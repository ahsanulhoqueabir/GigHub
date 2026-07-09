import { branding } from "@/config/brand.config";
import {
  IconBrandGithub,
  IconMail,
  IconMapPin,
  IconMessage,
  IconSend,
} from "@tabler/icons-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - GigHub",
  description:
    "Get in touch with the GigHub team. Reach out for support, inquiries, or collaboration opportunities.",
};

const contactMethods = [
  {
    icon: IconMail,
    title: "Email",
    value: branding.contacts.email,
    href: `mailto:${branding.contacts.email}`,
  },
  {
    icon: IconMapPin,
    title: "Address",
    value: branding.contacts.address,
    href: null,
  },
  {
    icon: IconBrandGithub,
    title: "GitHub",
    value: "ahsanulhoqueabir/gighub",
    href: branding.socialMedia.github,
  },
];

const faqs = [
  {
    q: "How do I create an account?",
    a: 'Click the "Sign Up" button on the top right, use your Jagannath University email or student ID, and follow the verification steps.',
  },
  {
    q: "How do payments work?",
    a: "All transactions are protected by escrow. Funds are held securely and released to the seller only after the buyer approves the completed work.",
  },
  {
    q: "Can I withdraw my earnings?",
    a: "Yes! You can withdraw your earnings to your preferred mobile banking or bank account. Withdrawals are subject to verification.",
  },
  {
    q: "How do I report a problem?",
    a: "Use the built-in report feature on any listing or message, or email us directly at contact.gighub@gmail.com. We typically respond within 24 hours.",
  },
];

export default function ContactPage() {
  return (
    <div className="">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <IconMessage className="size-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Get in Touch
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Have a question, suggestion, or need help? We&apos;d love to hear from
          you. Reach out and we&apos;ll get back to you as soon as possible.
        </p>
      </div>

      {/* Contact Methods */}
      <div className="mb-10 grid gap-6 sm:grid-cols-3">
        {contactMethods.map((method) => {
          const Icon = method.icon;
          const content = (
            <div className="rounded-xl border border-border bg-background p-6 text-center transition-colors hover:bg-muted/30">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-foreground">
                {method.title}
              </h3>
              <p className="text-sm text-muted-foreground">{method.value}</p>
            </div>
          );

          if (method.href) {
            return (
              <a
                key={method.title}
                href={method.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content}
              </a>
            );
          }
          return <div key={method.title}>{content}</div>;
        })}
      </div>

      {/* Contact Form & FAQ Grid */}
      <div className="mb-10 grid gap-8 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-border bg-background p-6">
            <h2 className="mb-1 text-lg font-semibold text-foreground">
              Send us a message
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Fill out the form below and we&apos;ll respond within 24 hours.
            </p>
            <form className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="subject"
                  className="text-sm font-medium text-foreground"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="How can we help?"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-sm font-medium text-foreground"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Tell us more about your inquiry..."
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                <IconSend className="size-4" />
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Sidebar */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-background p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Quick Answers
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h3 className="mb-1 text-sm font-medium text-foreground">
                    {faq.q}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                Need more help? Visit our{" "}
                <a
                  href="/help"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Help Center
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
        <IconMapPin className="mx-auto mb-3 size-8 text-primary/40" />
        <h2 className="text-lg font-semibold text-foreground">Visit Us</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {branding.contacts.address}
        </p>
      </div>
    </div>
  );
}
