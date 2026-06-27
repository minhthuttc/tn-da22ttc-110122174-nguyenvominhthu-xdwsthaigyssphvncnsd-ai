const { PayOS } = require('@payos/node');
require('dotenv').config();

// Initialize PayOS with options object
const payOS = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY
});

/**
 * Create payment link for order
 * @param {Object} orderData - Order information
 * @returns {Object} Payment link details
 */
async function createPaymentLink(orderData) {
  const { orderId, orderCode, amount, description, buyerName, buyerPhone } = orderData;
  
  console.log('\n🔷 === CREATING PAYOS PAYMENT LINK ===');
  console.log('📋 Order Data:', orderData);
  
  try {
    // Ensure amount is a positive integer
    const validAmount = Math.floor(Math.abs(Number(amount)));
    
    if (validAmount <= 0 || isNaN(validAmount)) {
      throw new Error(`Invalid amount: ${amount}. Amount must be a positive number.`);
    }
    
    console.log('💰 Validated amount:', validAmount);
    
    const paymentData = {
      orderCode: Number(orderCode || orderId),
      amount: validAmount,
      description: description || `Thanh toan don hang #${orderId}`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/tai-khoan`,
      returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/tai-khoan?orderId=${orderId}&status=success`
    };
    
    console.log('📤 Sending to PayOS:', paymentData);
    
    // Use paymentRequests.create() method
    const paymentLinkResponse = await payOS.paymentRequests.create(paymentData);
    
    console.log('✅ PayOS Payment Link Created:');
    console.log('   - checkoutUrl:', paymentLinkResponse.checkoutUrl);
    console.log('   - qrCode:', paymentLinkResponse.qrCode);
    console.log('   - paymentLinkId:', paymentLinkResponse.paymentLinkId);
    console.log('=== END PAYOS CREATION ===\n');
    
    return {
      success: true,
      checkoutUrl: paymentLinkResponse.checkoutUrl,
      qrCode: paymentLinkResponse.qrCode,
      paymentLinkId: paymentLinkResponse.paymentLinkId,
      orderCode: paymentData.orderCode
    };
  } catch (error) {
    console.error('❌ PayOS Error:', error);
    console.error('Error details:', {
      message: error.message,
      amount: amount,
      orderData: orderData
    });
    throw new Error(`PayOS payment link creation failed: ${error.message}`);
  }
}

/**
 * Verify PayOS webhook signature
 * @param {Object} webhookData - Webhook payload
 * @returns {Object} Verified webhook data
 */
async function verifyWebhookSignature(webhookData) {
  try {
    // PayOS v2 uses webhooks.verify()
    const verifiedData = await payOS.webhooks.verify(webhookData);
    return verifiedData;
  } catch (error) {
    console.error('❌ Webhook verification failed:', error);
    throw error;
  }
}

/**
 * Get payment info
 * @param {Number} orderCode - Order code
 * @returns {Object} Payment information
 */
async function getPaymentInfo(orderCode) {
  try {
    const paymentInfo = await payOS.paymentRequests.get(orderCode);
    return paymentInfo;
  } catch (error) {
    console.error('❌ Get payment info failed:', error);
    throw error;
  }
}

/**
 * Cancel payment link
 * @param {Number} orderCode - Order code
 * @returns {Object} Cancellation result
 */
async function cancelPaymentLink(orderCode) {
  try {
    const result = await payOS.paymentRequests.cancel(orderCode);
    return result;
  } catch (error) {
    console.error('❌ Cancel payment link failed:', error);
    throw error;
  }
}

module.exports = {
  createPaymentLink,
  verifyWebhookSignature,
  getPaymentInfo,
  cancelPaymentLink
};
