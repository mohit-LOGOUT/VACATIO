const frame = document.getElementById('sandbox-frame');
const params = new URLSearchParams(location.hash.slice(1));
const session = params.get('session');
if (session && /^[a-f0-9]{64}$/.test(session)) {
  localStorage.setItem('hermes-session', session);
  history.replaceState(null, '', location.pathname + location.search + '#test-hermes');
  frame.src = '/sandbox.html';
  document.getElementById('test-hermes').scrollIntoView();
}
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== 'hermes-height') return;
  const height = event.data.height;
  if (typeof height === 'number' && Number.isFinite(height) && height >= 300 && height <= 6000) frame.style.height = `${Math.ceil(height)}px`;
});
