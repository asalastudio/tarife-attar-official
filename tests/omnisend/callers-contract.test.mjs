import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const cart = await readFile('src/app/(site)/cart/page.tsx', 'utf8');
const footer = await readFile(
  'src/components/navigation/GlobalFooter.tsx',
  'utf8',
);
const quiz = await readFile(
  'src/app/(site)/quiz/TerritoryQuizClient.tsx',
  'utf8',
);

test('every Omnisend caller sends an explicit marketingConsent boolean', () => {
  assert.match(cart, /marketingConsent/);
  assert.match(footer, /marketingConsent:\s*true/);
  assert.match(quiz, /marketingConsent/);
});

test('cart and quiz do not archive customer emails in localStorage', () => {
  assert.doesNotMatch(cart, /saved-carts/);
  assert.doesNotMatch(quiz, /territory-profiles/);
});

test('every caller checks the HTTP response before showing success', () => {
  for (const source of [cart, footer, quiz]) {
    assert.match(source, /response\.ok/);
    assert.match(source, /throw new Error/);
  }
});
