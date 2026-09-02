import axios from 'axios';

export const deductCredits = async (userId, amount = 1) => {
    try {
        const response = await axios.post(`${process.env.AUTH_SERVICE || 'http://localhost:8001'}/deduct-credits`, {
            userId,
            amount
        });
        return response.data;
    } catch (error) {
        console.error("Error deducting credits", error);
        throw new Error("Failed to deduct credits");
    }
};
