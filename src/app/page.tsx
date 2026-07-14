'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { TrendingDown, Calculator, Users, Shield, ArrowRight, Check, Zap, Brain, Target } from 'lucide-react';

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Floating Orbs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-50 backdrop-blur-md bg-white/70 border-b border-gray-200/50 sticky top-0"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.div 
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            QuorumAI
          </motion.div>
          <div className="flex gap-6 items-center">
            <Link href="#features" className="text-gray-700 hover:text-gray-900 transition">Features</Link>
            <Link href="#how-it-works" className="text-gray-700 hover:text-gray-900 transition">Process</Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/sign-in"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all"
              >
                Launch Platform
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.div 
        ref={heroRef}
        style={{ opacity, scale }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700 mb-8">
            <Zap className="w-4 h-4" />
            Investment Analysis Platform
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight"
        >
          When perspectives <br />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            clash by design
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Four specialized analysts examine every investment from distinct angles. 
          They debate. They challenge assumptions. The platform captures where they align 
          and where they split — without forcing consensus.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href="/sign-up"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all flex items-center gap-2"
            >
              Start Analysis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href="#how-it-works"
              className="px-8 py-4 bg-white/80 backdrop-blur text-gray-900 rounded-xl font-semibold border-2 border-gray-300 hover:border-gray-400 transition-all shadow-lg"
            >
              View Process
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {[
            { label: 'Analyst Perspectives', value: '4' },
            { label: 'Analysis Rounds', value: '3+' },
            { label: 'Conflict Detection', value: 'Real' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 bg-white/70 backdrop-blur rounded-2xl border border-gray-200 shadow-lg"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* The Four Analysts */}
      <div ref={featuresRef} id="features" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Four distinct viewpoints
          </h2>
          <p className="text-xl text-gray-600">Each analyst brings a specialized framework to evaluation</p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: TrendingDown,
              title: 'Market Analyst',
              desc: 'Questions size claims, competitive positioning, and demand validation',
              color: 'from-red-500 to-orange-500',
              borderColor: 'border-red-500'
            },
            {
              icon: Calculator,
              title: 'Finance Specialist',
              desc: 'Examines unit economics, runway calculations, and projection consistency',
              color: 'from-blue-500 to-cyan-500',
              borderColor: 'border-blue-500'
            },
            {
              icon: Users,
              title: 'Team Evaluator',
              desc: 'Reviews founder background, execution history, and organizational gaps',
              color: 'from-violet-500 to-purple-500',
              borderColor: 'border-violet-500'
            },
            {
              icon: Shield,
              title: 'Risk Assessor',
              desc: 'Identifies regulatory exposure, structural concerns, and legal complexity',
              color: 'from-amber-500 to-yellow-500',
              borderColor: 'border-amber-500'
            }
          ].map((persona, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -8 }}
              className={`group relative bg-white rounded-2xl p-8 border-l-4 ${persona.borderColor} shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden`}
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${persona.color} opacity-0 group-hover:opacity-5 transition-opacity`}
              />
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${persona.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <persona.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{persona.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {persona.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-24 relative overflow-hidden">
        {/* Animated dots */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75" />
          <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-150" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white mb-4">Analysis workflow</h2>
            <p className="text-xl text-blue-200">From upload to insight in four stages</p>
          </motion.div>
          
          <div className="space-y-12">
            {[
              {
                num: '01',
                title: 'Upload materials',
                desc: 'Pitch deck and financial documents get processed. Text extraction handles standard PDFs while flagging scanned images that need manual input.',
                icon: Brain
              },
              {
                num: '02',
                title: 'Independent review',
                desc: 'Four analysts examine the content separately. Each generates specific observations tied to document evidence before seeing what others found.',
                icon: Target
              },
              {
                num: '03',
                title: 'Challenge rounds',
                desc: 'Analysts review each other\'s positions. They probe weak reasoning, cite contradictory evidence, or acknowledge valid points through structured exchanges.',
                icon: Zap
              },
              {
                num: '04',
                title: 'Report delivery',
                desc: 'The platform compiles consensus findings, resolved debates, and remaining disagreements. No artificial reconciliation where views genuinely diverge.',
                icon: Check
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="flex gap-8 items-start group"
              >
                <div className="flex-shrink-0">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-2xl text-white shadow-2xl shadow-blue-500/50"
                  >
                    {step.num}
                  </motion.div>
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-4 mb-3">
                    <step.icon className="w-6 h-6 text-blue-400" />
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-lg text-blue-100 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Built for decision clarity
          </h2>
          <p className="text-xl text-gray-600">
            Get perspectives that surface risk without manufacturing problems
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Multiple frameworks',
              desc: 'Market viability, financial health, team capability, and structural risk each get dedicated attention',
              gradient: 'from-blue-500 to-cyan-500'
            },
            {
              title: 'Evidence tracking',
              desc: 'Every observation links back to specific document content rather than generic industry assumptions',
              gradient: 'from-purple-500 to-pink-500'
            },
            {
              title: 'Conflict visibility',
              desc: 'When analysts reach different conclusions after examination, both viewpoints appear in the output',
              gradient: 'from-orange-500 to-red-500'
            }
          ].map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="relative p-8 bg-white rounded-2xl shadow-xl border border-gray-100 group overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative">
                <div className={`w-12 h-1 rounded-full bg-gradient-to-r ${benefit.gradient} mb-6`} />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative p-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/10" />
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              backgroundSize: '100% 100%',
            }}
          />
          <div className="relative text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Run your first analysis
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Upload a pitch deck. Watch four analysts examine it from distinct angles. 
              See where they align and where perspectives diverge.
            </p>
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link 
                href="/sign-up"
                className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/30 transition-all"
              >
                Begin Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                QuorumAI
              </div>
              <p className="text-sm text-gray-500">
                Investment analysis without artificial consensus
              </p>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="/about" className="hover:text-white transition">About</Link>
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms</Link>
              <Link href="/contact" className="hover:text-white transition">Contact</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            Built with Next.js, Claude API, and commitment to analytical clarity
          </div>
        </div>
      </footer>
    </div>
  );
}
