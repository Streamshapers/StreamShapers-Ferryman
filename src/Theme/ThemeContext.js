import React, {createContext, useContext, useEffect} from 'react';
import {GlobalStateContext} from "../Context/GlobalStateContext";

const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
    const {theme, setTheme} = useContext(GlobalStateContext);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook für den Zugriff auf das Theme
export const useTheme = () => useContext(ThemeContext);
