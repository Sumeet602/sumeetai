import API from "./axios.js";

// Auth & User
export const getCurrentUser = () => API.get("/api/me");
export const logout = () => API.post("/api/auth/logout");

// Chat
export const createConversation = (title) => API.post("/api/chat/conversations", { title });
export const getConversations = () => API.get("/api/chat/conversations");
export const getMessages = (conversationId) => API.get(`/api/chat/messages/${conversationId}`);
export const saveMessage = (data) => API.post("/api/chat/messages", data);

// Agent
export const executeAgent = (prompt, conversationId) => API.post("/api/agent/execute", { prompt, conversationId });

// Billing
export const createOrder = (amount, plan) => API.post("/api/billing/create-order", { amount, plan });
export const verifyPayment = (paymentData) => API.post("/api/billing/verify-payment", paymentData);
