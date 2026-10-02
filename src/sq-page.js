// Initialize the missing entries display when the page loads (used on SQ pages)
function initMissingEntries() {
  try {
    if (typeof updateMissingEntriesDisplay === 'function') {
      updateMissingEntriesDisplay();
      return true;
    }
  } catch (e) {
    console.error('initMissingEntries error', e);
  }
  return false;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    if (!initMissingEntries()) {
      setTimeout(initMissingEntries, 100);
    }
  });
} else {
  if (!initMissingEntries()) {
    setTimeout(initMissingEntries, 100);
  }
}
