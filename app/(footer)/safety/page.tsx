import {
  IconAlertTriangle,
  IconArrowRight,
  IconEye,
  IconFlag,
  IconLock,
  IconMessageReport,
  IconShieldCheck,
  IconUserShield,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Safety Guidelines - GigHub",
  description:
    "Learn how to stay safe on GigHub. Guidelines for secure transactions, communication, identity verification, and reporting concerns.",
};

const guidelines = [
  {
    icon: IconUserShield,
    title: "Verify Identity",
    items: [
      "Use your Jagannath University email or student ID for verification.",
      "Complete your profile with real information — it builds trust.",
      "Be cautious of users who refuse to verify their identity.",
    ],
  },
  {
    icon: IconLock,
    title: "Secure Payments",
    items: [
      "Always use GigHub's escrow system for payments — never pay outside the platform.",
      "Never share your financial information (bank accounts, mobile banking PINs).",
      "Only release payment after you are fully satisfied with the delivered work.",
    ],
  },
  {
    icon: IconMessageReport,
    title: "Stay on Platform",
    items: [
      "Keep all communication within GigHub's chat system for your protection.",
      "Off-platform communication makes dispute resolution difficult.",
      "Share files and documents through the platform's secure system.",
    ],
  },
  {
    icon: IconEye,
    title: "Red Flags to Watch For",
    items: [
      "Users asking for upfront payment before starting work.",
      "Offers that seem too good to be true — unrealistic prices or promises.",
      "Requests to share personal contact information immediately.",
      "Pressure to make quick decisions or bypass platform protections.",
    ],
  },
  {
    icon: IconFlag,
    title: "Report Concerns",
    items: [
      "Report suspicious behavior, policy violations, or harassment instantly.",
      "Use the report button on profiles, gigs, jobs, and messages.",
      "All reports are reviewed by our team within 24 hours.",
    ],
  },
  {
    icon: IconAlertTriangle,
    title: "Dispute Prevention",
    items: [
      "Clearly define the scope of work before accepting an order or job.",
      "Keep records of all agreements and communications on the platform.",
      "Use milestones for large projects to release payment incrementally.",
    ],
  },
];

export default function SafetyPage() {
  return (
    <div className="">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <IconShieldCheck className="size-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Safety Guidelines
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Your safety is our priority. Follow these guidelines to ensure a
          secure and trustworthy experience on GigHub.
        </p>
      </div>

      {/* Guidelines Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {guidelines.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-xl border border-border bg-background p-6 transition-colors hover:bg-muted/30"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  {item.title}
                </h2>
              </div>
              <ul className="space-y-2">
                {item.items.map((text, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Emergency Contact */}
      <div className="mt-10 rounded-xl border border-border bg-muted/30 p-6 text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Need immediate help?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          If you feel unsafe or need urgent assistance, contact our safety team
          immediately.
        </p>
        <Link
          href="mailto:support@gighub.ahsanull.com"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Contact Safety Team
          <IconArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
