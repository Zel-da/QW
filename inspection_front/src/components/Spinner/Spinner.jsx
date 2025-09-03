import React from 'react';
import styles from './Spinner.module.css';

const Spinner = ({ size = '40px' }) => {
    return (
        <div className={styles.spinnerContainer}>
            <div className={styles.spinner} style={{ width: size, height: size }}></div>
        </div>
    );
};

export default Spinner;