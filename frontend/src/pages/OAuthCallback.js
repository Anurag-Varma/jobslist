import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OAuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [message, setMessage] = useState('Authorizing...');

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const authCode = query.get('code');

        console.log(authCode);

        if (authCode) {
            const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
            axios.post(`${apiUrl}/api/users/oauth2callback`, { code: authCode },
                {
                    withCredentials: true
                })
                .then((response) => {
                    console.log(response);
                    setMessage('Authentication successful! You can close this window.');
                    navigate('/');  // Optionally redirect to another page
                })
                .catch((error) => {
                    console.error('Error exchanging code:', error);
                    setMessage('Authentication failed. Please try again.');
                });
        } else {
            setMessage('Authorization code not found.');
        }
    }, [location, navigate]);

    return (
        <div>
            <h2>{message}</h2>
        </div>
    );
};

export default OAuthCallback;
