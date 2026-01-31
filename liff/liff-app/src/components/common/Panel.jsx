// liff/liff-app/src/components/common/Panel.jsx
import React from 'react';
import styles from './Panel.module.css';

const Panel = ({ children }) => {
  return (
    <div className={styles.panel}>
      {children}
    </div>
  );
};

export default Panel;