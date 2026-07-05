import { SystemFields } from "../generic.types";
import { Gig } from "./gig.types";
import { Order } from "./order.types";
import { Profile } from "./profile.types";

export interface ReviewCore {
  reviewer: string | Partial<Profile>;
  seller: string | Partial<Profile>;
  gig: string | Partial<Gig>;
  order: string | Partial<Order>;

  rating: number;
  note?: string;
}

export interface Review extends ReviewCore, SystemFields {}
