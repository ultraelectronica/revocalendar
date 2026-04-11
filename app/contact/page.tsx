'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Orb from '@/components/Orb';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#05050A]">
      {/* Orb Background */}
      <div className="absolute top-0 left-0 w-full h-[1000px] z-0 overflow-hidden mix-blend-screen pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] -mt-[50px] opacity-50">
          <Orb hue={280} hoverIntensity={0.3} backgroundColor="#05050A" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-[#05050A] via-[#05050A]/60 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#05050A] to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="px-6 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/revologo.png" alt="Revo Logo" width={28} height={28} className="object-contain" />
              <span className="text-lg font-bold text-white tracking-tight">Revo</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </header>

        {/* Hero Title */}
        <section className="pt-20 pb-8 text-center px-4">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4 tracking-tight">Get in touch</h1>
          <p className="text-base text-white/40 max-w-md mx-auto">
            Please feel free to send us any questions, feedback or suggestions you might have.
          </p>
        </section>

        {/* Form Card */}
        <section className="flex-1 px-4 pb-20">
          <div className="max-w-xl mx-auto">
            {/* Outer glow border */}
            <div className="rounded-2xl border border-white/[0.06] p-[1px] bg-gradient-to-b from-white/[0.05] to-transparent shadow-[0_0_80px_rgba(139,92,246,0.08)]">
              <div className="rounded-2xl bg-[#0c0c14]/90 backdrop-blur-xl p-6 sm:p-10">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Message Sent!</h2>
                    <p className="text-white/50 mb-8 text-sm">Thank you for reaching out. We'll get back to you soon.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2.5 rounded-full border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 transition-all"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Topic Select */}
                    <div>
                      <label htmlFor="subject" className="text-xs text-white/40 block mb-2">Choose a topic</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-white/20 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="bg-[#0c0c14]">General</option>
                        <option value="general" className="bg-[#0c0c14]">General</option>
                        <option value="support" className="bg-[#0c0c14]">Technical Support</option>
                        <option value="feedback" className="bg-[#0c0c14]">Feature Feedback</option>
                        <option value="bug" className="bg-[#0c0c14]">Bug Report</option>
                      </select>
                    </div>

                    {/* Name Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="text-xs text-white/40 block mb-2">First name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="First name"
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/20 transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="text-xs text-white/40 block mb-2">Last name</label>
                        <input
                          type="text"
                          id="lastName"
                          placeholder="Last name"
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/20 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="text-xs text-white/40 block mb-2">Email address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Email address"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="text-xs text-white/40 block mb-2">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Enter your questions, feedback or suggestions..."
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-white/20 transition-colors resize-none"
                      />
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Direct Email */}
            <div className="mt-6 text-center">
              <p className="text-xs text-white/30">
                Prefer email?{' '}
                <a href="mailto:heiminrei22@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors">
                  heiminrei22@gmail.com
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-white/[0.05] bg-[#020204]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-white/[0.03] flex items-center justify-center border border-white/5">
                <Image src="/revologo.png" alt="Revo Logo" width={14} height={14} className="opacity-50" />
              </div>
              <span className="text-[12px] text-white/30">© 2026 Revo. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-[12px] text-white/30">
              <Link href="/privacy" className="hover:text-white/80 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white/80 transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
