/**
 * CENTRALIZED PAYMENT SUCCESS HANDLER
 * 
 * This is the ONLY place that updates payment_status to PAID.
 * All payment confirmations (webhook, manual, callback) MUST use this function.
 * 
 * DESIGN RULE:
 * - ONE function to handle payment success
 * - ONE database transaction for consistency
 * - FORBIDDEN STATE: transaction_id exists BUT payment_status=PENDING
 */

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Thu2220403',
  database: process.env.DB_NAME || 'ai_sim_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Handle payment success - CENTRAL HANDLER
 * Updates order status, payment status, and SIM status in ONE transaction
 * 
 * @param {Number} orderId - Order ID (ma_don_hang)
 * @param {String} transactionId - Transaction/Payment reference ID
 * @param {Object} options - Additional options
 * @returns {Object} Result with success status and data
 */
async function handlePaymentSuccess(orderId, transactionId, options = {}) {
  const {
    source = 'unknown', // webhook, manual, callback
    autoApprove = true   // Auto-approve order when payment confirmed
  } = options;
  
  console.log('\n💰 === HANDLE PAYMENT SUCCESS ===');
  console.log('📋 Order ID:', orderId);
  console.log('🆔 Transaction ID:', transactionId);
  console.log('📍 Source:', source);
  console.log('⚙️  Auto-approve:', autoApprove);
  
  const connection = await pool.getConnection();
  
  try {
    // Start transaction
    await connection.beginTransaction();
    console.log('🔄 Transaction started...');
    
    // 1. Get order details
    console.log('🔍 Fetching order details...');
    const [orders] = await connection.query(
      'SELECT ma_don_hang, so_sim, gia_mua, payment_status, paid_at, transaction_id FROM don_hang WHERE ma_don_hang = ?',
      [orderId]
    );
    
    if (orders.length === 0) {
      throw new Error(`Order not found: ${orderId}`);
    }
    
    const order = orders[0];
    console.log('✅ Order found:', order.so_sim, '-', order.gia_mua, 'VNĐ');
    console.log('   Current payment_status:', order.payment_status);
    console.log('   Current paid_at:', order.paid_at);
    console.log('   Current transaction_id:', order.transaction_id);
    
    // 2. Check if already PAID (idempotency)
    if (order.payment_status === 'PAID') {
      console.log('⚠️  Order already PAID. Skipping update (idempotent).');
      await connection.commit();
      return {
        success: true,
        alreadyPaid: true,
        message: 'Order already paid',
        data: {
          orderId: order.ma_don_hang,
          simNumber: order.so_sim,
          paymentStatus: order.payment_status,
          paidAt: order.paid_at
        }
      };
    }
    
    // 3. Detect inconsistent state
    if (order.transaction_id && order.payment_status === 'PENDING') {
      console.error('🚨 DATABASE INCONSISTENCY DETECTED!');
      console.error('   transaction_id exists BUT payment_status=PENDING');
      console.error('   This should never happen in a properly designed system.');
      console.error('   Fixing automatically...');
    }
    
    // 4. Update order to PAID (with optional auto-approve)
    console.log('🔄 Updating order to PAID...');
    
    const updateFields = {
      payment_status: 'PAID',
      paid_at: new Date(),
      transaction_id: transactionId
    };
    
    if (autoApprove) {
      updateFields.trang_thai = 'Đã duyệt';
      updateFields.ngay_duyet = new Date();
      console.log('   - Auto-approving order (trang_thai = "Đã duyệt")');
    }
    
    await connection.query(
      `UPDATE don_hang 
       SET payment_status = ?,
           paid_at = ?,
           transaction_id = ?
           ${autoApprove ? ', trang_thai = ?, ngay_duyet = ?' : ''}
       WHERE ma_don_hang = ?`,
      autoApprove 
        ? [updateFields.payment_status, updateFields.paid_at, updateFields.transaction_id, updateFields.trang_thai, updateFields.ngay_duyet, orderId]
        : [updateFields.payment_status, updateFields.paid_at, updateFields.transaction_id, orderId]
    );
    
    console.log('✅ Order updated:');
    console.log('   - payment_status = PAID');
    console.log('   - paid_at =', updateFields.paid_at.toISOString());
    console.log('   - transaction_id =', transactionId);
    if (autoApprove) {
      console.log('   - trang_thai = Đã duyệt');
    }
    
    // 5. Update SIM status to "Đã bán"
    console.log('🔄 Updating SIM to "Đã bán"...');
    await connection.query(
      'UPDATE the_sim SET trang_thai = ? WHERE so_sim = ?',
      ['Đã bán', order.so_sim]
    );
    console.log('✅ SIM', order.so_sim, 'marked as "Đã bán"');
    
    // 6. Commit transaction
    await connection.commit();
    console.log('✅ Transaction committed successfully!');
    console.log('=== END HANDLE PAYMENT SUCCESS ===\n');
    
    return {
      success: true,
      alreadyPaid: false,
      message: 'Payment processed successfully',
      data: {
        orderId: order.ma_don_hang,
        simNumber: order.so_sim,
        amount: order.gia_mua,
        paymentStatus: 'PAID',
        paidAt: updateFields.paid_at,
        transactionId: transactionId,
        orderStatus: autoApprove ? 'Đã duyệt' : order.trang_thai,
        source: source
      }
    };
    
  } catch (error) {
    // Rollback on error
    await connection.rollback();
    console.error('❌ Transaction rolled back due to error:', error.message);
    console.error('=== END HANDLE PAYMENT SUCCESS (FAILED) ===\n');
    
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Check payment status consistency
 * Detects and logs inconsistent states
 * 
 * @param {Number} orderId - Order ID to check
 * @returns {Object} Consistency check result
 */
async function checkPaymentConsistency(orderId) {
  try {
    const [orders] = await pool.query(
      'SELECT ma_don_hang, payment_status, paid_at, transaction_id FROM don_hang WHERE ma_don_hang = ?',
      [orderId]
    );
    
    if (orders.length === 0) {
      return { consistent: false, reason: 'Order not found' };
    }
    
    const order = orders[0];
    
    // Check for inconsistent states
    const inconsistencies = [];
    
    // FORBIDDEN STATE 1: transaction_id exists BUT payment_status=PENDING
    if (order.transaction_id && order.payment_status === 'PENDING') {
      inconsistencies.push({
        type: 'TRANSACTION_WITHOUT_PAYMENT',
        message: 'transaction_id exists BUT payment_status=PENDING',
        severity: 'ERROR'
      });
    }
    
    // FORBIDDEN STATE 2: transaction_id exists BUT paid_at is NULL
    if (order.transaction_id && !order.paid_at && order.payment_status === 'PAID') {
      inconsistencies.push({
        type: 'PAID_WITHOUT_TIMESTAMP',
        message: 'payment_status=PAID BUT paid_at is NULL',
        severity: 'ERROR'
      });
    }
    
    // FORBIDDEN STATE 3: paid_at exists BUT payment_status is not PAID
    if (order.paid_at && order.payment_status !== 'PAID') {
      inconsistencies.push({
        type: 'TIMESTAMP_WITHOUT_PAID_STATUS',
        message: 'paid_at exists BUT payment_status != PAID',
        severity: 'ERROR'
      });
    }
    
    if (inconsistencies.length > 0) {
      console.error('\n🚨 DATABASE INCONSISTENCY DETECTED!');
      console.error('Order ID:', orderId);
      console.error('Inconsistencies:', inconsistencies);
      console.error('Current state:', {
        payment_status: order.payment_status,
        paid_at: order.paid_at,
        transaction_id: order.transaction_id
      });
      console.error('');
      
      return {
        consistent: false,
        orderId: order.ma_don_hang,
        inconsistencies: inconsistencies,
        currentState: {
          payment_status: order.payment_status,
          paid_at: order.paid_at,
          transaction_id: order.transaction_id
        }
      };
    }
    
    return {
      consistent: true,
      orderId: order.ma_don_hang,
      state: {
        payment_status: order.payment_status,
        paid_at: order.paid_at,
        transaction_id: order.transaction_id
      }
    };
    
  } catch (error) {
    console.error('❌ Error checking payment consistency:', error.message);
    return { consistent: false, reason: error.message };
  }
}

module.exports = {
  handlePaymentSuccess,
  checkPaymentConsistency
};
