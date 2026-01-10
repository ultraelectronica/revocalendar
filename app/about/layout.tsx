import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Revo | Smart Calendar & Productivity App',
  description: 'Learn about Revo, the end-to-end encrypted calendar app built by Ultraelectronica. Discover our mission to help students and professionals stay organized and focused.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'About Revo',
    description: 'Learn about Revo - the secure, beautiful calendar app for modern productivity.',
    type: 'website',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
