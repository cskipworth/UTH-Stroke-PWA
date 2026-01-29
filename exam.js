const carousel = document.getElementById('examSlides');
const slides = document.querySelectorAll('.slide');
const buttons = document.querySelectorAll('.option-btn');
const debugInfo = document.getElementById('debug-info');
const totalScoreDisplay = document.querySelectorAll('.total-score');

let totalScore = 0; 
// Map of scores per question so each slide's points are retained and updatable
const quizScores = {};

// Store current exam name for answer tracking
let currentExamName = '';

// LocalStorage keys for exam answers
const EXAM_ANSWERS_KEY = 'examAnswers';
const EXAM_HISTORY_KEY = 'examHistory';

/**
 * Detect current exam name from page URL
 * @returns {string} The exam name (e.g., "SPA-NIHSS", "SPA-CN", "SPA-Post-NIHSS", "SPA-SQ")
 */
function detectCurrentExamName() {
  const url = window.location.pathname.toLowerCase();
  
  if (url.includes('nihss')) {
    return 'SPA-NIHSS';
  } else if (url.includes('cn') && url.includes('spanish')) {
    return 'SPA-CN';
  } else if (url.includes('post-nihss')) {
    return 'SPA-Post-NIHSS';
  } else if (url.includes('sq')) {
    return 'SPA-SQ';
  }
  
  return ''; // Unknown exam
}

/**
 * Generate a unique examID for tracking completed exams
 * @returns {string} Unique exam ID with timestamp and random component
 */
function generateExamID() {
    return `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save answer to localStorage with data-points and button text
 * @param {string} questionId - The question ID (data-question-id)
 * @param {number} points - The data-points value
 * @param {string} answerText - The text content of the selected button
 * @param {string} examName - The name of the current exam (optional, uses global if available)
 * @param {string} unReasonText - The explanation text for UN (Untestable) selections (optional)
 */
function saveAnswerToStorage(questionId, points, answerText, examName = currentExamName, unReasonText = null) {
    try {
        let answers = JSON.parse(localStorage.getItem(EXAM_ANSWERS_KEY)) || {};
        // Preserve existing UN reason text when updating an answer
        const existingUnText = answers[questionId] ? answers[questionId]['un-reason-text'] : null;
        answers[questionId] = {
            points: points,
            text: answerText,
            timestamp: new Date().toISOString(),
            exam: examName
        };
        // Add UN reason text if provided, otherwise preserve existing
        if (unReasonText !== null) {
            answers[questionId]['un-reason-text'] = unReasonText;
        } else if (existingUnText) {
            answers[questionId]['un-reason-text'] = existingUnText;
        }
        localStorage.setItem(EXAM_ANSWERS_KEY, JSON.stringify(answers));
    } catch (e) {
        console.error('Failed to save answer to localStorage:', e);
    }
}

/**
 * Retrieve all saved answers from localStorage
 * @returns {Object} Object with questionId as key and {points, text, timestamp} as value
 */
function getAnswersFromStorage() {
    try {
        return JSON.parse(localStorage.getItem(EXAM_ANSWERS_KEY)) || {};
    } catch (e) {
        console.error('Failed to retrieve answers from localStorage:', e);
        return {};
    }
}

/**
 * Save completed exam to history with examID
 * @param {string} examName - Name/type of the exam (e.g., "SPA-NIHSS", "SPA-SQ")
 * @returns {string} The examID assigned to this completed exam
 */
function saveExamToHistory(examName) {
    try {
        const examID = generateExamID();
        const answers = getAnswersFromStorage();
        
        // Calculate total score
        const totalPoints = Object.values(answers).reduce((sum, answer) => sum + answer.points, 0);
        
        // Create exam record
        const examRecord = {
            examID: examID,
            examName: examName,
            completedAt: new Date().toISOString(),
            totalScore: totalPoints,
            answers: answers
        };
        
        // Add to history
        let history = JSON.parse(localStorage.getItem(EXAM_HISTORY_KEY)) || [];
        history.push(examRecord);
        localStorage.setItem(EXAM_HISTORY_KEY, JSON.stringify(history));
        
        return examID;
    } catch (e) {
        console.error('Failed to save exam to history:', e);
        return null;
    }
}

/**
 * Update an existing exam in history with new answers
 * @param {string} examID - The exam ID to update
 * @param {string} examName - Name/type of the exam (e.g., "SPA-NIHSS", "SPA-SQ")
 * @returns {string} The examID of the updated exam
 */
function updateExamInHistory(examID, examName) {
    try {
        const answers = getAnswersFromStorage();
        
        // Calculate total score
        const totalPoints = Object.values(answers).reduce((sum, answer) => sum + answer.points, 0);
        
        // Get history and find the exam to update
        let history = JSON.parse(localStorage.getItem(EXAM_HISTORY_KEY)) || [];
        const examIndex = history.findIndex(e => e.examID === examID);
        
        if (examIndex === -1) {
            console.error('Exam not found in history:', examID);
            return null;
        }
        
        // Update the exam record
        history[examIndex] = {
            examID: examID,
            examName: examName,
            completedAt: new Date().toISOString(),
            totalScore: totalPoints,
            answers: answers
        };
        
        localStorage.setItem(EXAM_HISTORY_KEY, JSON.stringify(history));
        
        return examID;
    } catch (e) {
        console.error('Failed to update exam in history:', e);
        return null;
    }
}

/**
 * Get all completed exams from history
 * @returns {Array} Array of exam records
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
 * Get a specific exam from history by examID
 * @param {string} examID - The exam ID to retrieve
 * @returns {Object|null} Exam record or null if not found
 */
function getExamByID(examID) {
    try {
        const history = getExamHistory();
        return history.find(exam => exam.examID === examID) || null;
    } catch (e) {
        console.error('Failed to retrieve exam by ID:', e);
        return null;
    }
}

/**
 * Get answer for a specific question
 * @param {string} questionId - The question ID
 * @returns {Object|null} Answer object {points, text, timestamp} or null if not found
 */
function getAnswerForQuestion(questionId) {
    const answers = getAnswersFromStorage();
    return answers[questionId] || null;
}

/**
 * Clear all saved answers from localStorage
 */
function clearAnswersFromStorage() {
    try {
        localStorage.removeItem(EXAM_ANSWERS_KEY);
    } catch (e) {
        console.error('Failed to clear answers from localStorage:', e);
    }
}

/**
 * Complete exam: Save to history, then clear current answers and navigate
 * @param {string} examName - Name/type of the exam (e.g., "SPA-NIHSS", "SPA-SQ")
 * @param {string} redirectUrl - URL to redirect to after completing exam (default: score-results page)
 */
function completeExam(examName, redirectUrl = '../../score-results.html') {
    try {
        // Set current exam name for answer tracking
        currentExamName = examName;
        
        // Check if we're editing an existing exam
        const editingExamID = sessionStorage.getItem('editingExamID');
        let examID;
        
        if (editingExamID) {
            // Update existing exam
            examID = updateExamInHistory(editingExamID, examName);
            // Don't remove editingExamID from sessionStorage yet - it will be removed when we return to score-results
        } else {
            // Save current exam answers to history with new examID
            examID = saveExamToHistory(examName);
        }
        
        if (!examID) {
            console.error('Failed to save exam to history');
            return;
        }
        
        // Clear current answers from localStorage to refresh exam pages
        clearAnswersFromStorage();
        
        // Reset quiz scores in memory
        Object.keys(quizScores).forEach(key => delete quizScores[key]);
        totalScore = 0;
        
        // Navigate to results page
        window.location.href = redirectUrl;
    } catch (e) {
        console.error('Failed to complete exam:', e);
    }
}
// Navigation Function - No longer needed with scrollable layout
// Users can now scroll naturally through the content instead of using buttons

function adjustCarouselHeight() {
    // no-op in single-page layout
    return;
}

function optionsListener() {
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const clicked = e.currentTarget;
            const parentTile = clicked.closest('.slide');

            // Use per-slide storage (quizScores) keyed by data-question-id so
            // each slide's points are retained and the total can be updated
            const questionId = parentTile && parentTile.dataset ? parentTile.dataset.questionId : null;
            const newPoints = parseInt(clicked.getAttribute('data-points'), 10) || 0;
            const answerText = clicked.textContent.trim();

            // Clear other option UI for this slide
            const options = parentTile.querySelectorAll('.option-btn');
            options.forEach(btn => {
                btn.classList.remove('selected');
                btn.disabled = false;
            });

            // Handle UN (Untestable) explanation inputs visibility
            const unInputs = parentTile.querySelectorAll('.un-explanation-input');
            const unDoneButtons = parentTile.querySelectorAll('.un-done-btn');
            const isUNSelected = clicked.getAttribute('data-points') === 'UN';
            let unReasonText = null;
            unInputs.forEach(input => {
                const unQuestion = input.getAttribute('data-un-question');
                const doneBtn = parentTile.querySelector(`.un-done-btn[data-un-question="${unQuestion}"]`);
                
                if (isUNSelected && unQuestion === clicked.getAttribute('data-un-question')) {
                    input.style.display = 'block';
                    if (doneBtn) doneBtn.style.display = 'block';
                    
                    // Restore UN text from localStorage if it exists
                    const answers = getAnswersFromStorage();
                    if (answers[questionId] && answers[questionId]['un-reason-text']) {
                        input.value = answers[questionId]['un-reason-text'];
                    }
                    
                    // Only add listeners if they haven't been added yet (check for data attribute)
                    if (!doneBtn || !doneBtn.dataset.listenerAdded) {
                        // Add change listener to textarea
                        input.addEventListener('input', (e) => {
                            unReasonText = e.target.value;
                        });
                        
                        // Add click listener to Done/Edit button
                        if (doneBtn) {
                            doneBtn.dataset.listenerAdded = 'true';
                            doneBtn.addEventListener('click', (e) => {
                                e.preventDefault();
                                
                                // Toggle between Done and Edit states
                                const isCurrentlyEditing = doneBtn.innerText === 'Done';
                                
                                if (isCurrentlyEditing) {
                                    // User clicked "Done" - save and lock textarea
                                    unReasonText = input.value;
                                    if (questionId) {
                                        let answers = JSON.parse(localStorage.getItem(EXAM_ANSWERS_KEY)) || {};
                                        if (answers[questionId]) {
                                            answers[questionId]['un-reason-text'] = unReasonText;
                                            localStorage.setItem(EXAM_ANSWERS_KEY, JSON.stringify(answers));
                                            // Refresh results display to show the newly saved UN reason text
                                            updateResultsBreakdownAlways();
                                        }
                                    }
                                    // Lock textarea and change button
                                    input.readOnly = true;
                                    doneBtn.innerText = 'Edit';
                                } else {
                                    // User clicked "Edit" - unlock textarea
                                    input.readOnly = false;
                                    input.focus();
                                    doneBtn.innerText = 'Done';
                                }
                            });
                        }
                    }
                } else {
                    input.style.display = 'none';
                    if (doneBtn) doneBtn.style.display = 'none';
                    input.value = ''; // Clear the input when hidden
                    input.readOnly = false; // Reset to editable when hidden
                    if (doneBtn) doneBtn.innerText = 'Done'; // Reset button text
                }
            });

            // Store/update the score for this question
            const prevPoints = questionId ? (quizScores[questionId] || 0) : 0;
            if (questionId) quizScores[questionId] = newPoints;

            // Save answer to localStorage with both points and text
            if (questionId) {
                saveAnswerToStorage(questionId, newPoints, answerText);
            }

            // Recalculate totalScore as delta (keeps existing external uses intact)
            totalScore = totalScore - prevPoints + newPoints;

            // Update clicked button UI
            clicked.classList.add('selected');
            clicked.disabled = true;

            // Mark the question as answered and update displays
            if (parentTile) parentTile.classList.add('answered');
            updateScoreDisplays();
            updateNavButtons();
        });
    });
}

function updateScoreDisplays() {
    if (!totalScoreDisplay) return;
    totalScoreDisplay.forEach(el => {
        if (el) el.innerText = totalScore;
    });
    // Always update the results breakdown
    updateResultsBreakdownAlways();
}

function renderResultsBreakdown(resultsSlide) {
    if (!resultsSlide) return;

    // Find or create the breakdown container placed under the total score paragraph
    let breakdown = resultsSlide.querySelector('.results-breakdown');
    if (!breakdown) {
        breakdown = document.createElement('div');
        breakdown.className = 'results-breakdown';
        // Put it after the paragraph that contains the total-score
        const scorePara = resultsSlide.querySelector('p');
        if (scorePara && scorePara.parentNode) {
            scorePara.parentNode.insertBefore(breakdown, scorePara.nextSibling);
        } else {
            resultsSlide.appendChild(breakdown);
        }
    }

    // Build lines in order of slides (excluding the results slide)
    const lines = [];
    slides.forEach(slide => {
        const qid = slide.dataset ? slide.dataset.questionId : null;
        if (!qid || qid === 'results') return;
        // Skip slides that have no option buttons (content-only slides)
        const optionBtns = slide.querySelectorAll('.option-btn');
        if (!optionBtns || optionBtns.length === 0) return;
        const titleEl = slide.querySelector('h2');
        const title = titleEl ? titleEl.innerText.trim() : `Question ${qid}`;
        const pts = quizScores[qid] !== undefined ? quizScores[qid] : 0;
        lines.push(`<div><strong>${title}</strong>: ${pts} points</div>`);
    });

    breakdown.innerHTML = lines.join('\n');
}

/**
 * Always render results breakdown to the score-board for persistent visibility
 */
function updateResultsBreakdownAlways() {
    // Find the score-board element
    const scoreBoard = document.querySelector('.score-board');
    if (!scoreBoard) return;

    // Find or create the breakdown container right after the score board
    let breakdown = scoreBoard.querySelector('.results-breakdown');
    if (!breakdown) {
        breakdown = document.createElement('div');
        breakdown.className = 'results-breakdown';
        scoreBoard.appendChild(breakdown);
    }

    // Get current answers to access UN reason text
    const answers = getAnswersFromStorage();

    // Build lines in order of slides (excluding the results slide)
    const lines = [];
    slides.forEach(slide => {
        const qid = slide.dataset ? slide.dataset.questionId : null;
        if (!qid || qid === 'results') return;
        // Skip slides that have no option buttons (content-only slides)
        const optionBtns = slide.querySelectorAll('.option-btn');
        if (!optionBtns || optionBtns.length === 0) return;
        const titleEl = slide.querySelector('h2');
        const title = titleEl ? titleEl.innerText.trim() : `Question ${qid}`;
        const pts = quizScores[qid] !== undefined ? quizScores[qid] : 0;
        let line = `<div><strong>${title}</strong>: ${pts} points</div>`;
        
        // Add UN reason text if it exists
        if (answers[qid] && answers[qid]['un-reason-text']) {
            line += `<div style="margin-left: 1rem; font-size: 0.9em; color: #555; margin-top: 0.25rem;"><em>Reason: ${answers[qid]['un-reason-text']}</em></div>`;
        }
        
        lines.push(line);
    });

    breakdown.innerHTML = lines.join('\n');
}

function updateNavButtons() {
    updateScoreDisplays();
}

/**
 * Restore previously selected answers from localStorage
 * This is useful when users navigate back to an exam page
 */
function restorePreviousAnswers() {
    const answers = getAnswersFromStorage();
    
    slides.forEach(slide => {
        const questionId = slide.dataset ? slide.dataset.questionId : null;
        if (!questionId || !answers[questionId]) return;
        
        const answer = answers[questionId];
        const optionBtns = slide.querySelectorAll('.option-btn');
        
        // Find and select the button that matches the saved answer
        optionBtns.forEach(btn => {
            const btnPoints = parseInt(btn.getAttribute('data-points'), 10) || 0;
            const btnText = btn.textContent.trim();
            const btnDataPoints = btn.getAttribute('data-points');
            const btnUnQuestion = btn.getAttribute('data-un-question');
            
            // Check if this is a UN button and the answer is also UN
            const isUNButton = btnDataPoints === 'UN';
            const answerIsUN = answer.text && answer.text.startsWith('UN');
            
            // Match based on both points and text to handle duplicate point values
            // For UN buttons, match if both are UN and have the same un-question attribute
            let matches = false;
            if (isUNButton && answerIsUN && btnUnQuestion === questionId) {
                matches = true;
            } else if (!isUNButton && btnPoints === answer.points && btnText === answer.text) {
                matches = true;
            }
            
            if (matches) {
                btn.classList.add('selected');
                btn.disabled = true;
                slide.classList.add('answered');
                
                // Update quizScores for this question
                quizScores[questionId] = answer.points;
                
                // For UN answers, show the textarea and done button
                if (isUNButton && answer['un-reason-text']) {
                    const unReasonInput = slide.querySelector('.un-explanation-input[data-un-question="' + questionId + '"]');
                    const unDoneBtn = slide.querySelector('.un-done-btn[data-un-question="' + questionId + '"]');
                    
                    if (unReasonInput) {
                        // Restore the text
                        unReasonInput.value = answer['un-reason-text'];
                        // Show the textarea and button
                        unReasonInput.style.display = 'block';
                        if (unDoneBtn) {
                            unDoneBtn.style.display = 'block';
                            unDoneBtn.innerText = 'Edit';
                        }
                        // Set to readOnly state since it's been saved
                        unReasonInput.readOnly = true;
                    } else {
                        console.warn('UN textarea not found for question:', questionId);
                    }
                }
            } else {
                btn.classList.remove('selected');
                btn.disabled = false;
            }
        });
    });
    
    // Recalculate total score from restored answers
    totalScore = Object.values(quizScores).reduce((sum, points) => sum + points, 0);
}

// Initialize listeners and UI
// First, detect and set the current exam name from the page URL
currentExamName = detectCurrentExamName();

optionsListener();
// Restore any previously saved answers from localStorage
restorePreviousAnswers();
// Set initial UI
updateNavButtons();
// Initialize results breakdown to always show
updateResultsBreakdownAlways();

// Expose completeExam for window scope
window.completeExam = completeExam;