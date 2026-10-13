import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreTerritory } from '../../src/lib/quiz/scoring.ts';
test('fifth answer breaks a tie from the first four answers', () => {
  assert.equal(scoreTerritory({0:['EMBER'],1:['PETAL'],2:['EMBER'],3:['PETAL'],4:['PETAL']}), 'PETAL');
});
test('preserves territory order on a true tie', () => {
  assert.equal(scoreTerritory({0:['TIDAL'],1:['TERRA']}), 'TIDAL');
});
