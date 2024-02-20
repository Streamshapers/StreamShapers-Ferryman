import React from 'react';
import { useTheme } from './ThemeContext';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMoon, faSun} from "@fortawesome/free-solid-svg-icons";

const ThemeSwitch = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="theme-switch">
            <FontAwesomeIcon icon={faSun} className={`icon light ${theme === 'light' ? 'active' : ''}`} />
            <label className="switch">
                <input
                    type="checkbox"
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                />
                <span className="slider round"></span>
            </label>
            <FontAwesomeIcon icon={faMoon} className={`icon dark ${theme === 'dark' ? 'active' : ''}`} />
        </div>
    );
};

export default ThemeSwitch;
