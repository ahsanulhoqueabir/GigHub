import { SystemFields } from "../generic.types";
import { Profile } from "./profile.types";

export interface WalletCore {
  name: string;
  user: string | Partial<Profile>;
  balance: number;
  currency: string;
}

export interface Wallet extends WalletCore, SystemFields {}
