import { formatUnits, parseUnits, type Address as _Address } from "viem";
import type { TokenBalance, TokenMetadata } from "../types/inventory.types.ts";
import { areAddressesEqual } from "./format-utils.ts";

/**
 * Format token amount for display with appropriate decimal places
 */
export function formatTokenAmount(amount: bigint, decimals: number, displayDecimals: number = 4): string {
  const formatted = formatUnits(amount, decimals);
  const trimmed = formatted.replace(/\.?0+$/, "") || "0";

  if (trimmed === "0") return "0";
  if (amount < parseUnits("0.0001", decimals)) return "<0.0001";

  const num = parseFloat(formatted);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  });
}

/**
 * Format USD value for display
 */
export function formatUsdValue(value: number): string {
  if (value === 0) return "$0.00";
  if (value < 0.01) return "<$0.01";

  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Get token symbol with fallback to address
 */
export function getTokenSymbol(token: TokenMetadata): string {
  return token.displayName || token.symbol;
}

/**
 * Calculate total USD value from token balances
 */
export function calculateTotalUsdValue(balances: TokenBalance[]): number {
  return balances.reduce((total, balance) => {
    return total + (balance.usdValue || 0);
  }, 0);
}

/**
 * Merge incoming token balances into an existing snapshot, keyed by contract address
 * Entries for an address already in the snapshot are replaced, new addresses are appended and
 * addresses missing from the incoming list are kept, so a partial refresh never drops holdings
 * and distinct contracts that share a symbol stay separate
 */
export function mergeTokenBalances(existing: TokenBalance[], incoming: TokenBalance[]): TokenBalance[] {
  const merged = [...existing];

  incoming.forEach((balance) => {
    const existingIndex = merged.findIndex((current) => areAddressesEqual(current.address, balance.address));

    if (existingIndex >= 0) {
      merged[existingIndex] = balance;
    } else {
      merged.push(balance);
    }
  });

  return merged;
}

/**
 * Check if token balance is effectively zero (less than 0.0001)
 */
export function isBalanceZero(balance: bigint, decimals: number): boolean {
  return balance < parseUnits("0.0001", decimals);
}

/**
 * Sort token balances by USD value (highest first)
 */
export function sortBalancesByValue(balances: TokenBalance[]): TokenBalance[] {
  return [...balances].sort((a, b) => {
    const aValue = a.usdValue || 0;
    const bValue = b.usdValue || 0;
    return bValue - aValue;
  });
}

/**
 * Create display text for token balance
 */
export function createBalanceDisplayText(balance: TokenBalance): string {
  const amount = formatTokenAmount(balance.balance, balance.decimals);
  const usdValue = balance.usdValue ? ` (${formatUsdValue(balance.usdValue)})` : "";
  return `${amount} ${balance.symbol}${usdValue}`;
}
