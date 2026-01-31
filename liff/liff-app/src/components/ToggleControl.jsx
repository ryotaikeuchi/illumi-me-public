// liff/liff-app/src/components/ToggleControl.jsx
import React from 'react';
import styles from './ToggleControl.module.css';

const ToggleControl = ({ isOn, setIsOn }) => {
  return (
    <div className={styles.controlRow}>
      <div className={styles.toggleContainer} onClick={() => setIsOn(!isOn)}>
        <span className={styles.label}>オン/オフ</span>
        <div className={`${styles.toggleTrack} ${isOn ? styles.on : ''}`}>
          <div className={styles.toggleThumb} />
        </div>
      </div>
    </div>
  );
};

export default ToggleControl;
