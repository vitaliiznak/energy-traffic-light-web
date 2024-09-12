import './styles/gloabal.css'
import { Component } from 'solid-js';
import { css } from '@emotion/css';
import { colors } from './styles/colors';
import { spacing } from './styles/common';
import { TrafficLight } from './TrafficLight';
import { ConsumptionGraph } from './ConsumptionGraph';
import { PriceAwareness } from './PriceAwareness';
import { ActionableInsights } from './ActionableInsights';
import { GamificationIncentives } from './GamificationIncentives';
import { Notifications } from './Notifications';

const App: Component = () => {
  const styles = {
    mainContainer: css`
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      padding: ${spacing.md};
      background-color: ${colors.background};
      color: ${colors.text};
    `,
    header: css`
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: ${spacing.md};
      text-align: center;
    `,
    dashboardGrid: css`
      display: grid;
      grid-template-columns: 1fr;
      gap: ${spacing.md};

      @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);
      }
    `,
    gridItem: css`
      background-color: ${colors.surface};
      border-radius: 8px;
      padding: ${spacing.md};
      box-shadow: 0 4px 6px ${colors.shadow};
    `,
  };

  return (
    <div class={styles.mainContainer}>
      <header class={styles.header}>Energy Consumption Dashboard</header>
      <div class={styles.dashboardGrid}>
        <div class={styles.gridItem}>
          <TrafficLight />
        </div>
        <div class={styles.gridItem}>
          <ConsumptionGraph />
        </div>
        <div class={styles.gridItem}>
          <PriceAwareness />
        </div>
        <div class={styles.gridItem}>
          <ActionableInsights />
        </div>
        <div class={styles.gridItem}>
          <GamificationIncentives />
        </div>
      </div>
      <Notifications />
    </div>
  );
};

export default App;