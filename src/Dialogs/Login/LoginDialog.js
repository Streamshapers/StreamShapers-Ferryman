import React, {useContext, useEffect, useState} from "react";
import {GlobalStateContext} from "../../Context/GlobalStateContext";
import AuthContext from '../../Context/AuthContext';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons";
import api from '../../axiosInstance';

function LoginDialog({ onClose }) {
    const {user, login} = useContext(AuthContext);

    const [loginData, setLoginData] = useState({
        loginMail: '',
        loginPassword: ''
    });
    const [registerData, setRegisterData] = useState({
        registerUsername: '',
        registerMail: '',
        registerPassword: ''
    });
    const [focus, setFocus] = useState({
        registerUsername: false,
        registerMail: false,
        registerPassword: false
    });

    const [errors, setErrors] = useState({
        registerUsername: false,
        registerMail: false,
        registerPassword: false
    });

    const {loginMail, loginPassword} = loginData;
    const {registerUsername, registerMail, registerPassword} = registerData;
    const onLoginChange = e => setLoginData({...loginData, [e.target.name]: e.target.value});
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('login');

    const handleTabChange = tabName => {
        setActiveTab(tabName);
    };

    const showAlert = (msg, duration = 10000) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage(null);
        }, duration);
    };

    const onLoginSubmit = async e => {
        e.preventDefault();
        try {
            console.log('Sending Login-Data...');
            const response = await api.post('/auth/login', loginData, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });

            const { accessToken } = response.data;

            localStorage.setItem('accessToken', accessToken);

            console.log('Login successful, token stored.');

            const userResponse = await api.get('/auth/me', {
                headers: { 'Authorization': `Bearer ${accessToken}` },
                withCredentials: true,
            });

            const user = userResponse.data.user;
            console.log('User information retrieved:', user);

            login(user);
            onClose();
        } catch (error) {
            console.error('Error logging in:', error.response?.data || error.message);
        }
    };

    const onRegisterChange = (e) => setRegisterData({...registerData, [e.target.name]: e.target.value});

    const handleFocus = (name) => setFocus({...focus, [name]: true});

    const handleBlur = (name) => {
        if (!registerData[name]) {
            setFocus({...focus, [name]: false});
        }
        validateField(name, registerData[name]);
    };

    const validateField = (name, value) => {
        let isValid = true;

        if (!value) {
            console.log(`Validation failed for ${name}: empty value`);
            setErrors({...errors, [name]: true});
            return false;
        }

        if (name === 'registerMail') {
            isValid = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
            if (!isValid) console.log('Invalid email format');
        } else if (name === 'registerPassword') {
            isValid = value.length >= 6;
            if (!isValid) console.log('Password must be at least 6 characters');
        } else if (name === 'registerUsername') {
            isValid = value.length >= 3;
            if (!isValid) console.log('Username must be at least 3 characters');
        }

        setErrors({...errors, [name]: !isValid});
        return isValid;
    };


    const onRegisterSubmit = async e => {
        e.preventDefault();

        try {
            console.log('Sending Registration-Data...');
            const response = await api.post('/auth/register', registerData, {
                headers: { 'Content-Type': 'application/json' },
            });

            console.log('Registration successful:', response.data);

            await onLoginSubmit(e);
        } catch (error) {
            console.error('Registration Error:', error.response?.data || error.message);
        }
    }

    return (<>
            {!user && (
                <>
                    <h2>{activeTab === 'login' ? 'Login' : 'Register'}</h2>
                        {message && (
                            <div className="success-wrapper">
                                <div className="success alert-success">{message}</div>
                            </div>
                        )}
                        <div className="mode-switch">
                            <button className={`mode-button ${activeTab === 'login' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('login')}>Login
                            </button>
                            <button className={`mode-button ${activeTab === 'register' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('register')}>Register
                            </button>
                        </div>
                        {activeTab === 'login' && (
                            <form className="auth-form" onSubmit={onLoginSubmit}>
                                <div className="auth-input">
                                    <input autoComplete="loginMail" type="loginMail" name="loginMail" value={loginMail}
                                           onChange={onLoginChange}
                                           required/>
                                    <label className="input-label">E-Mail:</label>
                                </div>
                                <div className="auth-input">

                                    <input autoComplete="current-loginPassword" type="loginPassword"
                                           name="loginPassword"
                                           value={loginPassword}
                                           onChange={onLoginChange} required/>
                                    <label className="input-label">Password:</label>
                                </div>
                                <button className="auth-button" type="submit">Login</button>
                            </form>
                        )}
                        {activeTab === 'register' && (
                            <form onSubmit={e => onRegisterSubmit(e)} autoComplete="off">
                                <div className="auth-input">
                                    <input
                                        className={`input ${errors.registerUsername ? 'invalid' : ''}`}
                                        autoComplete="off"
                                        type="text"
                                        name="registerUsername"
                                        value={registerUsername}
                                        onChange={onRegisterChange}
                                        onFocus={() => handleFocus('registerUsername')}
                                        onBlur={() => handleBlur('registerUsername')}
                                        required
                                    />
                                    <label
                                        className={`input-label ${focus.registerUsername || registerUsername ? 'active' : ''}`}>Username:</label>
                                </div>
                                <div className="auth-input">
                                    <input
                                        className={`input ${errors.registerMail ? 'invalid' : ''}`}
                                        autoComplete="off"
                                        type="registerMail"
                                        name="registerMail"
                                        value={registerMail}
                                        onChange={onRegisterChange}
                                        onFocus={() => handleFocus('registerMail')}
                                        onBlur={() => handleBlur('registerMail')}
                                        required
                                    />
                                    <label
                                        className={`input-label ${focus.registerMail || loginMail ? 'active' : ''}`}>Mail:</label>
                                </div>
                                <div className="auth-input">
                                    <input
                                        className={`input ${errors.registerPassword ? 'invalid' : ''}`}
                                        autoComplete="off"
                                        type="registerPassword"
                                        name="registerPassword"
                                        value={registerPassword}
                                        onChange={onRegisterChange}
                                        onFocus={() => handleFocus('password')}
                                        onBlur={() => handleBlur('password')}
                                        required
                                    />
                                    <label
                                        className={`input-label ${focus.registerPassword || registerPassword ? 'active' : ''}`}>Password:</label>
                                </div>

                                <button className="auth-button" type="submit">Register</button>
                            </form>
                        )}
                        {/*<div className="popupButtonArea">
                    <button id="downloadBtn" onClick={onClose}>Close</button>
                    <button id="downloadBtn" onClick={downloadFile}>Download File</button>
                </div>*/}
                </>
            )}
        </>
    )
        ;
}

export default LoginDialog;