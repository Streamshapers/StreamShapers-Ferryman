import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../axiosInstance';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('Verifying...');
    const [resendEmail, setResendEmail] = useState('');
    const [resendStatus, setResendStatus] = useState('');
    const token = searchParams.get('token');

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await api.get(`/auth/verify-email?token=${token}`);
                setMessage(response.data.message || 'Your email has been verified successfully.');
            } catch (error) {
                const errMsg = error.response?.data?.error || 'Verification failed.';
                setMessage(errMsg);
            }
        };

        if (token) verify();
        else setMessage('No token provided.');
    }, [token]);

    const handleResend = async () => {
        try {
            setResendStatus('Sending...');
            const response = await api.post('/auth/resend-verification', { email: resendEmail });
            setResendStatus(response.data.message || 'Verification email sent.');
        } catch (err) {
            const msg = err.response?.data?.error || 'Error sending email.';
            setResendStatus(msg);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-dialog">
                <h2>Email Verification</h2>
                <p>{message}</p>

                <hr />
                <h3>Didn't receive the email?</h3>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                />
                <button onClick={handleResend}>Resend Verification Email</button>
                {resendStatus && <p>{resendStatus}</p>}
            </div>
        </div>
    );
};

export default VerifyEmail;
