import type { Metadata } from 'next';
import LegalPageLayout from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Terms of Service | Revo',
  description: 'Read the terms and conditions for using Revo, the secure calendar and productivity application.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="January 11, 2026">
      {/* Introduction */}
      <section className="mb-8">
        <p className="text-white/70 leading-relaxed">
          Welcome to Revo. By using our service, you agree to these terms. Please read them carefully.
        </p>
      </section>

      {/* Acceptance */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
        <div className="space-y-3 text-white/60 text-sm leading-relaxed">
          <p>
            By accessing or using Revo, you agree to be bound by these Terms of Service and our Privacy Policy. 
            If you do not agree to these terms, please do not use our service.
          </p>
        </div>
      </section>

      {/* Account Responsibilities */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">2. Account Responsibilities</h2>
        <div className="space-y-3 text-white/60 text-sm leading-relaxed">
          <p>When you create an account, you agree to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Safeguard your encryption passphrase (we cannot recover it)</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>
        </div>
      </section>

      {/* Acceptable Use */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">3. Acceptable Use</h2>
        <div className="space-y-3 text-white/60 text-sm leading-relaxed">
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use Revo for any illegal purposes</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the service</li>
            <li>Share your account with others</li>
          </ul>
        </div>
      </section>

      {/* Service Availability */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">4. Service Availability</h2>
        <div className="space-y-3 text-white/60 text-sm leading-relaxed">
          <p>
            We strive to provide reliable service but cannot guarantee 100% uptime. We may temporarily 
            suspend access for maintenance, updates, or unexpected issues. We will notify users of 
            planned downtime when possible.
          </p>
        </div>
      </section>

      {/* Intellectual Property */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">5. Intellectual Property</h2>
        <div className="space-y-3 text-white/60 text-sm leading-relaxed">
          <p>
            Revo and its original content, features, and functionality are owned by us and protected 
            by copyright, trademark, and other intellectual property laws. Your data remains yours.
          </p>
        </div>
      </section>

      {/* Disclaimers */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">6. Disclaimers</h2>
        <div className="space-y-3 text-white/60 text-sm leading-relaxed">
          <p>
            Revo is provided "as is" without warranties of any kind. We do not guarantee that the 
            service will be uninterrupted, secure, or error-free. You use the service at your own risk.
          </p>
        </div>
      </section>

      {/* Changes to Terms */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">7. Changes to Terms</h2>
        <div className="space-y-3 text-white/60 text-sm leading-relaxed">
          <p>
            We may update these terms from time to time. We will notify you of significant changes 
            via email or in-app notification. Continued use after changes constitutes acceptance.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">8. Contact Us</h2>
        <p className="text-white/60 text-sm leading-relaxed">
          Questions about these terms? Contact us at{' '}
          <a href="mailto:heiminrei22@gmail.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            heiminrei22@gmail.com
          </a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
