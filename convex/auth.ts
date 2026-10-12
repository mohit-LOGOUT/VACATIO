import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';
import { adminProfile } from './adminRules';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({ profile: adminProfile })],
  session: { totalDurationMs: 8 * 60 * 60 * 1000, inactiveDurationMs: 2 * 60 * 60 * 1000 },
});
