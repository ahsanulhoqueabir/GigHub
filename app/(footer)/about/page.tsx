import { team } from "@/config/brand.config";
import {
  IconBuildingStore,
  IconHeart,
  IconSchool,
  IconShieldCheck,
  IconStars,
  IconUsers,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About - GigHub",
  description:
    "Learn about GigHub, the campus freelance and task marketplace exclusively for Jagannath University (JnU) students in Dhaka, Bangladesh.",
};

const stats = [
  { label: "Active Students", value: "500+" },
  { label: "Gigs Posted", value: "200+" },
  { label: "Jobs Filled", value: "150+" },
  { label: "Secure Transactions", value: "300+" },
];

const values = [
  {
    icon: IconSchool,
    title: "Campus-Exclusive",
    description:
      "GigHub is built exclusively for Jagannath University students, a trusted marketplace within our own campus community.",
  },
  {
    icon: IconShieldCheck,
    title: "Secure & Transparent",
    description:
      "Every transaction is protected by our escrow system. Funds are released only when work is approved, ensuring fairness for both parties.",
  },
  {
    icon: IconUsers,
    title: "Peer Collaboration",
    description:
      "We believe in the power of peer-to-peer collaboration. Connect with talented JnU students and build your professional network.",
  },
  {
    icon: IconStars,
    title: "Skill Development",
    description:
      "GigHub helps students gain real-world experience, build portfolios, and earn income, all while studying at JnU.",
  },
  {
    icon: IconHeart,
    title: "Community First",
    description:
      "Our platform is built on trust, respect, and mutual growth. Every interaction strengthens our campus community.",
  },
  {
    icon: IconBuildingStore,
    title: "Diverse Opportunities",
    description:
      "From tutoring and design to programming and writing, find or offer services across a wide range of categories.",
  },
];

export default function AboutPage() {
  return (
    <div className="">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <IconSchool className="size-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          About GigHub
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
          GigHub is a closed, campus-exclusive freelance and task marketplace
          built for the students of Jagannath University (JnU), Dhaka —
          empowering peer-to-peer collaboration, skill development, and secure
          transactions within our trusted campus ecosystem.
        </p>
      </div>

      {/* Story */}
      <div className="mb-12 grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Our Story
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            GigHub was born from a simple observation: JnU students have
            incredible talents, from graphic design and content writing to
            programming and tutoring, but there was no dedicated platform to
            connect them with peers who need those services.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We built GigHub to bridge that gap. What started as a vision to
            create a safe, campus-exclusive marketplace has grown into a
            thriving community where students can offer their skills, find
            freelance work, post jobs, hire peers, and complete secure
            escrow-protected transactions, all within the trusted JnU ecosystem.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Today, GigHub serves hundreds of JnU students, facilitating
            everything from tuition jobs and design gigs to programming projects
            and part-time work. We&apos;re proud to help our fellow students
            build their professional portfolios while earning and learning.
          </p>
        </div>
        <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-xl p-8">
          <div className="space-y-4 text-center">
            <Image
              src="/brand/logo.svg"
              alt="GigHub Logo"
              className="mx-auto h-20 w-auto"
              fill
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-background p-4 text-center"
          >
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Values */}
      <div className="mb-12">
        <h2 className="mb-6 text-center text-2xl font-bold tracking-tight text-foreground">
          What We Stand For
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="rounded-xl border border-border bg-background p-6 transition-colors hover:bg-muted/30"
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team */}
      <div className="mb-12">
        <h2 className="mb-6 text-center text-2xl font-bold tracking-tight text-foreground">
          Meet the Team
        </h2>
        <div className="flex justify-center gap-5">
          {team.map((member) => (
            <div
              key={member.name}
              className="w-full max-w-sm rounded-xl border border-border bg-background p-6 text-center"
            >
              <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10">
                <IconUsers className="size-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {member.name}
              </h3>
              <p className="text-sm font-medium text-primary">{member.role}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {member.dept}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Ready to be part of the community?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Join hundreds of JnU students already using GigHub to connect,
          collaborate, and grow.
        </p>
        <div className="mt-5 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
          <Link
            href="/gigs"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Browse Gigs
          </Link>
        </div>
      </div>
    </div>
  );
}
