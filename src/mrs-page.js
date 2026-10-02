document.addEventListener('DOMContentLoaded', function () {
  try {
    if (typeof renderMRSDropdown === 'function' && typeof getCurrentMetadataModifiedRankinValue === 'function') {
      renderMRSDropdown('mrs-dropdown-container', getCurrentMetadataModifiedRankinValue());
    }
  } catch (e) {
    console.error('mrs-page init failed', e);
  }
});
