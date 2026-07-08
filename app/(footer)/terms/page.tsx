import { IconFileDescription } from "@tabler/icons-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - GigHub",
  description:
    "Read the Terms of Service for GigHub — the campus freelance and task marketplace for Jagannath University students.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using GigHub, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform. We reserve the right to update these terms at any time; continued use constitutes acceptance of changes.",
  },
  {
    title: "2. Eligibility",
    content:
      "GigHub is exclusively for current students of Jagannath University (JnU), Dhaka. You must be at least 18 years old or have parental consent. You are responsible for maintaining the confidentiality of your account credentials.",
  },
  {
    title: "3. User Conduct",
    content:
      "You agree to use GigHub only for lawful purposes. Prohibited activities include: posting false or misleading listings, harassing other users, attempting to defraud others, sharing inappropriate content, or violating any applicable laws or university policies.",
  },
  {
    title: "4. Listings & Transactions",
    content:
      "All gigs and job listings must be accurate and truthful. Sellers must deliver the promised services as described. Buyers must pay for completed work. GigHub acts as a platform and escrow agent but is not a party to any transaction between users.",
  },
  {
    title: "5. Escrow & Payments",
    content:
      "Payments are held in escrow until the buyer confirms satisfactory completion. GigHub may charge a service fee on transactions. Funds are released only after mutual agreement or resolution of any disputes. Withdrawals are subject to verification.",
  },
  {
    title: "6. Intellectual Property",
    content:
      "You retain ownership of work you create and share on GigHub. By posting content, you grant GigHub a license to display it on the platform. You may not use others' intellectual property without permission.",
  },
  {
    title: "7. Dispute Resolution",
    content:
      "If a dispute arises between users, we encourage direct communication first. If unresolved, GigHub support may mediate. As a last resort, disputes may be resolved through binding arbitration in Dhaka, Bangladesh.",
  },
  {
    title: "8. Limitation of Liability",
    content:
      "GigHub is provided 'as is' without warranties. We are not liable for damages arising from use of the platform, including lost profits or data. Our total liability is limited to the fees paid by you in the preceding 12 months.",
  },
  {
    title: "9. Termination",
    content:
      "We may suspend or terminate accounts that violate these terms or engage in fraudulent activity. You may delete your account at any time. Upon termination, pending transactions will be resolved according to these terms.",
  },
  {
    title: "10. Governing Law",
    content:
      "These terms are governed by the laws of Bangladesh. Any legal actions shall be brought exclusively in the courts of Dhaka, Bangladesh.",
  },
];

export default function TermsPage() {
  return (
    <div className="">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <IconFileDescription className="size-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Please read these terms carefully before using GigHub. By using the
          platform, you agree to be bound by these terms.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Last updated: July 2026
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-border bg-background p-6"
          >
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              {section.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-10 rounded-xl border border-border bg-muted/30 p-6 text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Questions about these terms?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          If you have any questions, please contact our support team.
        </p>
        <a
          href="mailto:support@gighub.ahsanull.com"
          className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          support@gighub.ahsanull.com
        </a>
      </div>
    </div>
  );
}
