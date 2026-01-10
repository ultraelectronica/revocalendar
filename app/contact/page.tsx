'use client';

import { useState } from 'react';
import Link from 'next/link';
import FloatingLines from '@/components/FloatingLines';

// Saturn Logo Component
function SaturnLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="6" fill="url(#planetGradientContact)" />
      <ellipse cx="12" cy="12" rx="10" ry="3" stroke="url(#ringGradientContact)" strokeWidth="1.5" fill="none" 
        strokeDasharray="0 15.7 31.4" transform="rotate(-20 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="3" stroke="url(#ringGradientContact)" strokeWidth="1.5" fill="none"
        strokeDasharray="31.4 15.7 0" transform="rotate(-20 12 12)" />
      <defs>
        <linearGradient id="planetGradientContact" x1="6" y1="6" x2="18" y2="18">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="ringGradientContact" x1="2" y1="12" x2="22" y2="12">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}

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

  const backgroundProps = {
    linesGradient: ['#06b6d4', '#8b5cf6', '#f97316', '#10b981'] as string[],
    enabledWaves: ['top', 'middle', 'bottom'] as Array<'top' | 'middle' | 'bottom'>,
    lineCount: [4, 5, 4] as number[],
    animationSpeed: 0.6,
    interactive: false,
    parallax: false,
    mixBlendMode: 'screen' as const,
  };

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
    <div className="min-h-screen flex flex-col relative overflow-hidden aurora-bg">
      {/* Background Animation */}
      <div className="fixed inset-0 z-0">
        <FloatingLines {...backgroundProps} />
      </div>

      {/* Background Overlay */}
      <div className="fixed inset-0 z-[1] bg-[#0a0a12]/70 backdrop-blur-[3px]" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="px-4 sm:px-6 py-4 border-b border-white/5">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {/* Logo & Back */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white/10 group-hover:border-white/20 transition-all">
                <SaturnLogo className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">Revo</h1>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Plan • Track • Achieve</p>
              </div>
            </Link>

            {/* Back Button */}
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto">
            <div className="glass-card p-6 sm:p-10">
              {/* Title */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Get in Touch</h1>
                <p className="text-sm text-white/50">Have questions or feedback? We'd love to hear from you.</p>
              </div>

              {submitted ? (
                /* Success Message */
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">Message Sent!</h2>
                  <p className="text-white/60 mb-6">Thank you for reaching out. We'll get back to you soon.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-secondary"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                /* Contact Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                        className="input-field"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="input-field appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select a topic...</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="feedback">Feature Feedback</option>
                      <option value="bug">Bug Report</option>
                      <option value="partnership">Partnership Opportunity</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="text-xs text-white/50 uppercase tracking-wider block mb-1.5">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Tell us how we can help..."
                      className="input-field resize-none"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Message
                      </span>
                    )}
                  </button>
                </form>
              )}

              {/* Direct Email Alternative */}
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-xs text-white/40">
                  Prefer email?{' '}
                  <a 
                    href="mailto:heiminrei22@gmail.com" 
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    heiminrei22@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-4 py-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <SaturnLogo className="w-4 h-4" />
              <span className="text-xs text-white/40">© 2026 Revo. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/40">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
