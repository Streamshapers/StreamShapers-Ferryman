import React, {createContext, useState, useEffect, useContext, useRef} from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [serverURL] = useState("https://server.streamshapers.com");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get(serverURL + '/auth/me', { withCredentials: true });
                //console.log('CheckAuth answer:', response.data);
                setUser(response.data.user);
            } catch (error) {
                console.error('authentication error:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth().then();
    }, []);


    const login = async (formData) => {
        //console.log('Try logging in with:', formData);
        const response = await axios.post(serverURL + '/auth/login', formData, {withCredentials: true});
        //console.log('Login successfully, answer:', response.data);

        if (response.data.user) {
            setUser(response.data.user);
            //console.log('User:', response.data.user);
        } else {
            console.error('No user found');
        }
    };

    const logout = async () => {
        try {
            const response = await axios.post(serverURL + '/auth/logout', {}, {withCredentials: true});
            //console.log('Logout successfully:', response.data);
            setUser(null);
        } catch (error) {
            console.error('Error logging out:', error.message);
        }
    };

    return (
        <AuthContext.Provider value={{user, login, logout, loading, serverURL}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
