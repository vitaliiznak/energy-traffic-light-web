import { Component, createSignal, createEffect } from 'solid-js';
import { css } from '@emotion/css';
import { colors } from './styles/colors';
import { typography } from './styles/typography';
import { spacing } from './styles/common';

export const PriceAwareness: Component = () => {
  const [currentPrice, setCurrentPrice] = createSignal(0.12);
  const [gridLoad, setGridLoad] = createSignal(50);
  const [potentialSavings, setPotentialSavings] = createSignal(0);

  const updateGridLoad = () => {
    // Simulate grid load changes
    const newLoad = Math.random() * 100;
    setGridLoad(newLoad);
  };

  createEffect(() => {
    // Update price based on grid load
    const load = gridLoad();
    let newPrice = 0.10; // Base price
    if (load > 80) {
      newPrice = 0.20; // High load price
    } else if (load > 60) {
      newPrice = 0.15; // Medium load price
    }
    setCurrentPrice(newPrice);

    // Calculate potential savings
    const averageConsumption = 30; // kWh per day
    const potentialReduction = 0.2; // 20% reduction
    const savings = averageConsumption * potentialReduction * (newPrice - 0.10) * 30; // Monthly savings
    setPotentialSavings(savings);
  });

  // Update grid load every 10 seconds
  setInterval(updateGridLoad, 10000);

  const styles = {
    container: css`
      display: flex;
      flex-direction: column;
      padding: ${spacing.md};
      background-color: ${colors.surface};
      border-radius: 8px;
      box-shadow: 0 4px 6px ${colors.shadow};
    `,
    title: css`
      font-size: ${typography.fontSize.xl};
      font-weight: ${typography.fontWeight.bold};
      color: ${colors.text};
      margin-bottom: ${spacing.md};
    `,
    priceInfo: css`
      font-size: ${typography.fontSize['2xl']};
      font-weight: ${typography.fontWeight.bold};
      color: ${colors.primary};
      margin-bottom: ${spacing.sm};
    `,
    gridLoad: css`
      font-size: ${typography.fontSize.md};
      color: ${colors.textLight};
      margin-bottom: ${spacing.md};
    `,
    savings: css`
      font-size: ${typography.fontSize.lg};
      color: ${colors.secondary};
      margin-bottom: ${spacing.md};
    `,
    suggestions: css`
      font-size: ${typography.fontSize.sm};
      color: ${colors.text};
    `,
    suggestion: css`
      margin-bottom: ${spacing.sm};
      padding: ${spacing.sm};
      background-color: ${colors.primaryDark};
      border-radius: 4px;
      color: ${colors.textLight};
    `,
  };

  return (
    <div class={styles.container} role="region" aria-labelledby="price-awareness-title">
      <h2 id="price-awareness-title" class={styles.title}>Price Awareness</h2>
      <div class={styles.priceInfo} aria-live="polite">
        Current Price: ${currentPrice().toFixed(2)} / kWh
      </div>
      <div class={styles.gridLoad} aria-live="polite">
        Grid Load: {gridLoad().toFixed(0)}%
      </div>
      <div class={styles.savings} aria-live="polite">
        Potential Monthly Savings: ${potentialSavings().toFixed(2)}
      </div>
      <div class={styles.suggestions}>
        <h3 id="savings-suggestions">Savings Suggestions:</h3>
        <ul aria-labelledby="savings-suggestions">
          <li class={styles.suggestion}>
            Shift high-energy activities to off-peak hours (typically late evening or early morning).
          </li>
          <li class={styles.suggestion}>
            Use smart plugs to automatically turn off devices during peak hours.
          </li>
          <li class={styles.suggestion}>
            Adjust your thermostat by a few degrees during high-price periods.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PriceAwareness;