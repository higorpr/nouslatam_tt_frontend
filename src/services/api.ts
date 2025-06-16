import axios from "axios";

const api = axios.create({
    // TODO: Colocar a baseURL em um .env
    baseURL:'http://localhost:8001/api/'
})

export default api