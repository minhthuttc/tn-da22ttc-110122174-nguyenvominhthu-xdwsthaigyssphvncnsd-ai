const mysql = require('mysql2/promise');
const { handlePaymentSuccess } = require('./services/paymentHandler');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Thu2220403',
  database: 'ai_sim_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function approveOrder() {
  try {
    // Lấy orderId từ command line argument
    const orderId = process.argv[2];
    
    if (!orderId) {
      console.log('\n❌ Vui lòng cung cấp Order ID!');
      console.log('Usage: node quick-approve.js <orderId>');
      console.log('Example: node quick-approve.js 13');
      console.log('');
      process.exit(1);
    }

    console.log('\n🚀 === QUICK APPROVE ORDER (MANUAL) ===');
    console.log('⏰ Time:', new Date().toLocaleString());
    console.log('🆔 Order ID:', orderId);
    console.log('');

    // Use centralized payment handler
    const transactionId = 'MANUAL_' + Date.now();
    
    const result = await handlePaymentSuccess(orderId, transactionId, {
      source: 'manual-approve',
      autoApprove: true
    });
    
    if (result.success) {
      if (result.alreadyPaid) {
        console.log('⚠️ Order already PAID!');
        console.log('✅ No action needed.');
      } else {
        console.log('🎉 ORDER APPROVED SUCCESSFULLY!');
        console.log('');
        console.log('📊 Result:');
        console.log('   - Order ID:', result.data.orderId);
        console.log('   - SIM:', result.data.simNumber);
        console.log('   - Payment Status:', result.data.paymentStatus);
        console.log('   - Order Status:', result.data.orderStatus);
        console.log('   - Transaction ID:', result.data.transactionId);
        console.log('');
        console.log('⏰ Polling will detect in ~3 seconds...');
        console.log('💡 Check browser console for auto-update!');
      }
    } else {
      console.error('❌ APPROVE FAILED:', result.message);
    }
    
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

approveOrder();
