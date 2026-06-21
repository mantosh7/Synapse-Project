import axios from 'axios'

// Base axios instance 
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // to send cookies automatically 
})

export default api