import axios from "axios";
import { API_V1 } from "@/lib/utils/constants";

const apiClient = axios.create({
  baseURL: API_V1,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling — toasts added in T17
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
