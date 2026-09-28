import type { Money } from "@/data/schema/store";
import { formatCurrency } from "@/lib/format";

/** "₦25,000" from minor units. */
export const formatMoney = (money: Money) => formatCurrency(money.amount / 100, money.currency);
