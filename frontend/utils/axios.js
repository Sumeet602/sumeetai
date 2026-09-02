import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const session = localStorage.getItem("session");
    if (session) {
        config.headers.Authorization = `Bearer ${session}`;
    }
    return config;
});

export default api;
