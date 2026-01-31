import React from 'react';
import PropTypes from 'prop-types';
import styles from './ColorPalette.module.css';
import { LABEL_COLOR } from '../constants';

const ColorPalette = ({ colors, handleColorChange, disabled }) => {
  return (
    <div className={`${styles.controlRow} ${disabled ? styles.disabled : ''}`}>
      <p className={styles.label}>{LABEL_COLOR}</p>
      <div className={styles.colorGrid}>
        {colors.map((color, index) => (
          <div key={index}>
            <label className={styles.colorLabel}>
              <div className={styles.colorCircle} style={{ backgroundColor: color }} />
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                className={styles.colorInput}
                disabled={disabled}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

ColorPalette.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleColorChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default ColorPalette;