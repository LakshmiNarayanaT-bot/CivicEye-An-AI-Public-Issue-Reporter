import test from 'node:test';
import assert from 'node:assert/strict';
import { getRecommendedChannels, VERIFIED_CHANNELS } from './routing.js';

test('VERIFIED_CHANNELS includes key Indian and Hyderabad grievance channels', () => {
  assert.ok(VERIFIED_CHANNELS.length >= 4);
  const ids = VERIFIED_CHANNELS.map((c) => c.id);
  assert.ok(ids.includes('ghmc-mycure'));
  assert.ok(ids.includes('swachhata-app'));
  assert.ok(ids.includes('hmwssb-water'));
});

test('getRecommendedChannels returns GHMC and Swachhata for road damage in Hyderabad', () => {
  const channels = getRecommendedChannels('road_damage', 'Banjara Hills, Hyderabad');
  const ids = channels.map((c) => c.id);
  assert.ok(ids.includes('ghmc-mycure'));
  assert.ok(ids.includes('cpgrams-central'));
});

test('getRecommendedChannels returns water board for water leaks', () => {
  const channels = getRecommendedChannels('water_issue', 'Hyderabad');
  const ids = channels.map((c) => c.id);
  assert.ok(ids.includes('hmwssb-water'));
  assert.ok(ids.includes('swachhata-app'));
});
