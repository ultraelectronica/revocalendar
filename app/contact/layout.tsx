import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Revo',
  description: 'Get in touch with the Revo team. Send us your questions, feedback, or partnership inquiries.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
