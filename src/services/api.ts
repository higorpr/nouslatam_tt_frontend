import axios from "axios";

const api = axios.create({
  // TODO: Colocar a baseURL em um .env
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export default api;
