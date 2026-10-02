// Helper wrappers used on Saved-Scores page
function getExamHistory() {
  try {
    return JSON.parse(localStorage.getItem('examHistory')) || [];
  } catch (e) {
    console.error('Failed to retrieve exam history:', e);
    return [];
  }
}

function formatDate(isoString) {
  try { return formatDateForDisplay(isoString); } catch (e) { return isoString; }
}

function formatExamName(examName) {
  try { return formatExamNameForDisplay(examName); } catch (e) { return examName; }
}

function viewExamDetails(examID) {
  const history = getExamHistory();
  const exam = history.find(e => e.examID === examID);
  if (!exam) { alert('Exam not found'); return; }

  const allMetadata = JSON.parse(localStorage.getItem('examMetadata')) || {};
  const metadata = allMetadata[examID] || {};

  let details = `
    <h2>${formatExamName(exam.examName)}</h2>
    <p><strong>Completed:</strong> ${formatDate(exam.completedAt)}</p>
    <p><strong>Exam ID:</strong> ${exam.examID}</p>
    <p><strong>Total Score:</strong> <span style="font-size: 1.3em; color: #2b8a3e; font-weight: bold;">${exam.totalScore}</span></p>
  `;

  if (Object.keys(metadata).length > 0) {
    details += '<h3>Exam Details:</h3>';
    if (metadata.patientName) details += `<p><strong>Name:</strong> ${metadata.patientName}</p>`;
    if (metadata.patientID) details += `<p><strong>ID #:</strong> ${metadata.patientID}</p>`;
    if (metadata.dateOfBirth) details += `<p><strong>DOB:</strong> ${metadata.dateOfBirth}</p>`;
    if (metadata.lastKnownWell) details += `<p><strong>Last Known Well:</strong> ${metadata.lastKnownWell}</p>`;
    if (metadata.nihssScore) details += `<p><strong>NIHSS Score:</strong> ${metadata.nihssScore} / 42</p>`;
    if (metadata.modifiedRankin) details += `<p><strong>Modified Rankin:</strong> ${metadata.modifiedRankin}</p>`;
    if (metadata.interval) details += `<p><strong>Interval:</strong> ${metadata.interval}</p>`;
    if (metadata.location) details += `<p><strong>Location:</strong> ${metadata.location}</p>`;
    if (metadata.notes) details += `<p><strong>Notes:</strong> ${metadata.notes}</p>`;
  }

  details += `<h3>Answers Breakdown:</h3><div class="answer-breakdown">`;

  if (exam.answers && Object.keys(exam.answers).length > 0) {
    const questionOrder = ['1a','1b','1c','2','3','4','5','5b','6a','6b','7','8','9','10','11','12','13','14'];
    const sortedAnswers = [];
    questionOrder.forEach(qId => { if (exam.answers[qId]) sortedAnswers.push([qId, exam.answers[qId]]); });
    Object.entries(exam.answers).forEach(([qId, answer]) => { if (!sortedAnswers.find(([id])=>id===qId)) sortedAnswers.push([qId, answer]); });

    sortedAnswers.forEach(([questionId, answer]) => {
      const questionTitle = getQuestionTitle(questionId);
      let answerDetail = `<em>Answer: ${answer.text}</em>`;
      if (answer['un-reason-text']) answerDetail += `<br><span style="font-size: 0.9em; color: #555; margin-top: 0.25rem; display: block;"><em>Reason: ${answer['un-reason-text']}</em></span>`;
      details += `
        <div class="answer-item">
          <strong>${questionTitle}</strong><br>
          ${answer.points} point${answer.points !== 1 ? 's' : ''}<br>
          ${answerDetail}
        </div>
      `;
    });
  } else {
    details += '<p>No answers recorded for this exam.</p>';
  }

  details += '</div>';

  const modal = document.createElement('div');
  modal.id = 'exam-details-modal';
  modal.className = 'exam-details-modal';
  const modalContent = document.createElement('div');
  modalContent.className = 'exam-details-modal-content';
  modalContent.innerHTML = `
    ${details}
    <div class="modal-button-container">
      <button class="modal-button modal-close-btn" onclick="document.getElementById('exam-details-modal').remove()">Close</button>
      <button class="modal-button modal-edit-btn" onclick="editExam('${examID}')">Edit</button>
      <button class="modal-button modal-delete-btn" onclick="deleteExam('${examID}')">Delete Exam</button>
    </div>
  `;
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

function deleteExam(examID) {
  if (!confirm('Are you sure you want to delete this exam record?')) return;
  try {
    let history = JSON.parse(localStorage.getItem('examHistory')) || [];
    history = history.filter(exam => exam.examID !== examID);
    localStorage.setItem('examHistory', JSON.stringify(history));
    const modal = document.getElementById('exam-details-modal'); if (modal) modal.remove();
    renderScores();
  } catch (e) { console.error('Failed to delete exam:', e); alert('Failed to delete exam'); }
}

function editExam(examID) {
  try { sessionStorage.setItem('editingExamID', examID); window.location.href = './score-results.html'; }
  catch (e) { console.error('Failed to open exam for editing:', e); alert('Failed to open exam for editing'); }
}

function clearAllHistory() {
  if (!confirm('Are you sure you want to delete ALL exam records? This cannot be undone.')) return;
  try { localStorage.removeItem('examHistory'); renderScores(); } catch (e) { console.error('Failed to clear history:', e); alert('Failed to clear history'); }
}

function generateExamShareText(examID) {
  const history = getExamHistory();
  const exam = history.find(e => e.examID === examID);
  if (!exam) return '';
  const allMetadata = JSON.parse(localStorage.getItem('examMetadata')) || {};
  const metadata = allMetadata[examID] || {};
  return generateShareText(exam, metadata);
}

function shareExamFromList(examID) { const text = generateExamShareText(examID); openShareModal(text, examID); }
function shareExamFromModal(examID) { const text = generateExamShareText(examID); openShareModal(text, examID); }

function openShareModal(text, examID) {
  const modal = document.createElement('div'); modal.className = 'share-modal-overlay'; modal.id = 'share-results-modal';
  const content = document.createElement('div'); content.className = 'share-modal-content';
  content.innerHTML = `
    <div class="share-modal-header">
      <h3>Share Exam Results</h3>
      <button class="share-modal-close" onclick="document.getElementById('share-results-modal').remove()">✕</button>
    </div>
    <div class="share-modal-text">${text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
    <div class="share-modal-actions">
      <button class="share-modal-btn" onclick="copyShareText('${examID}')">Copy to Clipboard</button>
      <button class="share-modal-btn" onclick="downloadShareText('${examID}')">Download as Text</button>
      <button class="share-modal-btn share-modal-close-btn" onclick="document.getElementById('share-results-modal').remove()">Close</button>
    </div>
  `;
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  modal.appendChild(content); document.body.appendChild(modal);
}

function copyShareText(examID) {
  const text = generateExamShareText(examID);
  copyToClipboard(text).then(()=>{ alert('Results copied to clipboard!'); }).catch(err=>{ console.error('Failed to copy:', err); alert('Failed to copy to clipboard'); });
}

function downloadShareText(examID) {
  const text = generateExamShareText(examID);
  downloadTextAsFile(text, `stroke-assessment-${examID}.txt`);
}

function renderScores() {
  const history = getExamHistory();
  const scoresList = document.getElementById('scores-list');
  const noScoresMessage = document.getElementById('no-scores-message');
  if (!scoresList || !noScoresMessage) return;
  if (history.length === 0) { scoresList.style.display='none'; noScoresMessage.style.display='block'; return; }
  noScoresMessage.style.display='none'; scoresList.style.display='block';
  const sorted = [...history].sort((a,b)=> new Date(b.completedAt)-new Date(a.completedAt));
  let html = '<table class="scores-table'><html>';
  html = '<table class="scores-table">\n';
  html += `\n<thead><tr><th>Exam</th><th>Score</th><th>Date</th><th>Action</th></tr></thead><tbody>`;
  sorted.forEach(exam=>{
    html += `\n<tr>\n<td class="scores-table-exam-name">${formatExamName(exam.examName)}</td>\n<td class="scores-table-score">${exam.totalScore}</td>\n<td class="scores-table-date">${formatDate(exam.completedAt)}</td>\n<td class="scores-table-action">\n<button class="view-exam-btn" onclick="viewExamDetails('${exam.examID}')">View</button>\n<button class="share-exam-btn" onclick="shareExamFromList('${exam.examID}')">Share</button>\n</td>\n</tr>`;
  });
  html += `\n</tbody></table><div class="clear-history-container"><button class="clear-history-btn" onclick="clearAllHistory()">Clear All History</button></div>`;
  scoresList.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', renderScores);
