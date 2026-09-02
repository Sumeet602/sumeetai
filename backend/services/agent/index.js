import dotenv from 'dotenv';
dotenv.config();
import express from 'express';

import { handleAgentRequest } from './controllers/agent.controller.js';

const app = express();
const PORT = process.env.PORT || 8003;

app.use(express.json());


// Example agent execution endpoint
app.post('/execute', handleAgentRequest);

app.listen(PORT, () => {
    console.log(`Agent Service running on port ${PORT}`);
});
