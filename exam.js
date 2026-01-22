const carousel = document.getElementById('examSlides');
const slides = document.querySelectorAll('.slide');
const buttons = document.querySelectorAll('.option-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const debugInfo = document.getElementById('debug-info');
const totalScoreDisplay = document.querySelectorAll('.total-score');
const navScorePara = document.querySelector('.exam-nav-buttons p');

let currentSlide = 0;
let totalScore = 0; 
// Map of scores per question so each slide's points are retained and updatable
const quizScores = {};

// LocalStorage keys for exam answers
const EXAM_ANSWERS_KEY = 'examAnswers';
const EXAM_HISTORY_KEY = 'examHistory';

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
 */
function saveAnswerToStorage(questionId, points, answerText) {
    try {
        let answers = JSON.parse(localStorage.getItem(EXAM_ANSWERS_KEY)) || {};
        answers[questionId] = {
            points: points,
            text: answerText,
            timestamp: new Date().toISOString()
        };
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
        // Save current exam answers to history with examID
        const examID = saveExamToHistory(examName);
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

// Navigation Function
function moveSlides(direction) {
    // Move relative number of slides using goToSlide
    goToSlide(currentSlide + (direction > 0 ? 1 : -1));
}

function goToSlide(index) {
    if (!slides || slides.length === 0) return;
    const clamped = Math.min(Math.max(index, 0), slides.length - 1);
    currentSlide = clamped;

    // Scroll the target slide into view on the page
    const target = slides[currentSlide];
    if (target && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Update navigation UI and results breakdown
    updateNavButtons();
}

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

function updateNavButtons() {
    const current = slides[currentSlide];
    // Replace previous/next with a single "View Results" button
    // Always hide the previous button
    if (prevBtn) prevBtn.style.display = 'none';

        // If this slide is the results slide, show a "Refresh Results" button so
        // the breakdown can be re-rendered on demand; hide the nav score paragraph.
        if (current && current.dataset && current.dataset.questionId === 'results') {
            if (nextBtn) {
                nextBtn.style.display = 'inline-block';
                nextBtn.textContent = 'Refresh Results';
            }
            if (navScorePara) navScorePara.style.display = 'none';
        } else {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'inline-block';
            if (nextBtn) nextBtn.textContent = 'View Results';
            if (navScorePara) navScorePara.style.display = 'block';
        }
    updateScoreDisplays();
    // Render per-question breakdown on the results slide
    if (current && current.dataset && current.dataset.questionId === 'results') {
        renderResultsBreakdown(current);
    } else {
        // Remove breakdown if present when not on results
        const existing = document.querySelector('.results-breakdown');
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    }

    // Use this for debugging
    //if (debugInfo) debugInfo.innerText = `Debug Info: Current Slide: ${currentSlide + 1} / ${slides.length}, Total Score: ${totalScore}`;
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
            
            // Match based on both points and text to handle duplicate point values
            if (btnPoints === answer.points && btnText === answer.text) {
                btn.classList.add('selected');
                btn.disabled = true;
                slide.classList.add('answered');
                
                // Update quizScores for this question
                quizScores[questionId] = answer.points;
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
optionsListener();
// Restore any previously saved answers from localStorage
restorePreviousAnswers();
// Set initial UI
updateNavButtons();

// Use this for debugging
if (debugInfo) debugInfo.innerText = `Debug Info: Current Slide: ${currentSlide + 1} / ${slides.length}, Total Score: ${totalScore}`;

// Expose moveSlides and completeExam for inline onclick handlers (module scope doesn't expose functions to window)
window.moveSlides = moveSlides;
window.completeExam = completeExam;

// Also attach click handlers to prev/next buttons so they work without inline attributes
if (prevBtn) {
    // Hide/remove previous behavior since we use a single View Results button
    prevBtn.style.display = 'none';
}
if (nextBtn) nextBtn.addEventListener('click', () => {
    // If we're already on results, refresh the breakdown; otherwise jump there
    const current = slides[currentSlide];
    if (current && current.dataset && current.dataset.questionId === 'results') {
        renderResultsBreakdown(current);
        updateScoreDisplays();
        return;
    }
    // Jump directly to the results slide (find its index dynamically)
    const resultsIndex = Array.from(slides).findIndex(s => s.dataset && s.dataset.questionId === 'results');
    if (resultsIndex >= 0) {
        goToSlide(resultsIndex);
    }
});