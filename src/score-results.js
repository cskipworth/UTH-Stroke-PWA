const EXAM_ANSWERS_KEY = 'examAnswers';
const EXAM_HISTORY_KEY = 'examHistory';
const EXAM_METADATA_KEY = 'examMetadata';
let currentExamID = null;
let isEditingExam = false;

/**
 * Initialize the score-results page with current exam data
 */
function initScoreResultsPage() {
  // Check if we're editing an existing exam or creating new
  const editingExamID = sessionStorage.getItem('editingExamID');
  
  let answers = {};
  let examHistory = getExamHistory();
  let currentExam = null;

  if (editingExamID) {
    // Load existing exam for editing
    isEditingExam = true;
    currentExam = examHistory.find(e => e.examID === editingExamID);
    if (!currentExam) {
      document.getElementById('exam-metadata').innerHTML = '<p>Exam not found. Please try again.</p>';
      return;
    }
    currentExamID = editingExamID;
    answers = currentExam.answers;
    sessionStorage.removeItem('editingExamID');
  } else {
    // New exam - use answers from the most recent exam in history
    isEditingExam = false;
    if (examHistory.length === 0) {
      document.getElementById('exam-metadata').innerHTML = '<p>No active exam found. Please complete an exam first.</p>';
      return;
    }
    
    currentExam = examHistory[examHistory.length - 1];
    answers = currentExam.answers || {};
    currentExamID = currentExam.examID;
  }

  // Load or initialize metadata for this exam
  const metadata = getExamMetadata(currentExamID) || {
    examDate: currentExam.completedAt ? formatDateTime(currentExam.completedAt) : new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('en-US', { hour12: false }),
    patientName: '',
    patientID: '',
    dateOfBirth: '',
    lastKnownWell: '',
    nihssScore: currentExam.totalScore || 0,
    modifiedRankin: '',
    interval: '0 (No Symptoms)',
    location: '',
    notes: ''
  };

  renderMetadataForm(metadata);
  renderAnswersTable(answers);
  initializeFormValidation();
  
  // Update button text if this is an update (editing existing exam)
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn && isEditingExam) {
    saveBtn.textContent = 'Update Exam Details';
  }
}

/**
 * Format ISO datetime string to readable format
 */
function formatDateTime(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Get answers from localStorage
 */
function getAnswersFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(EXAM_ANSWERS_KEY)) || {};
  } catch (e) {
    console.error('Failed to retrieve answers:', e);
    return {};
  }
}

/**
 * Get exam history from localStorage
 */
function getExamHistory() {
  try {
    return JSON.parse(localStorage.getItem(EXAM_HISTORY_KEY)) || [];
  } catch (e) {
    console.error('Failed to retrieve exam history:', e);
    return [];
  }
}

/**
 * Get metadata for a specific exam
 */
function getExamMetadata(examID) {
  try {
    const allMetadata = JSON.parse(localStorage.getItem(EXAM_METADATA_KEY)) || {};
    return allMetadata[examID] || null;
  } catch (e) {
    console.error('Failed to retrieve metadata:', e);
    return null;
  }
}

/**
 * Save metadata for a specific exam
 */
function saveExamMetadata(examID, metadata) {
  try {
    let allMetadata = JSON.parse(localStorage.getItem(EXAM_METADATA_KEY)) || {};
    allMetadata[examID] = metadata;
    localStorage.setItem(EXAM_METADATA_KEY, JSON.stringify(allMetadata));
  } catch (e) {
    console.error('Failed to save metadata:', e);
  }
}

/**
 * Render the editable metadata form
 */
function renderMetadataForm(metadata) {
  const form = document.getElementById('exam-metadata');
  form.innerHTML = `
    <div class="metadata-field">
      <label>Exam Date & Time:</label>
      <span class="metadata-value" id="examDate">${metadata.examDate}</span>
    </div>

    <div class="metadata-field">
      <label>Name:</label>
      <input type="text" class="editable-field" id="patientName" value="${metadata.patientName || ''}" placeholder="Enter patient name">
    </div>

    <div class="metadata-field">
      <label>ID #:</label>
      <input type="text" class="editable-field" id="patientID" value="${metadata.patientID || ''}" placeholder="Enter patient ID">
    </div>

    <div class="metadata-field">
      <label>DOB:</label>
      <input type="date" class="editable-field" id="dateOfBirth" value="${metadata.dateOfBirth || ''}">
    </div>

    <div class="metadata-field">
      <label>Last Known Well:</label>
      <input type="time" class="editable-field" id="lastKnownWell" value="${metadata.lastKnownWell || ''}">
    </div>

    <div class="metadata-field">
      <label>NIHSS Score:</label>
      <span class="score-display">
        <input type="number" class="editable-field score-input" id="nihssScore" min="0" max="42" value="${metadata.nihssScore || 0}">
        <span class="score-max"> / 42</span>
      </span>
      <div class="error-message" id="nihssScoreError" style="display: none; color: #d32f2f; font-size: 0.9em; margin-top: 0.25rem;">Invalid Score.</div>
    </div>

    <div class="metadata-field">
      <label>Modified Rankin Scale:</label>
      <input type="text" class="editable-field" id="modifiedRankin" value="${metadata.modifiedRankin || ''}" placeholder="(To be developed)">
    </div>

    <div class="metadata-field">
      <label>Interval:</label>
      <select class="editable-field" id="interval">
        <option value="0 (No Symptoms)" ${metadata.interval === '0 (No Symptoms)' ? 'selected' : ''}>0 (No Symptoms)</option>
        <option value="1 (No Significant Disability)" ${metadata.interval === '1 (No Significant Disability)' ? 'selected' : ''}>1 (No Significant Disability)</option>
        <option value="2 (Slight Disability)" ${metadata.interval === '2 (Slight Disability)' ? 'selected' : ''}>2 (Slight Disability)</option>
        <option value="3 (Moderate Disability)" ${metadata.interval === '3 (Moderate Disability)' ? 'selected' : ''}>3 (Moderate Disability)</option>
        <option value="4 (Moderately Severe Disability)" ${metadata.interval === '4 (Moderately Severe Disability)' ? 'selected' : ''}>4 (Moderately Severe Disability)</option>
        <option value="5 (Severe Disability)" ${metadata.interval === '5 (Severe Disability)' ? 'selected' : ''}>5 (Severe Disability)</option>
        <option value="6 (Death)" ${metadata.interval === '6 (Death)' ? 'selected' : ''}>6 (Death)</option>
      </select>
    </div>

    <div class="metadata-field">
      <label>Location:</label>
      <input type="text" class="editable-field location-input" id="location" value="${metadata.location || ''}" placeholder="Enter location">
    </div>

    <div class="metadata-field">
      <label>Notes:</label>
      <textarea class="editable-field notes-input" id="notes" placeholder="Enter notes">${metadata.notes || ''}</textarea>
    </div>
  `;
}

/**
 * Render the exam answers table with exam column and proper ordering
 */
function renderAnswersTable(answers) {
  const section = document.getElementById('exam-answers-table');
  
  if (!section) {
    console.error('exam-answers-table element not found');
    return;
  }
  
  if (Object.keys(answers).length === 0) {
    section.innerHTML = '<p>No answers recorded.</p>';
    return;
  }

  // Create ordered array of answers with question data
  const orderedAnswers = [];
  Object.entries(answers).forEach(([questionId, answer]) => {
    const examName = getExamFromQuestionId(questionId);
    orderedAnswers.push({
      id: questionId,
      exam: examName,
      number: extractQuestionNumber(questionId),
      title: getQuestionTitle(questionId),
      text: answer.text,
      points: answer.points,
      maxPoints: getMaxPoints(questionId),
      unReasonText: answer['un-reason-text'] || null
    });
  });

  // Sort by exam order and then by question number
  const examOrder = ['SPA-NIHSS', 'SPA-CN', 'SPA-Post-NIHSS', 'SPA-SQ'];
  orderedAnswers.sort((a, b) => {
    const examIndexA = examOrder.indexOf(a.exam);
    const examIndexB = examOrder.indexOf(b.exam);
    
    if (examIndexA !== examIndexB) {
      return examIndexA - examIndexB;
    }
    
    // Within same exam, sort by question number
    return compareQuestionNumbers(a.number, b.number);
  });

  // Build table
  let tableHTML = '<table class="exam-answers-table"><thead><tr><th>Exam</th><th>#</th><th>Title</th><th>Answer & Points</th></tr></thead><tbody>';
  
  orderedAnswers.forEach(answer => {
    const examDisplay = formatExamName(answer.exam);
    let answerCell = `${answer.text}; ${answer.points}/${answer.maxPoints}`;
    
    // Add UN reason text if it exists
    if (answer.unReasonText) {
      answerCell += `<br><span style="font-size: 0.9em; color: #555; margin-top: 0.25rem; display: block;"><em>Reason: ${answer.unReasonText}</em></span>`;
    }
    
    tableHTML += `
      <tr>
        <td class="exam-answers-table-exam">${examDisplay}</td>
        <td>${answer.number}</td>
        <td>${answer.title}</td>
        <td>${answerCell}</td>
      </tr>
    `;
  });

  tableHTML += '</tbody></table>';
  section.innerHTML = tableHTML;
  section.style.display = 'block';
}

/**
 * Extract question number from question ID
 */
function extractQuestionNumber(questionId) {
  // Extract the number part from question IDs like "Spanish-NIHSS1a", "CN10,11,12", etc.
  const match = questionId.match(/(\d+[a-zA-Z,]*)/);
  return match ? match[1] : questionId;
}

/**
 * Compare question numbers for proper sorting
 */
function compareQuestionNumbers(numA, numB) {
  // Parse out the base number and any suffixes
  const parseNum = (str) => {
    const match = str.match(/^(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };
  
  const baseA = parseNum(numA);
  const baseB = parseNum(numB);
  
  if (baseA !== baseB) return baseA - baseB;
  // If base numbers are same, do string comparison for suffixes (a, b, c, etc.)
  return numA.localeCompare(numB);
}

/**
 * Determine exam name from question ID using hardcoded mapping
 */
function getExamFromQuestionId(questionId) {
  const examMapping = {
    // NIHSS Questions
    'I1': 'SPA-NIHSS',
    'I2': 'SPA-NIHSS',
    'I3': 'SPA-NIHSS',
    '1a': 'SPA-NIHSS',
    '1b': 'SPA-NIHSS',
    '1c': 'SPA-NIHSS',
    '2: ': 'SPA-NIHSS',
    '3': 'SPA-NIHSS',
    '4': 'SPA-NIHSS',
    '5': 'SPA-NIHSS',
    '5a': 'SPA-NIHSS',
    '5b': 'SPA-NIHSS',
    '6a': 'SPA-NIHSS',
    '6b': 'SPA-NIHSS',
    '7': 'SPA-NIHSS',
    '8': 'SPA-NIHSS',
    '9': 'SPA-NIHSS',
    '10': 'SPA-NIHSS',
    '11': 'SPA-NIHSS',
    // CN Questions
    'CN10,11,12': 'SPA-CN',
    'CN11': 'SPA-CN',
    // Post-NIHSS Questions
    '12': 'SPA-Post-NIHSS',
    '13': 'SPA-Post-NIHSS',
    '14': 'SPA-Post-NIHSS',
    // SQ Questions
    'Spanish-SQ0': 'SPA-SQ',
    'Spanish-SQ1': 'SPA-SQ',
    'Spanish-SQ2A': 'SPA-SQ',
    'Spanish-SQ3A': 'SPA-SQ',
    'Spanish-SQ4': 'SPA-SQ',
    'Spanish-SQ5A': 'SPA-SQ',
    'Spanish-SQ6A': 'SPA-SQ',
    'Spanish-SQ7A': 'SPA-SQ',
    'Spanish-SQ8': 'SPA-SQ',
    'Spanish-SQ9': 'SPA-SQ'
  };
  
  return examMapping[questionId] || 'Unknown';
}

/**
 * Format exam name for display
 */
function formatExamName(examName) {
  const names = {
    'SPA-NIHSS': 'NIHSS',
    'SPA-CN': 'Cranial Nerves',
    'SPA-Post-NIHSS': 'Post-NIHSS',
    'SPA-SQ': 'Supplemental'
  };
  return names[examName] || examName;
}

/**
 * Get the question title by question ID and exam
 */
function getQuestionTitle(questionId, examName = '') {
  // Comprehensive hardcoded question title mappings from HTML files
  const allTitles = {
    // SPA-NIHSS Questions
    'I1': 'Introduction 1',
    'I2': 'Introduction 2',
    'I3': 'Introduction 3',
    '1a': 'Level of Consciousness',
    '1b': 'Level of Consciousness Questions',
    '1c': 'Level of Consciousness Commands',
    '2: ': 'Best Gaze',
    '3': 'Visual',
    '4': 'Facial Palsy',
    '5': 'Motor: Left Arm',
    '5a': 'Motor: Left Arm',
    '5b': 'Motor: Right Arm',
    '6a': 'Motor: Left Leg',
    '6b': 'Motor: Right Leg',
    '7': 'Limb Ataxia',
    '8': 'Sensory',
    '9': 'Best Language',
    '10': 'Dysarthria',
    '11': 'Extinction and Inattention',
    // SPA-CN Questions
    'CN10,11,12': 'CN 9, 10, 12',
    'CN11': 'CN 11',
    // SPA-Post-NIHSS Questions
    '12': 'Cough',
    '13': 'Dysphagia',
    '14': 'Gait/Trunk Ataxia and Limb Ataxia',
    // SPA-SQ Questions
    'Spanish-SQ0': 'SQ 0',
    'Spanish-SQ1': 'SQ 1 - Last Known Well',
    'Spanish-SQ2A': 'SQ 2 - Wake Up Stroke',
    'Spanish-SQ3A': 'SQ 3 - IVT Contraindications',
    'Spanish-SQ4': 'SQ 4',
    'Spanish-SQ5A': 'SQ 5',
    'Spanish-SQ6A': 'SQ 6',
    'Spanish-SQ7A': 'SQ 7',
    'Spanish-SQ8': 'SQ 8 - Other',
    'Spanish-SQ9': 'SQ 9'
  };

  return allTitles[questionId] || questionId;
}

/**
 * Get the maximum points for a question
 */
function getMaxPoints(questionId) {
  // Max points mapping for all questions
  const maxPoints = {
    // NIHSS Questions
    'I1': 0,
    'I2': 0,
    'I3': 0,
    '1a': 3,
    '1b': 3,
    '1c': 3,
    '2: ': 2,
    '3': 3,
    '4': 3,
    '5': 4,
    '5a': 4,
    '5b': 4,
    '6a': 4,
    '6b': 4,
    '7': 2,
    '8': 2,
    '9': 3,
    '10': 2,
    '11': 2,
    // CN Questions
    'CN10,11,12': 1,
    'CN11': 1,
    // Post-NIHSS Questions
    '12': 5,
    '13': 4,
    '14': 3,
    // SQ Questions
    'Spanish-SQ0': 0,
    'Spanish-SQ1': 0,
    'Spanish-SQ2A': 0,
    'Spanish-SQ3A': 0,
    'Spanish-SQ4': 0,
    'Spanish-SQ5A': 0,
    'Spanish-SQ6A': 0,
    'Spanish-SQ7A': 0,
    'Spanish-SQ8': 0,
    'Spanish-SQ9': 0
  };
  return maxPoints[questionId] || 1;
}

/**
 * Edit exam responses: Store exam ID and navigate back to NIHSS page
 */
function editExamResponses() {
  if (!currentExamID) {
    alert('No active exam found.');
    return;
  }
  
  // Get the exam from history and restore its answers to localStorage
  try {
    const examHistory = getExamHistory();
    const exam = examHistory.find(e => e.examID === currentExamID);
    
    if (exam && exam.answers) {
      // Restore answers to localStorage so exam pages can use them
      localStorage.setItem(EXAM_ANSWERS_KEY, JSON.stringify(exam.answers));
    }
  } catch (e) {
    console.error('Failed to restore answers for editing:', e);
  }
  
  // Store exam ID in sessionStorage so exam pages know we're editing
  sessionStorage.setItem('editingExamID', currentExamID);
  
  // Navigate to SPA-NIHSS to edit responses
  window.location.href = './Spanish-Pages/SPA-NIHSS.html';
}

/**
 * Finalize and save exam details
 */
function finalizeAndSaveExam() {
  if (!currentExamID) {
    alert('No active exam found.');
    return;
  }

  // Collect all metadata from form
  const metadata = {
    examDate: document.getElementById('examDate').textContent,
    patientName: document.getElementById('patientName').value,
    patientID: document.getElementById('patientID').value,
    dateOfBirth: document.getElementById('dateOfBirth').value,
    lastKnownWell: document.getElementById('lastKnownWell').value,
    nihssScore: parseInt(document.getElementById('nihssScore').value) || 0,
    modifiedRankin: document.getElementById('modifiedRankin').value,
    interval: document.getElementById('interval').value,
    location: document.getElementById('location').value,
    notes: document.getElementById('notes').value
  };

  // Save metadata
  saveExamMetadata(currentExamID, metadata);

  // Clear current exam answers from storage (only if new exam, not editing)
  const isEditing = sessionStorage.getItem('editingExamID');
  if (!isEditing) {
    try {
      localStorage.removeItem(EXAM_ANSWERS_KEY);
    } catch (e) {
      console.error('Failed to clear answers:', e);
    }
  }

  const message = isEditingExam ? 'Exam details updated successfully!' : 'Exam details saved successfully!';
  alert(message);
  window.location.href = './Saved-Scores.html';
}

/**
 * Initialize form validation for metadata fields
 */
function initializeFormValidation() {
  // ID # field - only allow alphanumeric characters (text and numbers)
  const idField = document.getElementById('patientID');
  if (idField) {
    idField.addEventListener('input', (e) => {
      // Remove any non-alphanumeric characters
      e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
    });
  }
  
  // Date of Birth field - don't allow future dates
  const dobField = document.getElementById('dateOfBirth');
  if (dobField) {
    // Set max date to today
    const today = new Date().toISOString().split('T')[0];
    dobField.max = today;
  }
  
  // NIHSS Score field - max 42 with error message
  const nihssField = document.getElementById('nihssScore');
  const nihssError = document.getElementById('nihssScoreError');
  if (nihssField) {
    nihssField.addEventListener('input', (e) => {
      const value = parseInt(e.target.value, 10);
      
      if (value > 42) {
        nihssField.classList.add('error-input');
        if (nihssError) {
          nihssError.style.display = 'block';
        }
      } else {
        nihssField.classList.remove('error-input');
        if (nihssError) {
          nihssError.style.display = 'none';
        }
      }
    });
  }
}

// Initialize the page when DOM is ready
document.addEventListener('DOMContentLoaded', initScoreResultsPage);
