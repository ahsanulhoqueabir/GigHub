import { logostore } from "@/config/logo-story.config";

export type NodeType = "university" | "student" | "work" | "collaboration";

export const getNodeDetails = (node: NodeType) => {
  switch (node) {
    case "university":
      return {
        data: logostore.four_nodes.university,
        svg: "/logo-story/University.svg",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        glow: "shadow-emerald-500/20",
      };
    case "student":
      return {
        data: logostore.four_nodes.student,
        svg: "/logo-story/student.svg",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        glow: "shadow-blue-500/20",
      };
    case "work":
      return {
        data: logostore.four_nodes.work,
        svg: "/logo-story/Work.svg",
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        glow: "shadow-red-500/20",
      };
    case "collaboration":
      return {
        data: logostore.four_nodes.collaboration,
        svg: "/logo-story/Collaboration.svg",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        glow: "shadow-amber-500/20",
      };
  }
};
