// Register the service worker and update the UI with status.
const statusEl = document.getElementById('sw-status');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      statusEl.textContent = `Service worker: registered (scope: ${reg.scope})`;
      console.log('Service worker registered:', reg);
    } catch (err) {
      statusEl.textContent = 'Service worker: registration failed';
      console.error('Service worker registration failed:', err);
    }
  });
} else {
  statusEl.textContent = 'Service worker: unsupported in this browser';
}
