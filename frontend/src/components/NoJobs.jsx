import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const NoJobs = () => {
    return (
        <div style={styles.container}>
            <FontAwesomeIcon icon={faExclamationTriangle} style={styles.icon} />
            <h2 style={styles.heading}>No Jobs Found</h2>
            <p style={styles.message}>
                We couldn't find any job listings matching your criteria. Try adjusting your search terms or check back later for new opportunities.
            </p>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        padding: '20px',
    },
    icon: {
        fontSize: '50px',
        color: '#ffcc00',
        marginTop: '150px',
        marginBottom: '10px',
    },
    heading: {
        fontSize: '24px',
        margin: '10px 0',
    },
    message: {
        fontSize: '16px',
        color: '#666',
    },
};

export default NoJobs;
