# Algorand Casino Labs

A modern, decentralized gaming platform built on the Algorand blockchain, featuring provably fair games, DeFi integrations, and advanced smart contract capabilities.

## 🚀 Features

### Core Gaming Platform
- **Lottery System**: Provably fair lottery with randomness beacon integration
- **Coin Flip**: Simple heads/tails betting with instant results
- **Roulette**: American roulette with comprehensive betting options
- **House Staking**: Stake tokens to become the house and earn profits

### Blockchain Integration
- **Latest Algorand SDK**: Built with algosdk v3.1.0 and AlgoKit Utils v8.1.0
- **Multi-Wallet Support**: Pera, Defly, Exodus, Lute, and WalletConnect
- **Real-time Updates**: Live transaction monitoring and network status
- **Smart Contract Integration**: Direct interaction with Algorand applications

### Modern Architecture
- **React 18**: Latest React with TypeScript support
- **Material-UI v5**: Modern, accessible UI components
- **TanStack Query**: Advanced data fetching and caching
- **Redux Toolkit**: Predictable state management
- **Vite**: Fast development and optimized builds

## 🛠 Technology Stack

### Frontend
- **React 18.3.1** with TypeScript
- **Material-UI 5.15.15** for UI components
- **TanStack React Query 5.75.5** for data fetching
- **Redux Toolkit 2.2.3** for state management
- **React Router 6.23.1** for navigation

### Blockchain
- **Algorand SDK 3.1.0** - Latest Algorand JavaScript SDK
- **AlgoKit Utils 8.1.0** - Enhanced Algorand development tools
- **Use-Wallet React 3.0.0** - Multi-wallet integration
- **WalletConnect 2.14.0** - Cross-platform wallet connections

### Development
- **Vite 6.3.2** - Fast build tool and dev server
- **TypeScript 5.8.3** - Type safety and developer experience
- **ESLint** - Code quality and consistency
- **Sass** - Enhanced CSS capabilities

## 🏗 Architecture

### Enhanced Algorand Integration

The application uses the latest Algorand SDK with modern patterns:

```typescript
// Enhanced Algorand Client
import { AlgorandClient } from "@algorandfoundation/algokit-utils";

const algorandClient = AlgorandClient.fromConfig({
  algodConfig: {
    server: "https://mainnet-api.4160.nodely.dev",
    token: "",
  },
  indexerConfig: {
    server: "https://mainnet-idx.4160.nodely.dev", 
    token: "",
  },
});
```

### Modern React Hooks

Custom hooks for Algorand operations:

```typescript
// Account information with caching
const { data: accountInfo } = useAccountInfo(address);

// Real-time network status
const { data: networkStatus } = useNetworkStatus();

// Transaction building and submission
const submitTransaction = useSubmitTransaction();
```

### Smart Contract Integration

Direct integration with Algorand applications:

```typescript
// Application state management
const { data: appInfo } = useApplicationInfo(appId);

// Transaction composition
const transaction = await algorandClient.createPaymentTransaction({
  from: sender,
  to: receiver,
  amount: microAlgos(1),
});
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Algorand wallet (Pera, Defly, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/algorand-casino-labs.git
   cd algorand-casino-labs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   VITE_ALGOD_NETWORK=mainnet
   VITE_ALGOD_SERVER=https://mainnet-api.4160.nodely.dev
   VITE_INDEXER_SERVER=https://mainnet-idx.4160.nodely.dev
   
   # Application IDs
   VITE_COIN_FLIP_APP_ID=your_coin_flip_app_id
   VITE_ROULETTE_APP_ID=your_roulette_app_id
   VITE_LOTTERY_MANAGER_ADDRESS=your_lottery_manager_address
   
   # Real-time features
   VITE_PUSHER_APP_KEY=your_pusher_key
   VITE_PUSHER_APP_CLUSTER=your_pusher_cluster
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🎮 Games & Features

### Lottery System
- **Provably Fair**: Uses Algorand's randomness beacon
- **Multiple Entries**: Up to 98 tickets per user
- **Prize Tiers**: 2, 3, 4, and 5 number matches
- **Rollover Jackpots**: Unclaimed prizes roll to next draw

### Coin Flip
- **Simple Betting**: Heads or tails prediction
- **Instant Results**: Fast transaction confirmation
- **3D Animation**: Immersive coin flip visualization
- **Sound Effects**: Enhanced user experience

### Roulette
- **American Roulette**: 38-number wheel (0, 00, 1-36)
- **Multiple Bet Types**: Numbers, colors, dozens, columns
- **Real-time Animation**: Spinning wheel with physics
- **Comprehensive Payouts**: Industry-standard odds

### House Staking
- **Profit Sharing**: Stake tokens to earn casino profits
- **Multiple Assets**: Support for various Algorand tokens
- **Transparent Rewards**: On-chain profit distribution
- **Flexible Periods**: Regular staking cycles

## 🔧 Development

### Project Structure

```
src/
├── api/                 # API integrations
│   └── algorand/       # Algorand client and utilities
├── app/                # Core application setup
├── components/         # Reusable UI components
├── features/           # Feature-specific code
│   ├── coin-flip/     # Coin flip game
│   ├── lottery/       # Lottery system
│   ├── roulette/      # Roulette game
│   └── house-staking/ # Staking features
├── hooks/             # Custom React hooks
├── routes/            # Page components
├── utils/             # Utility functions
└── types/             # TypeScript definitions
```

### Key Components

- **Enhanced Algorand Client**: Modern SDK integration with caching
- **Network Status**: Real-time network health monitoring
- **Transaction Builder**: Visual transaction composition
- **Wallet Integration**: Multi-wallet support with fallbacks
- **Performance Metrics**: Network performance tracking

### Custom Hooks

- `useAccountInfo()` - Account data with caching
- `useNetworkStatus()` - Real-time network monitoring
- `useSubmitTransaction()` - Transaction submission with feedback
- `usePerformanceMetrics()` - Network performance data

## 🔐 Security

### Smart Contract Security
- **Audited Contracts**: All smart contracts undergo security review
- **Randomness Verification**: Provably fair random number generation
- **Access Controls**: Proper permission management
- **Emergency Stops**: Circuit breakers for critical functions

### Frontend Security
- **Input Validation**: All user inputs are validated
- **Address Verification**: Algorand address format checking
- **Transaction Verification**: Pre-submission transaction review
- **Secure Storage**: No private keys stored in browser

## 🌐 Network Support

### Mainnet (Production)
- **Algod**: https://mainnet-api.4160.nodely.dev
- **Indexer**: https://mainnet-idx.4160.nodely.dev
- **Explorer**: https://allo.info

### TestNet (Development)
- **Algod**: https://testnet-api.algonode.cloud
- **Indexer**: https://testnet-idx.algonode.cloud
- **Explorer**: https://testnet.allo.info

### Local Development
- **Mock Mode**: Test without real wallet connections
- **Local Network**: Support for local Algorand nodes
- **Development Tools**: Enhanced debugging capabilities

## 📊 Performance

### Optimization Features
- **Code Splitting**: Lazy-loaded routes and components
- **Asset Optimization**: Compressed images and assets
- **Caching Strategy**: Intelligent data caching with TanStack Query
- **Bundle Analysis**: Optimized bundle sizes

### Monitoring
- **Network Health**: Real-time Algorand network status
- **Performance Metrics**: Block time and TPS tracking
- **Error Tracking**: Comprehensive error handling
- **User Analytics**: Usage patterns and optimization insights

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Testing**: Unit tests for critical functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🔗 Links

- **Live Application**: https://labs.algo-casino.com
- **Documentation**: https://docs.algo-casino.com
- **Discord**: https://discord.gg/RRVA5p3U6p
- **Twitter**: https://twitter.com/AlgoCasino

## 🙏 Acknowledgments

- **Algorand Foundation** - For the amazing blockchain platform
- **AlgoKit Team** - For the excellent development tools
- **Community** - For feedback and contributions
- **Open Source** - Built on the shoulders of giants

---

Built with ❤️ on Algorand