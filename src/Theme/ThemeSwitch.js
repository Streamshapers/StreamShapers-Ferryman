import React from 'react';
import {useTheme} from './ThemeContext';
import {faMoon, faSun} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const ThemeSwitch = () => {
    const {theme, toggleTheme} = useTheme();

    return (<>
            <div className="headerButton headerButton1 theme-switch" onClick={toggleTheme}>
                {theme === 'dark' && (<FontAwesomeIcon icon={faMoon} title="Export"/>)}
                {theme === 'light' && (<FontAwesomeIcon icon={faSun} title="Export"/>)}
            </div>
        </>
    );
};

export default ThemeSwitch;
