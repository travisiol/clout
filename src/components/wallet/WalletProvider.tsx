"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { CHAIN } from "@/lib/chain";

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: never[]) => void) => void;
  removeListener?: (event: string, handler: (...args: never[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

type WalletState = {
  address: `0x${string}` | null;
  chainId: number | null;
  connecting: boolean;
  hasInjected: boolean;
  dialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToChain: () => Promise<void>;
  provider: Eip1193Provider | null;
};

const WalletContext = createContext<WalletState | null>(null);

const STORAGE_KEY = "clout:wallet:connected";

/**
 * Whether a wallet has injected itself, as an external store rather than a
 * piece of state written from an effect. `window.ethereum` is exactly the kind
 * of thing useSyncExternalStore exists for: it is not React's to own, it can
 * appear after hydration, and the server has to answer "no" without that
 * counting as a mismatch.
 */
function subscribeInjected(onChange: () => void) {
  window.addEventListener("ethereum#initialized", onChange);
  return () => window.removeEventListener("ethereum#initialized", onChange);
}
const injectedSnapshot = () => typeof window !== "undefined" && !!window.ethereum;
const injectedServerSnapshot = () => false;

/**
 * A deliberately small wallet layer: one injected EIP-1193 provider, no
 * connector registry, no WalletConnect project id to leak. Everything the
 * trading pad needs is `eth_requestAccounts`, the chain id, and the ability to
 * send one transaction — anything more is weight the page does not use.
 *
 * Reconnection is silent and only ever uses `eth_accounts`, which never
 * prompts: a returning visitor who is still authorised sees their address
 * again, and one who revoked access simply sees the connect button.
 */
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const hasInjected = useSyncExternalStore(
    subscribeInjected,
    injectedSnapshot,
    injectedServerSnapshot,
  );
  const provider = hasInjected && typeof window !== "undefined"
    ? (window.ethereum ?? null)
    : null;

  useEffect(() => {
    if (!hasInjected) return;
    const eth = window.ethereum!;

    const readChain = async () => {
      try {
        const id = (await eth.request({ method: "eth_chainId" })) as string;
        setChainId(Number.parseInt(id, 16));
      } catch {
        // provider refused — leave the chain unknown rather than guessing
      }
    };

    (async () => {
      let wasConnected = false;
      try {
        wasConnected = localStorage.getItem(STORAGE_KEY) === "1";
      } catch {
        // storage blocked; treat as a first visit
      }
      if (!wasConnected) return;
      try {
        const accounts = (await eth.request({ method: "eth_accounts" })) as string[];
        if (accounts?.[0]) {
          setAddress(accounts[0] as `0x${string}`);
          await readChain();
        }
      } catch {
        // nothing authorised — stay signed out
      }
    })();

    const onAccounts = (...args: never[]) => {
      const accounts = args[0] as unknown as string[];
      setAddress((accounts?.[0] as `0x${string}`) ?? null);
      if (!accounts?.length) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
      }
    };
    const onChain = (...args: never[]) => {
      setChainId(Number.parseInt(args[0] as unknown as string, 16));
    };

    eth.on?.("accountsChanged", onAccounts);
    eth.on?.("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, [hasInjected]);

  const connect = useCallback(async () => {
    const eth = typeof window === "undefined" ? null : window.ethereum;
    if (!eth) return;
    setConnecting(true);
    try {
      const accounts = (await eth.request({
        method: "eth_requestAccounts",
      })) as string[];
      if (accounts?.[0]) {
        setAddress(accounts[0] as `0x${string}`);
        try {
          localStorage.setItem(STORAGE_KEY, "1");
        } catch {}
        const id = (await eth.request({ method: "eth_chainId" })) as string;
        setChainId(Number.parseInt(id, 16));
        setDialogOpen(false);
      }
    } catch {
      // user dismissed the wallet prompt
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const switchToChain = useCallback(async () => {
    const eth = typeof window === "undefined" ? null : window.ethereum;
    if (!eth) return;
    const hexId = `0x${CHAIN.id.toString(16)}`;
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexId }],
      });
    } catch {
      // 4902: the wallet has never heard of this chain, so offer to add it
      try {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hexId,
              chainName: CHAIN.name,
              nativeCurrency: CHAIN.nativeCurrency,
              rpcUrls: [CHAIN.rpcUrl],
              blockExplorerUrls: [CHAIN.explorer],
            },
          ],
        });
      } catch {
        // declined — the pad stays in its "wrong network" state
      }
    }
  }, []);

  const value = useMemo<WalletState>(
    () => ({
      address,
      chainId,
      connecting,
      hasInjected,
      dialogOpen,
      openDialog: () => setDialogOpen(true),
      closeDialog: () => setDialogOpen(false),
      connect,
      disconnect,
      switchToChain,
      provider,
    }),
    [
      address,
      chainId,
      connecting,
      hasInjected,
      dialogOpen,
      connect,
      disconnect,
      switchToChain,
      provider,
    ],
  );

  return <WalletContext value={value}>{children}</WalletContext>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}
