import { Component, createSignal, createEffect } from 'solid-js';
import { css } from '@emotion/css';
import { colors } from './styles/colors';
import { typography } from './styles/typography';
import { spacing } from './styles/common';

export const GamificationIncentives: Component = () => {
  const [score, setScore] = createSignal(0);
  const [level, setLevel] = createSignal(1);
  const [offPeakUsage, setOffPeakUsage] = createSignal(0);

  // Mock function to simulate off-peak usage updates
  const updateOffPeakUsage = () => {
    setOffPeakUsage((prev) => prev + Math.random() * 10);
  };

  createEffect(() => {
    // Update score based on off-peak usage
    setScore(Math.floor(offPeakUsage() / 10));
    
    // Update level based on score
    setLevel(Math.floor(score() / 100) + 1);
  });

  // Simulate updates every 5 seconds
  setInterval(updateOffPeakUsage, 5000);

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
    scoreContainer: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${spacing.md};
    `,
    score: css`
      font-size: ${typography.fontSize['2xl']};
      font-weight: ${typography.fontWeight.bold};
      color: ${colors.primary};
    `,
    level: css`
      font-size: ${typography.fontSize.lg};
      color: ${colors.secondary};
    `,
    progressBarContainer: css`
      width: 100%;
      height: 20px;
      background-color: ${colors.background};
      border-radius: 10px;
      overflow: hidden;
    `,
    progressBar: css`
      height: 100%;
      background-color: ${colors.primary};
      transition: width 0.3s ease;
    `,
    offPeakUsage: css`
      font-size: ${typography.fontSize.md};
      color: ${colors.textLight};
      margin-top: ${spacing.sm};
    `,
  };

  return (
    <div class={styles.container}>
      <h2 class={styles.title}>Energy Saver Challenge</h2>
      <div class={styles.scoreContainer}>
        <div class={styles.score}>Score: {score()}</div>
        <div class={styles.level}>Level {level()}</div>
      </div>
      <div class={styles.progressBarContainer}>
        <div 
          class={styles.progressBar} 
          style={{ width: `${(score() % 100)}%` }}
        />
      </div>
      <div class={styles.offPeakUsage}>
        Off-peak usage: {offPeakUsage().toFixed(2)} kWh
      </div>
    </div>
  );
};