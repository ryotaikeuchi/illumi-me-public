import React from 'react';
import PropTypes from 'prop-types';
import Panel from './common/Panel'; // 共通Panelコンポーネントをインポート
import ToggleControl from './ToggleControl';
import ModeSelector from './ModeSelector';
import ColorPalette from './ColorPalette';
import styles from './SettingsPanel.module.css'; // sectionTitle用

const SettingsPanel = ({ isOn, setIsOn, mode, setMode, colors, handleColorChange }) => {
  const isDisabled = !isOn; // 設定がオフの場合、モードとカラーのコントロールを無効にする

  return (
    <Panel> {/* 共通Panelコンポーネントを使用 */}
      <h2 className={styles.sectionTitle}>設定</h2>
      
      <ToggleControl isOn={isOn} setIsOn={setIsOn} />
      
      <ModeSelector mode={mode} setMode={setMode} disabled={isDisabled} />
      
      <ColorPalette colors={colors} handleColorChange={handleColorChange} disabled={isDisabled} />
    </Panel>
  );
};

SettingsPanel.propTypes = {
  isOn: PropTypes.bool.isRequired,
  setIsOn: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  setMode: PropTypes.func.isRequired,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleColorChange: PropTypes.func.isRequired
};

export default SettingsPanel;