// liff/liff-app/src/components/ModeSelector.jsx
import React from 'react';
import styles from './ModeSelector.module.css';

const ModeSelector = ({ mode, setMode, disabled }) => {
  return (
    <div className={`${styles.controlRow} ${disabled ? styles.disabled : ''}`}>
      <p className={styles.label}>モード</p>
      <div className={styles.flexRow}>
        <button 
          onClick={() => setMode('blink')} 
          className={`${styles.button} ${mode === 'blink' ? styles.active : ''}`}
          disabled={disabled}
        >
          点滅（パッパッ）
        </button>
        <button 
          onClick={() => setMode('flow')} 
          className={`${styles.button} ${mode === 'flow' ? styles.active : ''}`}
          disabled={disabled}
        >
          移動（ピュー）
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;