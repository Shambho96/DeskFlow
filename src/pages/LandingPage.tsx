import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bed,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Search,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Star,
  Building2,
  Lock
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-[var(--primary-foreground)] font-sans overflow-x-hidden">
      {/* Background Lighting Gradients */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[var(--primary)]/20 via-[var(--primary)]/5 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-[var(--primary)]/10 blur-[150px] pointer-events-none -z-10" />

      {/* STICKY HEADER NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--background)]/80 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/30">
              <Bed className="w-5 h-5 text-[var(--primary-foreground)]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">
                Desk<span className="text-[var(--primary)] font-extrabold">Flow</span>
              </span>
              <span className="block text-[10px] text-[var(--muted-foreground)] tracking-widest uppercase font-bold">Intelligent Operations Platform</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--muted-foreground)]">
            <a href="#features" className="hover:text-[var(--foreground)] transition-colors">Features</a>
            <a href="#demo" className="hover:text-[var(--foreground)] transition-colors">Live Tape Chart</a>
            <a href="#pricing" className="hover:text-[var(--foreground)] transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-[var(--foreground)] transition-colors">Reviews</a>
          </nav>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button
              className="bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/25 font-semibold gap-2 rounded-lg"
              onClick={() => navigate('/app/dashboard')}
            >
              Launch Platform App <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-24 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-500/30 text-xs font-extrabold text-[var(--foreground)] mb-8 shadow-lg shadow-indigo-500/5 backdrop-blur-md"
        >
         
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="tracking-wide">Real-Time Autonomous Hotel Operations Ecosystem</span>
          
          <ChevronRight className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-[var(--foreground)] max-w-5xl mx-auto leading-[1.15]"
        >
          An Intelligent Hotel <span className="text-[var(--primary)]">Operations Platform</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-[var(--muted-foreground)] max-w-3xl mx-auto leading-relaxed font-medium"
        >
          An intelligent hotel operations platform that connects reservations, rooms, housekeeping, maintenance, billings, and guest services in real time
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] h-13 px-8 text-base font-semibold shadow-xl shadow-[var(--primary)]/30 gap-2 rounded-xl"
            onClick={() => navigate('/app/dashboard')}
          >
            Explore Reception Platform <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-[var(--border)] bg-[var(--muted)] hover:bg-[var(--secondary)] text-[var(--foreground)] h-13 px-8 text-base font-medium rounded-xl"
            onClick={() => navigate('/login')}
          >
            <Lock className="w-4 h-4 text-emerald-500 mr-2" /> Quick Receptionist Login
          </Button>
        </motion.div>
      </section>

      {/* MARQUEE OTAS LOGOS */}
      <section className="py-12 border-y border-[var(--border)] bg-[var(--muted)]/50 text-center">
        <p className="text-xs uppercase tracking-widest font-semibold text-[var(--muted-foreground)] mb-6">
          Seamlessly Syncing Bookings &amp; OTAs Across 2,400+ Independent Hotels
        </p>
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-75 grayscale hover:grayscale-0 transition-all">
          <span className="text-lg font-bold text-[var(--muted-foreground)] tracking-wider">Booking.com</span>
          <span className="text-lg font-bold text-[var(--muted-foreground)] tracking-wider">Agoda</span>
          <span className="text-lg font-bold text-[var(--muted-foreground)] tracking-wider">MakeMyTrip</span>
          <span className="text-lg font-bold text-[var(--muted-foreground)] tracking-wider">Expedia Group</span>
          <span className="text-lg font-bold text-[var(--muted-foreground)] tracking-wider">Airbnb Pro</span>
          <span className="text-lg font-bold text-[var(--muted-foreground)] tracking-wider">TripAdvisor</span>
        </div>
      </section>

      {/* FEATURES GRID SECTION */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Engineered for Reception Efficiency</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
            Everything your front desk team needs to deliver 5-star service.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "30-Second Walk-in Check-in",
              desc: "Fast guest profiling with auto-suggest phone lookup, document ID upload, and immediate keycard encoding prompt."
            },
            {
              icon: Calendar,
              title: "Interactive Tape Chart",
              desc: "7-day scrollable grid grouped by floors. Click any empty cell to create a reservation with date & room prefilled."
            },
            {
              icon: Clock,
              title: "Live Housekeeping Sync",
              desc: "Real-time room status updates between front desk and cleaning staff (Clean, Dirty, In Progress, OOO)."
            },
            {
              icon: CreditCard,
              title: "Shift Cash Drawer & Audit",
              desc: "Track active receptionists, initial float, cash collected, card settlements, and UPI receipts with 1-click shift closure."
            },
            {
              icon: Search,
              title: "Universal Search (Ctrl + K)",
              desc: "Instant search across guest names, phone numbers, room numbers, and booking IDs from anywhere in the app."
            },
            {
              icon: ShieldCheck,
              title: "Automated GST & Folios",
              desc: "Built-in dual slab GST tax logic (0%, 12%, 18%) with printable itemized guest bill folios."
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              className="p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-all duration-300 text-left group shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] mb-6 group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)] transition-all">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">{item.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto border-t border-[var(--border)]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Transparent Pricing</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
            Simple plans for properties of any scale.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Boutique / Inn",
              price: "₹2,999",
              period: "/ month",
              desc: "Perfect for bed & breakfasts and small boutique hotels up to 15 rooms.",
              features: ["Up to 15 Rooms", "Front Desk Engine", "Housekeeping Sync", "PDF Folio Invoicing", "Standard Support"]
            },
            {
              name: "Growth Resort",
              price: "₹5,999",
              period: "/ month",
              popular: true,
              desc: "Designed for full-service hotels requiring shift audits & OTA integrations.",
              features: ["Up to 50 Rooms", "Visual Tape Chart Grid", "Shift Cash Drawer Audit", "Dual Slab GST Simulator", "Ctrl+K Fast Search", "24/7 Priority Support"]
            },
            {
              name: "Enterprise Grand",
              price: "Custom",
              period: "",
              desc: "Multi-property luxury hotel chains needing custom integrations & dedicated AM.",
              features: ["Unlimited Rooms & Floors", "Multi-Property Switcher", "Custom Role Permissions Matrix", "API & Webhook Access", "Dedicated Account Manager"]
            }
          ].map((plan, idx) => (
            <div
              key={idx}
              className={`relative p-8 rounded-2xl border text-left flex flex-col justify-between ${
                plan.popular
                  ? 'bg-[var(--card)] border-[var(--primary)] shadow-2xl shadow-[var(--primary)]/20'
                  : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/40'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold uppercase tracking-wider shadow-md">
                  Most Popular
                </span>
              )}
              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">{plan.name}</h3>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">{plan.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[var(--foreground)]">{plan.price}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{plan.period}</span>
                </div>

                <ul className="mt-8 space-y-3.5 text-xs text-[var(--muted-foreground)]">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className={`mt-10 w-full rounded-xl font-semibold ${
                  plan.popular
                    ? 'bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] shadow-lg'
                    : 'bg-[var(--secondary)] hover:bg-[var(--muted)] text-[var(--secondary-foreground)]'
                }`}
                onClick={() => navigate('/app/dashboard')}
              >
                Start 30-Day Free Trial
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section id="testimonials" className="py-20 px-6 max-w-7xl mx-auto border-t border-[var(--border)]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Loved by General Managers</span>
          <h2 className="mt-3 text-3xl font-extrabold text-[var(--foreground)]">Trusted by hospitality leaders across India &amp; Asia.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "Our front desk check-in time dropped from 4 minutes to under 30 seconds. The visual tape chart is an absolute game-changer for our reception team.",
              author: "Vikramaditya Roy",
              role: "General Manager, Grand Azure Suites",
              stars: 5
            },
            {
              quote: "The shift cash register audit eliminated all discrepancies during shift handovers. It's clean, fast, and effortless to use.",
              author: "Ananya Sharma",
              role: "Front Office Manager, Sea Breeze Resort",
              stars: 5
            },
            {
              quote: "Setting up bulk rooms and floor categories took less than 2 minutes. The dark mode theme is super sleek for late-night audits.",
              author: "Karan Johar",
              role: "Operations Director, Highland Inn",
              stars: 5
            }
          ].map((t, idx) => (
            <div key={idx} className="p-6 rounded-xl bg-[var(--card)] border border-[var(--border)] text-left">
              <div className="flex gap-1 mb-4 text-amber-400">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-[var(--muted-foreground)] italic mb-6">"{t.quote}"</p>
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">{t.author}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GIANT BLURRED DESKFLOW BRAND TYPOGRAPHY & CTA SECTION */}
      <section className="relative py-28 px-6 border-t border-[var(--border)] overflow-hidden text-center select-none bg-gradient-to-b from-transparent via-[var(--muted)]/40 to-[var(--background)]">
        {/* Giant Blurred Background Watermark Typography */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 dark:opacity-25 blur-[1px] transform scale-110">
          <span className="text-[14vw] font-black tracking-tighter leading-none">
            <span className="text-[var(--foreground)]">Desk</span>
            <span className="text-[var(--primary)]">Flow</span>
          </span>
        </div>

        {/* Ambient Bottom Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[var(--primary)]/15 blur-[140px] pointer-events-none" />

        {/* CTA Content */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-[var(--foreground)] leading-tight">
            Ready to elevate your hotel's <br />
            <span className="text-[var(--primary)]">front desk experience?</span>
          </h2>
          <p className="text-base md:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
            Join over 2,400+ boutique hotels, resorts, and luxury suites running on DeskFlow.
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-semibold text-base px-8 h-13 rounded-xl shadow-xl shadow-[var(--primary)]/30 gap-2"
              onClick={() => navigate('/app/dashboard')}
            >
              Explore Demo Platform <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-[var(--border)] text-center text-xs text-[var(--muted-foreground)] relative z-10 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[var(--primary)]" />
            <span className="font-bold text-[var(--foreground)]">Desk<span className="text-[var(--primary)] font-extrabold">Flow</span> — Hotel PMS Platform</span>
          </div>
          <p>© 2026 DeskFlow Technologies. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[var(--foreground)]">Privacy Policy</a>
            <a href="#" className="hover:text-[var(--foreground)]">Terms of Service</a>
            <a href="#" className="hover:text-[var(--foreground)]">Support &amp; Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
