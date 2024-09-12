import './styles/gloabal.css'
import { Component, createSignal, JSX } from 'solid-js';
import { css } from '@emotion/css';
import { colors } from './styles/colors';
import { spacing } from './styles/common';
import { typography } from './styles/typography';
import { FaSolidExpand } from 'solid-icons/fa';
import { TrafficLight } from './TrafficLight';
import { ConsumptionGraph } from './ConsumptionGraph';
import { EnergyInsights } from './EnergyInsights';
import { GamificationIncentives } from './GamificationIncentives';
import { Notifications } from './Notifications';
import { BillEstimator } from './BillEstimator';
import { CarbonFootprintCalculator } from './CarbonFootprintCalculator';
import { CartoonImages } from './CartoonImages';

type ComponentKey = 'ConsumptionGraph' | 'TrafficLight' | 'GamificationIncentives' | 'BillEstimator' | 'CarbonFootprintCalculator';

const componentMap: Record<ComponentKey, Component<{}>> = {
  ConsumptionGraph,
  TrafficLight,
  EnergyInsights,
  GamificationIncentives,
  BillEstimator,
  CarbonFootprintCalculator,
};

const App: Component = () => {
  const [mainView, setMainView] = createSignal<ComponentKey>('ConsumptionGraph');

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
    mainView: css`
      background-color: ${colors.surface};
      border-radius: 12px;
      padding: ${spacing.lg};
      box-shadow: 0 4px 6px ${colors.shadow};
      margin-bottom: ${spacing.lg};
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
      position: relative;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 8px ${colors.shadow};
      }
    `,
    expandButton: css`
      position: absolute;
      top: ${spacing.sm};
      right: ${spacing.sm};
      background-color: ${colors.primary};
      color: ${colors.text};
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.3s ease;

      &:hover {
        background-color: ${colors.primaryDark};
        transform: scale(1.1);
      }
    `,
  };

  return (
    <div class={styles.mainContainer}>
      <header class={styles.header}>Energy Traffic Lights</header>
      <main class={styles.mainView}>
        {(() => {
          const Component = componentMap[mainView()];
          return <Component />;
        })()}
      </main>
      <div class={styles.dashboardGrid}>
        {Object.keys(componentMap).map((key) => {
          if (key !== mainView()) {
            const Component = componentMap[key as ComponentKey];
            return (
              <div class={styles.gridItem}>
                <Component />
                <button
                  class={styles.expandButton}
                  onClick={() => setMainView(key as ComponentKey)}
                  title="Expand to main view"
                >
                  <FaSolidExpand size={16} />
                </button>
              </div>
            );
          }
          return null;
        })}
      </div>
      <Notifications />
 {/*      <CartoonImages /> */}
    </div>
  );
};

export default App;