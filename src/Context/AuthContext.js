import React, {createContext, useState, useEffect, useContext} from 'react';
import axios from 'axios';
import {GlobalStateContext} from "./GlobalStateContext";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const {serverUrl} = useContext(GlobalStateContext);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get(serverUrl + '/auth/me', {withCredentials: true});
                console.log('CheckAuth Antwort:', response.data);
                setUser(response.data.user);
            } catch (error) {
                setUser(null);
                console.error('Fehler bei der Authentifizierung:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (formData) => {
        console.log('Versuche, mich einzuloggen mit:', formData);
        const response = await axios.post(serverUrl + '/auth/login', formData, {withCredentials: true});
        console.log('Login erfolgreich, Antwort:', response.data);

        if (response.data.user) {
            setUser(response.data.user);
            console.log('Benutzerzustand nach Login:', response.data.user);
        } else {
            console.error('Keine Benutzerdaten in der Antwort gefunden');
        }
    };

    const logout = async () => {
        try {
            const response = await axios.post(serverUrl + '/auth/logout', {}, {withCredentials: true});
            console.log('Logout erfolgreich, Antwort:', response.data);
            setUser(null);
        } catch (error) {
            console.error('Fehler beim Logout:', error.message);
        }
    };

    return (
        <AuthContext.Provider value={{user, login, logout, loading}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
