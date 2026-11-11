/**
 * ScholarSync Deterministic Eligibility Engine
 * Safe, rule-based evaluator without arbitrary code or SQL execution.
 */

const ALLOWED_FIELDS = [
  'cgpa',
  'annual_family_income',
  'department',
  'study_year',
  'domicile_state',
  'category',
];

const ALLOWED_OPERATORS = [
  'EQ',
  'NE',
  'GT',
  'GTE',
  'LT',
  'LTE',
  'IN',
  'BETWEEN',
];

/**
 * Evaluates a single criterion against a student's profile value.
 */
function evaluateCriterion(criterion, studentProfile) {
  const { field_key, operator, expected_value, upper_value, display_reason, is_mandatory } = criterion;

  if (!ALLOWED_FIELDS.includes(field_key)) {
    return {
      criterion_id: criterion.criterion_id,
      field_key,
      passed: false,
      status: 'INVALID_CRITERION',
      reason: `Unsupported eligibility field: ${field_key}`,
      is_mandatory: Boolean(is_mandatory),
    };
  }

  if (!ALLOWED_OPERATORS.includes(operator)) {
    return {
      criterion_id: criterion.criterion_id,
      field_key,
      passed: false,
      status: 'INVALID_OPERATOR',
      reason: `Unsupported operator: ${operator}`,
      is_mandatory: Boolean(is_mandatory),
    };
  }

  const studentVal = studentProfile ? studentProfile[field_key] : undefined;

  // Check if profile value is missing
  if (studentVal === undefined || studentVal === null || studentVal === '') {
    return {
      criterion_id: criterion.criterion_id,
      field_key,
      passed: false,
      status: 'MISSING_DATA',
      reason: `Profile is missing required field: ${field_key}`,
      display_reason: display_reason || `Requires valid ${field_key}`,
      is_mandatory: Boolean(is_mandatory),
    };
  }

  let passed = false;

  switch (operator) {
    case 'EQ':
      passed = String(studentVal).trim().toLowerCase() === String(expected_value).trim().toLowerCase();
      break;

    case 'NE':
      passed = String(studentVal).trim().toLowerCase() !== String(expected_value).trim().toLowerCase();
      break;

    case 'GT':
      passed = Number(studentVal) > Number(expected_value);
      break;

    case 'GTE':
      passed = Number(studentVal) >= Number(expected_value);
      break;

    case 'LT':
      passed = Number(studentVal) < Number(expected_value);
      break;

    case 'LTE':
      passed = Number(studentVal) <= Number(expected_value);
      break;

    case 'IN': {
      const allowedList = String(expected_value)
        .split(',')
        .map((s) => s.trim().toLowerCase());
      passed = allowedList.includes(String(studentVal).trim().toLowerCase());
      break;
    }

    case 'BETWEEN': {
      const numVal = Number(studentVal);
      const minVal = Number(expected_value);
      const maxVal = Number(upper_value !== undefined ? upper_value : expected_value);
      passed = numVal >= minVal && numVal <= maxVal;
      break;
    }

    default:
      passed = false;
  }

  return {
    criterion_id: criterion.criterion_id,
    field_key,
    operator,
    expected_value,
    upper_value,
    student_value: studentVal,
    passed,
    status: passed ? 'PASSED' : 'FAILED',
    reason: passed
      ? (display_reason || 'Criterion satisfied')
      : `Did not meet requirement: ${display_reason || `${field_key} must satisfy ${operator} ${expected_value}`}`,
    display_reason,
    is_mandatory: Boolean(is_mandatory),
  };
}

/**
 * Evaluates all criteria for a scholarship against a student's profile.
 * Returns overall eligibility, missing fields list, and per-criterion evaluations.
 */
function evaluateEligibility(criteria = [], studentProfile = {}) {
  if (!criteria || criteria.length === 0) {
    return {
      is_eligible: true,
      has_missing_data: false,
      missing_fields: [],
      criteria_results: [],
      summary: 'No specific criteria required for this scholarship.',
    };
  }

  const results = criteria.map((c) => evaluateCriterion(c, studentProfile));
  const missingResults = results.filter((r) => r.status === 'MISSING_DATA');
  const failedMandatory = results.filter((r) => r.is_mandatory && !r.passed);

  const missing_fields = [...new Set(missingResults.map((r) => r.field_key))];
  const has_missing_data = missing_fields.length > 0;
  const is_eligible = failedMandatory.length === 0;

  let summary = '';
  if (has_missing_data) {
    summary = `Profile incomplete. Please update: ${missing_fields.join(', ')}`;
  } else if (is_eligible) {
    summary = 'Congratulations! You meet all mandatory criteria for this scholarship.';
  } else {
    summary = `You do not satisfy ${failedMandatory.length} mandatory requirement(s).`;
  }

  return {
    is_eligible,
    has_missing_data,
    missing_fields,
    criteria_results: results,
    summary,
  };
}

module.exports = {
  ALLOWED_FIELDS,
  ALLOWED_OPERATORS,
  evaluateCriterion,
  evaluateEligibility,
};
