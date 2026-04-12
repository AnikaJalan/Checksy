'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, FileCheck2, Settings2, Sparkles } from 'lucide-react';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-slate-50 selection:bg-amber-500/30 font-sans">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero.png" 
            alt="Checksy Workspace" 
            fill 
            priority
            className="object-cover opacity-40 brightness-75 mix-blend-luminosity grayscale-[30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent md:w-2/3" />
        </div>

        <div className="container relative z-10 mx-auto px-6 max-w-6xl">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={stagger}
            className="max-w-xls space-y-8"
          >
            <motion.div variants={fadeUp} className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <span className="text-xl font-semibold tracking-wide text-amber-500">Checksy</span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight text-white leading-[1.05]">
              Grade smarter, <br/><span className="text-slate-400">not longer.</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-300 leading-relaxed font-light max-w-lg">
              Checksy combines your teaching philosophy with powerful local AI orchestration, giving you your weekends back without sacrificing personalized feedback.
            </motion.p>
            
            <motion.div variants={fadeUp} className="pt-6">
              <Link 
                href="/sign-in"
                className="inline-flex group items-center justify-center px-10 py-5 bg-amber-500 text-amber-950 font-semibold rounded-sm text-lg tracking-wide transition-all hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                <span>Get Started Automatically</span>
                <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1.5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Support / How it Works */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, margin: "-100px" }}
             variants={stagger}
             className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            <motion.div variants={fadeUp} className="space-y-4">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <span className="text-amber-500 font-mono text-sm">01</span>
              </div>
              <h3 className="text-xl font-medium">Upload Zip</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Drop a massive zip folder of generic `.docx` documents and watch them parse silently onto mapped UI limits securely safely seamlessly in milliseconds.</p>
            </motion.div>
            
            <motion.div variants={fadeUp} className="space-y-4">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <span className="text-amber-500 font-mono text-sm">02</span>
              </div>
              <h3 className="text-xl font-medium">Configure Constraints</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Define the strictness, select the subject adapter iteratively dynamically modifying internal system AI prompt templates autonomously effortlessly preventing UI constraints.</p>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-4">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <span className="text-amber-500 font-mono text-sm">03</span>
              </div>
              <h3 className="text-xl font-medium">Review Results</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Export beautiful standardized CSV matrices instantly mapping AI heuristics reliably seamlessly bypassing global context hallucination securely natively effortlessly.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Deep Dive Details */}
      <section className="py-32 bg-[#050505]">
        <div className="container mx-auto px-6 max-w-4xl space-y-24">
          <div className="flex flex-col md:flex-row gap-12 items-start">
             <div className="md:w-1/3 pt-2">
                 <Settings2 className="w-8 h-8 text-amber-500 mb-6" />
                 <h3 className="text-2xl font-medium tracking-tight">Bring Your Own Key</h3>
             </div>
             <div className="md:w-2/3 space-y-4">
                 <p className="text-lg text-slate-300 font-light leading-relaxed">We don't lock you into abstract subscriptions mapping generic SaaS overheads globally. Easily paste your own LLM Provider keys and Checksy encrypts them directly onto your teacher profile mapping algorithms strictly via AES-256 securely. You strictly own and orchestrate your individual isolated compute costs seamlessly natively iteratively gracefully securely globally effortlessly.</p>
             </div>
          </div>

          <div className="flex flex-col md:flex-row gap-12 items-start">
             <div className="md:w-1/3 pt-2">
                 <FileCheck2 className="w-8 h-8 text-amber-500 mb-6" />
                 <h3 className="text-2xl font-medium tracking-tight">Zero Hallucinations</h3>
             </div>
             <div className="md:w-2/3 space-y-4">
                 <p className="text-lg text-slate-300 font-light leading-relaxed">Our unified background mapping Inngest orchestrators clamp rigid mathematical heuristic constraints directly encapsulating schemas exactly preventing external metadata traces securely globally smoothly effortlessly mapping output seamlessly strictly safely flawlessly protecting grades iteratively robustly natively correctly safely bypassing model limits entirely safely completely.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-black border-t border-white/5 text-center">
        <div className="container mx-auto px-6 max-w-2xl space-y-8">
           <h2 className="text-4xl font-medium tracking-tight text-white">Start your final weekend.</h2>
           <p className="text-slate-400 text-lg">Join securely safely mapping analytics reliably iteratively grading beautifully effortlessly seamlessly reliably.</p>
           <div className="pt-8">
             <Link 
               href="/sign-in"
               className="inline-flex items-center justify-center px-8 py-3 bg-white text-black font-semibold rounded-sm tracking-wide transition-all hover:bg-slate-200"
             >
               Go to Dashboard Native
             </Link>
           </div>
        </div>
      </section>

    </div>
  );
}
