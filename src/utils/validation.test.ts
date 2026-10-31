import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateImageFile,
  sanitizeCategory,
  sanitizeConfidence,
  parseAndValidateGemmaAnalysis,
  getFallbackDepartment,
  MAX_IMAGE_SIZE_BYTES,
} from './validation.js';

test('validateImageFile rejects empty files and oversized files', () => {
  const emptyRes = validateImageFile(0, 'image/png');
  assert.equal(emptyRes.valid, false);
  assert.match(emptyRes.error || '', /empty/i);

  const oversizedRes = validateImageFile(MAX_IMAGE_SIZE_BYTES + 500, 'image/jpeg');
  assert.equal(oversizedRes.valid, false);
  assert.match(oversizedRes.error || '', /exceeds 10MB/i);

  const invalidMime = validateImageFile(5000, 'application/pdf');
  assert.equal(invalidMime.valid, false);
  assert.match(invalidMime.error || '', /unsupported/i);

  const validPng = validateImageFile(50000, 'image/png');
  assert.equal(validPng.valid, true);

  const validJpeg = validateImageFile(50000, 'image/jpeg');
  assert.equal(validJpeg.valid, true);

  const validWebp = validateImageFile(50000, 'image/webp');
  assert.equal(validWebp.valid, true);
});

test('sanitizeCategory maps raw strings to valid enum values', () => {
  assert.equal(sanitizeCategory('road_damage'), 'road_damage');
  assert.equal(sanitizeCategory('potholes on main street'), 'road_damage');
  assert.equal(sanitizeCategory('garbage pile overflowing'), 'garbage');
  assert.equal(sanitizeCategory('open sewer drain'), 'open_drain');
  assert.equal(sanitizeCategory('water pipe leak'), 'water_issue');
  assert.equal(sanitizeCategory('broken street lamp'), 'damaged_streetlight');
  assert.equal(sanitizeCategory('unknown weird thing'), 'other');
});

test('sanitizeConfidence returns likely, possible, or uncertain', () => {
  assert.equal(sanitizeConfidence('likely'), 'likely');
  assert.equal(sanitizeConfidence('high'), 'likely');
  assert.equal(sanitizeConfidence('possible'), 'possible');
  assert.equal(sanitizeConfidence('medium'), 'possible');
  assert.equal(sanitizeConfidence('low'), 'uncertain');
  assert.equal(sanitizeConfidence(null), 'uncertain');
});

test('parseAndValidateGemmaAnalysis parses valid JSON output correctly', () => {
  const jsonMock = JSON.stringify({
    category: 'road_damage',
    title: 'Damaged asphalt with visible potholes',
    observations: ['Large pothole approximately 2 feet wide', 'Loose gravel on carriageway'],
    potential_hazard: 'Risk of two-wheeler skidding and vehicle axle damage',
    confidence_label: 'likely',
    suggested_department: 'Road Maintenance Wing',
    missing_information: ['Exact street name', 'Nearest landmark'],
    requires_user_confirmation: true,
  });

  const parsed = parseAndValidateGemmaAnalysis(jsonMock, 'gemma-4-26b-a4b-it');
  assert.equal(parsed.category, 'road_damage');
  assert.equal(parsed.title, 'Damaged asphalt with visible potholes');
  assert.equal(parsed.observations.length, 2);
  assert.equal(parsed.confidence_label, 'likely');
  assert.equal(parsed.model_used, 'gemma-4-26b-a4b-it');
});

test('parseAndValidateGemmaAnalysis handles fenced markdown json and fallback', () => {
  const fencedMock = `\`\`\`json
  {
    "category": "garbage",
    "title": "Overflowing waste container",
    "observations": ["Dumpster spilling onto pavement"],
    "potential_hazard": "Health and sanitation hazard",
    "confidence_label": "likely"
  }
  \`\`\``;

  const parsed = parseAndValidateGemmaAnalysis(fencedMock, 'gemma-4-26b-a4b-it');
  assert.equal(parsed.category, 'garbage');
  assert.equal(parsed.observations[0], 'Dumpster spilling onto pavement');

  const fallback = parseAndValidateGemmaAnalysis('Invalid non-json text response', 'gemma-4');
  assert.equal(fallback.category, 'uncertain');
  assert.equal(fallback.confidence_label, 'uncertain');
});

test('getFallbackDepartment provides appropriate government wings', () => {
  assert.match(getFallbackDepartment('road_damage'), /Road/);
  assert.match(getFallbackDepartment('garbage'), /Sanitation/);
  assert.match(getFallbackDepartment('open_drain'), /Drainage/);
  assert.match(getFallbackDepartment('water_issue'), /Water/);
  assert.match(getFallbackDepartment('damaged_streetlight'), /Street Light/);
});
