import axios from 'axios';

const api = axios.create({
    baseURL: 'https://server.streamshapers.com',
    withCredentials: true,
});

api.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 403 && !error.config._retry) {
            error.config._retry = true;

            try {
                const refreshResponse = await api.post('/auth/refresh', {}, {
                    withCredentials: true,
                });

                const newAccessToken = refreshResponse.data.accessToken;

                localStorage.setItem('accessToken', newAccessToken);

                error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;

                return api(error.config);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);

                localStorage.removeItem('accessToken');

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

api.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export default api;
