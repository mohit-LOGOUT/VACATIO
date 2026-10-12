import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transformSync } from 'esbuild';
const source = await readFile('convex/checkInRules.ts', 'utf8');
const { code } = transformSync(source, { loader: 'ts', format: 'esm' });
const { isReadyForCheckIn } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const ready = { expectedGuestCount: 2, requiredIdTypes: ['Aadhaar', 'Passport'], acceptedTypesByGuest: [['Aadhaar', 'Passport'], ['Aadhaar', 'Passport']], arrivalInformationSentAt: 123, hasOpenEscalation: false };
test('check-in requires every guest, every required ID, arrival information and no unresolved issue', () => {
  assert.equal(isReadyForCheckIn(ready), true);
  for (const change of [
    {acceptedTypesByGuest: [['Aadhaar', 'Passport']]},
    {acceptedTypesByGuest: [['Aadhaar', 'Passport'], ['Aadhaar']]},
    {arrivalInformationSentAt: undefined},
    {hasOpenEscalation: true},
    {requiredIdTypes: []},
    {expectedGuestCount: 0, acceptedTypesByGuest: []},
    {expectedGuestCount: 2.5},
    {expectedGuestCount: 101},
  ]) assert.equal(isReadyForCheckIn({...ready, ...change}), false, JSON.stringify(change));
});
