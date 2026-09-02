import express from 'express';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import billingRoutes from './routes/billing.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8004;

// Middleware
app.use(express.json());


// DB Connection
connectDB();

// Routes
app.use('/', billingRoutes);

app.listen(PORT, () => {
    console.log(`Billing Service running on port ${PORT}`);
});
