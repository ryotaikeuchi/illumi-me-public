import React from 'react';
import PropTypes from 'prop-types';
import Panel from './common/Panel'; // 共通Panelコンポーネントをインポート
import LedPreview from './LedPreview';
import styles from './PreviewPanel.module.css'; // sectionTitle用

const PreviewPanel = ({ isOn, mode, colors }) => {
  return (
    <Panel> {/* 共通Panelコンポーネントを使用 */}
      <h2 className={styles.sectionTitle}>プレビュー</h2>
      <LedPreview isOn={isOn} mode={mode} colors={colors} />
    </Panel>
  );
};

PreviewPanel.propTypes = {
  isOn: PropTypes.bool.isRequired,
  mode: PropTypes.string.isRequired,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default PreviewPanel;