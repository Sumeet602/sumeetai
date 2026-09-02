import { razorpayInstance } from '../config/razorpay.js';
import { plans } from '../config/plans.js';
import Payment from '../models/payment.model.js';
import crypto from 'crypto';
import axios from 'axios';

export const createOrder = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { plan } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!plans[plan]) return res.status(400).json({ error: 'Invalid plan' });

        const amount = plans[plan].priceINR * 100; // Razorpay expects amount in paise

        const options = {
            amount,
            currency: 'INR',
            receipt: `receipt_${userId}_${Date.now()}`
        };

        const order = await razorpayInstance.orders.create(options);

        // Save order in DB
        await Payment.create({
            userId,
            razorpayOrderId: order.id,
            amount: plans[plan].priceINR,
            planPurchased: plan
        });

        res.status(200).json(order);
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment is authentic
            const payment = await Payment.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { 
                    status: 'paid', 
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature 
                },
                { new: true }
            );
            
            // Make a request to Auth service to update user credits here.
            try {
                await axios.post(`${process.env.AUTH_SERVICE}/api/auth/update-credits`, {
                    userId: payment.userId,
                    plan: payment.planPurchased
                });
            } catch (err) {
                console.error("Failed to update credits in Auth service", err);
            }
            
            return res.status(200).json({ message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ error: "Invalid signature sent!" });
        }
    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
