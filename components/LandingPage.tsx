'use client';

import { useState } from 'react';
import Link from 'next/link';
import FloatingLines from '@/components/FloatingLines';
import AuthModal from '@/components/AuthModal';

// Saturn Logo Component (matching the main app)
function SaturnLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="6" fill="url(#planetGradientLanding)" />
      <ellipse cx="12" cy="12" rx="10" ry="3" stroke="url(#ringGradientLanding)" strokeWidth="1.5" fill="none" 
        strokeDasharray="0 15.7 31.4" transform="rotate(-20 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="3" stroke="url(#ringGradientLanding)" strokeWidth="1.5" fill="none"
        strokeDasharray="31.4 15.7 0" transform="rotate(-20 12 12)" />
      <defs>
        <linearGradient id="planetGradientLanding" x1="6" y1="6" x2="18" y2="18">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="ringGradientLanding" x1="2" y1="12" x2="22" y2="12">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Feature Card Component
function FeatureCard({ 
  icon, 
  title, 
  description, 
  gradient 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  gradient: string;
}) {
  return (
    <div className="glass-card-hover p-6 group">
      <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed">{description}</p>
    </div>
  );
}

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const backgroundProps = {
    linesGradient: ['#06b6d4', '#8b5cf6', '#f97316', '#10b981'] as string[],
    enabledWaves: ['top', 'middle', 'bottom'] as Array<'top' | 'middle' | 'bottom'>,
    lineCount: [5, 7, 5] as number[],
    animationSpeed: 0.8,
    interactive: true,
    parallax: true,
    mixBlendMode: 'screen' as const,
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden aurora-bg">
      {/* Background Animation */}
      <div className="fixed inset-0 z-0">
        <FloatingLines {...backgroundProps} />
      </div>

      {/* Background Overlay for better text readability */}
      <div className="fixed inset-0 z-[1] bg-[#0a0a12]/60 backdrop-blur-[2px]" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header / Navigation */}
        <header className="px-4 sm:px-6 py-4 border-b border-white/5">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white/10">
                <SaturnLogo className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">Revo</h1>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Plan • Track • Achieve</p>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-secondary text-xs sm:text-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-primary text-xs sm:text-sm"
              >
                Get Started
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 fade-in">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs sm:text-sm text-white/70">Secure & Encrypted</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 fade-in stagger-1">
              Studying?{' '}
              <span className="gradient-text text-glow-cyan">Simply Organized</span>
            </h2>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto mb-8 sm:mb-10 fade-in stagger-2 leading-relaxed">
              A stunning calendar app with end-to-end encryption, smart planning tools, focus timer, and Spotify integration. 
              Take control of your time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 fade-in stagger-3">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Planning Free
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 mt-10 text-xs text-white/40 fade-in stagger-4">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Free forever tier
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Setup in 30s
              </span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Everything You Need to <span className="gradient-text">Stay Productive</span>
              </h3>
              <p className="text-sm sm:text-base text-white/50 max-w-xl mx-auto">
                Designed for focused work and seamless planning
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <FeatureCard
                icon={
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                title="Smart Calendar"
                description="Intuitive event management with drag-and-drop, recurring events, and smart reminders."
                gradient="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20"
              />
              <FeatureCard
                icon={
                  <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                title="End-to-End Encryption"
                description="Your data is encrypted on your device. Not even we can read your events and notes."
                gradient="bg-gradient-to-br from-violet-500/20 to-violet-600/20"
              />
              <FeatureCard
                icon={
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                title="Focus Timer"
                description="Built-in Pomodoro timer with customizable sessions and ambient sounds to boost focus."
                gradient="bg-gradient-to-br from-orange-500/20 to-orange-600/20"
              />
              <FeatureCard
                icon={
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                }
                title="Spotify Integration"
                description="Control your music while you work. See what's playing without leaving your calendar."
                gradient="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-4 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Get Started in <span className="gradient-text">3 Simple Steps</span>
              </h3>
              <p className="text-sm sm:text-base text-white/50">
                From signup to full productivity in under a minute
              </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="glass-card p-6 relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-cyan-500/30">
                  1
                </div>
                <div className="mt-2">
                  <h4 className="text-lg font-semibold text-white mb-2">Create Account</h4>
                  <p className="text-sm text-white/50">Sign up with email or Google. Set your encryption passphrase for maximum security.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="glass-card p-6 relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-violet-500/30">
                  2
                </div>
                <div className="mt-2">
                  <h4 className="text-lg font-semibold text-white mb-2">Add Your Events</h4>
                  <p className="text-sm text-white/50">Create events, set reminders, and organize your schedule with our intuitive interface.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="glass-card p-6 relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-orange-500/30">
                  3
                </div>
                <div className="mt-2">
                  <h4 className="text-lg font-semibold text-white mb-2">Stay Focused</h4>
                  <p className="text-sm text-white/50">Use the focus timer, track your progress, and sync seamlessly across all your devices.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 sm:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="glass-card p-8 sm:p-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to Transform Your Productivity?
              </h3>
              <p className="text-white/60 mb-8">
                Join thousands of users who have taken control of their time with Revo.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:-translate-y-1"
              >
                Get Started — It's Free
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 py-8 border-t border-white/5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <SaturnLogo className="w-5 h-5" />
              <span className="text-sm text-white/40">© 2026 Revo. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/40">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <a href="mailto:contact@revo.app" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
