'use client';

import Link from 'next/link';
import FloatingLines from '@/components/FloatingLines';

// Saturn Logo Component
function SaturnLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="6" fill="url(#planetGradientAbout)" />
      <ellipse cx="12" cy="12" rx="10" ry="3" stroke="url(#ringGradientAbout)" strokeWidth="1.5" fill="none" 
        strokeDasharray="0 15.7 31.4" transform="rotate(-20 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="3" stroke="url(#ringGradientAbout)" strokeWidth="1.5" fill="none"
        strokeDasharray="31.4 15.7 0" transform="rotate(-20 12 12)" />
      <defs>
        <linearGradient id="planetGradientAbout" x1="6" y1="6" x2="18" y2="18">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="ringGradientAbout" x1="2" y1="12" x2="22" y2="12">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function AboutPage() {
  const backgroundProps = {
    linesGradient: ['#06b6d4', '#8b5cf6', '#f97316', '#10b981'] as string[],
    enabledWaves: ['top', 'middle', 'bottom'] as Array<'top' | 'middle' | 'bottom'>,
    lineCount: [4, 5, 4] as number[],
    animationSpeed: 0.6,
    interactive: false,
    parallax: false,
    mixBlendMode: 'screen' as const,
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
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white/10">
                <SaturnLogo className="w-12 h-12" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                About <span className="gradient-text">Revo</span>
              </h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                A beautifully designed, privacy-first calendar app built for students and professionals who value security and productivity.
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 mb-12">
              {/* Mission Section */}
              <div className="glass-card p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  Our Mission
                </h2>
                <p className="text-white/60 leading-relaxed">
                  Revo was created with a simple goal: to help people organize their lives without sacrificing their privacy. 
                  In a world where your data is constantly being collected and monetized, we believe you deserve a productivity 
                  tool that respects your privacy. Every event, note, and reminder you create is encrypted on your device 
                  before it ever leaves — not even we can read your data.
                </p>
              </div>

              {/* What is Revo */}
              <div className="glass-card p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  What is Revo?
                </h2>
                <p className="text-white/60 leading-relaxed mb-4">
                  Revo is a modern calendar and productivity application designed specifically for students, 
                  freelancers, and professionals who need a simple yet powerful way to manage their time.
                </p>
                <ul className="space-y-3 text-white/60">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong className="text-white/80">End-to-End Encryption</strong> — Your data is encrypted before leaving your device</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong className="text-white/80">Focus Timer</strong> — Built-in Pomodoro timer to boost your productivity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong className="text-white/80">Spotify Integration</strong> — Control your music while staying focused</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong className="text-white/80">Cloud Sync</strong> — Access your calendar from anywhere, securely</span>
                  </li>
                </ul>
              </div>

              {/* Developer Section */}
              <div className="glass-card p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  Built by
                </h2>
                <p className="text-white/60 leading-relaxed mb-4">
                  Revo is developed and maintained by{' '}
                  <a 
                    href="https://github.com/ultraelectronica" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold inline-flex items-center gap-1"
                  >
                    Ultraelectronica
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  , a deadass developer.
                </p>
                <a 
                  href="https://github.com/ultraelectronica" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  View on GitHub
                </a>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:-translate-y-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Get Started Free
              </Link>
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
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
