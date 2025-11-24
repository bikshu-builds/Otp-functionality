import axios from "axios";

const api = axios.create({
  baseURL: "https://otp-functionality.onrender.com/api", 
});

export default api;
