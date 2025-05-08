import React, {useContext, useEffect, useState} from "react";
import AuthContext from '../../Context/AuthContext';
import api from '../../axiosInstance';
import {Link} from "react-router-dom";

function LoginDialog({ onClose }) {
    const {user, login} = useContext(AuthContext);
    const [confirmPassword, setConfirmPassword] = useState('');
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
    const [loginMessage, setLoginMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('login');

    const handleTabChange = tabName => {
        setActiveTab(tabName);
        setLoginMessage(null);
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
            setLoginMessage("login not possible, wrong credentials.");
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
            isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(registerPassword);
            if (!isValid) console.log('Please ensure password meets all requirements');
        } else if (name === 'registerUsername') {
            isValid = value.length >= 3;
            if (!isValid) console.log('Username must be at least 3 characters');
        }

        setErrors({...errors, [name]: !isValid});
        return isValid;
    };


    const onRegisterSubmit = async e => {
        e.preventDefault();

        const isUsernameValid = validateField('registerUsername', registerUsername);
        const isMailValid = validateField('registerMail', registerMail);
        const isPasswordValid = validateField('registerPassword', registerPassword);
        const passwordsMatch = registerPassword === confirmPassword;
        if (!isUsernameValid || !isMailValid || !isPasswordValid || !passwordsMatch) {
            showAlert("Please enter a valid data.");
            return;
        }

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
                    {loginMessage && (
                        <div className="error-wrapper">
                            <div className="error">{loginMessage}</div>
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
                                    <input autoComplete="email" type="email" name="loginMail" value={loginMail}
                                           onChange={onLoginChange} required />
                                    <label className="input-label">E-Mail:</label>
                                </div>
                                <div className="auth-input">
                                    <input autoComplete="current-password" type="password" name="loginPassword"
                                           value={loginPassword} onChange={onLoginChange} required />
                                    <label className="input-label">Password:</label>
                                </div>
                                <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                                    <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'none' }}>
                                        Forgot your password?
                                    </Link>
                                </p>
                                <button className="auth-button" type="submit">Login</button>
                            </form>
                        )}
                        {activeTab === 'register' && (
                            <form className="auth-form" onSubmit={onRegisterSubmit} autoComplete="off">
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
                                    <label className={`input-label ${focus.registerUsername || registerUsername ? 'active' : ''}`}>
                                        Username:
                                    </label>
                                    {errors.registerUsername && (
                                        <span className="error-message">This username is not valid or already taken.</span>
                                    )}
                                </div>
                                <div className="auth-input">
                                    <input
                                        className={`input ${errors.registerMail ? 'invalid' : ''}`}
                                        autoComplete="off"
                                        type="email"
                                        name="registerMail"
                                        value={registerMail}
                                        onChange={onRegisterChange}
                                        onFocus={() => handleFocus('registerMail')}
                                        onBlur={() => handleBlur('registerMail')}
                                        required
                                    />
                                    <label className={`input-label ${focus.registerMail || registerMail ? 'active' : ''}`}>
                                        Mail:
                                    </label>
                                    {errors.registerMail && (
                                        <span className="error-message">Please enter a valid email address.</span>
                                    )}
                                </div>
                                <div className="auth-input">
                                    <input
                                        className={`input ${errors.registerPassword ? 'invalid' : ''}`}
                                        autoComplete="off"
                                        type="password"
                                        name="registerPassword"
                                        value={registerPassword}
                                        onChange={(e) => {
                                            onRegisterChange(e);
                                            validateField('registerPassword', e.target.value);
                                        }}
                                        onFocus={() => handleFocus('registerPassword')}
                                        onBlur={() => handleBlur('registerPassword')}
                                        required
                                    />
                                    <label className={`input-label ${focus.registerPassword || registerPassword ? 'active' : ''}`}>
                                        Password:
                                    </label>
                                </div>

                                <ul style={{ fontSize: '0.85rem', margin: '0.5rem 0 1rem', paddingLeft: '1.2rem' }}>
                                    <li>{registerPassword.length >= 8 ? '✅' : '❌'} at least 8 characters</li>
                                    <li>{/[A-Z]/.test(registerPassword) ? '✅' : '❌'} one uppercase letter</li>
                                    <li>{/[a-z]/.test(registerPassword) ? '✅' : '❌'} one lowercase letter</li>
                                    <li>{/\d/.test(registerPassword) ? '✅' : '❌'} one number</li>
                                    <li>{/[@$!%*?&]/.test(registerPassword) ? '✅' : '❌'} one special character (@$!%*?&)</li>
                                </ul>

                                <div className="auth-input">
                                    <input
                                        className={`input ${confirmPassword && confirmPassword !== registerPassword ? 'invalid' : ''}`}
                                        autoComplete="off"
                                        type="password"
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <label className="input-label active">
                                        Confirm Password:
                                    </label>
                                </div>
                                {confirmPassword && confirmPassword !== registerPassword && (
                                    <p style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                        Passwords do not match.
                                    </p>
                                )}

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
