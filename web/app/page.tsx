import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import {
  IconSearch,
  IconBriefcase,
  IconUsers,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: IconSearch,
    title: "Find Gigs",
    desc: "Browse thousands of freelance opportunities from top clients worldwide.",
  },
  {
    icon: IconBriefcase,
    title: "Post Projects",
    desc: "Hire skilled professionals to bring your ideas to life.",
  },
  {
    icon: IconUsers,
    title: "Top Talent",
    desc: "Connect with verified freelancers across every category.",
  },
  {
    icon: IconShieldCheck,
    title: "Secure Payments",
    desc: "Escrow-backed payments ensure peace of mind for both parties.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {siteConfig.tagline}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto">
              The modern freelancing marketplace where talented professionals
              and ambitious projects come together.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/gigs">Browse Gigs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-card p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Ready to start your journey?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Join thousands of freelancers and clients on {siteConfig.name}.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/signup">Create your account</Link>
        </Button>
      </section>
    </div>
  );
}
