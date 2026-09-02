import express from 'express';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import chatRoutes from './routes/chat.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(express.json());


// DB Connection
connectDB();

// Routes
app.use('/', chatRoutes);

app.listen(PORT, () => {
    console.log(`Chat Service running on port ${PORT}`);
});
