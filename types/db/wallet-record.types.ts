import { SystemFields } from "../generic.types";
import { Wallet } from "./wallet.types";

export interface WalletRecordCore {
  wallet: string | Partial<Wallet>;
  amount: number;
  type: WalletRecordType;
  description?: string;
  metadata?: Record<string, unknown>;
}

export type WalletRecordType = "CREDIT" | "DEBIT";

export interface WalletRecord extends WalletRecordCore, SystemFields {}
