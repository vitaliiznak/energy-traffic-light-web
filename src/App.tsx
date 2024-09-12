import './styles/gloabal.css'
import { Component } from 'solid-js';
import { css } from '@emotion/css';
import { colors } from './styles/colors';
import { spacing } from './styles/common';
import { typography } from './styles/typography'; // Add this import
import { TrafficLight } from './TrafficLight';
import { ConsumptionGraph } from './ConsumptionGraph';
import { PriceAwareness } from './PriceAwareness';
import { ActionableInsights } from './ActionableInsights';
import { GamificationIncentives } from './GamificationIncentives';
import { Notifications } from './Notifications';
import { BillEstimator } from './BillEstimator';
import { CarbonFootprintCalculator } from './CarbonFootprintCalculator';

const App: Component = () => {
  const styles = {
    mainContainer: css`
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      padding: ${spacing.lg};
      background-color: ${colors.background};
      color: ${colors.text};
    `,
    header: css`
      font-size: ${typography.fontSize['2xl']};
      font-weight: ${typography.fontWeight.bold};
      margin-bottom: ${spacing.lg};
      text-align: center;
      color: ${colors.primary};
    `,
    dashboardGrid: css`
      display: grid;
      grid-template-columns: 1fr;
      gap: ${spacing.lg};

      @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);
      }
    `,
    gridItem: css`
      background-color: ${colors.surface};
      border-radius: 12px;
      padding: ${spacing.lg};
      box-shadow: 0 4px 6px ${colors.shadow};
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 8px ${colors.shadow};
      }
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
        <div class={styles.gridItem}>
          <BillEstimator />
        </div>
        <div class={styles.gridItem}>
          <CarbonFootprintCalculator />
        </div>
      </div>
      <Notifications />
    </div>
  );
};

export default App;