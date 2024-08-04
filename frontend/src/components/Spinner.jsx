import React from 'react';

const Spinner = () => {
    return (
        <div style={{ marginTop: '180px' }}>
            <style>
                {`
                    .spinner {
                        border: 20px solid #f3f3f3;
                        border-radius: 50%;
                        border-top: 16px solid blue;
                        width: 80px;
                        height: 80px;
                        animation: spin 1s linear infinite;
                        margin-top: 20px;
                    }

                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    `}
            </style>
            <div style={{ opacity: 0.8 }}>Loading...</div>
            <div className="spinner"></div>
        </div>
    );
};

export default Spinner;
