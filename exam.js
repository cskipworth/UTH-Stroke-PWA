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

            // Clear other option UI for this slide
            const options = parentTile.querySelectorAll('.option-btn');
            options.forEach(btn => {
                btn.classList.remove('selected');
                btn.disabled = false;
            });

            // Store/update the score for this question
            const prevPoints = questionId ? (quizScores[questionId] || 0) : 0;
            if (questionId) quizScores[questionId] = newPoints;

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

// Initialize listeners and UI
optionsListener();
// Set initial UI
updateNavButtons();

// Use this for debugging
if (debugInfo) debugInfo.innerText = `Debug Info: Current Slide: ${currentSlide + 1} / ${slides.length}, Total Score: ${totalScore}`;

// Expose moveSlides for inline onclick handlers (module scope doesn't expose functions to window)
window.moveSlides = moveSlides;

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