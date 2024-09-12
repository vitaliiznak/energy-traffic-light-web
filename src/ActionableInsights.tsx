import { Component } from 'solid-js';
import { css } from '@emotion/css';
import { colors } from './styles/colors';

export const ActionableInsights: Component = () => {
  const styles = {
    container: css`
      display: flex;
      flex-direction: column;
    `,
    title: css`
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
    `,
    insight: css`
      background-color: ${colors.primaryDark};
      color: ${colors.text};
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 10px;
    `,
  };

  return (
    <div class={styles.container}>
      <h2 class={styles.title}>Energy-Saving Tips</h2>
      <div class={styles.insight}>
        Tip: Run your dishwasher and washing machine during off-peak hours to save on energy costs.
      </div>
      <div class={styles.insight}>
        Tip: Unplug electronics when not in use to reduce standby power consumption.
      </div>
    </div>
  );
};