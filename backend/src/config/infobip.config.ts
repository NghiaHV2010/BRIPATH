import axios, { AxiosInstance } from 'axios';
import { INFOBIP_API_KEY, INFOBIP_BASE_URL } from './env.config';

class InfobipClient {
    private client: AxiosInstance;
    private apiKey: string;
    private baseURL: string;

    constructor() {
        this.apiKey = INFOBIP_API_KEY;
        this.baseURL = INFOBIP_BASE_URL;

        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': this.apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        // Add request interceptor for logging
        this.client.interceptors.request.use(
            (config) => {
                console.log(`📤 Infobip Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('❌ Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Add response interceptor for logging
        this.client.interceptors.response.use(
            (response) => {
                console.log(`✅ Infobip Response: ${response.status}`);
                return response;
            },
            (error) => {
                console.error('❌ Response Error:', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    getClient(): AxiosInstance {
        return this.client;
    }
}

export const infobipClient = new InfobipClient().getClient();