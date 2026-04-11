'use client';

import Link from 'next/link';
import Image from 'next/image';
import Orb from '@/components/Orb';

export default function AboutPage() {
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

        {/* Hero — editorial, full-width, big type */}
        <section className="pt-24 sm:pt-32 pb-20 px-6 text-center">
          <p className="text-violet-400/80 text-sm font-semibold uppercase tracking-[0.2em] mb-6">About Revo</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-8">
            We believe your time <br className="hidden sm:block" />is <span className="gradient-text">yours to keep.</span>
          </h1>
          <p className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed font-light">
            Revo is a privacy-first calendar and productivity workspace, built for individuals who refuse to compromise on security or design.
          </p>
        </section>

        {/* Two-column Story Section */}
        <section className="px-6 pb-24 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto pt-20">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
              {/* Left label */}
              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-32">
                  <p className="text-xs text-white/30 uppercase tracking-[0.15em] mb-3">The Problem</p>
                  <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">Your productivity tools shouldn't spy on you.</h2>
                </div>
              </div>
              {/* Right body */}
              <div className="lg:col-span-3 space-y-6 text-white/50 text-[15px] leading-relaxed">
                <p>
                  Most calendar and note-taking apps treat your data as a product. They store your events in plaintext, sell insights to advertisers, and offer you convenience at the cost of privacy.
                </p>
                <p>
                  We started Revo because we were tired of the tradeoff. We wanted something that was both gorgeous to use and completely private — a workspace where your schedule, notes, and reminders are encrypted on your device before they ever touch the cloud.
                </p>
                <p>
                  Not even we can read your data. That's not a feature — it's the foundation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities — horizontal scroll-like cards */}
        <section className="px-6 py-24 bg-[#08080C] border-y border-white/[0.04]">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs text-white/30 uppercase tracking-[0.15em] mb-4">What's inside</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-16">Built to keep you in flow.</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.06]">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ),
                  title: 'End-to-End Encryption',
                  desc: 'Zero-knowledge architecture. Your data is encrypted on-device before syncing to the cloud.',
                  color: 'text-violet-400',
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ),
                  title: 'Smart Calendar',
                  desc: 'Intuitive event management with recurring events, color coding, and adaptive layouts.',
                  color: 'text-cyan-400',
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: 'Focus Timer',
                  desc: 'Built-in Pomodoro sessions with customizable durations and ambient alarm sounds.',
                  color: 'text-orange-400',
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  ),
                  title: 'Spotify Integration',
                  desc: 'Control your music without breaking focus. See what\'s playing right inside your workspace.',
                  color: 'text-emerald-400',
                },
              ].map((item, i) => (
                <div key={i} className="bg-[#0c0c14] p-8 sm:p-10 group hover:bg-[#0e0e18] transition-colors">
                  <div className={`${item.color} mb-5 opacity-70 group-hover:opacity-100 transition-opacity`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Builder Section — asymmetric, personal */}
        <section className="px-6 py-24">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
              <div className="lg:col-span-2">
                <p className="text-xs text-white/30 uppercase tracking-[0.15em] mb-3">The Builder</p>
                <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">Made by one developer, <br className="hidden lg:block" />for everyone.</h2>
              </div>
              <div className="lg:col-span-3">
                <p className="text-white/50 text-[15px] leading-relaxed mb-8">
                  Revo is developed and maintained by{' '}
                  <a
                    href="https://github.com/ultraelectronica"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-violet-300 transition-colors font-semibold"
                  >
                    Ultraelectronica
                  </a>
                  , a deadass developer. This project is open source, free to use, and built with genuine love for clean design and strong privacy defaults.
                </p>
                <a
                  href="https://github.com/ultraelectronica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 text-white/60 text-sm hover:bg-white/5 hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-5">Ready to own your time?</h3>
            <p className="text-white/40 mb-10">It's free, encrypted, and yours.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:-translate-y-1"
            >
              Get Started
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
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
              <Link href="/contact" className="hover:text-white/80 transition-colors">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
