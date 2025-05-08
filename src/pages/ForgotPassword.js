import React, { useState } from 'react';
import api from "../axiosInstance";


const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message || 'If this email exists, we sent a reset link.');
        } catch (error) {
            const msg = error.response?.data?.error || 'Error sending reset email.';
            setMessage(msg);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-dialog">
                <h2>Reset your password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="auth-input">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label className="input-label">Your email address</label>
                    </div>
                    <button className="auth-button" type="submit">Send Reset Link</button>
                </form>
                {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
            </div>
        </div>
    );
};

export default ForgotPassword;
