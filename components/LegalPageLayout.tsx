'use client';

import Link from 'next/link';
import FloatingLines from '@/components/FloatingLines';

// Saturn Logo Component
function SaturnLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="6" fill="url(#planetGradientLegal)" />
      <ellipse cx="12" cy="12" rx="10" ry="3" stroke="url(#ringGradientLegal)" strokeWidth="1.5" fill="none" 
        strokeDasharray="0 15.7 31.4" transform="rotate(-20 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="3" stroke="url(#ringGradientLegal)" strokeWidth="1.5" fill="none"
        strokeDasharray="31.4 15.7 0" transform="rotate(-20 12 12)" />
      <defs>
        <linearGradient id="planetGradientLegal" x1="6" y1="6" x2="18" y2="18">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="ringGradientLegal" x1="2" y1="12" x2="22" y2="12">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
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
            <div className="glass-card p-6 sm:p-10">
              {/* Title */}
              <div className="mb-8 pb-6 border-b border-white/10">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{title}</h1>
                <p className="text-sm text-white/40">Last updated: {lastUpdated}</p>
              </div>

              {/* Content */}
              <div className="prose prose-invert prose-sm max-w-none">
                {children}
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
