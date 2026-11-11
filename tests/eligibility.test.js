const test = require('node:test');
const assert = require('node:assert');
const {
  evaluateCriterion,
  evaluateEligibility,
} = require('../server/src/modules/eligibility/eligibilityEngine');

test('Eligibility Engine: Evaluates numeric GTE and LTE accurately', () => {
  const gteCrit = {
    criterion_id: 'c1',
    field_key: 'cgpa',
    operator: 'GTE',
    expected_value: '7.5',
    is_mandatory: true,
  };

  assert.strictEqual(evaluateCriterion(gteCrit, { cgpa: 8.0 }).passed, true);
  assert.strictEqual(evaluateCriterion(gteCrit, { cgpa: 7.5 }).passed, true);
  assert.strictEqual(evaluateCriterion(gteCrit, { cgpa: 7.49 }).passed, false);

  const lteCrit = {
    criterion_id: 'c2',
    field_key: 'annual_family_income',
    operator: 'LTE',
    expected_value: '500000',
    is_mandatory: true,
  };

  assert.strictEqual(evaluateCriterion(lteCrit, { annual_family_income: 450000 }).passed, true);
  assert.strictEqual(evaluateCriterion(lteCrit, { annual_family_income: 550000 }).passed, false);
});

test('Eligibility Engine: Evaluates BETWEEN operator properly', () => {
  const betweenCrit = {
    criterion_id: 'c3',
    field_key: 'study_year',
    operator: 'BETWEEN',
    expected_value: '2',
    upper_value: '4',
    is_mandatory: true,
  };

  assert.strictEqual(evaluateCriterion(betweenCrit, { study_year: 2 }).passed, true);
  assert.strictEqual(evaluateCriterion(betweenCrit, { study_year: 3 }).passed, true);
  assert.strictEqual(evaluateCriterion(betweenCrit, { study_year: 4 }).passed, true);
  assert.strictEqual(evaluateCriterion(betweenCrit, { study_year: 1 }).passed, false);
  assert.strictEqual(evaluateCriterion(betweenCrit, { study_year: 5 }).passed, false);
});

test('Eligibility Engine: Returns MISSING_DATA when profile value is absent', () => {
  const crit = {
    criterion_id: 'c4',
    field_key: 'category',
    operator: 'EQ',
    expected_value: 'OBC',
    is_mandatory: true,
  };

  const result = evaluateCriterion(crit, { category: '' });
  assert.strictEqual(result.passed, false);
  assert.strictEqual(result.status, 'MISSING_DATA');
});

test('Eligibility Engine: Overall evaluation aggregates missing fields and mandatory status', () => {
  const criteria = [
    { criterion_id: '1', field_key: 'cgpa', operator: 'GTE', expected_value: '7.0', is_mandatory: true },
    { criterion_id: '2', field_key: 'domicile_state', operator: 'EQ', expected_value: 'Maharashtra', is_mandatory: true },
  ];

  // Eligible case
  const res1 = evaluateEligibility(criteria, { cgpa: 8.5, domicile_state: 'Maharashtra' });
  assert.strictEqual(res1.is_eligible, true);
  assert.strictEqual(res1.has_missing_data, false);

  // Ineligible case
  const res2 = evaluateEligibility(criteria, { cgpa: 6.5, domicile_state: 'Maharashtra' });
  assert.strictEqual(res2.is_eligible, false);

  // Missing data case
  const res3 = evaluateEligibility(criteria, { cgpa: 8.5 });
  assert.strictEqual(res3.has_missing_data, true);
  assert.deepStrictEqual(res3.missing_fields, ['domicile_state']);
});
