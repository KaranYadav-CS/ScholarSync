import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Award, Plus, Trash2, ArrowLeft, Save, Sparkles } from 'lucide-react';

export default function ScholarshipFormPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    description: '',
    award_amount: 50000,
    currency: 'INR',
    category: 'Merit-cum-Means',
    deadline_at: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
  });

  const [criteria, setCriteria] = useState([
    {
      field_key: 'cgpa',
      operator: 'GTE',
      expected_value: '7.5',
      upper_value: '',
      is_mandatory: true,
      display_reason: 'Minimum CGPA of 7.5 on 10.0 scale',
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCriterion = () => {
    setCriteria((prev) => [
      ...prev,
      {
        field_key: 'annual_family_income',
        operator: 'LTE',
        expected_value: '500000',
        upper_value: '',
        is_mandatory: true,
        display_reason: 'Annual family income under 5 Lakhs',
      },
    ]);
  };

  const handleRemoveCriterion = (index) => {
    setCriteria((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCriterionChange = (index, field, value) => {
    setCriteria((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        award_amount: Number(formData.award_amount),
        criteria: criteria.map((c) => ({
          ...c,
          upper_value: c.operator === 'BETWEEN' ? c.upper_value : null,
        })),
      };

      const res = await api.post('/scholarships', payload);
      if (res.success) {
        // Automatically publish or navigate to scholarships list
        await api.post(`/scholarships/${res.data.scholarship_id}/publish`);
        navigate('/admin/scholarships');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create scholarship.');
    } finally {
      setSaving(false);
    }
  };

  const fieldOptions = [
    { key: 'cgpa', label: 'Cumulative CGPA' },
    { key: 'annual_family_income', label: 'Annual Family Income' },
    { key: 'study_year', label: 'Year of Study' },
    { key: 'department', label: 'Department' },
    { key: 'domicile_state', label: 'Domicile State' },
    { key: 'category', label: 'Social Category' },
  ];

  const operatorOptions = ['EQ', 'NE', 'GT', 'GTE', 'LT', 'LTE', 'BETWEEN', 'IN'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/scholarships"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scholarships
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <Award className="w-7 h-7 text-brand-600" />
          Create New Scholarship Opportunity
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure title, grant parameters, and rule-based deterministic eligibility criteria.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Program Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Scholarship Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. National Merit Engineering Fellowship 2026"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Provider / Foundation
              </label>
              <input
                type="text"
                name="provider"
                required
                value={formData.provider}
                onChange={handleChange}
                placeholder="e.g. Directorate of Higher Education"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="Merit-cum-Means">Merit-cum-Means</option>
                <option value="Merit-based">Merit-based</option>
                <option value="Need-based">Need-based</option>
                <option value="Special Diversity">Special Diversity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Award Amount (INR ₹)
              </label>
              <input
                type="number"
                name="award_amount"
                required
                value={formData.award_amount}
                onChange={handleChange}
                placeholder="50000"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Application Deadline
              </label>
              <input
                type="date"
                name="deadline_at"
                required
                value={formData.deadline_at}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Program Description & Terms
              </label>
              <textarea
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed eligibility scope, disbursements schedule, and documentation guidelines..."
                className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Criteria Builder */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                Rule-Based Eligibility Criteria
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Strict allowlisted evaluator (no arbitrary execution). Per-criterion explanations provided to students.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCriterion}
              className="px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Criterion
            </button>
          </div>

          <div className="space-y-4">
            {criteria.map((c, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-700 uppercase">
                    Rule #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCriterion(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                    title="Remove criterion"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Field Key
                    </label>
                    <select
                      value={c.field_key}
                      onChange={(e) => handleCriterionChange(idx, 'field_key', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    >
                      {fieldOptions.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Operator
                    </label>
                    <select
                      value={c.operator}
                      onChange={(e) => handleCriterionChange(idx, 'operator', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-mono"
                    >
                      {operatorOptions.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Expected Value
                    </label>
                    <input
                      type="text"
                      required
                      value={c.expected_value}
                      onChange={(e) => handleCriterionChange(idx, 'expected_value', e.target.value)}
                      placeholder="e.g. 7.5"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>

                  {c.operator === 'BETWEEN' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Upper Limit
                      </label>
                      <input
                        type="text"
                        required
                        value={c.upper_value}
                        onChange={(e) => handleCriterionChange(idx, 'upper_value', e.target.value)}
                        placeholder="e.g. 4"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                  )}

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Display Reason Shown to Student
                    </label>
                    <input
                      type="text"
                      required
                      value={c.display_reason}
                      onChange={(e) => handleCriterionChange(idx, 'display_reason', e.target.value)}
                      placeholder="e.g. Cumulative CGPA must be at least 7.5"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            to="/admin/scholarships"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Publish Scholarship'}
          </button>
        </div>
      </form>
    </div>
  );
}
