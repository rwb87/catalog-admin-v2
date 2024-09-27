import { useUser } from '@/_store';
import axios, { AxiosRequestConfig } from 'axios';

const baseUrl = () => {
    switch (import.meta.env.VITE_APP_ENV) {
        case 'local': return import.meta.env.VITE_APP_API_URL
        case 'dev': return 'https://api-dev.shopcatalog.app/api'
        case 'staging': return 'https://api-staging.shopcatalog.app/api'
        case 'prod': return 'https://api.shopcatalog.app/api'
        default: return 'https://api-dev.shopcatalog.app/api'
    }
};

const BASE_URL = baseUrl();

type RequestOptions = {
    endpoint: string,
    method?: string,
    data?: AxiosRequestConfig['data'] | null,
    hasFiles?: boolean,
    options?: object,
}
const fetch = async({ endpoint = '', method = 'GET', data = null, hasFiles = false, options = {}}: RequestOptions) => {
    const supportedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    const { token }: any = await useUser.getState();

    // Convert method text to uppercase
    method = method.toUpperCase();

    // Check if method is supported
    if(!supportedMethods.includes(method)) throw new Error(`Request method not supported. Supported methods are ${supportedMethods.join(', ')}.`);
    if(BASE_URL === '' || typeof BASE_URL === 'undefined') throw new Error(`Base URL is not defined. Please set a base url in the .env file with the key 'NEXT_PUBLIC_API_URL'.`);

    let headersConfig = {
        'Content-Type': hasFiles ? 'multipart/form-data' : 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token || ''}`,
    };

    // If has extra options
    if(options !== null) {
        headersConfig = {
            ...headersConfig,
            ...options,
        }
    }

    return await axios({
        url: encodeURI(`${BASE_URL}${endpoint}`),
        method: method,
        headers: headersConfig,
        data: data || undefined,
    })
    .then(response => response.data);
}

export default fetch;