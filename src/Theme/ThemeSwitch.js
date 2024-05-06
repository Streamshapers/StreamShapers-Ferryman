import React from 'react';
import {useTheme} from './ThemeContext';

const ThemeSwitch = () => {
    const {theme, toggleTheme} = useTheme();

    return (<>
            <div className="headerButton headerButton1 theme-switch" onClick={toggleTheme}>
                <div><i className={`fas ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`}></i></div>
            </div>
        </>
    );
};

export default ThemeSwitch;
