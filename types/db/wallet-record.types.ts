import { SystemFields } from "../generic.types";
import { Wallet } from "./wallet.types";
import { Order } from "./order.types";
import { Escrow } from "./escrow.types";

export interface WalletRecordCore {
  wallet: string | Partial<Wallet>;
  amount: number;
  type: WalletRecordType;
  description?: string;
  metadata?: Record<string, unknown>;
  note?: string;
  order?: string | Partial<Order>;
  escrow?: string | Partial<Escrow>;
  payment_method: string;
}

export type WalletRecordType = "CREDIT" | "DEBIT";

export interface WalletRecord extends WalletRecordCore, SystemFields {}
