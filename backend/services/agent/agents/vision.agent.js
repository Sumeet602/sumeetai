import axios from 'axios';

export const visionAgentNode = async (state) => {
    try {
        const lastMessage = state.messages[state.messages.length - 1];
        const prompt = encodeURIComponent(lastMessage.content);
        
        // Generate an image URL using the free Pollinations.ai API
        const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true`;

        // The UI will look for 'artifacts' array in the message object to display images
        return {
            messages: [{ 
                role: 'assistant', 
                content: `Here is the generated image for: "${lastMessage.content}"`,
                artifacts: [{ type: 'image', url: imageUrl }]
            }]
        };
    } catch (error) {
        console.error("Vision Agent Error:", error);
        return {
            messages: [{ role: 'assistant', content: 'Error generating image.' }]
        };
    }
};
