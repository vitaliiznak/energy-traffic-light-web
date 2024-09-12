import { Component, createSignal, onCleanup } from 'solid-js';
import { css } from '@emotion/css';
import { colors } from './styles/colors';
import { typography } from './styles/typography';
import { FaSolidClock } from 'solid-icons/fa';

export const Clock: Component = () => {
  const [time, setTime] = createSignal(new Date());

  const timer = setInterval(() => {
    setTime(new Date());
  }, 1000);

  onCleanup(() => clearInterval(timer));

  const styles = {
    clockContainer: css`
      display: flex;
      align-items: center;
      background-color: ${colors.surface};
      padding: 0.5rem 1rem;
      border-radius: 20px;
      box-shadow: 0 2px 4px ${colors.shadow};
    `,
    icon: css`
      color: ${colors.primary};
      margin-right: 0.5rem;
    `,
    time: css`
      font-size: ${typography.fontSize.lg};
      color: ${colors.text};
      font-weight: ${typography.fontWeight.medium};
    `,
  };

  return (
    <div class={styles.clockContainer}>
      <FaSolidClock size={24} class={styles.icon} />
      <div class={styles.time}>{time().toLocaleTimeString()}</div>
    </div>
  );
};