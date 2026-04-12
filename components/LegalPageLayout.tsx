'use client';

import Image from 'next/image';
import Link from 'next/link';
import Orb from '@/components/Orb';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative bg-[#05050A] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1100px] z-0 overflow-hidden mix-blend-screen pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] -mt-[100px] opacity-70">
          <Orb hue={280} hoverIntensity={0.5} backgroundColor="#05050A" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-[#05050A] via-[#05050A]/60 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#05050A] to-transparent" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <header className="px-6 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/revologo.png" alt="Revo Logo" width={28} height={28} className="object-contain" />
              <span className="text-lg font-bold text-white tracking-tight">Revo</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
            </nav>

            <Link
              href="/"
              className="px-5 py-2 rounded-full border border-white/10 text-sm font-medium text-white hover:bg-white/5 transition-all"
            >
              Back Home
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-6xl mx-auto">
            <section className="text-center mb-14 sm:mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-white/45 backdrop-blur-sm">
                <span>Legal</span>
                <span className="text-white/20">•</span>
                <span>Last updated {lastUpdated}</span>
              </div>
              <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05]">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-white/50 leading-relaxed">
                Clear terms, clear privacy, and the same design language as the rest of Revo.
              </p>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">
              <aside className="rounded-3xl border border-white/10 bg-[#0c0c14]/80 backdrop-blur-md p-6 lg:sticky lg:top-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/70">Why this matters</p>
                <p className="mt-4 text-sm leading-relaxed text-white/55">
                  Revo is built around private planning and focused work. These pages explain the rules of the service and how your data is handled.
                </p>
                <div className="mt-6 space-y-3 text-sm text-white/60">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-white font-medium">Privacy-first</p>
                    <p className="mt-1 text-white/45">Your notes and schedule are designed around encryption and user control.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-white font-medium">Plain language</p>
                    <p className="mt-1 text-white/45">The content stays readable instead of looking like a default legal template.</p>
                  </div>
                </div>
              </aside>

              <div className="rounded-3xl border border-white/10 bg-[#0c0c14]/80 backdrop-blur-md overflow-hidden shadow-2xl">
                <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                </div>
                <div className="p-6 sm:p-8 md:p-10">
                  <div className="mb-8 pb-6 border-b border-white/10">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300/70">Revo Legal</p>
                    <h2 className="mt-3 text-2xl sm:text-3xl font-semibold text-white">{title}</h2>
                    <p className="mt-2 text-sm text-white/40">Updated {lastUpdated}</p>
                  </div>
                  <div className="legal-content max-w-none text-white/70">
                    {children}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        <footer className="bg-[#05050A] pt-16 pb-10 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <Image src="/revologo.png" alt="Revo Logo" width={20} height={20} className="object-contain" />
                  <span className="text-[15px] font-bold text-white tracking-tight">Revo</span>
                </div>
                <p className="text-sm text-white/50 max-w-sm">
                  Experience the next generation of personal productivity, scheduling, and encrypted note-taking.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-6 text-sm">Product</h4>
                <ul className="space-y-4 text-[13px] text-white/50">
                  <li><Link href="/about" className="hover:text-white transition-colors">About Revo</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-6 text-sm">Legals</h4>
                <ul className="space-y-4 text-[13px] text-white/50">
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-[11px] text-white/40">
              <p>©2026 Revo. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
