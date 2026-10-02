const EXAM_METADATA_KEY = 'examMetadata';
const MRS_STORAGE_KEY = 'selectedModifiedRankin';
const MRS_OPTIONS = [
  { value: '0 (No Symptoms At All)', label: '0 (No Symptoms At All)' },
  { value: '1 (No Significant Disability)', label: '1 (No Significant Disability)' },
  { value: '2 (Slight Disability)', label: '2 (Slight Disability)' },
  { value: '3 (Moderate Disability)', label: '3 (Moderate Disability)' },
  { value: '4 (Moderately Severe Disability)', label: '4 (Moderately Severe Disability)' },
  { value: '5 (Severe Disability)', label: '5 (Severe Disability)' },
  { value: '6 (Dead)', label: '6 (Dead)' }
];

const MRS_VALUE_TO_RESULT = {
  '0 (No Symptoms At All)': 'result-0',
  '1 (No Significant Disability)': 'result-1',
  '2 (Slight Disability)': 'result-2',
  '3 (Moderate Disability)': 'result-3',
  '4 (Moderately Severe Disability)': 'result-4',
  '5 (Severe Disability)': 'result-5',
  '6 (Dead)': 'result-6'
};

function normalizeModifiedRankinValue(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const normalizeMap = {
    '0 (No Symptoms at All)': '0 (No Symptoms At All)',
    '0 (No Symptoms At All)': '0 (No Symptoms At All)',
    '1 (No Significant Disability)': '1 (No Significant Disability)',
    '2 (Slight Disability)': '2 (Slight Disability)',
    '3 (Moderate Disability)': '3 (Moderate Disability)',
    '4 (Moderately Severe Disability)': '4 (Moderately Severe Disability)',
    '5 (Severe Disability)': '5 (Severe Disability)',
    '6 (Dead)': '6 (Dead)'
  };

  const canonical = normalizeMap[trimmed];
  if (canonical) {
    return canonical;
  }

  const matchedOption = MRS_OPTIONS.find((option) => option.value.toLowerCase() === trimmed.toLowerCase());
  return matchedOption ? matchedOption.value : trimmed;
}

function getCurrentModifiedRankinValue() {
  try {
    const rawValue = localStorage.getItem(MRS_STORAGE_KEY);
    return normalizeModifiedRankinValue(rawValue || '');
  } catch (error) {
    console.error('Failed to read Modified Rankin value:', error);
    return '';
  }
}

function setCurrentModifiedRankinValue(value) {
  const normalizedValue = normalizeModifiedRankinValue(value);

  try {
    if (normalizedValue) {
      localStorage.setItem(MRS_STORAGE_KEY, normalizedValue);
    } else {
      localStorage.removeItem(MRS_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to persist Modified Rankin value:', error);
  }

  return normalizedValue;
}

function getCurrentMetadataModifiedRankinValue() {
  try {
    const rawMetadata = JSON.parse(localStorage.getItem(EXAM_METADATA_KEY) || '{}');
    const currentExamId = sessionStorage.getItem('currentExamID') || sessionStorage.getItem('editingExamID');

    if (currentExamId && rawMetadata[currentExamId]?.modifiedRankin) {
      return normalizeModifiedRankinValue(rawMetadata[currentExamId].modifiedRankin);
    }

    const lastExamId = Object.keys(rawMetadata).at(-1);
    if (lastExamId && rawMetadata[lastExamId]?.modifiedRankin) {
      return normalizeModifiedRankinValue(rawMetadata[lastExamId].modifiedRankin);
    }

    return getCurrentModifiedRankinValue();
  } catch (error) {
    console.error('Failed to read metadata Modified Rankin value:', error);
    return getCurrentModifiedRankinValue();
  }
}

function updateCurrentMetadataModifiedRankin(value) {
  const normalizedValue = normalizeModifiedRankinValue(value);
  if (!normalizedValue) {
    return '';
  }

  try {
    const metadata = JSON.parse(localStorage.getItem(EXAM_METADATA_KEY) || '{}');
    const currentExamId = sessionStorage.getItem('currentExamID') || sessionStorage.getItem('editingExamID') || 'current';
    metadata[currentExamId] = {
      ...(metadata[currentExamId] || {}),
      modifiedRankin: normalizedValue
    };
    localStorage.setItem(EXAM_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Failed to update metadata Modified Rankin value:', error);
  }

  return setCurrentModifiedRankinValue(normalizedValue);
}

function syncQuizFromDropdown(value) {
  const normalizedValue = normalizeModifiedRankinValue(value);
  const resultKey = MRS_VALUE_TO_RESULT[normalizedValue];

  if (!resultKey || typeof window.renderStep !== 'function') {
    return;
  }

  window.renderStep(resultKey);
}

function renderMRSDropdown(containerId = 'mrs-dropdown-container', selectedValue = getCurrentMetadataModifiedRankinValue()) {
  const container = document.getElementById(containerId);
  if (!container) {
    return null;
  }

  const actualValue = normalizeModifiedRankinValue(selectedValue);

  container.innerHTML = `
    <div class="metadata-field">
      <select class="editable-field" id="modifiedRankin" aria-label="Modified Rankin Scale" ${actualValue ? '' : 'required'}>
        <option value="" ${!actualValue ? 'selected disabled hidden' : ''}>Choose a score</option>
        ${MRS_OPTIONS.map((option) => `
          <option value="${option.value}" ${option.value === actualValue ? 'selected' : ''}>${option.label}</option>
        `).join('')}
      </select>
    </div>
  `;

  const select = container.querySelector('#modifiedRankin');
  if (select) {
    select.addEventListener('change', (event) => {
      const selected = event.target.value;
      const nextValue = setCurrentModifiedRankinValue(selected);
      if (nextValue && typeof window.updateCurrentMetadataModifiedRankin === 'function') {
        window.updateCurrentMetadataModifiedRankin(nextValue);
      }

      if (nextValue && typeof window.renderStep === 'function') {
        syncQuizFromDropdown(nextValue);
      }
    });
  }

  return select;
}

window.MRS_OPTIONS = MRS_OPTIONS;
window.getCurrentModifiedRankinValue = getCurrentModifiedRankinValue;
window.setCurrentModifiedRankinValue = setCurrentModifiedRankinValue;
window.getCurrentMetadataModifiedRankinValue = getCurrentMetadataModifiedRankinValue;
window.updateCurrentMetadataModifiedRankin = updateCurrentMetadataModifiedRankin;
window.renderMRSDropdown = renderMRSDropdown;
window.normalizeModifiedRankinValue = normalizeModifiedRankinValue;
window.MRS_VALUE_TO_RESULT = MRS_VALUE_TO_RESULT;
window.syncQuizFromDropdown = syncQuizFromDropdown;