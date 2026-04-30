import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';

const ApplicationModal = ({ job, onClose, onSuccess }) => {
    const [coverLetter, setCoverLetter] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file) => {
        setError('');
        const allowed = ['.pdf', '.doc', '.docx'];
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!allowed.includes(ext)) {
            setError('Only PDF, DOC, and DOCX files are allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be under 5MB.');
            return;
        }
        setResumeFile(file);
    };

    const removeFile = () => {
        setResumeFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!resumeFile) {
            setError('Please upload your resume to apply.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('job', job._id);
            formData.append('resume', resumeFile);
            if (coverLetter.trim()) {
                formData.append('coverLetter', coverLetter.trim());
            }

            const response = await api.post('/applications', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess?.();
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
    };

    if (success) {
        return createPortal(
            <div className="am-overlay" onClick={handleOverlayClick}>
                <div className="am-modal am-success-modal">
                    <div className="am-success-anim">
                        <div className="am-check-circle">
                            <svg viewBox="0 0 52 52" className="am-checkmark">
                                <circle cx="26" cy="26" r="25" fill="none" />
                                <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                            </svg>
                        </div>
                        <h2>Application Submitted!</h2>
                        <p>Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been submitted successfully.</p>
                        <span className="am-success-sub">You'll receive updates as your application progresses.</span>
                    </div>
                </div>
                <style>{successStyles}</style>
            </div>,
            document.body
        );
    }

    return createPortal(
        <div className="am-overlay" onClick={handleOverlayClick}>
            <div className="am-modal">
                {/* Header */}
                <div className="am-header">
                    <div className="am-header-left">
                        <div className="am-header-icon">📄</div>
                        <div>
                            <h2>Apply for Position</h2>
                            <p className="am-job-info">{job.title} <span>at</span> {job.company}</p>
                        </div>
                    </div>
                    <button className="am-close" onClick={onClose} disabled={submitting}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="am-body">
                    {/* Resume Upload */}
                    <div className="am-section">
                        <label className="am-label">
                            Resume / CV <span className="am-required">*</span>
                        </label>
                        <p className="am-hint">Accepted formats: PDF, DOC, DOCX (max 5MB)</p>

                        {!resumeFile ? (
                            <div
                                className={`am-dropzone ${dragActive ? 'active' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="am-dropzone-icon">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17,8 12,3 7,8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                </div>
                                <p className="am-dropzone-text">
                                    <strong>Click to upload</strong> or drag and drop
                                </p>
                                <span className="am-dropzone-sub">PDF, DOC, DOCX up to 5MB</span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    hidden
                                />
                            </div>
                        ) : (
                            <div className="am-file-preview">
                                <div className="am-file-icon">
                                    {resumeFile.name.endsWith('.pdf') ? '📕' : '📘'}
                                </div>
                                <div className="am-file-info">
                                    <span className="am-file-name">{resumeFile.name}</span>
                                    <span className="am-file-size">{formatFileSize(resumeFile.size)}</span>
                                </div>
                                <button type="button" className="am-file-remove" onClick={removeFile}>✕</button>
                            </div>
                        )}
                    </div>

                    {/* Cover Letter */}
                    <div className="am-section">
                        <label className="am-label">Cover Letter <span className="am-optional">(optional)</span></label>
                        <p className="am-hint">Tell the recruiter why you're the perfect fit</p>
                        <textarea
                            className="am-textarea"
                            placeholder={"Dear Hiring Manager,\n\nI am excited to apply for this position because..."}
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            maxLength={2000}
                            rows={5}
                        />
                        <div className="am-char-count">
                            {coverLetter.length} / 2,000 characters
                        </div>
                    </div>

                    {/* Error */}
                    {error && <div className="am-error">{error}</div>}

                    {/* Actions */}
                    <div className="am-actions">
                        <button type="button" className="am-btn-cancel" onClick={onClose} disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" className="am-btn-submit" disabled={submitting}>
                            {submitting ? (
                                <><span className="am-spinner"></span> Submitting...</>
                            ) : (
                                'Submit Application'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <style>{modalStyles}</style>
        </div>,
        document.body
    );
};

const modalStyles = `
    .am-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 1.5rem;
        animation: am-fadeIn 0.2s ease;
    }

    @keyframes am-fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes am-slideUp {
        from { opacity: 0; transform: translateY(20px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .am-modal {
        background: white;
        border-radius: 20px;
        width: 100%;
        max-width: 560px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 25px 80px -12px rgba(0, 0, 0, 0.25);
        animation: am-slideUp 0.3s ease;
    }

    .am-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 1.75rem 1.75rem 1.25rem;
        border-bottom: 1px solid #f1f5f9;
    }

    .am-header-left {
        display: flex;
        gap: 0.85rem;
        align-items: flex-start;
    }

    .am-header-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, #eff6ff, #dbeafe);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;
        flex-shrink: 0;
    }

    .am-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.02em;
    }

    .am-job-info {
        margin: 0.2rem 0 0;
        font-size: 0.88rem;
        color: #2563eb;
        font-weight: 600;
    }

    .am-job-info span {
        color: #94a3b8;
        font-weight: 400;
    }

    .am-close {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        background: #f8fafc;
        color: #64748b;
        font-size: 0.85rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
        padding: 0;
        box-shadow: none !important;
    }

    .am-close:hover {
        background: #f1f5f9;
        color: #1e293b;
        border-color: #cbd5e1;
    }

    .am-body {
        padding: 1.5rem 1.75rem 1.75rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .am-section {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .am-label {
        font-size: 0.85rem;
        font-weight: 700;
        color: #1e293b;
    }

    .am-required {
        color: #ef4444;
    }

    .am-optional {
        color: #94a3b8;
        font-weight: 500;
    }

    .am-hint {
        font-size: 0.78rem;
        color: #94a3b8;
        margin: 0;
    }

    /* Dropzone */
    .am-dropzone {
        border: 2px dashed #cbd5e1;
        border-radius: 14px;
        padding: 2rem 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
        background: #fafbfc;
        margin-top: 0.35rem;
    }

    .am-dropzone:hover, .am-dropzone.active {
        border-color: #2563eb;
        background: #eff6ff;
    }

    .am-dropzone-icon {
        color: #94a3b8;
        transition: color 0.2s;
    }

    .am-dropzone:hover .am-dropzone-icon,
    .am-dropzone.active .am-dropzone-icon {
        color: #2563eb;
    }

    .am-dropzone-text {
        font-size: 0.88rem;
        color: #64748b;
        margin: 0;
    }

    .am-dropzone-text strong {
        color: #2563eb;
    }

    .am-dropzone-sub {
        font-size: 0.72rem;
        color: #94a3b8;
    }

    /* File preview */
    .am-file-preview {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.85rem 1rem;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 12px;
        margin-top: 0.35rem;
    }

    .am-file-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
    }

    .am-file-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
        min-width: 0;
    }

    .am-file-name {
        font-size: 0.85rem;
        font-weight: 700;
        color: #166534;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .am-file-size {
        font-size: 0.72rem;
        color: #4ade80;
        font-weight: 600;
    }

    .am-file-remove {
        width: 26px;
        height: 26px;
        border-radius: 6px;
        border: 1px solid #bbf7d0;
        background: white;
        color: #64748b;
        font-size: 0.7rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        box-shadow: none !important;
        flex-shrink: 0;
    }

    .am-file-remove:hover {
        background: #fef2f2;
        color: #dc2626;
        border-color: #fecaca;
    }

    /* Textarea */
    .am-textarea {
        border: 1.5px solid #e2e8f0;
        border-radius: 12px;
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
        font-family: inherit;
        resize: vertical;
        min-height: 110px;
        background: #f8fafc;
        transition: all 0.2s;
        outline: none;
        color: #1e293b;
        margin-top: 0.35rem;
        line-height: 1.55;
        box-shadow: none;
    }

    .am-textarea:focus {
        border-color: #2563eb;
        background: white;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .am-char-count {
        font-size: 0.72rem;
        color: #94a3b8;
        text-align: right;
        font-weight: 500;
    }

    /* Error */
    .am-error {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
        padding: 0.7rem 1rem;
        border-radius: 10px;
        font-size: 0.85rem;
        font-weight: 500;
    }

    /* Actions */
    .am-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding-top: 0.5rem;
        border-top: 1px solid #f1f5f9;
    }

    .am-btn-cancel {
        padding: 0.65rem 1.25rem;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        background: #f8fafc;
        font-size: 0.88rem;
        font-weight: 700;
        color: #64748b;
        cursor: pointer;
        transition: all 0.15s;
        box-shadow: none !important;
    }

    .am-btn-cancel:hover {
        background: #f1f5f9;
        color: #1e293b;
        border-color: #cbd5e1;
    }

    .am-btn-submit {
        padding: 0.65rem 1.75rem;
        border-radius: 10px;
        border: none;
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        color: white;
        font-size: 0.88rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .am-btn-submit:hover:not(:disabled) {
        background: linear-gradient(135deg, #1d4ed8, #2563eb);
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
    }

    .am-btn-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    /* Spinner */
    .am-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: am-spin 0.6s linear infinite;
    }

    @keyframes am-spin {
        to { transform: rotate(360deg); }
    }
`;

const successStyles = `
    .am-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 1.5rem;
    }

    .am-success-modal {
        background: white;
        border-radius: 20px;
        width: 100%;
        max-width: 420px;
        padding: 3rem 2rem;
        text-align: center;
        box-shadow: 0 25px 80px -12px rgba(0, 0, 0, 0.25);
        animation: am-scaleIn 0.4s ease;
    }

    @keyframes am-scaleIn {
        from { opacity: 0; transform: scale(0.85); }
        to { opacity: 1; transform: scale(1); }
    }

    .am-success-anim {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
    }

    .am-check-circle {
        width: 72px;
        height: 72px;
        margin-bottom: 0.5rem;
    }

    .am-checkmark {
        width: 72px;
        height: 72px;
    }

    .am-checkmark circle {
        stroke-dasharray: 166;
        stroke-dashoffset: 166;
        stroke-width: 2;
        stroke: #16a34a;
        fill: none;
        animation: am-stroke 0.6s ease forwards;
    }

    .am-checkmark path {
        stroke: #16a34a;
        stroke-dasharray: 48;
        stroke-dashoffset: 48;
        stroke-width: 3;
        animation: am-stroke 0.4s ease 0.4s forwards;
    }

    @keyframes am-stroke {
        100% { stroke-dashoffset: 0; }
    }

    .am-success-anim h2 {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.02em;
    }

    .am-success-anim p {
        margin: 0;
        font-size: 0.92rem;
        color: #475569;
        line-height: 1.5;
    }

    .am-success-sub {
        font-size: 0.78rem;
        color: #94a3b8;
        margin-top: 0.25rem;
    }
`;

export default ApplicationModal;
