/**
 * Robinhood Chain, and the pons bonding-curve contracts the shares trade on.
 *
 * The addresses below were read off the chain rather than copied from docs:
 * the factory's own `launchForwarder()` view names the forwarder, and the
 * curve selectors were recovered from bytecode. Anything that is *not*
 * verified is left as an environment variable rather than guessed, because a
 * wrong address here looks like a working app right up until someone signs.
 */
export const CHAIN = {
  id: 4663,
  name: "Robinhood Chain",
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "https://rpc.mainnet.chain.robinhood.com",
  explorer: "https://robinhoodchain.blockscout.com",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
} as const;

/** pons V2 on Robinhood Chain. */
export const PONS = {
  factory: "0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e",
  launchForwarder: "0xe33e9e479df8802cb0866d5d05258bec4cf62948",
  feeEscrow: "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e",
  multicall3: "0xcA11bde05977b3631167028862bE2a173976CA11",
} as const;

/** Curve economics, fixed by the factory config the shares launch under. */
export const CURVE = {
  /** ETH raised on the curve before it graduates to a pool. */
  graduationThresholdEth: 4.2,
  /** 1e9 shares minted per trader. */
  launchSupply: 1_000_000_000,
  /** 1% of every trade, which is what the trader is paid. */
  feeBps: 100,
  /** The protocol's cut of that fee. */
  protocolFeeShareBps: 3000,
} as const;

/**
 * The reads the market needs from a curve. Fee balance stays on the curve
 * until pons sweeps it to the escrow, so "fees paid" and "fees accrued" are
 * two different numbers and the UI must not pretend otherwise.
 */
export const CURVE_ABI = [
  {
    type: "function",
    name: "getReserves",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "quoteReserve", type: "uint256" },
      { name: "baseReserve", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "realQuoteReserve",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "graduationThreshold",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "graduated",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "launchSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "quoteFeeBalance",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "feeBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint16" }],
  },
  {
    type: "function",
    name: "deployer",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    // `quoteAmount` must equal msg.value or the curve reverts with
    // NativeValueMismatch — there is no deadline argument.
    name: "buy",
    stateMutability: "payable",
    inputs: [
      { name: "quoteAmount", type: "uint256" },
      { name: "minTokensOut", type: "uint256" },
      { name: "recipient", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "sell",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenAmount", type: "uint256" },
      { name: "minQuoteOut", type: "uint256" },
      { name: "recipient", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const;

export const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

export function explorerAddress(address: string) {
  return `${CHAIN.explorer}/address/${address}`;
}

export function explorerTx(hash: string) {
  return `${CHAIN.explorer}/tx/${hash}`;
}
