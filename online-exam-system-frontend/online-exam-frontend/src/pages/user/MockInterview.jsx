import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { generateInterview, evaluateInterview } from '../../services/interviewService';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const MODES = [
  { id: 'interview', icon: '🤖', label: 'AI Job Interview', desc: 'Job role based mock interview with HR + Technical questions' },
  { id: 'technical', icon: '⚡', label: 'Technical Topics', desc: 'Pick a CS/programming topic and practice focused questions' },
  { id: 'aptitude',  icon: '🧮', label: 'Aptitude Practice', desc: 'Quantitative, logical reasoning, verbal ability questions' },
];

const TECHNICAL_TOPICS = [
  { id: 'Data Structures & Algorithms', icon: '🌳', tags: ['Arrays', 'Trees', 'Graphs', 'DP'] },
  { id: 'Object Oriented Programming',  icon: '🧱', tags: ['Classes', 'Inheritance', 'Polymorphism'] },
  { id: 'Database Management (DBMS)',    icon: '🗄️', tags: ['SQL', 'Normalization', 'Transactions'] },
  { id: 'Operating Systems',            icon: '💻', tags: ['Processes', 'Memory', 'Scheduling'] },
  { id: 'Computer Networks',            icon: '🌐', tags: ['TCP/IP', 'HTTP', 'DNS', 'OSI'] },
  { id: 'System Design',                icon: '🏗️', tags: ['Scalability', 'Load Balancing', 'Caching'] },
  { id: 'Java Programming',             icon: '☕', tags: ['JVM', 'Collections', 'Multithreading'] },
  { id: 'Python Programming',           icon: '🐍', tags: ['OOP', 'Libraries', 'Decorators'] },
  { id: 'JavaScript & Web',             icon: '🌍', tags: ['DOM', 'Async', 'React', 'Node'] },
  { id: 'Machine Learning',             icon: '🤖', tags: ['Regression', 'CNN', 'NLP', 'sklearn'] },
  { id: 'Cloud Computing',              icon: '☁️', tags: ['AWS', 'Azure', 'Docker', 'K8s'] },
  { id: 'Cybersecurity',                icon: '🔐', tags: ['Encryption', 'Auth', 'OWASP'] },
  { id: 'Software Engineering',         icon: '⚙️', tags: ['SDLC', 'Agile', 'Design Patterns'] },
  { id: 'Data Science & Analytics',     icon: '📊', tags: ['Statistics', 'Pandas', 'Visualization'] },
];

const APTITUDE_TOPICS = [
  { id: 'Quantitative Aptitude',        icon: '🔢', tags: ['Percentages', 'Ratio', 'Time & Work', 'Profit & Loss'] },
  { id: 'Logical Reasoning',            icon: '🧩', tags: ['Syllogisms', 'Puzzles', 'Series', 'Coding-Decoding'] },
  { id: 'Verbal Ability',               icon: '📖', tags: ['Synonyms', 'Antonyms', 'Grammar', 'Reading Comp'] },
  { id: 'Data Interpretation',          icon: '📈', tags: ['Bar Chart', 'Pie Chart', 'Tables', 'Line Graph'] },
  { id: 'Number System',                icon: '🔣', tags: ['HCF/LCM', 'Prime', 'Fractions', 'Decimals'] },
  { id: 'Time, Speed & Distance',       icon: '🚀', tags: ['Trains', 'Boats', 'Average Speed'] },
  { id: 'Geometry & Mensuration',       icon: '📐', tags: ['Area', 'Volume', 'Triangles', 'Circles'] },
  { id: 'Probability & Statistics',     icon: '🎲', tags: ['Permutation', 'Combination', 'Mean', 'Median'] },
];

const JOB_ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Analyst', 'Data Scientist',
  'Machine Learning Engineer', 'DevOps Engineer', 'Product Manager',
  'UI/UX Designer', 'Business Analyst', 'Marketing Manager',
  'HR Manager', 'Cybersecurity Analyst', 'Cloud Architect',
];

/* ─────────────────────────────────────────────
   PILL BUTTON
───────────────────────────────────────────── */
function Pill({ label, selected, onClick, color = '#7c3aed' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '7px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '600',
        border: `2px solid ${selected ? color : '#e2e8f0'}`,
        background: selected ? color : '#f8fafc',
        color: selected ? '#fff' : '#64748b',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   TOPIC CARD
───────────────────────────────────────────── */
function TopicCard({ topic, selected, onSelect, color }) {
  return (
    <div
      onClick={onSelect}
      style={{
        border: `2px solid ${selected ? color : '#e2e8f0'}`,
        borderRadius: '14px', padding: '16px', cursor: 'pointer',
        background: selected ? `${color}10` : '#fff',
        transition: 'all 0.15s',
        boxShadow: selected ? `0 0 0 3px ${color}25` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <span style={{ fontSize: '22px' }}>{topic.icon}</span>
        <span style={{ fontWeight: '700', color: selected ? color : '#1e1b4b', fontSize: '14px' }}>{topic.id}</span>
        {selected && <span style={{ marginLeft: 'auto', color, fontSize: '16px' }}>✓</span>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {topic.tags.map(t => (
          <span key={t} style={{ fontSize: '11px', background: selected ? `${color}15` : '#f1f5f9', color: selected ? color : '#64748b', borderRadius: '4px', padding: '2px 8px', fontWeight: '500' }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SEARCH BAR
───────────────────────────────────────────── */
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8' }}>🔍</span>
      <input
        className="form-input"
        style={{ paddingLeft: '42px', fontSize: '15px' }}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function MockInterview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]               = useState('mode');    // mode | setup | interview | submitting
  const [mode, setMode]               = useState(null);      // 'interview' | 'technical' | 'aptitude'

  // setup
  const [selectedTopic, setSelectedTopic] = useState('');
  const [jobRole, setJobRole]             = useState('');
  const [customRole, setCustomRole]       = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [searchQuery, setSearchQuery]     = useState('');
  const [generating, setGenerating]       = useState(false);
  const [setupError, setSetupError]       = useState('');

  // interview
  const [sessionId, setSessionId]   = useState(null);
  const [questions, setQuestions]   = useState([]);
  const [answers, setAnswers]       = useState([]);
  const [currentQ, setCurrentQ]     = useState(0);

  /* ── derived ── */
  const finalTopic =
    mode === 'interview'
      ? (jobRole === '__custom__' ? customRole.trim() : jobRole)
      : selectedTopic;

  const topicList = mode === 'technical' ? TECHNICAL_TOPICS : APTITUDE_TOPICS;
  const filteredTopics = topicList.filter(t =>
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const modeColor = mode === 'aptitude' ? '#0284c7' : mode === 'technical' ? '#7c3aed' : '#db2777';
  const modePromptPrefix =
    mode === 'technical'
      ? `technical interview questions specifically about the topic: `
      : mode === 'aptitude'
      ? `aptitude/competitive exam practice questions on the topic: `
      : `job interview questions for a `;

  /* ── generate ── */
  const handleGenerate = async () => {
    if (!finalTopic) { setSetupError('Please select a topic.'); return; }
    setSetupError(''); setGenerating(true);
    try {
      // Pass mode info via jobRole so backend prompt is accurate
      const promptRole = mode === 'interview'
        ? finalTopic
        : `[${mode === 'technical' ? 'TECHNICAL' : 'APTITUDE'}] ${finalTopic}`;
      const data = await generateInterview(promptRole, questionCount, user?.userId);
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(''));
      setCurrentQ(0);
      setStep('interview');
    } catch (err) {
      setSetupError(err.response?.data?.message || 'Failed to generate questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    setStep('submitting');
    try {
      const payload = questions.map((q, i) => ({
        question: q.question,
        answer: answers[i] || '',
        category: q.category,
      }));
      const result = await evaluateInterview(sessionId, user?.userId, finalTopic, payload);
      navigate('/user/interview/result', { state: { result, jobRole: finalTopic, mode } });
    } catch (err) {
      setStep('interview');
      alert(err.response?.data?.message || 'Evaluation failed. Please try again.');
    }
  };

  const answeredCount = answers.filter(a => a.trim().length > 0).length;
  const q = questions[currentQ];

  /* ────────────────────────────────────────
     TOP BAR (common)
  ──────────────────────────────────────── */
  const TopBar = () => (
    <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#4c1d95)', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{ color: '#fff', fontWeight: '800', fontSize: '18px' }}>
        🤖 <span style={{ color: '#a78bfa' }}>AI</span> Practice Coach
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {step !== 'mode' && (
          <button
            className="btn btn-ghost"
            style={{ color: '#c4b5fd', borderColor: 'rgba(255,255,255,0.2)', padding: '7px 14px', fontSize: '13px' }}
            onClick={() => { setStep('mode'); setMode(null); setSelectedTopic(''); setJobRole(''); setSearchQuery(''); }}
          >
            ← Change Mode
          </button>
        )}
        <button className="btn btn-ghost" style={{ color: '#c4b5fd', borderColor: 'rgba(255,255,255,0.2)', padding: '7px 14px', fontSize: '13px' }} onClick={() => navigate('/user/dashboard')}>
          🏠 Dashboard
        </button>
      </div>
    </div>
  );

  /* ════════════════════════════════════════
     STEP: MODE SELECTION
  ════════════════════════════════════════ */
  if (step === 'mode') return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <TopBar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px' }}>
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎯</div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1e1b4b', margin: '0 0 8px' }}>What do you want to practice?</h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Choose a mode to get started with AI-powered practice.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
          {MODES.map(m => (
            <div
              key={m.id}
              className="card"
              onClick={() => { setMode(m.id); setStep('setup'); }}
              style={{ cursor: 'pointer', textAlign: 'center', padding: '36px 24px', transition: 'all 0.2s', border: '2px solid transparent' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(124,58,237,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ fontSize: '44px', marginBottom: '16px' }}>{m.icon}</div>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '800', color: '#1e1b4b' }}>{m.label}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>{m.desc}</p>
              <div style={{ marginTop: '20px' }}>
                <span style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', fontWeight: '700' }}>
                  Start →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════
     STEP: SETUP
  ════════════════════════════════════════ */
  if (step === 'setup') return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <TopBar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }} className="fade-in">

        {/* Mode header */}
        <div style={{ background: `linear-gradient(135deg,${modeColor},#1e1b4b)`, borderRadius: '16px', padding: '24px 28px', marginBottom: '24px', color: '#fff', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '40px' }}>{MODES.find(m => m.id === mode)?.icon}</div>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800' }}>{MODES.find(m => m.id === mode)?.label}</h2>
            <p style={{ margin: 0, opacity: 0.85, fontSize: '14px' }}>{MODES.find(m => m.id === mode)?.desc}</p>
          </div>
        </div>

        {setupError && <div className="alert alert-error">{setupError}</div>}

        <div className="card">
          {/* ── Job Interview mode ── */}
          {mode === 'interview' && (
            <>
              <h3 style={{ margin: '0 0 16px', fontWeight: '700', color: '#1e1b4b' }}>Select Job Role</h3>
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search job roles... e.g. Data Scientist, DevOps" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {JOB_ROLES.filter(r => r.toLowerCase().includes(searchQuery.toLowerCase())).map(role => (
                  <Pill key={role} label={role} selected={jobRole === role} onClick={() => setJobRole(role)} color="#db2777" />
                ))}
                <Pill label="✏️ Custom Role" selected={jobRole === '__custom__'} onClick={() => setJobRole('__custom__')} color="#db2777" />
              </div>
              {jobRole === '__custom__' && (
                <input className="form-input" style={{ marginBottom: '16px' }} placeholder="e.g. Blockchain Developer, Game Designer..." value={customRole} onChange={e => setCustomRole(e.target.value)} autoFocus />
              )}
              {finalTopic && (
                <div className="alert alert-info">
                  💼 Role: <strong>{finalTopic}</strong> — AI will generate HR + Technical + Situational questions.
                </div>
              )}
            </>
          )}

          {/* ── Technical Topics mode ── */}
          {mode === 'technical' && (
            <>
              <h3 style={{ margin: '0 0 16px', fontWeight: '700', color: '#1e1b4b' }}>Select Technical Topic</h3>
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search topics... e.g. Java, System Design, DBMS" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '12px', marginBottom: '16px' }}>
                {filteredTopics.map(topic => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    selected={selectedTopic === topic.id}
                    onSelect={() => setSelectedTopic(topic.id)}
                    color="#7c3aed"
                  />
                ))}
              </div>
              {filteredTopics.length === 0 && (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>No topics found. Try a different search.</p>
              )}
              {selectedTopic && (
                <div className="alert alert-info">
                  ⚡ Topic: <strong>{selectedTopic}</strong> — AI will generate focused technical questions on this subject.
                </div>
              )}
            </>
          )}

          {/* ── Aptitude mode ── */}
          {mode === 'aptitude' && (
            <>
              <h3 style={{ margin: '0 0 16px', fontWeight: '700', color: '#1e1b4b' }}>Select Aptitude Category</h3>
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search categories... e.g. Probability, Logical Reasoning" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '12px', marginBottom: '16px' }}>
                {filteredTopics.map(topic => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    selected={selectedTopic === topic.id}
                    onSelect={() => setSelectedTopic(topic.id)}
                    color="#0284c7"
                  />
                ))}
              </div>
              {filteredTopics.length === 0 && (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>No categories found.</p>
              )}
              {selectedTopic && (
                <div className="alert alert-info">
                  🧮 Category: <strong>{selectedTopic}</strong> — AI will generate aptitude practice questions.
                </div>
              )}
            </>
          )}

          {/* Question count */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: '8px' }}>
            <label className="form-label">Number of Questions</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {[3, 5, 7, 10].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQuestionCount(n)}
                  style={{
                    padding: '10px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: '700',
                    border: `2px solid ${questionCount === n ? modeColor : '#e2e8f0'}`,
                    background: questionCount === n ? modeColor : '#f8fafc',
                    color: questionCount === n ? '#fff' : '#64748b',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              className="btn"
              style={{ width: '100%', padding: '14px', fontSize: '16px', background: `linear-gradient(135deg,${modeColor},#4f46e5)`, color: '#fff', opacity: (!finalTopic || generating) ? 0.6 : 1 }}
              onClick={handleGenerate}
              disabled={!finalTopic || generating}
            >
              {generating ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }} />
                  Generating {questionCount} questions with AI...
                </span>
              ) : `🚀 Generate ${questionCount} Questions`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════
     STEP: INTERVIEW
  ════════════════════════════════════════ */
  if (step === 'interview' && q) return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <TopBar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 220px', gap: '20px', alignItems: 'start' }}>

        <div>
          {/* Progress bar */}
          <div className="card" style={{ marginBottom: '16px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontWeight: '700', color: '#1e1b4b' }}>
                {MODES.find(m => m.id === mode)?.icon} {finalTopic}
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{answeredCount}/{questions.length} answered</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, background: `linear-gradient(90deg,${modeColor},#4f46e5)` }} />
            </div>
          </div>

          {/* Question */}
          <div className="interview-card fade-in" key={currentQ} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span className={`badge ${q.category === 'Technical' ? 'badge-blue' : q.category === 'Behavioral' ? 'badge-green' : q.category === 'Aptitude' ? 'badge-purple' : 'badge-purple'}`}>
                {q.category}
              </span>
              <span className={`badge ${q.type === 'mcq' ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: '11px' }}>
                {q.type === 'mcq' ? '🔘 MCQ' : '✏️ Written'}
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Question {currentQ + 1} of {questions.length}
              </span>
            </div>

            <h3 style={{ margin: '0 0 20px', fontSize: '18px', color: '#1e1b4b', lineHeight: '1.65', fontWeight: '600' }}>
              {q.question}
            </h3>

            {/* MCQ options */}
            {q.type === 'mcq' && q.options && q.options.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {q.options.map((opt, oi) => {
                  const selected = answers[currentQ] === opt;
                  return (
                    <label
                      key={oi}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '13px 18px', borderRadius: '10px', cursor: 'pointer',
                        border: `2px solid ${selected ? modeColor : '#e2e8f0'}`,
                        background: selected ? `${modeColor}15` : '#f8fafc',
                        transition: 'all 0.15s',
                        color: selected ? modeColor : '#334155',
                        fontWeight: selected ? '700' : '400',
                      }}
                    >
                      <input
                        type="radio"
                        name={`q${currentQ}`}
                        value={opt}
                        checked={selected}
                        onChange={() => { const u = [...answers]; u[currentQ] = opt; setAnswers(u); }}
                        style={{ accentColor: modeColor, width: '18px', height: '18px', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: '15px' }}>{opt}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              /* Text answer */
              <>
                <label className="form-label">Your Answer</label>
                <textarea
                  style={{ width: '100%', minHeight: '150px', padding: '13px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', lineHeight: '1.7', resize: 'vertical', background: '#f8fafc', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                  placeholder={mode === 'aptitude' ? 'Write your solution with explanation...' : mode === 'technical' ? 'Explain with examples, code snippets, or theory...' : 'Give a structured answer with real examples...'}
                  value={answers[currentQ] || ''}
                  onChange={e => { const u = [...answers]; u[currentQ] = e.target.value; setAnswers(u); }}
                  onFocus={e => { e.target.style.borderColor = modeColor; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                />
                <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
                  {answers[currentQ]?.length || 0} chars
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setCurrentQ(c => Math.max(0, c - 1))} disabled={currentQ === 0}>
              ← Prev
            </button>
            {currentQ < questions.length - 1 ? (
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setCurrentQ(c => c + 1)}>
                Next →
              </button>
            ) : (
              <button
                className="btn"
                style={{ flex: 2, background: `linear-gradient(135deg,${modeColor},#4f46e5)`, color: '#fff', fontSize: '15px' }}
                onClick={handleSubmit}
              >
                🤖 Submit & Get AI Feedback
              </button>
            )}
          </div>
        </div>

        {/* Navigator sidebar */}
        <div className="card" style={{ position: 'sticky', top: '76px', padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Navigator
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', marginBottom: '14px' }}>
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                style={{
                  height: '32px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                  background: i === currentQ ? modeColor : answers[i]?.trim() ? '#10b981' : '#f1f5f9',
                  color: i === currentQ || answers[i]?.trim() ? '#fff' : '#64748b',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', color: '#94a3b8', marginBottom: '14px' }}>
            {[[modeColor, 'Current'], ['#10b981', 'Answered'], ['#f1f5f9', 'Pending']].map(([bg, lbl]) => (
              <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: bg, border: bg === '#f1f5f9' ? '1px solid #e2e8f0' : 'none' }} />
                {lbl}
              </div>
            ))}
          </div>
          {answeredCount === questions.length && (
            <button
              className="btn"
              style={{ width: '100%', background: `linear-gradient(135deg,${modeColor},#4f46e5)`, color: '#fff', padding: '10px', fontSize: '13px' }}
              onClick={handleSubmit}
            >
              Submit All →
            </button>
          )}
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════
     STEP: SUBMITTING
  ════════════════════════════════════════ */
  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <TopBar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)' }}>
        <div className="interview-card fade-in" style={{ textAlign: 'center', maxWidth: '480px', width: '100%' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🤖</div>
          <h2 style={{ margin: '0 0 10px', color: '#1e1b4b' }}>AI is evaluating your answers...</h2>
          <p style={{ color: '#64748b', marginBottom: '28px', lineHeight: '1.7' }}>
            Gemini AI is scoring each answer 0–10 and generating personalized feedback. This takes 10–20 seconds.
          </p>
          <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '5px', margin: '0 auto 24px' }} />
          {['Analyzing your answers...', 'Comparing with ideal responses...', 'Generating detailed feedback...'].map((msg, i) => (
            <div key={i} style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '6px' }}>
              <span style={{ color: modeColor }}>✓</span> {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
