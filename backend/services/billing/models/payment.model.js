import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed'],
        default: 'created'
    },
    planPurchased: {
        type: String,
        enum: ['starter', 'pro'],
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
