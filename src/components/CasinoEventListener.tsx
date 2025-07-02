import React, { useEffect } from 'react';
import { casinoWebSocketClient } from '@/api/casino/websocket';
import { useNotification } from '@/hooks/useNotification';
import { useWallet } from '@txnlab/use-wallet-react';

interface CasinoEventListenerProps {
  children: React.ReactNode;
}

/**
 * Global event listener component for casino events
 * This component should be placed at the app level to listen for casino-wide events
 */
export const CasinoEventListener: React.FC<CasinoEventListenerProps> = ({ children }) => {
  const notification = useNotification();
  const { activeAddress } = useWallet();

  useEffect(() => {
    // Subscribe to general casino events
    const unsubscribeCasino = casinoWebSocketClient.subscribeToCasinoEvents(
      (data) => {
        // Handle big win events
        notification.display({
          type: 'success',
          message: `🎉 Big Win! ${data.player} won ${data.amount} chips!`,
        });
      },
      (data) => {
        // Handle system messages
        notification.display({
          type: 'info',
          message: data.message,
        });
      }
    );

    // Subscribe to leaderboard updates
    const unsubscribeLeaderboard = casinoWebSocketClient.subscribeToLeaderboardEvents(
      (data) => {
        notification.display({
          type: 'info',
          message: 'Leaderboard has been updated!',
        });
      }
    );

    // Subscribe to user-specific events if wallet is connected
    let unsubscribePrivate: (() => void) | undefined;
    if (activeAddress) {
      unsubscribePrivate = casinoWebSocketClient.subscribeToPrivateChannel(
        activeAddress,
        (data) => {
          switch (data.type) {
            case 'reward-received':
              notification.display({
                type: 'success',
                message: `You received ${data.amount} chips as a reward!`,
              });
              break;
            case 'staking-reward':
              notification.display({
                type: 'success',
                message: `Staking reward: ${data.amount} chips distributed!`,
              });
              break;
            case 'refund-processed':
              notification.display({
                type: 'success',
                message: `Your refund of ${data.amount} chips has been processed!`,
              });
              break;
            default:
              notification.display({
                type: 'info',
                message: data.message || 'You have a new notification',
              });
          }
        }
      );
    }

    // Cleanup subscriptions
    return () => {
      unsubscribeCasino();
      unsubscribeLeaderboard();
      unsubscribePrivate?.();
    };
  }, [activeAddress, notification]);

  return <>{children}</>;
};

export default CasinoEventListener;