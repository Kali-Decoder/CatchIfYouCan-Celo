# Catch If You Can - Celo

A blockchain-based multiplayer game where players catch insects using hand tracking technology. Built on the Celo Sepolia testnet with real-time multiplayer capabilities, leaderboards, and on-chain score tracking.

## 🎮 Features

- **Hand Tracking Gameplay**: Use MediaPipe hand tracking to catch insects with your hands
- **Blockchain Integration**: Scores recorded on Celo Sepolia testnet via smart contracts
- **Multiplayer Mode**: Real-time multiplayer sessions using React Together
- **Single Player Mode**: Practice and improve your skills solo
- **Leaderboard**: View top players and track your rankings
- **Wallet Integration**: Connect with RainbowKit/Wagmi for seamless Web3 experience
- **Multiple Insect Types**: Choose from different insects (bee, butterfly, mouch, blue mouch)
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **RainbowKit/Wagmi** - Wallet connection and Web3 interactions
- **React Together** - Multiplayer synchronization
- **MediaPipe** - Hand tracking
- **Supabase** - Backend database for leaderboards
- **React Router** - Navigation

### Backend
- **Express.js** - API server
- **Viem** - Ethereum/Celo library for blockchain interactions
- **Node.js** - Runtime environment

### Blockchain
- **Celo Sepolia Testnet** - Network
- **Smart Contracts** - On-chain score tracking

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Git**
- A Web3 wallet (MetaMask, WalletConnect compatible)
- Celo Sepolia testnet tokens (for gas fees)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CatchIfYouCan-Celo
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

## ⚙️ Environment Variables Setup

### Frontend Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# WalletConnect Configuration
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_KEY=your-supabase-anon-key

# React Together (Multiplayer) Configuration
VITE_MULTISYNQ_APP_ID=your-multisynq-app-id
VITE_MULTISYNQ_API_KEY=your-multisynq-api-key
VITE_MULTISYNQ_SESSION_PASSWORD=catchbirds

# Backend Relayer URL
VITE_RELAYER_URL=http://localhost:3001
```

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Contract Configuration
CONTRACT_ADDRESS=0x80b828B226AFee0A2FA87404EF3ED44E6ddEecF2

# Private Keys (for relayer transactions)
PRIVATE_KEY=your-deployer-private-key
RELAYER_PRIVATE_KEY_1=your-relayer-private-key-1
RELAYER_PRIVATE_KEY_2=your-relayer-private-key-2

# RPC Configuration
ALCHEMY_RPC_URL=https://forno.celo-sepolia.celo-testnet.org/
# OR
CELO_RPC_URL=https://forno.celo-sepolia.celo-testnet.org/

# Gas Configuration (optional)
GAS_MULTIPLIER=1.2
MIN_BALANCE_WEI=100000000000000
BALANCE_TTL_MS=30000

# Server Port
PORT=3001
```

### Getting API Keys

1. **WalletConnect Project ID**:
   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy the Project ID

2. **Supabase**:
   - Visit [Supabase](https://supabase.com/)
   - Create a new project
   - Go to Settings > API
   - Copy the Project URL and anon/public key

3. **React Together (MultiSynq)**:
   - Visit [React Together](https://react-together.com/) or your MultiSynq provider
   - Create an account and project
   - Get your App ID and API Key

4. **Celo Sepolia Testnet Tokens**:
   - Visit [Celo Faucet](https://faucet.celo.org/)
   - Request testnet tokens for your wallet address

## 🏃 Running the Project

### Development Mode

#### 1. Start the Backend Relayer

```bash
cd backend
npm start
```

The backend will run on `http://localhost:3001` (or the port specified in your `.env`).

#### 2. Start the Frontend Development Server

In a new terminal, from the root directory:

```bash
npm run dev
```

The frontend will be available at `http://localhost:8080`.

### Production Build

#### Build the Frontend

```bash
npm run build
```

The production build will be in the `dist` directory.

#### Preview Production Build

```bash
npm run preview
```

## 🎯 Usage

### Starting the Game

1. **Connect Your Wallet**:
   - Click the "Connect Wallet" button on the start screen
   - Select your preferred wallet (MetaMask, WalletConnect, etc.)
   - Approve the connection and switch to Celo Sepolia testnet if prompted

2. **Select Game Mode**:
   - **Single Player**: Practice catching insects on your own
   - **Multiplayer**: 
     - **Host**: Create a new room
     - **Join**: Enter a room ID to join an existing game

3. **Choose Your Insect**:
   - Select from available insects (bee, butterfly, mouch, blue mouch)
   - Each has different movement patterns

4. **Play the Game**:
   - Use hand tracking to catch insects
   - Each catch earns points
   - Points are recorded on-chain via the relayer
   - Game ends when time runs out or you choose to exit

5. **View Leaderboard**:
   - Check your ranking and top players
   - Leaderboard data is stored in Supabase

### Hand Tracking Setup

- Ensure good lighting
- Position your camera so your hands are visible
- Allow camera permissions when prompted
- Follow on-screen instructions for hand calibration

## 📁 Project Structure

```
CatchIfYouCan-Celo/
├── backend/                 # Backend relayer service
│   ├── relayer.cjs         # Express server for blockchain transactions
│   ├── Dockerfile          # Docker configuration for deployment
│   └── package.json        # Backend dependencies
├── public/                  # Static assets
│   ├── animals/            # Insect GIFs and sprites
│   ├── audio/              # Game sound effects
│   └── spritesheet/        # Sprite sheets for animations
├── src/
│   ├── components/         # React components
│   │   ├── GameScreen.tsx  # Single player game
│   │   ├── GameScreenMultiplayer.tsx  # Multiplayer game
│   │   ├── StartScreen.tsx # Start screen
│   │   ├── InsectSelectScreen.tsx  # Insect selection
│   │   ├── LeaderboardScreen.tsx   # Leaderboard
│   │   ├── HandTrackingView.tsx    # Hand tracking component
│   │   ├── WalletButton.tsx        # Wallet connection
│   │   ├── WalletProvider.tsx      # Wallet context
│   │   └── ui/             # UI components (shadcn/ui)
│   ├── config/
│   │   └── wagmi.ts        # Wagmi/RainbowKit configuration
│   ├── hooks/              # Custom React hooks
│   ├── lib/
│   │   ├── supabaseClient.ts  # Supabase client
│   │   └── utils.ts       # Utility functions
│   ├── pages/              # Page components
│   │   ├── Index.tsx      # Main page
│   │   └── NotFound.tsx   # 404 page
│   ├── services/
│   │   ├── gameDataService.ts  # Game data management
│   │   └── hitService.ts       # Hit/score service
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── index.html              # HTML template
├── package.json            # Frontend dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## 🐳 Docker Deployment

### Backend Deployment

The backend includes a Dockerfile for containerized deployment:

```bash
cd backend
docker build -t catch-if-you-can-backend .
docker run -p 3001:3001 --env-file .env catch-if-you-can-backend
```

For platforms like Render, ensure the `PORT` environment variable is set (Render sets this automatically).

## 🔧 Configuration

### Network Configuration

The project is configured for **Celo Sepolia Testnet** by default. To change networks:

1. Update `src/config/wagmi.ts` with your chain configuration
2. Update the RPC URL in backend `.env`
3. Deploy contracts to the new network
4. Update `CONTRACT_ADDRESS` in backend `.env`

### Smart Contract

The game uses a smart contract to record hits/scores on-chain. The contract address is configured in the backend environment variables.

To deploy your own contract:
1. Use Hardhat or your preferred deployment tool
2. Update `CONTRACT_ADDRESS` in backend `.env`
3. Ensure the relayer wallet is authorized in the contract

## 🧪 Testing

Run the linter:

```bash
npm run lint
```

## 📝 Scripts

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts

- `npm start` - Start the relayer server
- `npm run dev` - Start in development mode

## 🐛 Troubleshooting

### Common Issues

1. **Wallet Connection Fails**:
   - Ensure you're using a Web3-compatible browser
   - Check that WalletConnect Project ID is correct
   - Verify network is set to Celo Sepolia

2. **Hand Tracking Not Working**:
   - Grant camera permissions
   - Check browser compatibility (Chrome/Edge recommended)
   - Ensure good lighting conditions

3. **Backend Connection Errors**:
   - Verify `VITE_RELAYER_URL` matches backend URL
   - Check backend is running
   - Verify CORS is configured correctly

4. **Transaction Failures**:
   - Ensure wallet has Celo Sepolia testnet tokens
   - Check relayer has sufficient balance
   - Verify contract address is correct

5. **Environment Variables Not Loading**:
   - Ensure `.env` files are in correct directories
   - Restart dev server after changing `.env`
   - Check variable names start with `VITE_` for frontend


---

**Note**: This project uses Celo Sepolia testnet. Ensure you have testnet tokens before playing. Never use mainnet private keys or real funds in development.
