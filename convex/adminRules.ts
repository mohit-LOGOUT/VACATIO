import { ConvexError } from 'convex/values';
export function adminProfile(params: Record<string, unknown>) {
  if (params.flow !== 'signIn') throw new ConvexError('Admin accounts are configured by the owner. Public registration is unavailable.');
  const email = typeof params.email === 'string' ? params.email.trim().toLowerCase() : '';
  if (!email || email.length > 120) throw new ConvexError('Enter your admin ID.');
  return { email };
}
export function listingUrl(input: string) {
  if (input.length > 2048) throw new ConvexError('The listing link is too long.');
  let url: URL;
  try { url = new URL(input.trim()); } catch { throw new ConvexError('Paste a complete https:// property listing link.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || (url.port && !['80','443'].includes(url.port))) throw new ConvexError('Use a public HTTP or HTTPS property listing link.');
  if (/^(localhost|.*\.localhost|.*\.local|.*\.internal)$/i.test(url.hostname) || !url.hostname.includes('.')) throw new ConvexError('Use a public property website.');
  url.hash = '';
  const room = url.pathname.match(/^\/rooms\/(\d+)/);
  if (/^(www\.)?airbnb\.(com|co\.in|co\.uk|ca|com\.au|fr|de|es|it)$/.test(url.hostname) && room) {
    url.hostname = 'www.airbnb.com'; url.pathname = `/rooms/${room[1]}`; url.search = '';
  } else {
    for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key);
    url.searchParams.sort();
  }
  return url.toString();
}
