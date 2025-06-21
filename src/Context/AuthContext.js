import React, {createContext, useState, useEffect, useContext, useRef} from 'react';
import api from "../axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [serverURL] = useState("https://server.streamshapers.com");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const refreshResponse = await api.post('/auth/refresh', {}, { withCredentials: true });
                const newAccessToken = refreshResponse.data.accessToken;

                localStorage.setItem('accessToken', newAccessToken);

                const response = await api.get('/auth/me', {
                    headers: { 'Authorization': `Bearer ${newAccessToken}` },
                    withCredentials: true,
                });

                setUser(response.data.user);
            } catch (error) {
                console.error('authentication error:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth().then();

        const refreshTokenInterval = setInterval(async () => {
            try {
                const refreshResponse = await api.post('/auth/refresh', {}, { withCredentials: true });
                const newAccessToken = refreshResponse.data.accessToken;

                localStorage.setItem('accessToken', newAccessToken);
                //console.log('Access token refreshed:', newAccessToken);

                const response = await api.get('/auth/me', {
                    headers: { 'Authorization': `Bearer ${newAccessToken}` },
                    withCredentials: true,
                });

                setUser(response.data.user);
            } catch (error) {
                console.error('Error refreshing token:', error);
                setUser(null);
            }
        }, 14 * 60 * 1000);

        return () => clearInterval(refreshTokenInterval);
    }, []);

    const login = (userData) => {
        setUser(userData);
        setLoading(false);
        //console.log('User state updated:', userData);
    };


    const handleLogout = async () => {
        try {
            await api.post(serverURL + '/auth/logout', {}, {
                withCredentials: true,
            });

            localStorage.removeItem('accessToken');
            setUser(null);

            console.log('Logout successful');
        } catch (error) {
            console.error('Error during logout:', error.message);
        }
    };

    return (
        <AuthContext.Provider value={{user, login, handleLogout, loading, serverURL}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
