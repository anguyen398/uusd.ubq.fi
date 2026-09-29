import { formatUnits, type Address } from "viem";
import type { TokenBalance } from "../types/inventory.types.ts";
import type { InventoryBarComponent } from "../components/inventory-bar-component.ts";
import { areAddressesEqual } from "./format-utils.ts";

/**
 * Balance utilities for auto-population of input fields
 */

/**
 * Find a token balance in the inventory bar by contract address
 * Keyed by address rather than symbol so distinct contracts sharing a symbol never collide
 */
function findTokenBalance(inventoryBar: InventoryBarComponent, tokenAddress: Address): TokenBalance | undefined {
  return inventoryBar.getBalances().find((balance) => areAddressesEqual(balance.address, tokenAddress));
}

/**
 * Get the maximum available balance for a specific token from inventory bar
 */
export function getMaxTokenBalance(inventoryBar: InventoryBarComponent, tokenAddress: Address): string {
  if (!inventoryBar) {
    return "0";
  }

  const tokenBalance = findTokenBalance(inventoryBar, tokenAddress);

  if (!tokenBalance) {
    return "0";
  }

  // Convert to human-readable format for input field
  const formattedBalance = formatUnits(tokenBalance.balance, tokenBalance.decimals);

  // Remove trailing zeros and ensure clean formatting
  const cleanBalance = formattedBalance.replace(/\.?0+$/, "");

  return cleanBalance;
}

/**
 * Check if a token balance is available and greater than zero
 */
export function hasAvailableBalance(inventoryBar: InventoryBarComponent, tokenAddress: Address): boolean {
  const tokenBalance = findTokenBalance(inventoryBar, tokenAddress);

  if (!tokenBalance) {
    return false;
  }

  return tokenBalance.balance > 0n;
}

/**
 * Get formatted balance display for a specific token
 */
export function getBalanceDisplay(inventoryBar: InventoryBarComponent, tokenAddress: Address): string {
  const tokenBalance = findTokenBalance(inventoryBar, tokenAddress);

  if (!tokenBalance) {
    return "0";
  }

  const formattedBalance = formatUnits(tokenBalance.balance, tokenBalance.decimals);
  const trimmed = formattedBalance.replace(/\.?0+$/, "") || "0";

  if (trimmed === "0") return "0";
  if (tokenBalance.balance < 100000000000000n) return "<0.0001";

  return parseFloat(formattedBalance).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}
