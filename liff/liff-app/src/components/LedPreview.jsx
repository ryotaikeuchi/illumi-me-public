// liff/liff-app/src/components/LedPreview.jsx
import React, { useState, useEffect } from 'react';
import styles from './LedPreview.module.css'; // CSS Modules for styling
import { PREVIEW_LED_COUNT, BLINK_SPEED_MS, FLOW_SPEED_MS, ANIMATION_FRAME_RATE_MS } from '../constants'; // Import constants

const LedPreview = ({ isOn, mode, colors }) => {
  const [ledStates, setLedStates] = useState(Array(PREVIEW_LED_COUNT).fill(0));

  useEffect(() => {
    if (!isOn) {
      // Use setTimeout to avoid "setting state synchronously within an effect" warning
      const timer = setTimeout(() => {
        setLedStates(Array(PREVIEW_LED_COUNT).fill(-1)); // All LEDs off
      }, 0);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      // ... existing interval logic
      if (mode === 'blink') {
        setLedStates(prev => 
          prev.map((_, i) => {
            const isPulse = Math.floor(Date.now() / BLINK_SPEED_MS) % 2 === 0;
            return isPulse ? i % colors.length : -1; // Use colors.length for dynamic color indexing
          })
        );
      } else { // mode === 'flow'
        setLedStates(prev => {
          const offset = Math.floor(Date.now() / FLOW_SPEED_MS) % colors.length; // Use colors.length
          return prev.map((_, i) => {
            const ledIndex = i % colors.length; // Use colors.length
            return (ledIndex + offset) % colors.length;
          });
        });
      }
    }, ANIMATION_FRAME_RATE_MS);

    return () => clearInterval(interval);
  }, [isOn, mode, colors]); // Dependencies for useEffect

  return (
    <div className={styles.previewInner}>
      <div className={styles.ledTapeContainer}>
        {/* Split LEDs into two rows for visual representation, adjust as needed */}
        <div className={styles.ledTape}>
          {ledStates.slice(0, PREVIEW_LED_COUNT / 2).map((colorIndex, i) => (
            <div key={i} className={styles.led} style={{ 
                backgroundColor: colorIndex >= 0 ? colors[colorIndex] : '#404040',
                boxShadow: colorIndex >= 0 ? `0 0 18px ${colors[colorIndex]}, 0 0 5px #fff` : 'none',
                opacity: colorIndex >= 0 ? 1 : 0.4
            }} />
          ))}
        </div>
        <div className={styles.ledTape}>
          {ledStates.slice(PREVIEW_LED_COUNT / 2, PREVIEW_LED_COUNT).map((colorIndex, i) => (
            <div key={i} className={styles.led} style={{
                backgroundColor: colorIndex >= 0 ? colors[colorIndex] : '#404040',
                boxShadow: colorIndex >= 0 ? `0 0 18px ${colors[colorIndex]}, 0 0 5px #fff` : 'none',
                opacity: colorIndex >= 0 ? 1 : 0.4
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LedPreview;