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

// Swipe-to-go-back functionality for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, false);

document.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, false);

function handleSwipe() {
  const swipeThreshold = 75; // minimum distance in pixels for a swipe
  const swipeDistance = touchStartX - touchEndX;
  
  // Left swipe (touchStartX > touchEndX, moving from right to left)
  if (swipeDistance > swipeThreshold) {
    history.back();
  }
}
