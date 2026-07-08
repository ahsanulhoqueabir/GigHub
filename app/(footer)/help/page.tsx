import {
  IconArrowRight,
  IconCash,
  IconFileDescription,
  IconHelp,
  IconMessageCircle,
  IconReport,
  IconShieldCheck,
  IconUserCircle,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center - GigHub",
  description:
    "Find answers to common questions about GigHub — account setup, gigs, jobs, payments, and campus marketplace guidelines.",
};

const faqs = [
  {
    icon: IconUserCircle,
    title: "Account & Profile",
    items: [
      "Create an account using your Jagannath University email or student ID.",
      "Complete your profile with skills, portfolio, and bio to attract buyers.",
      "Change password, update email, or deactivate account from settings.",
    ],
  },
  {
    icon: IconFileDescription,
    title: "Gigs & Services",
    items: [
      "Post a gig offering your skill — design, writing, programming, tutoring, etc.",
      "Set a starting price, delivery time, and detailed description.",
      "Buyers can place an order directly from your gig page.",
    ],
  },
  {
    icon: IconReport,
    title: "Jobs & Hiring",
    items: [
      "Post a job if you need someone for a project or ongoing task.",
      "Review proposals from interested students and hire the best fit.",
      "Use filters to find tuition, freelance, or part-time opportunities.",
    ],
  },
  {
    icon: IconCash,
    title: "Payments & Escrow",
    items: [
      "All transactions are protected by escrow — funds released only when work is approved.",
      "Withdraw earnings to your preferred mobile banking or bank account.",
      "Dispute resolution available through our support team.",
    ],
  },
  {
    icon: IconMessageCircle,
    title: "Communication",
    items: [
      "Use the built-in chat to discuss project details with buyers or sellers.",
      "Share files, images, and documents securely within conversations.",
      "Keep all communication on-platform for dispute protection.",
    ],
  },
  {
    icon: IconShieldCheck,
    title: "Trust & Safety",
    items: [
      "Verify your identity with your university credentials.",
      "Report suspicious activity or policy violations instantly.",
      "Read our Safety Guidelines for a secure campus marketplace experience.",
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <IconHelp className="size-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Help Center
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Everything you need to know about using GigHub — from account setup to
          secure payments.
        </p>
      </div>

      {/* FAQ Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {faqs.map((faq) => {
          const Icon = faq.icon;
          return (
            <div
              key={faq.title}
              className="rounded-xl border border-border bg-background p-6 transition-colors hover:bg-muted/30"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  {faq.title}
                </h2>
              </div>
              <ul className="space-y-2">
                {faq.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Still need help */}
      <div className="mt-10 rounded-xl border border-border bg-muted/30 p-6 text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Still need help?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Reach out to our support team and we&apos;ll get back to you within 24
          hours.
        </p>
        <Link
          href="mailto:support@gighub.ahsanull.com"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Contact Support
          <IconArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
