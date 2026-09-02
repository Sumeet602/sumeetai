import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:8000",
  withCredentials: true, // required to send cookies through the Gateway
});

export default API;