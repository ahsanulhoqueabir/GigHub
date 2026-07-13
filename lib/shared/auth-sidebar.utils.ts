import { NodeType } from "@/components/logo-story/types-and-helpers";

export interface AuthNodeDetails {
  title: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
}

export const authNodeInfo: Record<NodeType, AuthNodeDetails> = {
  university: {
    title: "JnU Foundation",
    desc: "Authentic campus-exclusive trust rooted in Jagannath University.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  work: {
    title: "Opportunity Loop",
    desc: "Browse local jobs, post tasks, and find high-quality student services.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  collaboration: {
    title: "Secure Collaboration",
    desc: "Escrow protection, transparent milestones, and close peer partnerships.",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  student: {
    title: "Student Growth",
    desc: "Build a verified portfolio, gain experience, and learn while you earn.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
};
