import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../axiosInstance';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    // Einzelne Anforderungen prüfen
    const hasLower = /[a-z]/.test(newPassword);
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[@$!%*?&]/.test(newPassword);
    const hasLength = newPassword.length >= 8;

    const passwordsMatch = newPassword === confirmPassword;
    const passwordValid = hasLower && hasUpper && hasNumber && hasSpecial && hasLength;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!passwordValid) {
            setMessage('Please meet all password requirements.');
            return;
        }

        if (!passwordsMatch) {
            setMessage('Passwords do not match.');
            return;
        }

        try {
            const res = await api.post('/auth/reset-password', { token, newPassword });
            setMessage(res.data.message || 'Password reset successful.');
        } catch (error) {
            const msg = error.response?.data?.error || 'Failed to reset password.';
            setMessage(msg);
        }
    };

    const renderCheck = (condition) => condition ? '✅' : '❌';

    return (
        <div className="auth-wrapper">
            <div className="auth-dialog">
                <h2>Set a new password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="auth-input">
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <label className="input-label">New password</label>
                    </div>

                    <ul style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                        <li>{renderCheck(hasLength)} at least 8 characters</li>
                        <li>{renderCheck(hasUpper)} one uppercase letter (A–Z)</li>
                        <li>{renderCheck(hasLower)} one lowercase letter (a–z)</li>
                        <li>{renderCheck(hasNumber)} one number (0–9)</li>
                        <li>{renderCheck(hasSpecial)} one special character (@$!%*?&)</li>
                    </ul>

                    <div className="auth-input">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <label className="input-label">Confirm password</label>
                    </div>
                    {!passwordsMatch && confirmPassword && (
                        <p style={{ color: 'red', fontSize: '0.9rem' }}>
                            Passwords do not match.
                        </p>
                    )}

                    <button className="auth-button" type="submit" disabled={!passwordValid || !passwordsMatch}>
                        Reset Password
                    </button>
                </form>

                {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
            </div>
        </div>
    );
};

export default ResetPassword;
