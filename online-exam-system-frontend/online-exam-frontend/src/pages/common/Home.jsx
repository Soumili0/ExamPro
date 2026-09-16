import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ─── tiny scroll-reveal hook ─── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const NAV_LINKS = ['Features', 'How It Works', 'Preview', 'About'];

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Mock Interviews',
    desc: 'Practice realistic interviews tailored to your target role. AI scores every answer and gives actionable feedback.',
    tags: ['Java', 'Python', 'React', 'HR', 'Data Science'],
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)',
  },
  {
    icon: '📝',
    title: 'Smart Mock Exams',
    desc: 'Take timed MCQ exams with a real exam-like experience. Auto-submit, question navigator, and instant results.',
    tags: ['Aptitude', 'Coding', 'CS Fundamentals'],
    color: '#0284c7',
    bg: 'rgba(2,132,199,0.08)',
  },
  {
    icon: '📊',
    title: 'Performance Analytics',
    desc: 'Understand your strengths, weaknesses and improvement areas with visual breakdowns.',
    tags: ['Score', 'Accuracy', 'Progress'],
    color: '#059669',
    bg: 'rgba(5,150,105,0.08)',
  },
  {
    icon: '💡',
    title: 'AI-Powered Feedback',
    desc: 'Get detailed explanations, ideal answers, and personalized improvement tips after every attempt.',
    tags: ['Instant', 'Detailed', 'Actionable'],
    color: '#db2777',
    bg: 'rgba(219,39,119,0.08)',
  },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '🎯', title: 'Choose', desc: 'Select your target role or subject — Software Engineer, Data Analyst, Aptitude, and more.' },
  { step: '02', icon: '💬', title: 'Practice', desc: 'Answer AI-generated questions in a real interview or exam environment with a live timer.' },
  { step: '03', icon: '📈', title: 'Improve', desc: 'Receive scores, AI feedback, ideal answers, and track your progress over time.' },
];

const STATS = [
  { value: '15+', label: 'Job Roles Supported' },
  { value: 'AI', label: 'Gemini Powered' },
  { value: '10/10', label: 'Scoring System' },
  { value: '∞', label: 'Practice Sessions' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goTo = (id) => {
    setMobileMenu(false);
    // map display names to actual section ids
    const idMap = {
      'features': 'features',
      'how it works': 'how-it-works',
      'preview': 'preview',
      'about': 'about',
    };
    const sectionId = idMap[id.toLowerCase()] || id.toLowerCase().replace(/\s+/g, '-');
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#060818', color: '#fff', overflowX: 'hidden' }}>

      {/* ══ STYLES ══ */}
      <style>{`
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .revealed { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }
        .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); }
        .glass-hover:hover { background: rgba(255,255,255,0.07); border-color: rgba(167,139,250,0.3); transform: translateY(-4px); box-shadow: 0 16px 40px rgba(124,58,237,0.15); }
        .glow { box-shadow: 0 0 40px rgba(124,58,237,0.35); }
        .tag { display:inline-flex; align-items:center; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:600; background:rgba(255,255,255,0.08); color:#c4b5fd; border:1px solid rgba(255,255,255,0.1); }
        .nav-link { background:none; border:none; color:#94a3b8; font-size:14px; font-weight:500; cursor:pointer; padding:6px 12px; border-radius:8px; transition:color 0.2s; }
        .nav-link:hover { color:#fff; }
        .step-line { flex:1; height:1px; background:linear-gradient(90deg,rgba(124,58,237,0.6),rgba(219,39,119,0.6)); }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .float { animation: float 4s ease-in-out infinite; }
        @keyframes pulse-glow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        .pulse { animation: pulse-glow 2.5s ease-in-out infinite; }
        .mockup-window { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:16px; overflow:hidden; }
        .mockup-bar { background:rgba(255,255,255,0.06); padding:10px 16px; display:flex; align-items:center; gap:8px; }
        .dot { width:10px; height:10px; border-radius:50%; }
        .score-bar-fill { height:100%; border-radius:999px; transition:width 1.2s ease; }
      `}</style>

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(6,8,24,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 40px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontWeight: '900', fontSize: '20px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          🎓 <span style={{ color: '#a78bfa' }}>Exam</span>Pro
        </div>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {NAV_LINKS.map(l => (
            <button key={l} className="nav-link" onClick={() => goTo(l.toLowerCase().replace(' ', '-'))}>{l}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {user ? (
            <button
              onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard')}
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 20px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
            >
              Dashboard →
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="nav-link" style={{ color: '#e2e8f0' }}>
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 20px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Get Started →
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section id="features" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '100px 40px 60px', position: 'relative', overflow: 'hidden' }}>

        {/* Background glow blobs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(219,39,119,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>

          {/* Left */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: '999px', padding: '6px 16px', fontSize: '12px', fontWeight: '700', color: '#c4b5fd', marginBottom: '28px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span className="pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
              AI-Powered Exam & Interview Platform
            </div>

            <h1 style={{ fontSize: '58px', fontWeight: '900', lineHeight: '1.1', margin: '0 0 24px' }}>
              Ace Your Exams &{' '}
              <span style={{ background: 'linear-gradient(90deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Interviews
              </span>
            </h1>

            <p style={{ fontSize: '18px', color: '#94a3b8', lineHeight: '1.8', margin: '0 0 36px', maxWidth: '480px' }}>
              Prepare smarter with AI-powered mock interviews, timed exams, and personalized performance insights — all in one platform.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}>
              <button
                onClick={() => navigate(user ? (user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard') : '/register')}
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px 28px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', transition: 'transform 0.15s,box-shadow 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(124,58,237,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                Start Practicing Free →
              </button>
              <button
                onClick={() => { const el = document.getElementById('how-it-works'); if(el) el.scrollIntoView({behavior:'smooth'}); }}
                style={{ background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '14px 28px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >
                ▶ How It Works
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {['✓ AI Generated Questions', '✓ Instant Feedback', '✓ Timed Exams', '✓ Performance Analytics'].map(t => (
                <span key={t} style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Right — Dashboard mockup */}
          <div className="float" style={{ position: 'relative' }}>
            <div className="mockup-window glow" style={{ maxWidth: '420px', margin: '0 auto' }}>
              <div className="mockup-bar">
                <div className="dot" style={{ background: '#ef4444' }} />
                <div className="dot" style={{ background: '#f59e0b' }} />
                <div className="dot" style={{ background: '#10b981' }} />
                <span style={{ marginLeft: '8px', fontSize: '12px', color: '#64748b' }}>ExamPro Dashboard</span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>Good morning, Soumili 👋</div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Overall Score</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#a78bfa' }}>84%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div className="score-bar-fill" style={{ width: '84%', background: 'linear-gradient(90deg,#7c3aed,#a78bfa)' }} />
                  </div>
                </div>

                {[['🤖 AI Interview', '86%', '#a78bfa'], ['📝 Aptitude', '92%', '#34d399'], ['⚡ Technical', '78%', '#60a5fa']].map(([label, val, color]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8', width: '120px' }}>{label}</span>
                    <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div className="score-bar-fill" style={{ width: val, background: color }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color, minWidth: '36px', textAlign: 'right' }}>{val}</span>
                  </div>
                ))}

                <div style={{ marginTop: '18px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#a78bfa', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>AI Feedback Ready</div>
                    <div style={{ fontSize: '12px', color: '#e2e8f0' }}>Software Engineer Mock</div>
                  </div>
                  <span style={{ fontSize: '18px' }}>✨</span>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div style={{ position: 'absolute', top: '-16px', right: '-16px', background: 'linear-gradient(135deg,#7c3aed,#db2777)', borderRadius: '12px', padding: '10px 16px', fontSize: '12px', fontWeight: '700', color: '#fff', boxShadow: '0 8px 24px rgba(124,58,237,0.5)' }}>
              🤖 AI Powered
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS STRIP ══ */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', padding: '28px 40px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', textAlign: 'center' }}>
          {STATS.map(s => (
            <div key={s.label} className="reveal">
              <div style={{ fontSize: '28px', fontWeight: '900', background: 'linear-gradient(135deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ FEATURES ══ */}
      <section id="features" style={{ padding: '96px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }} className="reveal">
            <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '999px', padding: '5px 16px', fontSize: '12px', fontWeight: '700', color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
              Features
            </div>
            <h2 style={{ fontSize: '40px', fontWeight: '900', margin: '0 0 14px' }}>Everything you need to succeed</h2>
            <p style={{ color: '#64748b', fontSize: '17px', maxWidth: '540px', margin: '0 auto' }}>
              One platform for exam prep, AI mock interviews, and performance tracking.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`glass glass-hover reveal reveal-delay-${i + 1}`}
                style={{ borderRadius: '20px', padding: '28px', transition: 'all 0.3s ease', cursor: 'default' }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: f.bg, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '18px' }}>
                  {f.icon}
                </div>
                <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>{f.title}</h3>
                <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#64748b', lineHeight: '1.7' }}>{f.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {f.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" style={{ padding: '0 40px 96px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }} className="reveal">
            <div style={{ display: 'inline-block', background: 'rgba(219,39,119,0.12)', border: '1px solid rgba(219,39,119,0.25)', borderRadius: '999px', padding: '5px 16px', fontSize: '12px', fontWeight: '700', color: '#f9a8d4', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
              How It Works
            </div>
            <h2 style={{ fontSize: '40px', fontWeight: '900', margin: '0 0 14px' }}>Three steps to interview-ready</h2>
            <p style={{ color: '#64748b', fontSize: '17px' }}>Simple, fast, effective.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0', alignItems: 'center' }}>
            {HOW_IT_WORKS.map((s, i) => (
              <Fragment key={s.step}>
                <div className={`reveal reveal-delay-${i + 1}`} style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(219,39,119,0.2))', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 16px' }}>
                    {s.icon}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Step {s.step}</div>
                  <h3 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: '800' }}>{s.title}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.7' }}>{s.desc}</p>
                </div>
                {i < 2 && (
                  <div key={`arrow-${i}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#7c3aed', opacity: 0.5 }}>→</div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MOCK INTERVIEW PREVIEW ══ */}
      <section id="preview" style={{ padding: '0 40px 96px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }} className="reveal">
            <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '999px', padding: '5px 16px', fontSize: '12px', fontWeight: '700', color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
              Product Preview
            </div>
            <h2 style={{ fontSize: '40px', fontWeight: '900', margin: '0 0 14px' }}>See it in action</h2>
            <p style={{ color: '#64748b', fontSize: '17px' }}>This is exactly what your practice session looks like.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

            {/* Interview mockup */}
            <div className="mockup-window reveal" style={{ borderColor: 'rgba(124,58,237,0.3)' }}>
              <div className="mockup-bar" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div className="dot" style={{ background: '#ef4444' }} />
                  <div className="dot" style={{ background: '#f59e0b' }} />
                  <div className="dot" style={{ background: '#10b981' }} />
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>🤖 AI Mock Interview</span>
                <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '700' }}>Q 3/10</span>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ background: 'rgba(2,132,199,0.15)', color: '#38bdf8', borderRadius: '999px', padding: '4px 12px', fontSize: '11px', fontWeight: '700' }}>Technical</span>
                  <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '6px 14px', fontSize: '15px', fontWeight: '800', color: '#fca5a5' }}>⏱ 01:42</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '18px', marginBottom: '20px', borderLeft: '3px solid #7c3aed' }}>
                  <p style={{ margin: 0, fontSize: '15px', color: '#e2e8f0', lineHeight: '1.7' }}>
                    "Explain the difference between <strong style={{ color: '#a78bfa' }}>ArrayList</strong> and <strong style={{ color: '#a78bfa' }}>LinkedList</strong> in Java. When would you use each?"
                  </p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px', marginBottom: '16px', minHeight: '70px' }}>
                  <span style={{ fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>ArrayList uses dynamic array, better for random access... LinkedList uses doubly linked nodes, better for frequent insertions...</span>
                </div>
                <button style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                  Submit Answer →
                </button>
              </div>
            </div>

            {/* Feedback mockup */}
            <div className="reveal reveal-delay-2">
              <div className="mockup-window" style={{ borderColor: 'rgba(16,185,129,0.3)', marginBottom: '16px' }}>
                <div className="mockup-bar">
                  <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '700' }}>✨ AI Feedback</span>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Question Score</span>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#34d399' }}>8<span style={{ fontSize: '16px', color: '#64748b' }}>/10</span></div>
                  </div>
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.7' }}>
                      Great answer! You correctly identified the core differences. Consider mentioning <span style={{ color: '#34d399' }}>O(1) vs O(n) access time</span> for a perfect score.
                    </p>
                  </div>
                  <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Ideal Answer</div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>ArrayList provides O(1) random access via index. LinkedList offers O(1) insertions/deletions at known positions. Use ArrayList for read-heavy, LinkedList for write-heavy scenarios.</p>
                </div>
              </div>

              {/* Overall result teaser */}
              <div className="mockup-window" style={{ borderColor: 'rgba(124,58,237,0.3)' }}>
                <div style={{ padding: '20px' }}>
                  <div style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Overall Performance</div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>8.4</span>
                      <span style={{ fontSize: '9px', color: '#c4b5fd' }}>/10</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: '#e2e8f0', marginBottom: '4px' }}>Good Performance 🌟</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>You answered 9/10 questions with strong technical knowledge.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section style={{ padding: '0 40px 96px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }} className="reveal">
          <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(219,39,119,0.15))', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '28px', padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '300px', height: '300px', background: 'radial-gradient(circle,rgba(124,58,237,0.2),transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '300px', height: '300px', background: 'radial-gradient(circle,rgba(219,39,119,0.15),transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: '52px', marginBottom: '20px' }}>🚀</div>
              <h2 style={{ fontSize: '38px', fontWeight: '900', margin: '0 0 16px' }}>
                Ready to become interview-ready?
              </h2>
              <p style={{ fontSize: '17px', color: '#94a3b8', margin: '0 0 36px', lineHeight: '1.7' }}>
                Practice smarter. Learn faster. Perform better.<br />
                Join thousands of students preparing with AI.
              </p>
              <button
                onClick={() => navigate(user ? '/user/interview' : '/register')}
                style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: '#fff', border: 'none', borderRadius: '14px', padding: '16px 40px', fontSize: '17px', fontWeight: '800', cursor: 'pointer', transition: 'transform 0.15s,box-shadow 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                Start Practicing Free →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer id="about" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 40px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '48px', marginBottom: '40px' }}>
            <div>
              <div style={{ fontWeight: '900', fontSize: '20px', marginBottom: '12px' }}>
                🎓 <span style={{ color: '#a78bfa' }}>Exam</span>Pro
              </div>
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.8', maxWidth: '280px', margin: 0 }}>
                AI-powered preparation for exams & interviews. Practice smarter, perform better.
              </p>
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Platform</div>
              {['Mock Interviews', 'Mock Exams', 'Analytics', 'AI Feedback'].map(l => (
                <div key={l} style={{ color: '#475569', fontSize: '14px', marginBottom: '10px', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                  {l}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Company</div>
              {['About', 'Contact', 'Privacy', 'Terms'].map(l => (
                <div key={l} style={{ color: '#475569', fontSize: '14px', marginBottom: '10px', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                  {l}
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ color: '#334155', fontSize: '13px' }}>© 2026 ExamPro. All rights reserved.</span>
            <span style={{ color: '#334155', fontSize: '13px' }}>Built with Spring Boot & React · Powered by Groq AI · Made by <strong style={{ color: '#a78bfa' }}>Soumili Samanta</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
