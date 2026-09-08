"use client";

import { useMemo, useState } from "react";
import type { Trader } from "@/lib/market-types";
import { Avatar } from "@/components/ui/Avatar";
import { useWallet } from "@/components/wallet/WalletProvider";
import { CHAIN, CURVE_ABI } from "@/lib/chain";
import {
  formatPct,
  formatPrice,
  formatShares,
  formatUsd,
  toneFor,
} from "@/lib/format";

const PRESETS = [
  { label: "20%", fraction: 0.2 },
  { label: "40%", fraction: 0.4 },
  { label: "60%", fraction: 0.6 },
  { label: "Half", fraction: 0.5 },
  { label: "Max", fraction: 1 },
] as const;

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"] as const;

const SLIPPAGE = 0.01;

/**
 * The order pad.
 *
 * Everything it tells you is derived from the curve's own reserves rather
 * than from a spot price: on a curve this shallow the fill is materially
 * worse than spot for anything but the smallest orders, so the pad shows the
 * average price, the impact and the minimum received *before* you sign. A pad
 * that quoted spot alone would be lying by omission.
 *
 * The keypad exists because this is a phone-first surface — typing an amount
 * with a soft keyboard covering the quote is the worst version of this
 * screen — and because it makes "how much" a single, deliberate gesture.
 */
export function TradePad({
  trader,
  ethUsd,
  side,
  onSideChange,
  compact = false,
}: {
  trader: Trader;
  ethUsd: number;
  side: "buy" | "sell";
  onSideChange: (side: "buy" | "sell") => void;
  compact?: boolean;
}) {
  const token = trader.token;
  const { address, openDialog, chainId, switchToChain, provider } = useWallet();
  // One amount per side rather than one amount reset on every switch: it
  // keeps what you typed when you flip to check the other direction, and it
  // removes the effect that reset it (React 19 rejects setState in an effect
  // body, and rightly — this was never synchronising anything external).
  const [amounts, setAmounts] = useState({ buy: "0.01", sell: "0" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = amounts[side];
  const setAmount = (next: string | ((prev: string) => string)) =>
    setAmounts((prev) => ({
      ...prev,
      [side]: typeof next === "function" ? next(prev[side]) : next,
    }));

  const value = Number(amount) || 0;
  const wrongChain = address != null && chainId != null && chainId !== CHAIN.id;

  /**
   * The constant-product fill, computed here rather than fetched so the
   * numbers move as you press keys. The virtual quote reserve is part of the
   * curve, so it belongs in the maths — leaving it out overprices every fill.
   */
  const quote = useMemo(() => {
    if (!token || value <= 0) return null;
    const VIRTUAL = 1.68;
    const quoteReserve = VIRTUAL + token.raisedEth;
    const baseReserve = quoteReserve / token.priceEth;
    const feeRate = token.feeBps / 10_000;

    if (side === "buy") {
      const net = value * (1 - feeRate);
      const shares = (baseReserve * net) / (quoteReserve + net);
      const average = shares > 0 ? (value * ethUsd) / shares : 0;
      return {
        shares,
        usd: value * ethUsd,
        average,
        impact: ((average - token.priceUsd) / token.priceUsd) * 100,
        minReceived: shares * (1 - SLIPPAGE),
        unit: "shares",
      };
    }
    const gross = (quoteReserve * value) / (baseReserve + value);
    const eth = gross * (1 - feeRate);
    const average = value > 0 ? (eth * ethUsd) / value : 0;
    return {
      shares: eth,
      usd: eth * ethUsd,
      average,
      impact: ((average - token.priceUsd) / token.priceUsd) * 100,
      minReceived: eth * (1 - SLIPPAGE),
      unit: "ETH",
    };
  }, [token, value, side, ethUsd]);

  const press = (key: string) => {
    setError(null);
    setAmount((prev) => {
      if (key === "⌫") return prev.length <= 1 ? "0" : prev.slice(0, -1);
      if (key === "." && prev.includes(".")) return prev;
      if (prev === "0" && key !== ".") return key;
      return (prev + key).slice(0, 14);
    });
  };

  const submit = async () => {
    if (!token || !provider || !address) return;
    if (token.source === "sample") {
      setError(
        "This is a sample market — there is no curve at this address to trade against.",
      );
      return;
    }
    if (wrongChain) {
      await switchToChain();
      return;
    }
    setPending(true);
    setError(null);
    try {
      const { encodeFunctionData, parseEther } = await import("viem");
      const wei = parseEther(amount as `${number}`);
      const minOut = BigInt(
        Math.floor((quote?.minReceived ?? 0) * (side === "buy" ? 1e18 : 1e18)),
      );
      const data =
        side === "buy"
          ? encodeFunctionData({
              abi: CURVE_ABI,
              functionName: "buy",
              args: [wei, minOut, address],
            })
          : encodeFunctionData({
              abi: CURVE_ABI,
              functionName: "sell",
              args: [wei, minOut, address],
            });

      await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to: token.curve,
            data,
            // buy() reverts with NativeValueMismatch unless value === quoteAmount
            ...(side === "buy" ? { value: `0x${wei.toString(16)}` } : {}),
          },
        ],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "The wallet rejected the trade.");
    } finally {
      setPending(false);
    }
  };

  const label = !address
    ? "Connect wallet to trade"
    : wrongChain
      ? `Switch to ${CHAIN.name}`
      : pending
        ? "Confirm in wallet…"
        : side === "buy"
          ? `Buy ${token?.symbol ?? "shares"}`
          : `Sell ${token?.symbol ?? "shares"}`;

  return (
    <div className="flex flex-col">
      <div className="glass-caption flex items-center gap-3 rounded-2xl px-3 py-2.5">
        <Avatar
          src={trader.profilePictureLink}
          name={trader.name}
          size={38}
          className="border-2 border-white"
          sizes="64px"
        />
        <div className="min-w-0 flex-1">
          <p className="text-ink truncate text-[14px] leading-5 font-extrabold uppercase">
            {token?.symbol ?? trader.name}
          </p>
          <p className="text-muted truncate text-[11px] leading-4">
            @{trader.handle} {token && `$${token.symbol}`}
          </p>
        </div>
        <div className="text-right">
          <p className="tnum text-ink text-[13px] leading-5 font-bold">
            {token ? formatPrice(token.priceUsd) : "—"}
          </p>
          <p
            className={`tnum text-[12px] leading-4 font-semibold ${
              token?.change24hPct != null ? toneFor(token.change24hPct) : "text-muted"
            }`}
          >
            {token?.change24hPct != null ? formatPct(token.change24hPct) : "—"}
          </p>
        </div>
      </div>

      <div className="glass-field mt-3 flex h-[46px] items-center rounded-full p-1">
        <button
          type="button"
          aria-pressed={side === "buy"}
          onClick={() => onSideChange("buy")}
          className={`h-[38px] flex-1 rounded-full text-[15px] font-bold transition-colors ${
            side === "buy" ? "btn-buy" : "text-secondary hover:text-ink"
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          aria-pressed={side === "sell"}
          onClick={() => onSideChange("sell")}
          className={`h-[38px] flex-1 rounded-full text-[15px] font-bold transition-colors ${
            side === "sell" ? "btn-sell" : "text-secondary hover:text-ink"
          }`}
        >
          Sell
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-muted text-[10.5px] font-semibold tracking-[0.1em] uppercase">
          {side === "buy" ? "You pay" : "You sell"}
        </p>
        <p className="tnum text-ink mt-1 flex items-baseline justify-center gap-2 text-[40px] leading-none font-black tracking-[-0.03em]">
          {amount}
          <span className="text-muted text-[15px] font-bold tracking-normal">
            {side === "buy" ? "ETH" : token?.symbol ?? "shares"}
          </span>
        </p>
        <p className="text-secondary mt-2 text-[12px] leading-4">
          {quote
            ? side === "buy"
              ? `≈ ${formatUsd(quote.usd)} · you receive ${formatShares(quote.shares)} ${token?.symbol ?? ""} shares`
              : `≈ ${formatUsd(quote.usd)} · you receive ${quote.shares.toFixed(5)} ETH`
            : "Enter an amount"}
        </p>
        {!address && (
          <p className="text-muted mt-1 text-[11px]">Wallet not connected</p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              // With no balance read there is nothing to take a fraction of,
              // so the presets scale the current amount instead of pretending
              // to know the wallet.
              const base = Number(amount) || (side === "buy" ? 0.01 : 0);
              setAmount(String(Number((base * (1 + preset.fraction)).toFixed(6))));
            }}
            className="btn-glass text-secondary h-8 rounded-full px-3 text-[12px] font-semibold"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {!compact && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => press(key)}
              className="btn-glass text-ink h-11 rounded-full text-[17px] font-semibold"
            >
              {key}
            </button>
          ))}
        </div>
      )}

      <div className="border-hairline text-muted mt-4 border-t pt-3 text-center text-[11.5px] leading-4">
        {quote && token ? (
          <>
            Share price{" "}
            <span className="tnum text-ink font-semibold">
              {formatPrice(token.priceUsd)}
            </span>{" "}
            · Impact{" "}
            <span className={`tnum font-semibold ${toneFor(-Math.abs(quote.impact))}`}>
              {formatPct(quote.impact)}
            </span>{" "}
            · Min. received{" "}
            <span className="tnum text-ink font-semibold">
              {side === "buy"
                ? `${formatShares(quote.minReceived)} shares`
                : `${quote.minReceived.toFixed(5)} ETH`}
            </span>
          </>
        ) : (
          "No quote yet"
        )}
      </div>

      <button
        type="button"
        disabled={pending || !token}
        onClick={address ? submit : openDialog}
        className={`mt-3 h-12 w-full rounded-full text-[15px] font-bold disabled:cursor-not-allowed ${
          side === "buy" ? "btn-buy" : "btn-sell"
        }`}
      >
        {label}
      </button>

      {error && (
        <p className="text-negative mt-2 text-center text-[11.5px] leading-4">{error}</p>
      )}

      <p className="text-muted mt-2 text-center text-[11px]">
        {token ? `${token.feeBps / 100}% fee` : "1% fee"} · {SLIPPAGE * 100}%
        slippage · you hold 0 shares
      </p>
    </div>
  );
}
