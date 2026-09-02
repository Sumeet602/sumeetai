export const routeAgent = (state) => {
    if (state.agentType === 'coding') return 'codingAgent';
    if (state.agentType === 'vision') return 'visionAgent';
    if (state.agentType === 'search') return 'searchAgent';
    if (state.agentType === 'thinker') return 'deepThinkerAgent';
    if (state.agentType === 'pdfRag') return 'pdfRagAgent';
    return 'chatAgent';
};
