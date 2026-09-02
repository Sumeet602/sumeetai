import { runAgentGraph } from '../graph/graph.js';
import { deductCredits } from '../utils/deductCredits.js';

export const handleAgentRequest = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { prompt, agentType } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // 1. Check user credits here
        try {
            await deductCredits(userId, 1);
        } catch (error) {
            return res.status(402).json({ error: 'Insufficient credits or billing error' });
        }

        // 2. Run LangGraph Workflow
        const result = await runAgentGraph(prompt, agentType);

        // 3. Return response
        res.status(200).json({ response: result });
    } catch (error) {
        console.error('Agent Execution Error:', error);
        res.status(500).json({ error: 'Agent failed to process request' });
    }
};
