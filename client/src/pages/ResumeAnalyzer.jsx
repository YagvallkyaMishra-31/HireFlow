import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PROCESSING_MESSAGES = [
    "Scanning resume structure...",
    "Extracting skills and keywords...",
    "Comparing with ATS patterns...",
    "Calculating optimization score..."
];

const ResumeAnalyzer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const incomingJob = location.state || {};

    const [file, setFile] = useState(null);
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState(incomingJob.jobDescription || '');
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);
    const [results, setResults] = useState(null);
    const [showJD, setShowJD] = useState(!!incomingJob.jobDescription);
    const [fadeState, setFadeState] = useState('in'); // 'in', 'out'

    // Update state if incomingJob changes
    useEffect(() => {
        if (incomingJob.jobDescription) {
            setJobDescription(incomingJob.jobDescription);
            setShowJD(true);
        }
    }, [incomingJob.jobDescription]);

    // Simulated text extraction when a file is "uploaded"
    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResumeText(`Extracted content from ${selectedFile.name}. This is a simulated resume text for a Software Engineer with React and Node experience.`);
        }
    };

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            setResumeText(`Extracted content from ${droppedFile.name}. Simulated high-quality candidate data.`);
        }
    }, []);

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const handleAnalyze = () => {
        if (!resumeText && !file) {
            alert('Please upload a resume first.');
            return;
        }

        setFadeState('out');
        setTimeout(() => {
            setIsAnalyzing(true);
            setResults(null);
            setProcessingStep(0);
            setFadeState('in');
        }, 300);
    };

    // Cycle through processing messages
    useEffect(() => {
        if (isAnalyzing) {
            const interval = setInterval(() => {
                setProcessingStep(prev => {
                    if (prev < PROCESSING_MESSAGES.length - 1) return prev + 1;
                    clearInterval(interval);

                    // Final move to results
                    setTimeout(() => {
                        setFadeState('out');
                        setTimeout(() => {
                            const analysis = performMockAnalysis(resumeText, jobDescription);
                            setResults(analysis);
                            setIsAnalyzing(false);
                            setFadeState('in');
                        }, 400);
                    }, 800);

                    return prev;
                });
            }, 800);
            return () => clearInterval(interval);
        }
    }, [isAnalyzing, resumeText, jobDescription]);

    const performMockAnalysis = (resume, jd) => {
        const resumeWords = (resume || "").toLowerCase().split(/\W+/);
        const jdWords = jd ? Array.from(new Set(jd.toLowerCase().split(/\W+/))).filter(w => w.length > 3) : [];

        const keywords = jdWords.length > 0 ? jdWords.filter(word => [
            'react', 'node', 'javascript', 'python', 'java', 'sql', 'aws', 'docker',
            'kubernets', 'agile', 'frontend', 'backend', 'fullstack', 'typescript',
            'api', 'rest', 'graphql', 'mongodb', 'ci/cd', 'testing', 'design', 'cloud'
        ].includes(word)) : ['react', 'javascript', 'frontend', 'api', 'testing'];

        const matchedKeywords = keywords.filter(word => resumeWords.includes(word));
        const missingKeywords = keywords.filter(word => !resumeWords.includes(word));

        const keywordScore = keywords.length > 0 ? (matchedKeywords.length / keywords.length) * 100 : 75;
        const lengthScore = 85;

        const atsScore = Math.round((keywordScore * 0.7) + (lengthScore * 0.3));
        const skillStrength = Math.round(keywordScore);
        const expStrength = Math.min(100, Math.round(atsScore * 1.05));

        const suggestions = [
            matchedKeywords.length < 3 ? 'Incorporate more technical stack keywords from the job description.' : null,
            'Quantify your achievements with metrics (e.g., "Increased performance by 20%").',
            missingKeywords.length > 0 ? `Consider adding terms like: ${missingKeywords.slice(0, 2).join(', ')}.` : null,
            'Ensure your resume follows a clean, single-column layout for better ATS readability.',
            'Move your most relevant skills to the top of the document.'
        ].filter(Boolean);

        return { atsScore, matchedKeywords, missingKeywords, skillStrength, expStrength, suggestions };
    };

    const getScoreColor = (score) => {
        if (score >= 75) return '#10b981';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="modern-analyzer">
            <div className={`analyzer-wrapper fade-${fadeState}`}>
                {/* Header Section */}
                <div className="header-section">
                    <div className="ai-badge">✨ AI POWERED</div>
                    <h1>Resume Analyzer</h1>
                    <p>Get instant ATS feedback and optimization tips in seconds.</p>
                </div>

                <div className="content-area">
                    {!isAnalyzing && !results && (
                        <div className="upload-container animate-slide-up">
                            <div
                                className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                            >
                                <input
                                    type="file"
                                    id="resume-upload"
                                    hidden
                                    onChange={handleFileSelect}
                                    accept=".pdf,.doc,.docx,.txt"
                                />
                                <label htmlFor="resume-upload">
                                    <div className="upload-icon">
                                        {file ? '📄' : '📤'}
                                    </div>
                                    {file ? (
                                        <div className="file-info">
                                            <span className="filename">{file.name}</span>
                                            <span className="filesize">{(file.size / 1024).toFixed(1)} KB</span>
                                            <button className="btn-change" onClick={(e) => { e.preventDefault(); setFile(null); }}>Change File</button>
                                        </div>
                                    ) : (
                                        <div className="upload-text">
                                            <strong>Click to upload</strong> or drag and drop
                                            <span>Supports PDF, DOCX, and TXT</span>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div className="jd-section">
                                <button
                                    className={`jd-toggle ${showJD ? 'active' : ''}`}
                                    onClick={() => setShowJD(!showJD)}
                                >
                                    {showJD ? '− Hide Job Description (Optional)' : '+ Add Job Description for better accuracy'}
                                </button>
                                {showJD && (
                                    <textarea
                                        className="jd-input animate-expand"
                                        placeholder="Paste the job description here..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                    />
                                )}
                            </div>

                            <button
                                className="btn-primary analyze-now"
                                onClick={handleAnalyze}
                            >
                                Start AI Analysis
                            </button>
                        </div>
                    )}

                    {/* Processing State Overlay */}
                    {isAnalyzing && (
                        <div className="processing-overlay">
                            <div className="processing-card">
                                <div className="loader-ring">
                                    <div className="inner-ring"></div>
                                </div>
                                <div className="message-container">
                                    <p className="current-message">{PROCESSING_MESSAGES[processingStep]}</p>
                                    <div className="step-dots">
                                        {PROCESSING_MESSAGES.map((_, i) => (
                                            <div key={i} className={`dot ${i === processingStep ? 'active' : ''} ${i < processingStep ? 'done' : ''}`} />
                                        ))}
                                    </div>
                                </div>
                                <div className="processing-progress-bar">
                                    <div className="progress-fill" style={{ width: `${((processingStep + 1) / PROCESSING_MESSAGES.length) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Screen */}
                    {results && !isAnalyzing && (
                        <div className="results-dashboard animate-fade-in">
                            <div className="results-top">
                                <div className="main-score-card">
                                    <div className="score-radial">
                                        <svg viewBox="0 0 36 36" className="circular-chart">
                                            <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <path
                                                className="circle"
                                                strokeDasharray={`${results.atsScore}, 100`}
                                                stroke={getScoreColor(results.atsScore)}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <text x="18" y="20.35" className="percentage" fill={getScoreColor(results.atsScore)}>{results.atsScore}</text>
                                        </svg>
                                    </div>
                                    <div className="score-info">
                                        <h3>ATS Optimization Score</h3>
                                        <p>
                                            {incomingJob.jobTitle ? (
                                                <>Match Analysis for: <strong>{incomingJob.jobTitle}</strong>. Your resume is {results.atsScore > 70 ? 'well-optimized' : 'moderately optimized'}.</>
                                            ) : (
                                                <>Your resume is {results.atsScore > 70 ? 'well-optimized' : 'moderately optimized'} for modern tracking systems.</>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="results-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    {incomingJob.jobId && (
                                        <button
                                            className="btn-primary"
                                            style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem' }}
                                            onClick={() => navigate(`/job/${incomingJob.jobId}`)}
                                        >
                                            🚀 Apply for this Job
                                        </button>
                                    )}
                                    <button className="btn-secondary" onClick={() => { setFadeState('out'); setTimeout(() => { setResults(null); setFile(null); setResumeText(''); setFadeState('in'); }, 300); }}>
                                        🔄 Reset
                                    </button>
                                </div>
                            </div>

                            <div className="dashboard-grid">
                                <div className="card strengths-card">
                                    <h4>📊 Core Fast-Metrics</h4>
                                    <div className="metric-row">
                                        <span className="label">Skill Match</span>
                                        <div className="value-bar">
                                            <div className="fill blue" style={{ width: `${results.skillStrength}%` }}></div>
                                        </div>
                                        <span className="percentage-val">{results.skillStrength}%</span>
                                    </div>
                                    <div className="metric-row">
                                        <span className="label">Experience Fit</span>
                                        <div className="value-bar">
                                            <div className="fill purple" style={{ width: `${results.expStrength}%` }}></div>
                                        </div>
                                        <span className="percentage-val">{results.expStrength}%</span>
                                    </div>
                                </div>

                                <div className="card keywords-card">
                                    <h4>🏷️ Semantic Keywords</h4>
                                    <div className="keyword-group">
                                        <span className="sublabel">Missing Needs</span>
                                        <div className="tags">
                                            {results.missingKeywords.length > 0 ?
                                                results.missingKeywords.map(k => <span key={k} className="tag red">{k}</span>) :
                                                <span className="all-clear">✓ Perfect keyword match</span>
                                            }
                                        </div>
                                    </div>
                                    <div className="keyword-group">
                                        <span className="sublabel">Strong Matches</span>
                                        <div className="tags">
                                            {results.matchedKeywords.map(k => <span key={k} className="tag green">{k}</span>)}
                                        </div>
                                    </div>
                                </div>

                                <div className="card suggestions-card full-width">
                                    <h4>💡 Top Improvement Insights</h4>
                                    <ul className="insight-list">
                                        {results.suggestions.map((s, i) => (
                                            <li key={i}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .modern-analyzer {
                    min-height: calc(100vh - 80px);
                    background: radial-gradient(circle at top right, #f8fafc 0%, #eff6ff 100%);
                    padding: 3rem 1.5rem;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }

                .analyzer-wrapper {
                    max-width: 1100px;
                    margin: 0 auto;
                    transition: opacity 0.4s ease, transform 0.4s ease;
                }

                .analyzer-wrapper.fade-out { opacity: 0; transform: translateY(-10px); }
                .analyzer-wrapper.fade-in { opacity: 1; transform: translateY(0); }

                /* Header */
                .header-section {
                    text-align: center;
                    margin-bottom: 3.5rem;
                }

                .ai-badge {
                    display: inline-block;
                    padding: 0.35rem 1rem;
                    background: #dbeafe;
                    color: #2563eb;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    margin-bottom: 1.25rem;
                }

                .header-section h1 {
                    font-size: 2.75rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 0 0 0.75rem 0;
                    letter-spacing: -0.02em;
                }

                .header-section p {
                    color: #64748b;
                    font-size: 1.15rem;
                    max-width: 500px;
                    margin: 0 auto;
                }

                /* Content Area Transitions */
                .content-area {
                    position: relative;
                    min-height: 400px;
                }

                .animate-slide-up { animation: fadeInUp 0.5s ease-out; }
                .animate-fade-in { animation: fadeIn 0.6s ease-out; }
                .animate-expand { animation: expandDown 0.3s ease-out; }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes expandDown { from { opacity: 0; transform: scaleY(0.95); transform-origin: top; } to { opacity: 1; transform: scaleY(1); } }

                /* Upload Area */
                .upload-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .drop-zone {
                    background: white;
                    border: 2px dashed #e2e8f0;
                    border-radius: 24px;
                    padding: 4rem 2rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }

                .drop-zone:hover, .drop-zone.dragging {
                    border-color: #3b82f6;
                    background: #f0f7ff;
                    transform: translateY(-4px);
                    box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.1);
                }

                .upload-icon {
                    font-size: 3rem;
                    margin-bottom: 1.5rem;
                }

                .upload-text {
                    color: #475569;
                    font-size: 1.1rem;
                }

                .upload-text strong {
                    color: #1e293b;
                    margin-bottom: 0.25rem;
                    display: block;
                }

                .upload-text span {
                    font-size: 0.85rem;
                    color: #94a3b8;
                    margin-top: 0.5rem;
                    display: block;
                }

                .file-info {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .filename {
                    font-weight: 700;
                    color: #1e293b;
                    font-size: 1.2rem;
                }

                .filesize {
                    color: #64748b;
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                }

                .btn-change {
                    background: none;
                    border: 1px solid #e2e8f0;
                    padding: 0.4rem 1rem;
                    border-radius: 8px;
                    color: #64748b;
                    font-weight: 600;
                    cursor: pointer;
                }

                /* JD Section */
                .jd-section {
                    background: #f8fafc;
                    border-radius: 16px;
                    padding: 0.5rem;
                }

                .jd-toggle {
                    width: 100%;
                    background: none;
                    border: none;
                    padding: 0.85rem;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-align: left;
                    cursor: pointer;
                    border-radius: 12px;
                    transition: background 0.2s;
                }

                .jd-toggle:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                }

                .jd-input {
                    display: block;
                    width: 100%;
                    min-height: 120px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 1rem;
                    margin: 0.5rem 0 0.25rem 0;
                    font-family: inherit;
                    font-size: 0.9rem;
                    resize: vertical;
                }

                .btn-primary {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 1.15rem;
                    border-radius: 16px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
                }

                .btn-primary:hover {
                    background: #1d4ed8;
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.2);
                }

                /* Processing State Overlay */
                .processing-overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: rgba(248, 250, 252, 0.8);
                    backdrop-filter: blur(4px);
                    border-radius: 24px;
                    z-index: 10;
                    animation: fadeIn 0.4s ease-out;
                }

                .processing-card {
                    background: white;
                    padding: 3rem;
                    border-radius: 24px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    width: 100%;
                    max-width: 500px;
                    border: 1px solid #f1f5f9;
                }

                .loader-ring {
                    width: 80px;
                    height: 80px;
                    border: 4px solid #dbeafe;
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 2rem;
                    position: relative;
                }

                .inner-ring {
                    position: absolute;
                    top: 10px; left: 10px; right: 10px; bottom: 10px;
                    border: 3px solid #eff6ff;
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite reverse;
                }

                @keyframes spin { to { transform: rotate(360deg); } }

                .current-message {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 1.5rem;
                    min-height: 1.5em;
                }

                .step-dots {
                    display: flex;
                    gap: 0.5rem;
                    justify-content: center;
                    margin-bottom: 2rem;
                }

                .dot {
                    width: 8px; height: 8px; background: #e2e8f0;
                    border-radius: 50%; transition: all 0.3s;
                }

                .dot.active { background: #2563eb; transform: scale(1.4); }
                .dot.done { background: #bfdbfe; }

                .processing-progress-bar {
                    height: 4px;
                    background: #f1f5f9;
                    border-radius: 999px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: #2563eb;
                    transition: width 0.4s ease;
                }

                /* Results Dashboard */
                .results-dashboard {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .results-top {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    align-items: center;
                    gap: 2rem;
                    background: white;
                    padding: 2.5rem;
                    border-radius: 24px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    margin-bottom: 0.5rem;
                }

                .results-actions { display: flex; align-items: center; }

                .main-score-card { display: flex; align-items: center; gap: 3rem; }

                .score-radial { width: 140px; flex-shrink: 0; }

                .circular-chart { display: block; margin: 10px auto; max-width: 100%; max-height: 250px; }

                .circle-bg { fill: none; stroke: #f1f5f9; stroke-width: 3.2; }

                .circle { fill: none; stroke-width: 3.2; stroke-linecap: round; animation: progress 1.2s ease-out forwards; }

                @keyframes progress { 0% { stroke-dasharray: 0 100; } }

                .percentage { font-size: 10px; font-weight: 800; text-anchor: middle; font-family: inherit; }

                .score-info h3 { margin: 0; font-size: 1.85rem; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; }

                .score-info p { margin: 0.5rem 0 0 0; color: #64748b; font-size: 1.05rem; line-height: 1.5; max-width: 450px; }

                .btn-secondary {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 0.85rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 0.95rem;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-secondary:hover { border-color: #cbd5e0; background: #f8fafc; }

                .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

                @media (max-width: 768px) {
                    .dashboard-grid { grid-template-columns: 1fr; }
                    .main-score-card { flex-direction: column; text-align: center; gap: 1.5rem; }
                    .results-top { grid-template-columns: 1fr; text-align: center; }
                    .results-actions { justify-content: center; }
                }

                .card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 20px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .card h4 {
                    margin: 0 0 1.25rem 0;
                    font-size: 1rem;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .metric-row {
                    display: grid;
                    grid-template-columns: 120px 1fr 50px;
                    align-items: center;
                    gap: 1.25rem;
                    margin-bottom: 1.25rem;
                }

                .metric-row .label { font-size: 0.9rem; font-weight: 700; color: #475569; }

                .value-bar { height: 10px; background: #f1f5f9; border-radius: 999px; position: relative; overflow: hidden; }

                .fill { height: 100%; border-radius: 999px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }

                .fill.blue { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
                .fill.purple { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }

                .percentage-val { font-size: 0.9rem; font-weight: 800; color: #1e293b; text-align: right; }

                .keyword-group { margin-bottom: 1.5rem; }

                .sublabel { display: block; font-size: 0.75rem; font-weight: 700; color: #94a3b8; margin-bottom: 0.75rem; text-transform: uppercase; }

                .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }

                .tag { padding: 0.35rem 0.85rem; border-radius: 8px; font-size: 0.8rem; font-weight: 700; }

                .tag.red { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
                .tag.green { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }

                .all-clear { font-size: 0.9rem; color: #10b981; font-weight: 600; }

                .full-width { grid-column: 1 / -1; }

                .insight-list { list-style: none; padding: 0; margin: 0; }

                .insight-list li {
                    position: relative;
                    padding: 0.75rem 0 0.75rem 1.75rem;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 0.95rem;
                    color: #475569;
                    line-height: 1.5;
                }

                .insight-list li:before { content: '✨'; position: absolute; left: 0; }

                .insight-list li:last-child { border-bottom: none; }
            `}</style>
        </div>
    );
};

export default ResumeAnalyzer;
