import { Component, createSignal, createEffect } from 'solid-js';
import { css } from '@emotion/css';
import { colors } from './styles/colors';
import { typography } from './styles/typography';
import { spacing } from './styles/common';
import { simulationStore } from './store/simulationStore';

const getStressLevel = (): number => {
  const currentTime = simulationStore.state.currentTime;
  const householdData = simulationStore.state.householdPowerLoad;
  
  const currentEntry = householdData.find(entry => entry.timestamp * 1000 <= currentTime);
  return currentEntry ? currentEntry.stress_level : 0;
};

export const TrafficLight: Component = () => {
  const [stressLevel, setStressLevel] = createSignal(0);
  const [activeLight, setActiveLight] = createSignal<'green' | 'yellow' | 'red'>('green');
  const [currentPrice, setCurrentPrice] = createSignal(0.12);
  const [potentialSavings, setPotentialSavings] = createSignal(0);

  const updateStressLevel = () => {
    const currentTime = simulationStore.state.currentTime;
    const gridPowerLoad = simulationStore.state.gridPowerLoad;
    
    const currentEntry = gridPowerLoad.find(entry => entry.timestamp * 1000 <= currentTime);
    if (currentEntry) {
      setStressLevel(currentEntry.Wert);
      setActiveLight(currentEntry.is_peak ? 'red' : 'green');
    }
  };

  createEffect(() => {
    updateStressLevel();

    // Update price based on active light
    let newPrice = 0.10; // Base price
    if (activeLight() === 'red') {
      newPrice = 0.20; // High load price
    } else if (activeLight() === 'yellow') {
      newPrice = 0.15; // Medium load price
    }
    setCurrentPrice(newPrice);

    // Calculate potential savings
    const averageConsumption = 30; // kWh per day
    const potentialReduction = 0.2; // 20% reduction
    const savings = averageConsumption * potentialReduction * (newPrice - 0.10) * 30; // Monthly savings
    setPotentialSavings(savings);
  });

  // Update stress level every second
  setInterval(updateStressLevel, 1000);

  const isPeak = stressLevel() > 1;

  const pulsingEffect = css`
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    animation: ${isPeak ? 'pulse 1s infinite' : 'none'};
  `;

  const peakIndicator = css`
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: ${colors.error};
    color: ${colors.text};
    font-size: ${typography.fontSize.xs};
    padding: 2px 6px;
    border-radius: 10px;
    display: ${isPeak ? 'block' : 'none'};
  `;

  const styles = {
    container: css`
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: ${spacing.lg};
      border-radius: 16px;
      background-color: ${colors.surface};
      box-shadow: 0 4px 6px ${colors.shadow};
    `,
    title: css`
      font-size: ${typography.fontSize.xl};
      font-weight: ${typography.fontWeight.bold};
      margin-bottom: ${spacing.md};
      color: ${colors.primary};
    `,
    lightsContainer: css`
      display: flex;
      justify-content: space-around;
      width: 100%;
      margin-bottom: ${spacing.md};
    `,
    light: css`
      width: 70px;
      height: 70px;
      border-radius: 50%;
      opacity: 0.3;
      transition: opacity 0.3s ease, box-shadow 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: ${typography.fontWeight.bold};
      color: ${colors.text};
      font-size: ${typography.fontSize.lg};
    `,
    red: css`
      background-color: #ff4136;
      border: 2px solid #8b0000;
    `,
    yellow: css`
      background-color: #ffdc00;
      border: 2px solid #8b8000;
    `,
    green: css`
      background-color: #2ecc40;
      border: 2px solid #006400;
    `,
    active: css`
      opacity: 1;
      box-shadow: 0 0 20px 5px currentColor;
    `,
    loadInfo: css`
      font-size: ${typography.fontSize.lg};
      margin-top: ${spacing.md};
      color: ${colors.text};
      text-align: center;
    `,
    loadBar: css`
      width: 100%;
      height: 24px;
      background-color: ${colors.background};
      border-radius: 12px;
      overflow: hidden;
      margin-top: ${spacing.sm};
    `,
    loadBarFill: css`
      height: 100%;
      background-color: ${activeLight() === 'green' ? '#2ecc40' : activeLight() === 'yellow' ? '#ffdc00' : '#ff4136'};
      transition: width 0.3s ease, background-color 0.3s ease;
    `,
    insightsContainer: css`
      margin-top: ${spacing.lg};
      text-align: center;
    `,
    priceInfo: css`
      font-size: ${typography.fontSize['2xl']};
      font-weight: ${typography.fontWeight.bold};
      color: ${colors.primary};
      margin-bottom: ${spacing.sm};
    `,
    savings: css`
      font-size: ${typography.fontSize.lg};
      color: ${colors.secondary};
      margin-bottom: ${spacing.md};
    `,
    insightsList: css`
      list-style-type: none;
      padding: 0;
    `,
    insightItem: css`
      margin-bottom: ${spacing.sm};
      padding: ${spacing.sm};
      background-color: ${colors.primaryDark};
      border-radius: 4px;
      color: ${colors.textLight};
    `,
  };

  const getInsights = () => {
    const load = stressLevel();
    if (load > 1) {
      return [
        "High grid load! Consider postponing high-energy activities.",
        "Use smart plugs to automatically turn off devices during peak hours.",
        "Adjust your thermostat by a few degrees to reduce energy consumption.",
      ];
    } else if (load > 0) {
      return [
        "Grid load is increasing. Be mindful of your energy usage.",
        "Run your dishwasher and washing machine during off-peak hours.",
        "Unplug electronics when not in use to reduce standby power consumption.",
      ];
    } else {
      return [
        "Grid load is low. This is a good time for energy-intensive tasks.",
        "Consider charging electric vehicles or running large appliances now.",
        "Take advantage of lower prices by pre-cooling or pre-heating your home.",
      ];
    }
  };

  return (
    <div class={`${styles.container} ${pulsingEffect}`} role="status" aria-live="polite">
      <div class={peakIndicator}>Peak</div>
      <h2 class={styles.title} id="traffic-light-title">Energy Traffic Lights</h2>
      <div class={styles.lightsContainer} aria-labelledby="traffic-light-title">
        <div 
          class={`${styles.light} ${styles.red} ${activeLight() === 'red' ? styles.active : ''}`}
          aria-label={activeLight() === 'red' ? 'High load' : ''}
        >
          H
        </div>
        <div 
          class={`${styles.light} ${styles.yellow} ${activeLight() === 'yellow' ? styles.active : ''}`}
          aria-label={activeLight() === 'yellow' ? 'Medium load' : ''}
        >
          M
        </div>
        <div 
          class={`${styles.light} ${styles.green} ${activeLight() === 'green' ? styles.active : ''}`}
          aria-label={activeLight() === 'green' ? 'Low load' : ''}
        >
          L
        </div>
      </div>
      <div class={styles.loadInfo}>
        STRESS LEVEL: {stressLevel().toFixed(2)}
        <div class={styles.loadBar}>
          <div 
            class={styles.loadBarFill} 
            style={{ width: `${Math.min(Math.abs(stressLevel()) / 2 * 100, 100)}%` }}
            role="progressbar"
            aria-valuenow={stressLevel()}
            aria-valuemin={-2}
            aria-valuemax={2}
          ></div>
        </div>
      </div>
      <div class={styles.insightsContainer}>
        <div class={styles.priceInfo}>
          Current Price: {currentPrice().toFixed(2)} CHF/kWh
        </div>
        {/* <div class={styles.savings}>
          Potential Monthly Savings: {potentialSavings().toFixed(2)} CHF
        </div> */}
        <ul class={styles.insightsList}>
          {getInsights().map((insight) => (
            <li class={styles.insightItem}>{insight}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TrafficLight;