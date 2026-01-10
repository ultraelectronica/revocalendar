import type { Metadata } from 'next';
import LegalPageLayout from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy | Revo',
  description: 'Learn how Revo protects your data with end-to-end encryption and our commitment to your privacy.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="January 11, 2026">
      {/* Introduction */}
      <section className="mb-8">
        <p className="text-white/70 leading-relaxed">
          At Revo, your privacy is our priority. This policy explains how we collect, use, and protect your information 
          when you use our calendar and productivity application.
        </p>
      </section>

      {/* Data Collection */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>
        <div className="space-y-3 text-white/60 text-sm leading-relaxed">
          <p><strong className="text-white/80">Account Information:</strong> Email address and display name when you create an account.</p>
          <p><strong className="text-white/80">Calendar Data:</strong> Events, notes, and settings you create within the app.</p>
          <p><strong className="text-white/80">Usage Data:</strong> Anonymous analytics to improve our service (can be disabled).</p>
        </div>
      </section>

      {/* End-to-End Encryption */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">2. End-to-End Encryption</h2>
        <div className="space-y-3 text-white/60 text-sm leading-relaxed">
          <p>
            Your calendar events and notes are encrypted on your device before being stored. This means:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Only you can read your data</li>
            <li>We cannot access your encrypted content</li>
            <li>Your encryption passphrase never leaves your device</li>
          </ul>
        </div>
      </section>

      {/* Data Usage */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">3. How We Use Your Data</h2>
        <div className="space-y-3 text-white/60 text-sm leading-relaxed">
          <p>We use your information to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Provide and maintain the Revo service</li>
            <li>Sync your data across devices</li>
            <li>Send important service updates (you can opt out)</li>
            <li>Improve our application based on anonymous usage patterns</li>
          </ul>
        </div>
      </section>

      {/* Third-Party Services */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">4. Third-Party Services</h2>
        <div className="space-y-3 text-white/60 text-sm leading-relaxed">
          <p><strong className="text-white/80">Supabase:</strong> Secure database and authentication provider.</p>
          <p><strong className="text-white/80">Spotify (Optional):</strong> Music integration if you choose to connect your account.</p>
          <p><strong className="text-white/80">Weather API:</strong> Location-based weather data (location not stored).</p>
        </div>
      </section>

      {/* Data Retention */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">5. Data Retention & Deletion</h2>
        <div className="space-y-3 text-white/60 text-sm leading-relaxed">
          <p>
            You can delete your account and all associated data at any time from your account settings. 
            Upon deletion, all your data is permanently removed from our servers within 30 days.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">6. Contact Us</h2>
        <p className="text-white/60 text-sm leading-relaxed">
          Questions about this privacy policy? Contact us at{' '}
          <a href="mailto:heiminrei22@gmail.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            heiminrei22@gmail.com
          </a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
