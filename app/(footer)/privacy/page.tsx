import { IconShieldLock } from "@tabler/icons-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - GigHub",
  description:
    "GigHub's Privacy Policy explains how we collect, use, and protect your personal information when you use our campus marketplace platform.",
};

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We collect information you provide when creating an account — name, email address, student ID, university affiliation, and profile details. We also collect usage data such as pages visited, interactions, and transaction history to improve our services.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "Your information is used to: provide and maintain the platform, process transactions, facilitate communication between users, verify student身份, send important updates, enforce our Terms of Service, and improve user experience. We do not sell your personal information to third parties.",
  },
  {
    title: "3. Data Sharing",
    content:
      "We share your information only with: other users as necessary for transactions (e.g., your name and profile when you apply for a job), service providers who help operate the platform (under strict confidentiality agreements), and law enforcement when required by law.",
  },
  {
    title: "4. Data Security",
    content:
      "We implement industry-standard security measures including encryption in transit and at rest, secure authentication, regular security audits, and access controls. However, no method of electronic storage is 100% secure, and we cannot guarantee absolute security.",
  },
  {
    title: "5. Data Retention",
    content:
      "We retain your information for as long as your account is active. After account deletion, we may retain certain data for legal obligations, dispute resolution, and enforcement of our terms. Chat messages and transaction records may be retained for up to 3 years.",
  },
  {
    title: "6. Your Rights",
    content:
      "You have the right to: access your personal data, correct inaccurate data, delete your account and associated data, export your data, and withdraw consent for data processing. To exercise these rights, visit your account settings or contact our support team.",
  },
  {
    title: "7. Cookies",
    content:
      "We use essential cookies for authentication and platform functionality. Analytics cookies help us understand usage patterns. You can control cookie preferences through your browser settings. Disabling certain cookies may affect platform functionality.",
  },
  {
    title: "8. Third-Party Services",
    content:
      "GigHub integrates with third-party services for payment processing, file storage (R2), and email communications. These services have their own privacy policies. We recommend reviewing their policies for complete understanding of data handling practices.",
  },
  {
    title: "9. Changes to This Policy",
    content:
      "We may update this Privacy Policy periodically. Material changes will be notified via email or platform notification. Continued use after changes constitutes acceptance of the updated policy. We encourage you to review this policy regularly.",
  },
  {
    title: "10. Contact Us",
    content:
      "For questions about this Privacy Policy or data practices, contact our Data Protection Officer at support@gighub.ahsanull.com. You can also write to us at Jagannath University, 9-10 Chittaranjan Avenue, Dhaka 1100, Bangladesh.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <IconShieldLock className="size-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          We take your privacy seriously. This policy describes how we collect,
          use, and protect your personal information.
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
          Privacy concerns?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          If you have any concerns about your data, please reach out to us.
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
