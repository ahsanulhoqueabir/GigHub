import { LogoStoryInteractive } from "@/components/logo-story/logo-story-interactive";
import { logostore } from "@/config/logo-story.config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${logostore.logo_story.title} - ${logostore.brand.name} Logo Story`,
  description: logostore.logo_story.summary,
  openGraph: {
    title: `${logostore.logo_story.title} - ${logostore.brand.name} Logo Story`,
    description: logostore.logo_story.summary,
    type: "website",
  },
};

export default function LogoStoryPage() {
  return <LogoStoryInteractive />;
}
