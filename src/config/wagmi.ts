import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Define Celo Sepolia Testnet chain
const celoSepolia = defineChain({
    id: 11142220,
    name: 'Celo Sepolia',
    nativeCurrency: {
        decimals: 18,
        name: 'CELO',
        symbol: 'CELO',
    },
    rpcUrls: {
        default: {
            http: ['https://forno.celo-sepolia.celo-testnet.org'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Celo Sepolia Explorer',
            url: 'https://celo-sepolia.blockscout.com',
        },
    },
    testnet: true,
});

// Configure chains
export const config = getDefaultConfig({
    appName: 'Mouch Game',
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    chains: [celoSepolia],
    ssr: false, // Set to false for Vite
});
