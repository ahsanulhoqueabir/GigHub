export const branding = {
  title: "GigHub",
  name: "Campus Freelance & Task Marketplace for Jagannath University",
  logo: "/brand/gighub.svg",
  description:
    "GigHub is a closed, campus-exclusive freelance and task marketplace for the students of Jagannath University (JnU), Dhaka. Buy and sell services, post jobs, hire skilled peers, collaborate through real-time chat, and complete secure escrow-protected transactions while building a verified campus portfolio.",
  keywords: [
    "GigHub",
    "Jagannath University",
    "JnU freelance marketplace",
    "JnU student marketplace",
    "campus freelance platform",
    "student gigs Bangladesh",
    "student jobs JnU",
    "campus task marketplace",
    "escrow freelance platform",
    "GigHub JnU",
    "freelance for students",
    "Bangladesh student freelancing",
    "JnU gig platform",
    "GigHub Dhaka",
    "student portfolio platform",
  ],

  ogImage:
    "https://res.cloudinary.com/hvbrllbm/image/upload/v1783877833/og_cewnuz.png",

  openGraph: {
    title: "GigHub | Campus Freelance Marketplace for Jagannath University",
    description:
      "Connect with talented JnU students, offer services, hire peers, post projects, and complete secure escrow-protected transactions within a trusted campus ecosystem.",
    type: "website",
    locale: "en_BD",
    images: [
      {
        url: "https://res.cloudinary.com/hvbrllbm/image/upload/v1783877833/og_cewnuz.png",
        width: 1200,
        height: 630,
        alt: "GigHub — Campus Freelance Marketplace for Jagannath University",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "GigHub | JnU Campus Freelance Marketplace",
    description:
      "The exclusive freelance and task marketplace for Jagannath University students. Find gigs, hire peers, and build your professional portfolio.",
    images: [
      "https://res.cloudinary.com/hvbrllbm/image/upload/v1783877833/og_cewnuz.png",
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://gighub.ahsanull.com",
  },

  geo: {
    region: "BD-13",
    city: "Dhaka",
    country: "Bangladesh",
  },

  contacts: {
    phone: "",
    email: "contact.gighub@gmail.com",
    address:
      "Jagannath University, 9-10 Chittaranjan Avenue, Dhaka 1100, Bangladesh",
    license: "GigHub",
  },

  socialMedia: {
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    github: "https://github.com/ahsanulhoqueabir/gighub",
  },
} as const;

export const team = [
  {
    name: "Md. Ahsanul Hoque Abir",
    role: "Founder & Developer",
    dept: "Department of Computer Science and Engineering",
    image: null,
  },
  {
    name: "Maisha Binte Monir",
    role: "Co-Founder & Designer",
    dept: "Department of Computer Science and Engineering",
    image: null,
  },
];
