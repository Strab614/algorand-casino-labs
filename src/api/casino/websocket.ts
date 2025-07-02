import Pusher from "pusher-js";
import { casinoAPIClient } from "./enhanced";

// Enhanced WebSocket/Pusher integration for real-time casino events
export class CasinoWebSocketClient {
  private pusher: Pusher;
  private channels: Map<string, any> = new Map();
  private eventHandlers: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    this.pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      encrypted: true,
      authEndpoint: "https://api.algo-casino.com/pusher/auth",
      auth: {
        headers: {
          "Content-Type": "application/json",
        },
      },
    });

    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers() {
    this.pusher.connection.bind("connected", () => {
      console.log("Connected to Pusher");
    });

    this.pusher.connection.bind("disconnected", () => {
      console.log("Disconnected from Pusher");
    });

    this.pusher.connection.bind("error", (error: any) => {
      console.error("Pusher connection error:", error);
    });
  }

  // Subscribe to coin flip events
  subscribeToCoinFlipEvents(onGameCompleted: (data: any) => void) {
    const channel = this.getOrCreateChannel("coin-flip");
    
    channel.bind("game-completed", (data: any) => {
      console.log("Coin flip game completed:", data);
      onGameCompleted(data);
    });

    return () => {
      channel.unbind("game-completed");
      this.unsubscribeFromChannel("coin-flip");
    };
  }

  // Subscribe to roulette events
  subscribeToRouletteEvents(onGameCompleted: (data: any) => void) {
    const channel = this.getOrCreateChannel("roulette");
    
    channel.bind("game-completed", (data: any) => {
      console.log("Roulette game completed:", data);
      onGameCompleted(data);
    });

    return () => {
      channel.unbind("game-completed");
      this.unsubscribeFromChannel("roulette");
    };
  }

  // Subscribe to lottery events
  subscribeToLotteryEvents(
    onDraw: (data: any) => void,
    onTicketPurchase?: (data: any) => void
  ) {
    const channel = this.getOrCreateChannel("lottery");
    
    channel.bind("lottery-drawn", (data: any) => {
      console.log("Lottery drawn:", data);
      onDraw(data);
    });

    if (onTicketPurchase) {
      channel.bind("ticket-purchased", (data: any) => {
        console.log("Lottery ticket purchased:", data);
        onTicketPurchase(data);
      });
    }

    return () => {
      channel.unbind("lottery-drawn");
      if (onTicketPurchase) {
        channel.unbind("ticket-purchased");
      }
      this.unsubscribeFromChannel("lottery");
    };
  }

  // Subscribe to house staking events
  subscribeToStakingEvents(
    onRewardsDistributed: (data: any) => void,
    onPeriodUpdate?: (data: any) => void
  ) {
    const channel = this.getOrCreateChannel("house-staking");
    
    channel.bind("rewards-distributed", (data: any) => {
      console.log("Staking rewards distributed:", data);
      onRewardsDistributed(data);
    });

    if (onPeriodUpdate) {
      channel.bind("period-updated", (data: any) => {
        console.log("Staking period updated:", data);
        onPeriodUpdate(data);
      });
    }

    return () => {
      channel.unbind("rewards-distributed");
      if (onPeriodUpdate) {
        channel.unbind("period-updated");
      }
      this.unsubscribeFromChannel("house-staking");
    };
  }

  // Subscribe to leaderboard events
  subscribeToLeaderboardEvents(onUpdate: (data: any) => void) {
    const channel = this.getOrCreateChannel("leaderboard");
    
    channel.bind("leaderboard-updated", (data: any) => {
      console.log("Leaderboard updated:", data);
      onUpdate(data);
    });

    return () => {
      channel.unbind("leaderboard-updated");
      this.unsubscribeFromChannel("leaderboard");
    };
  }

  // Subscribe to general casino events
  subscribeToCasinoEvents(
    onBigWin: (data: any) => void,
    onSystemMessage?: (data: any) => void
  ) {
    const channel = this.getOrCreateChannel("casino-general");
    
    channel.bind("big-win", (data: any) => {
      console.log("Big win event:", data);
      onBigWin(data);
    });

    if (onSystemMessage) {
      channel.bind("system-message", (data: any) => {
        console.log("System message:", data);
        onSystemMessage(data);
      });
    }

    return () => {
      channel.unbind("big-win");
      if (onSystemMessage) {
        channel.unbind("system-message");
      }
      this.unsubscribeFromChannel("casino-general");
    };
  }

  // Private channel subscription for user-specific events
  subscribeToPrivateChannel(
    userId: string,
    onPersonalEvent: (data: any) => void
  ) {
    const channelName = `private-user-${userId}`;
    const channel = this.getOrCreateChannel(channelName);
    
    channel.bind("personal-event", (data: any) => {
      console.log("Personal event:", data);
      onPersonalEvent(data);
    });

    return () => {
      channel.unbind("personal-event");
      this.unsubscribeFromChannel(channelName);
    };
  }

  // Utility methods
  private getOrCreateChannel(channelName: string) {
    if (!this.channels.has(channelName)) {
      const channel = this.pusher.subscribe(channelName);
      this.channels.set(channelName, channel);
    }
    return this.channels.get(channelName);
  }

  private unsubscribeFromChannel(channelName: string) {
    if (this.channels.has(channelName)) {
      this.pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
    }
  }

  // Generic event subscription
  subscribeToEvent(
    channelName: string,
    eventName: string,
    handler: (data: any) => void
  ) {
    const channel = this.getOrCreateChannel(channelName);
    channel.bind(eventName, handler);

    // Store handler for cleanup
    const key = `${channelName}:${eventName}`;
    if (!this.eventHandlers.has(key)) {
      this.eventHandlers.set(key, []);
    }
    this.eventHandlers.get(key)!.push(handler);

    return () => {
      channel.unbind(eventName, handler);
      const handlers = this.eventHandlers.get(key);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
        if (handlers.length === 0) {
          this.eventHandlers.delete(key);
          this.unsubscribeFromChannel(channelName);
        }
      }
    };
  }

  // Cleanup all subscriptions
  disconnect() {
    this.channels.forEach((_, channelName) => {
      this.pusher.unsubscribe(channelName);
    });
    this.channels.clear();
    this.eventHandlers.clear();
    this.pusher.disconnect();
  }

  // Get connection state
  getConnectionState() {
    return this.pusher.connection.state;
  }

  // Check if connected
  isConnected() {
    return this.pusher.connection.state === "connected";
  }
}

// Export singleton instance
export const casinoWebSocketClient = new CasinoWebSocketClient();

// React hook for WebSocket integration
export const useCasinoWebSocket = () => {
  return {
    client: casinoWebSocketClient,
    isConnected: casinoWebSocketClient.isConnected(),
    connectionState: casinoWebSocketClient.getConnectionState(),
  };
};