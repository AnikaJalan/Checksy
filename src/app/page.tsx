'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useCallback } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileArchive,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  Timer,
} from 'lucide-react';

const sectionStagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: 'easeOut' as const,
    },
  },
};

const workflow = [
  {
    title: 'Upload ZIP submissions',
    body: 'Drop essays, quizzes, and worksheets as one archive. Checksy maps files by student and gets them ready for grading.',
    icon: FileArchive,
  },
  {
    title: 'AI grades with your rubric',
    body: 'Use subject-aware grading adapters, scoring logic, and consistency rules that match how your school evaluates work.',
    icon: BrainCircuit,
  },
  {
    title: 'Export results to CSV',
    body: 'Get classroom-ready marks, feedback, and flagged items in a clean CSV format for quick sharing and reporting.',
    icon: FileSpreadsheet,
  },
];

const highlights = [
  {
    title: 'Human-style feedback',
    body: 'Students get score context, not just numbers, so feedback actually helps them improve.',
    icon: CheckCircle2,
  },
  {
    title: 'Fast grading loops',
    body: 'From upload to result in minutes, even for larger class batches.',
    icon: Timer,
  },
  {
    title: 'Trust and safety checks',
    body: 'AI-content and plagiarism risk flags help teachers review with confidence before finalizing.',
    icon: ShieldCheck,
  },
];

export default function LandingPage() {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const springX = useSpring(pointerX, { stiffness: 50, damping: 20, mass: 0.7 });
  const springY = useSpring(pointerY, { stiffness: 50, damping: 20, mass: 0.7 });

  const glowOneX = useTransform(springX, (v) => v * 16);
  const glowOneY = useTransform(springY, (v) => v * 16);
  const glowTwoX = useTransform(springX, (v) => v * -20);
  const glowTwoY = useTransform(springY, (v) => v * -10);
  const glowThreeX = useTransform(springX, (v) => v * 10);
  const glowThreeY = useTransform(springY, (v) => v * -18);

  const handlePointerMove = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - left) / width;
    const y = (event.clientY - top) / height;

    pointerX.set((x - 0.5) * 2);
    pointerY.set((y - 0.5) * 2);
  }, [pointerX, pointerY]);

  const resetPointer = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#f4f7fb] text-[#0f1b39] selection:bg-blue-200/60"
      onMouseMove={handlePointerMove}
      onMouseLeave={resetPointer}
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-20 -top-16 h-96 w-96 rounded-full bg-[#b8d9ff]/55 blur-3xl"
          style={{ x: glowOneX, y: glowOneY }}
          animate={{ x: [0, 20, -12, 0], y: [0, 18, 8, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[-7rem] top-28 h-[26rem] w-[26rem] rounded-full bg-[#9ed5d9]/45 blur-3xl"
          style={{ x: glowTwoX, y: glowTwoY }}
          animate={{ x: [0, -28, -10, 0], y: [0, -12, 14, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-9rem] left-1/3 h-[25rem] w-[25rem] rounded-full bg-[#c8ccff]/40 blur-3xl"
          style={{ x: glowThreeX, y: glowThreeY }}
          animate={{ x: [0, 16, -20, 0], y: [0, -20, 14, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(108,155,235,0.17),transparent_38%),radial-gradient(circle_at_76%_26%,rgba(92,187,190,0.18),transparent_42%),linear-gradient(to_bottom,rgba(244,247,251,0.4),rgba(244,247,251,0.96))]" />
      </div>

      <section className="relative mx-auto flex min-h-[88vh] w-full max-w-6xl items-center px-6 pb-16 pt-24">
        <motion.div initial="hidden" animate="show" variants={sectionStagger} className="w-full">
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfd9ea] bg-white/70 px-4 py-2 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-[#5b75aa]" />
            <span className="text-sm tracking-wide text-[#314a7d]">Checksy AI Grading</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="max-w-4xl font-serif text-5xl leading-tight text-[#101c3e] md:text-7xl">
            Grading that feels lighter, faster, and more fun.
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-7 max-w-2xl text-lg leading-relaxed text-[#445a86] md:text-xl">
            Upload student submissions, run guided AI grading, and get polished feedback + score exports in one smooth flow.
            Built for teachers, not spreadsheets.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-7 py-3 font-semibold text-white transition hover:bg-[#1d2940]"
            >
              Start Grading
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center rounded-full border border-[#c7d2e5] bg-white/85 px-7 py-3 font-medium text-[#27385c] transition hover:bg-white"
            >
              Open Dashboard
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 grid max-w-3xl grid-cols-1 gap-3 text-sm text-[#2d446f] md:grid-cols-3">
            <div className="rounded-2xl border border-[#ccd8ee] bg-white/75 px-4 py-3 shadow-sm">Rubric-aware grading engine</div>
            <div className="rounded-2xl border border-[#ccd8ee] bg-white/75 px-4 py-3 shadow-sm">Plagiarism and AI-risk checks</div>
            <div className="rounded-2xl border border-[#ccd8ee] bg-white/75 px-4 py-3 shadow-sm">Downloadable CSV insights</div>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-6 pb-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionStagger}
          className="grid gap-5 md:grid-cols-3"
        >
          {workflow.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                variants={fadeUp}
                className="rounded-3xl border border-[#ced9ec] bg-white/80 p-6 shadow-[0_10px_28px_rgba(31,52,97,0.08)] backdrop-blur"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecf2ff] text-[#365796]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#5d78ab]">Step {index + 1}</p>
                <h3 className="mb-3 text-xl font-semibold text-[#15264d]">{item.title}</h3>
                <p className="leading-relaxed text-[#4c638c]">{item.body}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-6 pb-28">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionStagger}
          className="rounded-3xl border border-[#cad7ec] bg-gradient-to-br from-[#f4f8ff] via-white to-[#eff6ff] p-8 shadow-[0_22px_44px_rgba(26,48,94,0.08)] md:p-12"
        >
          <motion.h2 variants={fadeUp} className="font-serif text-4xl text-[#13244b] md:text-5xl">
            Made for real classroom energy
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 max-w-2xl text-lg text-[#486186]">
            Checksy gives you speed without losing nuance. Grade at scale, review edge cases faster, and spend more time teaching.
          </motion.p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="rounded-2xl border border-[#cfdcf1] bg-white/85 p-5 shadow-sm"
                >
                  <Icon className="mb-3 h-5 w-5 text-[#4667a6]" />
                  <h4 className="mb-2 text-lg font-semibold text-[#1b2f59]">{item.title}</h4>
                  <p className="text-[#4e658c]">{item.body}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
