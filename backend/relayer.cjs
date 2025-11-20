
require("dotenv").config();

const express = require("express");
const { createPublicClient, createWalletClient, http, getContract } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Celo Sepolia config
const celoSepolia = {
  id: 11142220,
  name: "Celo Sepolia",
  network: "celo-sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: { default: { http: ["https://forno.celo-sepolia.celo-testnet.org/"] } },
};

// Contract details - UPDATE THIS WITH YOUR DEPLOYED CONTRACT ADDRESS
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x80b828B226AFee0A2FA87404EF3ED44E6ddEecF2"; // Deployed HitTracker address
const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "player", type: "address" },
      { internalType: "uint256", name: "points", type: "uint256" }
    ],
    name: "recordHit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "relayerAddress", type: "address" }],
    name: "addAuthorizedRelayer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "hitId", type: "uint256" }],
    name: "hits",
    outputs: [
      { internalType: "address", name: "player", type: "address" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
      { internalType: "uint256", name: "points", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getGlobalTopScores",
    outputs: [
      {
        components: [
          { internalType: "address", name: "player", type: "address" },
          { internalType: "uint256", name: "score", type: "uint256" },
          { internalType: "uint256", name: "timestamp", type: "uint256" }
        ],
        internalType: "struct HitTracker.TopScore[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "getPlayerTotalScore",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "getPlayerHits",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalHits",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "relayerAddress", type: "address" }],
    name: "isAuthorizedRelayer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  // Error definitions
  {
    inputs: [],
    name: "Unauthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidScore",
    type: "error",
  }
];

// Helper function to validate and format private keys
function validatePrivateKey(key) {
  if (!key) return null;
  
  // Remove 0x prefix if present
  const cleanKey = key.startsWith('0x') ? key.slice(2) : key;
  
  // Check if it's a valid 64-character hex string
  if (cleanKey.length !== 64 || !/^[0-9a-fA-F]+$/.test(cleanKey)) {
    console.warn(`Invalid private key format: ${key.slice(0, 10)}...`);
    return null;
  }
  
  return `0x${cleanKey}`;
}

// Single private key for the deployer/owner - properly formatted
const DEPLOYER_PRIVATE_KEY = validatePrivateKey(process.env.PRIVATE_KEY);

// Multiple private keys for load balancing - All 50 relayers
const PRIVATE_KEYS = [
  process.env.RELAYER_PRIVATE_KEY_1,
  process.env.RELAYER_PRIVATE_KEY_2,
  // process.env.RELAYER_PRIVATE_KEY_3,
  // process.env.RELAYER_PRIVATE_KEY_4,
  // process.env.RELAYER_PRIVATE_KEY_5,
  // process.env.RELAYER_PRIVATE_KEY_6,
  // process.env.RELAYER_PRIVATE_KEY_7,
  // process.env.RELAYER_PRIVATE_KEY_8,
  // process.env.RELAYER_PRIVATE_KEY_9,
  // process.env.RELAYER_PRIVATE_KEY_10,
  // process.env.RELAYER_PRIVATE_KEY_11,
  // process.env.RELAYER_PRIVATE_KEY_12,
  // process.env.RELAYER_PRIVATE_KEY_13,
  // process.env.RELAYER_PRIVATE_KEY_14,
  // process.env.RELAYER_PRIVATE_KEY_15,
  // process.env.RELAYER_PRIVATE_KEY_16,
  // process.env.RELAYER_PRIVATE_KEY_17,
  // process.env.RELAYER_PRIVATE_KEY_18,
  // process.env.RELAYER_PRIVATE_KEY_19,
  // process.env.RELAYER_PRIVATE_KEY_20,
  // process.env.RELAYER_PRIVATE_KEY_21,
  // process.env.RELAYER_PRIVATE_KEY_22,
  // process.env.RELAYER_PRIVATE_KEY_23,
  // process.env.RELAYER_PRIVATE_KEY_24,
  // process.env.RELAYER_PRIVATE_KEY_25,
  // process.env.RELAYER_PRIVATE_KEY_26,
  // process.env.RELAYER_PRIVATE_KEY_27,
  // process.env.RELAYER_PRIVATE_KEY_28,
  // process.env.RELAYER_PRIVATE_KEY_29,
  // process.env.RELAYER_PRIVATE_KEY_30,
  // process.env.RELAYER_PRIVATE_KEY_31,
  // process.env.RELAYER_PRIVATE_KEY_32,
  // process.env.RELAYER_PRIVATE_KEY_33,
  // process.env.RELAYER_PRIVATE_KEY_34,
  // process.env.RELAYER_PRIVATE_KEY_35,
  // process.env.RELAYER_PRIVATE_KEY_36,
  // process.env.RELAYER_PRIVATE_KEY_37,
  // process.env.RELAYER_PRIVATE_KEY_38,
  // process.env.RELAYER_PRIVATE_KEY_39,
  // process.env.RELAYER_PRIVATE_KEY_40,
  // process.env.RELAYER_PRIVATE_KEY_41,
  // process.env.RELAYER_PRIVATE_KEY_42,
  // process.env.RELAYER_PRIVATE_KEY_43,
  // process.env.RELAYER_PRIVATE_KEY_44,
  // process.env.RELAYER_PRIVATE_KEY_45,
  // process.env.RELAYER_PRIVATE_KEY_46,
  // process.env.RELAYER_PRIVATE_KEY_47,
  // process.env.RELAYER_PRIVATE_KEY_48,
  // process.env.RELAYER_PRIVATE_KEY_49,
  // process.env.RELAYER_PRIVATE_KEY_50,
].filter(key => !!key).map(key => validatePrivateKey(key)).filter(key => !!key);

if (!DEPLOYER_PRIVATE_KEY) {
  console.error("❌ No valid deployer private key found!");
  process.exit(1);
}

console.log(`🔑 Loaded deployer private key`);
console.log(`🔑 Loaded ${PRIVATE_KEYS.length} relayer private keys`);
// Create transport and public client (prefer env-provided RPC e.g., Alchemy)
const RPC_URL = process.env.ALCHEMY_RPC_URL || process.env.CELO_RPC_URL || "https://forno.celo-sepolia.celo-testnet.org/";
const transport = http(RPC_URL);
const publicClient = createPublicClient({
  chain: celoSepolia,
  transport,
});

// Queue and wallet tracking
const txQueue = [];
const busyKeys = new Set();
let isProcessing = false;
// Round-robin index for fair key selection across restarts
let rrIndex = 0;
// Simple balance cache to reduce RPC pressure
const balanceCache = new Map(); // key -> { balance: bigint, ts: number }
const BALANCE_TTL_MS = Number(process.env.BALANCE_TTL_MS || 30000);
const MIN_BALANCE_WEI = (() => {
  try { return BigInt(process.env.MIN_BALANCE_WEI || "100000000000000"); } catch { return 100000000000000n; }
})();
// Gas tuning
const GAS_MULTIPLIER_X100 = (() => { const n = Number(process.env.GAS_MULTIPLIER || 1.2); return BigInt(Math.max(100, Math.round(n * 100))); })();

async function getAvailableKey() {
  const n = PRIVATE_KEYS.length;
  if (n === 0) return null;
  // Try each key at most once per selection, starting from rrIndex
  for (let attempt = 0; attempt < n; attempt++) {
    const idx = (rrIndex + attempt) % n;
    const key = PRIVATE_KEYS[idx];
    if (busyKeys.has(key)) continue;
    const account = privateKeyToAccount(key);
    // Balance check with TTL cache
    let cached = balanceCache.get(key);
    const now = Date.now();
    if (!cached || now - cached.ts > BALANCE_TTL_MS) {
      try {
        const bal = await publicClient.getBalance({ address: account.address });
        cached = { balance: bal, ts: now };
        balanceCache.set(key, cached);
      } catch (e) {
        console.warn(`⚠️ Balance check failed for ${account.address}:`, e?.message || e);
        continue;
      }
    }
    if (cached.balance >= MIN_BALANCE_WEI) {
      rrIndex = (idx + 1) % n; // advance RR pointer after a successful pick
      return key;
    } else {
      console.warn(`⏭️ Skipping key (low balance) ${account.address}: ${cached.balance.toString()} < ${MIN_BALANCE_WEI.toString()}`);
      continue;
    }
  }
  return null;
}

async function authorizeAllRelayers() {
  console.log("🔐 Setting up all relayers as authorized...");
  
  try {
    const deployerAccount = privateKeyToAccount(DEPLOYER_PRIVATE_KEY);
    const deployerWallet = createWalletClient({
      account: deployerAccount,
      chain: celoSepolia,
      transport,
    });

    // Authorize deployer first
    const isDeployerAuthorized = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "isAuthorizedRelayer",
      args: [deployerAccount.address],
    });

    if (!isDeployerAuthorized) {
      console.log(`🔐 Authorizing deployer as relayer: ${deployerAccount.address}`);
      const hash = await deployerWallet.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "addAuthorizedRelayer",
        args: [deployerAccount.address],
      });
      // ---- FIX: Add this line to wait for confirmation ----
      await publicClient.waitForTransactionReceipt({ hash });
      console.log(`✅ Deployer ${deployerAccount.address} authorized as relayer: ${hash}`);
    } else {
      console.log(`✅ Deployer ${deployerAccount.address} already authorized as relayer`);
    }

    // Authorize all relayer keys
    for (const privateKey of PRIVATE_KEYS) {
      const account = privateKeyToAccount(privateKey);
      const walletClient = createWalletClient({
        account,
        chain: celoSepolia,
        transport,
      });

      const isAuthorized = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "isAuthorizedRelayer",
        args: [account.address],
      });

      if (!isAuthorized) {
        console.log(`🔐 Authorizing relayer: ${account.address}`);
        const hash = await deployerWallet.writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "addAuthorizedRelayer",
          args: [account.address],
        });
        // ---- FIX: Add this line to wait for confirmation ----
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`✅ Relayer ${account.address} authorized: ${hash}`);
      } else {
        console.log(`✅ Relayer ${account.address} already authorized`);
      }
    }
  } catch (error) {
    console.error(`❌ Failed to authorize relayers:`, error.message);
  }
}

async function processSingleTransaction(tx) {
  const startTime = Date.now();
  try {
    const account = privateKeyToAccount(tx.privateKey);
    const walletClient = createWalletClient({
      account,
      chain: celoSepolia,
      transport,
    });

    // Use getContract pattern like sample relayer
    const contract = getContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      client: walletClient,
    });

    // Get fresh nonce for each transaction
    const nonceHex = await walletClient.request({
      method: "eth_getTransactionCount",
      params: [account.address, "pending"],
    });
    const nonce = parseInt(String(nonceHex), 16);

    console.log(`🚀 Sending transaction for ${tx.player} - ${tx.points} points with nonce ${nonce} using key ${tx.privateKey.slice(-4)}`);

    // Estimate gas & fees
    let gas;
    let feeOptions = {};
    try {
      const baseEstimate = await publicClient.estimateContractGas({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "recordHit",
        args: [tx.player, tx.points],
        account: account.address,
      });
      gas = (baseEstimate * GAS_MULTIPLIER_X100 + 99n) / 100n; // round up
    } catch (e) {
      console.warn("⚠️ Gas estimation failed, falling back to fixed buffer", e?.message || e);
      gas = 300000n; // conservative fallback
    }

    try {
      const fees = await publicClient.estimateFeesPerGas();
      if (fees?.maxFeePerGas && fees?.maxPriorityFeePerGas) {
        feeOptions = { maxFeePerGas: fees.maxFeePerGas, maxPriorityFeePerGas: fees.maxPriorityFeePerGas };
      } else {
        const gasPrice = await publicClient.getGasPrice();
        feeOptions = { gasPrice };
      }
    } catch (e) {
      const gasPrice = await publicClient.getGasPrice().catch(() => null);
      if (gasPrice) feeOptions = { gasPrice };
    }

    // Pre-flight balance check against estimated cost
    try {
      const bal = await publicClient.getBalance({ address: account.address });
      let required;
      if ('maxFeePerGas' in feeOptions) {
        required = gas * feeOptions.maxFeePerGas;
      } else if ('gasPrice' in feeOptions) {
        required = gas * feeOptions.gasPrice;
      } else {
        required = gas * 1_000_000_000n; // 1 gwei fallback
      }
      if (bal < required) {
        throw new Error(`insufficient balance for gas: have ${bal.toString()} need ${required.toString()}`);
      }
    } catch (e) {
      console.warn(`⛽ Pre-flight balance check failed for ${account.address}: ${e?.message || e}`);
    }

    // Send with explicit gas & fee options
    const hash = await contract.write.recordHit([tx.player, tx.points], { nonce, gas, ...feeOptions });

    console.log(`✅ Transaction sent: ${hash}`);
    console.log(`📊 Hit recorded for player ${tx.player}: ${tx.points} points`);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

    return { success: true, hash };
  } catch (error) {
    console.error(`❌ Transaction failed:`, error);
    return { success: false, error: error.message };
  } finally {
    busyKeys.delete(tx.privateKey);
    console.log(`Freed key: ${tx.privateKey.slice(-4)}, Time taken: ${Date.now() - startTime}ms`);
  }
}

async function processQueue() {
  if (isProcessing || txQueue.length === 0) return;

  isProcessing = true;
  console.log(`🔄 Processing queue: ${txQueue.length} transactions pending`);

  while (txQueue.length > 0) {
    const privateKey = await getAvailableKey();
    if (!privateKey) {
      // If no keys available, wait 100ms and check again
      await new Promise(resolve => setTimeout(resolve, 100));
      continue;
    }

    console.log(`Using key: ${privateKey.slice(-4)}, Queue length: ${txQueue.length}`);
    busyKeys.add(privateKey);
    const item = txQueue.shift();
    
    if (item) {
      // Add private key to transaction data
      item.privateKey = privateKey;
      // Process transaction without waiting for it
      processSingleTransaction(item).then(async (result) => {
        if (!result.success) {
          // On failure, retry once with a different key that passes balance check
          const fallbackKey = await getAvailableKey();
          if (fallbackKey && fallbackKey !== privateKey) {
            console.log(`🔁 Retrying with fallback key: ${fallbackKey.slice(-4)}`);
            busyKeys.add(fallbackKey);
            item.privateKey = fallbackKey;
            const retry = await processSingleTransaction(item);
            item.resolve(retry);
            return;
          }
        }
        item.resolve(result);
      }).catch(error => {
        item.reject(error);
      });
    } else {
      busyKeys.delete(privateKey);
    }
  }

  isProcessing = false;
}

// API Endpoints
app.post("/recordHit", async (req, res) => {
  try {
    const { player, points } = req.body;

    if (!player || !points) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate inputs
    if (points > 100) {
      return res.status(400).json({ error: "Points cannot exceed 100" });
    }

    const tx = {
      player,
      points: BigInt(points),
    };

    // Create promise for this transaction
    const txPromise = new Promise((resolve, reject) => {
      txQueue.push({
        ...tx,
        resolve,
        reject
      });
    });

    // Process queue immediately
    processQueue();

    // Wait for transaction result
    const result = await txPromise;
    
    if (result.success) {
      res.json({ 
        success: true, 
        hash: result.hash,
        message: "Hit recorded successfully"
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: result.error 
      });
    }
  } catch (error) {
    console.error("Error processing hit:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/status", async (req, res) => {
  try {
    const totalHits = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getTotalHits",
    });

    res.json({
      status: "running",
      queueLength: txQueue.length,
      totalHits: totalHits.toString(),
      deployerAddress: privateKeyToAccount(DEPLOYER_PRIVATE_KEY).address,
    });
  } catch (error) {
    console.error("Error getting status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/topScores", async (req, res) => {
  try {
    const topScores = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getGlobalTopScores"
    });
    
    // Convert BigInt values to strings for JSON serialization
    const serializedScores = topScores.map(score => ({
      player: score.player,
      score: score.score.toString(),
      timestamp: score.timestamp.toString()
    }));
    
    res.json({ topScores: serializedScores });
  } catch (error) {
    console.error("Error getting top scores:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/playerScore/:address", async (req, res) => {
  try {
    const playerAddress = req.params.address;
    const totalScore = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getPlayerTotalScore",
      args: [playerAddress],
    });

    const hitCount = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getPlayerHits",
      args: [playerAddress],
    });

    res.json({ 
      player: playerAddress,
      totalScore: totalScore.toString(), // Convert BigInt to string
      hitCount: hitCount.length
    });
  } catch (error) {
    console.error("Error getting player score:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`🚀 Relayer server running on port ${PORT}`);
  console.log(`📊 Contract address: ${CONTRACT_ADDRESS}`);
  console.log(`🔑 Deployer address: ${privateKeyToAccount(DEPLOYER_PRIVATE_KEY).address}`);
  console.log(`🌐 RPC: ${RPC_URL}`);
  console.log(`⚡ Instant transaction processing enabled`);
  
  // Authorize deployer as relayer on startup
  await authorizeAllRelayers();
});