'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthModal from '@/components/AuthModal';
import Orb from '@/components/Orb';
import LightRays from '@/components/LightRays';
import Reveal from '@/components/Reveal';

// Extracted UI Mockups as simple components
function DashboardMockup() {
  return (
    <div className="w-full max-w-5xl mx-auto rounded-xl border border-white/10 bg-[#0c0c14]/80 backdrop-blur-md overflow-hidden shadow-2xl relative z-10">
      <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2">
        <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/80"/><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"/><div className="w-2.5 h-2.5 rounded-full bg-green-500/80"/></div>
      </div>
      <div className="p-4 sm:p-8 flex items-start gap-6">
        <div className="w-48 hidden md:flex flex-col gap-3 border-r border-white/5 pr-6">
           <div className="h-6 w-24 bg-white/10 rounded"></div>
           <div className="h-4 w-32 bg-white/5 rounded mt-4"></div>
           <div className="h-4 w-28 bg-white/5 rounded"></div>
           <div className="h-4 w-24 bg-white/5 rounded"></div>
        </div>
        <div className="flex-1">
           <div className="flex justify-between items-center mb-6">
             <div className="h-6 w-40 bg-white/10 rounded"></div>
             <div className="h-8 w-24 bg-cyan-500/20 rounded border border-cyan-500/30"></div>
           </div>
           
           <div className="space-y-3">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="flex items-center gap-4 border-b border-white/5 pb-3">
                 <div className="h-4 w-1/3 bg-white/5 rounded"></div>
                 <div className="h-4 w-16 bg-white/10 rounded"></div>
                 <div className="h-4 w-24 bg-white/5 rounded hidden sm:block"></div>
                 <div className="h-4 w-12 bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center rounded"></div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function GridMockupOne() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0c0c14] p-6 sm:p-10 flex flex-col h-full relative overflow-hidden group hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-500">
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] group-hover:bg-violet-600/20 transition-colors duration-500"></div>
      <h3 className="text-2xl font-semibold text-white mb-2 relative z-10">Smart Calendar<br/>& Event Management</h3>
      <p className="text-white/50 text-sm mb-8 relative z-10 leading-relaxed">Seamlessly organize your schedule, track recurring events, and unlock intuitive drag-and-drop planning to reclaim your time.</p>
      <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-6 relative z-10 flex flex-col items-center justify-center shadow-lg group-hover:border-white/10 transition-colors duration-500">
         <div className="w-24 h-24 rounded-full border-[8px] border-violet-500/20 border-l-violet-500 border-t-violet-400 mb-6 drop-shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all duration-500"></div>
         <div className="w-full h-3 bg-white/10 rounded mb-3"></div>
         <div className="w-full h-3 bg-white/10 rounded mb-3"></div>
         <div className="w-3/4 h-3 bg-white/5 rounded"></div>
      </div>
    </div>
  );
}

function GridMockupTwo() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0c0c14] p-6 sm:p-10 flex flex-col h-full relative overflow-hidden group hover:border-cyan-500/30 hover:-translate-y-1 transition-all duration-500">
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-[80px] group-hover:bg-cyan-600/20 transition-colors duration-500"></div>
      <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-6 mb-8 relative z-10 shadow-lg group-hover:border-white/10 transition-colors duration-500">
         <div className="flex gap-2 sm:gap-4 mb-6 opacity-60">
            <div className="h-8 w-1/3 bg-white/10 rounded"></div>
            <div className="h-8 w-1/3 bg-white/10 rounded"></div>
            <div className="h-8 w-1/3 bg-white/10 rounded"></div>
         </div>
         <div className="flex gap-4 items-center border-b border-white/10 pb-4 mb-4">
             <div className="h-6 w-32 bg-violet-500/20 rounded-full border border-violet-500/30"></div>
             <div className="h-6 w-24 bg-white/5 rounded-full"></div>
         </div>
         <div className="space-y-4 opacity-50">
            <div className="flex justify-between">
                <div className="h-3 w-16 bg-white/10 rounded"></div>
                <div className="h-3 w-8 bg-emerald-500 rounded"></div>
            </div>
            <div className="flex justify-between">
                <div className="h-3 w-20 bg-white/10 rounded"></div>
                <div className="h-3 w-8 bg-red-500 rounded"></div>
            </div>
         </div>
      </div>
      <h3 className="text-2xl font-semibold text-white mb-2 relative z-10">Integrated Focus Toolkit</h3>
      <p className="text-white/50 text-sm relative z-10 leading-relaxed">Stay in the zone with our built-in Pomodoro timer, ambient soundscapes, and seamless Spotify integration directly in your calendar.</p>
    </div>
  );
}

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative bg-[#05050A]">
      {/* Orb Background */}
      <div className="absolute top-0 left-0 w-full h-[1100px] z-0 overflow-hidden mix-blend-screen pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] -mt-[100px] opacity-70">
           <Orb hue={280} hoverIntensity={0.5} backgroundColor="#05050A" />
         </div>
         <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-[#05050A] via-[#05050A]/60 to-transparent" />
         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#05050A] to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Navigation */}
        <header className="px-6 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image src="/revologo.png" alt="Revo Logo" width={28} height={28} className="object-contain" />
              <span className="text-lg font-bold text-white tracking-tight">Revo</span>
            </div>

            {/* Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-sm font-medium text-white hover:text-white/80 transition-colors hidden sm:block"
              >
                Log in
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2 rounded-full border border-white/10 text-sm font-medium text-white hover:bg-white/5 transition-all"
              >
                Sign up
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center pt-28 pb-16 px-4 text-center">
          <div className="max-w-3xl mx-auto z-10 relative">
            <Reveal delay={0}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                Time, Mastered. <br/> Starting Now.
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
                Revo brings your schedule, notes, and focus sessions into one beautifully cohesive and encrypted workspace.
              </p>
            </Reveal>
            
            <Reveal delay={240}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                 <div className="flex w-full sm:w-auto p-[3px] rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-sm shadow-[0_0_30px_rgba(255,255,255,0.02)] transition-all focus-within:border-white/20 hover:border-white/20">
                    <input 
                      type="text" 
                      placeholder="Enter your email address" 
                      className="bg-transparent border-none text-white px-6 py-3 w-full sm:w-64 focus:outline-none placeholder:text-white/30 text-sm"
                    />
                    <button 
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors"
                    >
                      Get Started
                    </button>
                 </div>
              </div>
            </Reveal>
            
            <Reveal delay={340}>
              <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                 <span>Open Source & Free Forever</span>
                 <span className="text-white/20">✦</span>
                 <span>Built for Personal Growth</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Dashboard Mockup Section */}
        <section className="px-4 pb-28 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-64 bg-violet-500/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          <Reveal>
            <DashboardMockup />
          </Reveal>
        </section>

        {/* Grid Mockup Section */}
        <section className="px-4 py-32 bg-[#08080C] border-t border-white/5 relative overflow-hidden">
          {/* LightRays WebGL Background */}
          <div className="absolute inset-0 z-0 opacity-60 mix-blend-screen">
            <LightRays
              raysOrigin="top-center"
              raysColor="#8b5cf6"
              raysSpeed={0.4}
              lightSpread={1.8}
              rayLength={1.4}
              pulsating={true}
              fadeDistance={0.9}
              saturation={1.3}
              followMouse={true}
              mouseInfluence={0.08}
              noiseAmount={0.05}
              distortion={0.1}
            />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#08080C] to-transparent z-[1] pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10">
             <Reveal>
               <div className="text-center mb-16">
                 <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Meet Your New <br/> Productivity Hub</h2>
               </div>
             </Reveal>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <Reveal delay={0}><GridMockupOne /></Reveal>
                <Reveal delay={150}><GridMockupTwo /></Reveal>
             </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#05050A] pt-20 pb-10 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12 mb-20">
               {/* Brand Col */}
               <div className="md:col-span-2">
                 <div className="flex items-center gap-2 mb-6">
                   <Image src="/revologo.png" alt="Revo Logo" width={20} height={20} className="object-contain" />
                   <span className="text-[15px] font-bold text-white tracking-tight">Revo</span>
                 </div>
                 <p className="text-sm text-white/50 mb-8 max-w-sm">Experience the next generation of personal productivity, scheduling, and encrypted note-taking.</p>
                 <button onClick={() => setIsAuthModalOpen(true)} className="px-5 py-2.5 rounded-full border border-white/10 text-white/70 text-xs font-medium hover:bg-white/5 transition-all">
                    Get Started for Free
                 </button>
               </div>
               
               {/* Links */}
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
                   <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Services</Link></li>
                   <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                 </ul>
               </div>

               <div className="md:col-span-1">
                 <h4 className="text-white font-semibold mb-6 text-sm">Community</h4>
                 <ul className="space-y-4 text-[13px] text-white/50">
                   <li><Link href="#" className="hover:text-white transition-colors">Feedback</Link></li>
                   <li><Link href="#" className="hover:text-white transition-colors">Contribution</Link></li>
                 </ul>
               </div>
            </div>

            {/* Bottom Footer Border & Copyright */}
            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-[11px] text-white/40">
               <p>©2026 Revo. All rights reserved.</p>
               <div className="flex gap-6 mt-4 md:mt-0">
                  <a href="#" className="hover:text-white transition-colors">IG</a>
                  <a href="#" className="hover:text-white transition-colors">YT</a>
                  <a href="#" className="hover:text-white transition-colors">IN</a>
                  <a href="#" className="hover:text-white transition-colors">TW</a>
               </div>
            </div>
          </div>
        </footer>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
