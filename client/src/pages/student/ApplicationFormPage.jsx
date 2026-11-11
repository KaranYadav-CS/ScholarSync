import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';

export default function ApplicationFormPage() {
  const { scholarshipId } = useParams();
  const navigate = useNavigate();
  const { student, user } = useAuth();

  const [scholarship, setScholarship] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [docType, setDocType] = useState('Income Certificate');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    initApplication();
  }, [scholarshipId]);

  const initApplication = async () => {
    try {
      const [scholRes, draftRes] = await Promise.all([
        api.get(`/scholarships/${scholarshipId}`),
        api.post('/applications', { scholarship_id: scholarshipId }),
      ]);

      if (scholRes.success) setScholarship(scholRes.data);
      if (draftRes.success) {
        setApplication(draftRes.data);
        if (draftRes.data.submission_notes) {
          setSubmissionNotes(draftRes.data.submission_notes);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initialize application.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !application) return;

    setUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('document_type', docType);

      const res = await api.post(`/applications/${application.application_id}/documents`, formData);
      if (res.success) {
        setSelectedFile(null);
        // Refresh application to get updated document list
        const updatedAppRes = await api.get(`/applications/${application.application_id}`);
        if (updatedAppRes.success) setApplication(updatedAppRes.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!application) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.post(`/applications/${application.application_id}/submit`, {
        submission_notes: submissionNotes,
      });

      if (res.success) {
        navigate(`/student/applications/${application.application_id}`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Preparing application form and document checklist...
      </div>
    );
  }

  const documentTypes = [
    'Income Certificate',
    'Academic Transcript',
    'Domicile Certificate',
    'Identity / College ID',
    'Bonafide Certificate',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-semibold text-brand-600 uppercase tracking-wider">
            Application Draft
          </span>
          <span>Deadline: {new Date(scholarship?.deadline_at).toLocaleDateString()}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {scholarship?.title}
        </h1>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
          <Building className="w-3.5 h-3.5" /> {scholarship?.provider} | Grant: ₹
          {Number(scholarship?.award_amount).toLocaleString()}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Verification Check */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            Applicant Academic Profile
          </h2>
          <Link to="/student/profile" className="text-xs text-brand-600 font-semibold underline">
            Edit Profile
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Student Name</span>
            <span className="font-semibold text-slate-900">{user?.fullName}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Department</span>
            <span className="font-semibold text-slate-900">{student?.department || 'Not set'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">CGPA</span>
            <span className="font-semibold text-slate-900">{student?.cgpa || 0} / 10.0</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Annual Income</span>
            <span className="font-semibold text-slate-900">
              ₹{Number(student?.annual_family_income || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Document Checklist & Upload Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand-600" />
            Required Document Uploads
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload authentic PDF, PNG, or JPEG certificates (Max 10MB per file). Files are securely stored in private cloud storage.
          </p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleFileUpload} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-end">
          <div className="w-full sm:w-1/3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Category
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {documentTypes.map((dt) => (
                <option key={dt} value={dt}>
                  {dt}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select File (PDF, PNG, JPG)
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="w-full sm:w-auto px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50 shrink-0"
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>

        {/* Uploaded Documents Table */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Attached Documents ({application?.documents?.length || 0})
          </h3>

          {!application?.documents || application.documents.length === 0 ? (
            <div className="p-6 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-400">
              No documents uploaded yet. Upload at least one supporting document before submitting.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {application.documents.map((doc) => (
                <div key={doc.document_id} className="p-3.5 flex items-center justify-between bg-white text-xs">
                  <div className="flex items-center gap-3">
                    <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">{doc.document_type}</p>
                      <p className="text-[11px] text-slate-400">
                        {doc.original_file_name} ({(doc.size_bytes / 1024).toFixed(1)} KB)
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Uploaded
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submission Notes & Confirmation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-1">
            Applicant Statement / Additional Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={submissionNotes}
            onChange={(e) => setSubmissionNotes(e.target.value)}
            placeholder="Share any special academic accomplishments or circumstances..."
            className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            By submitting, you certify that all uploaded certificates are authentic.
          </p>
          <button
            onClick={handleFinalSubmit}
            disabled={submitting || !application?.documents || application.documents.length === 0}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? 'Submitting Application...' : 'Submit Application'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
