import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { User, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function StudentProfilePage() {
  const { student, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    student_number: '',
    department: '',
    program: 'B.Tech',
    study_year: 1,
    cgpa: '',
    annual_family_income: '',
    domicile_state: '',
    category: 'General',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        student_number: student.student_number || '',
        department: student.department || '',
        program: student.program || 'B.Tech',
        study_year: student.study_year || 1,
        cgpa: student.cgpa !== undefined && student.cgpa !== null ? student.cgpa : '',
        annual_family_income:
          student.annual_family_income !== undefined && student.annual_family_income !== null
            ? student.annual_family_income
            : '',
        domicile_state: student.domicile_state || '',
        category: student.category || 'General',
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        study_year: Number(formData.study_year),
        cgpa: Number(formData.cgpa),
        annual_family_income: Number(formData.annual_family_income),
      };

      const res = await api.put('/students/me', payload);
      if (res.success) {
        setSuccessMsg('Student profile updated successfully!');
        await refreshUser();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update student profile.');
    } finally {
      setSaving(false);
    }
  };

  const departments = [
    'Computer Science and Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electronics and Communication',
    'Information Technology',
    'Biotechnology',
  ];

  const categories = ['General', 'OBC', 'SC', 'ST', 'EWS'];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Academic Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Keep your academic and financial attributes updated for automated, explainable eligibility evaluations.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Roll / Student Number
            </label>
            <input
              type="text"
              name="student_number"
              value={formData.student_number}
              onChange={handleChange}
              placeholder="e.g. CS-2024-042"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Degree Program</label>
            <input
              type="text"
              name="program"
              value={formData.program}
              onChange={handleChange}
              required
              placeholder="e.g. B.Tech"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Year of Study</label>
            <select
              name="study_year"
              value={formData.study_year}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              {[1, 2, 3, 4, 5, 6].map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Cumulative CGPA (out of 10.0)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              name="cgpa"
              value={formData.cgpa}
              onChange={handleChange}
              required
              placeholder="e.g. 8.85"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Annual Family Income (INR ₹)
            </label>
            <input
              type="number"
              step="1000"
              min="0"
              name="annual_family_income"
              value={formData.annual_family_income}
              onChange={handleChange}
              required
              placeholder="e.g. 350000"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Domicile State
            </label>
            <input
              type="text"
              name="domicile_state"
              value={formData.domicile_state}
              onChange={handleChange}
              required
              placeholder="e.g. Maharashtra, Karnataka"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Social Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
