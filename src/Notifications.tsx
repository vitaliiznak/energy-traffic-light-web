import { Component, createSignal, createEffect, For } from 'solid-js';
import { css, keyframes } from '@emotion/css';
import { colors } from './styles/colors';
import { typography } from './styles/typography';
import { spacing } from './styles/common';

type Notification = {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'alert';
};

export const Notifications: Component = () => {
  const [notifications, setNotifications] = createSignal<Notification[]>([]);

  const addNotification = (message: string, type: 'info' | 'warning' | 'alert') => {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      type,
    };
    setNotifications((prev) => [...prev, newNotification]);

    // Remove notification after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
    }, 5000);
  };

  // Simulate notifications based on grid load
  createEffect(() => {
    const interval = setInterval(() => {
      const gridLoad = Math.random() * 100;
      if (gridLoad > 80) {
        addNotification('High grid load! Please reduce energy consumption.', 'alert');
      } else if (gridLoad > 60) {
        addNotification('Grid load is increasing. Consider reducing energy usage.', 'warning');
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  });

  const slideIn = keyframes`
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  `;

  const styles = {
    container: css`
      position: fixed;
      top: ${spacing.lg};
      right: ${spacing.lg};
      z-index: 1000;
    `,
    notification: css`
      padding: ${spacing.md};
      margin-bottom: ${spacing.sm};
      border-radius: 4px;
      box-shadow: 0 2px 4px ${colors.shadow};
      animation: ${slideIn} 0.3s ease-out;
    `,
    info: css`
      background-color: ${colors.primary};
      color: ${colors.text};
    `,
    warning: css`
      background-color: ${colors.warning};
      color: ${colors.text};
    `,
    alert: css`
      background-color: ${colors.error};
      color: ${colors.text};
    `,
    message: css`
      font-size: ${typography.fontSize.sm};
      font-weight: ${typography.fontWeight.medium};
    `,
  };

  return (
    <div class={styles.container}>
      <For each={notifications()}>
        {(notification) => (
          <div class={`${styles.notification} ${styles[notification.type]}`}>
            <p class={styles.message}>{notification.message}</p>
          </div>
        )}
      </For>
    </div>
  );
};