import { Component, createSignal, createEffect } from 'solid-js';
import { css } from '@emotion/css';
import { colors } from './styles/colors';
import { typography } from './styles/typography';
import { spacing } from './styles/common';

// Mock service to fetch grid load data
const fetchGridLoad = async (): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Math.random() * 1000 + 500); // Random load between 500-1500 kWh
    }, 1000);
  });
};

export const TrafficLight: Component = () => {
  const [gridLoad, setGridLoad] = createSignal(0);
  const [activeLight, setActiveLight] = createSignal<'green' | 'yellow' | 'red'>('green');

  const updateGridLoad = async () => {
    const load = await fetchGridLoad();
    setGridLoad(load);
  };

  createEffect(() => {
    const load = gridLoad();
    if (load < 800) {
      setActiveLight('green');
    } else if (load < 1200) {
      setActiveLight('yellow');
    } else {
      setActiveLight('red');
    }
  });

  // Update grid load every 5 seconds
  setInterval(updateGridLoad, 5000);

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
  };

  return (
    <div class={styles.container} role="status" aria-live="polite">
      <h2 class={styles.title} id="traffic-light-title">Grid Load Status</h2>
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
        STRESS LEVEL: {gridLoad().toFixed(2)}
        <div class={styles.loadBar}>
          <div 
            class={styles.loadBarFill} 
            style={{ width: `${(gridLoad() / 1500) * 100}%` }}
            role="progressbar"
            aria-valuenow={gridLoad()}
            aria-valuemin={0}
            aria-valuemax={1500}
          ></div>
        </div>
      </div>
    </div>
  );
};