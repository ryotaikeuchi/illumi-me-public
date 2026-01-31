// liff/liff-app/src/App.jsx
import React from 'react';
import useAuth from './hooks/useAuth';
import useFirestoreSettings from './hooks/useFirestoreSettings';

// 新しいコンポーネントをインポート
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import PreviewPanel from './components/PreviewPanel';

// App全体のスタイル
import styles from './App.module.css';

import { APP_TITLE, LOADING_AUTH, LOGIN_REQUIRED, LIFF_ERROR_MSG, LIFF_BROWSER_MSG } from './constants';

const App = () => {
  const { user, loading, liffError } = useAuth();
  const { 
    isOn, setIsOn, 
    mode, setMode, 
    colors, setColors 
  } = useFirestoreSettings(user);

  const handleColorChange = (index, color) => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <p className={styles.loadingText}>{LOADING_AUTH}</p>
        </div>
      </div>
    );
  }

  if (liffError) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <p className={styles.errorText}>{LIFF_ERROR_MSG}{liffError.message}</p>
          <p className={styles.errorText}>{LIFF_BROWSER_MSG}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <p className={styles.loadingText}>{LOGIN_REQUIRED}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Header title={APP_TITLE} />
        <SettingsPanel 
          isOn={isOn} 
          setIsOn={setIsOn} 
          mode={mode} 
          setMode={setMode} 
          colors={colors} 
          handleColorChange={handleColorChange} 
        />
        <PreviewPanel isOn={isOn} mode={mode} colors={colors} />
      </div>
    </div>
  );
};

export default App;