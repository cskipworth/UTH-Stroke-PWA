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
    if (!carousel || !slides) return;
    const clamped = Math.min(Math.max(index, 0), slides.length - 1);
    currentSlide = clamped;

    const tileWidth = carousel.offsetWidth || 0;
    // Try smooth scroll then enforce final position as a fallback
    try {
        carousel.scrollTo({ left: currentSlide * tileWidth, behavior: 'smooth' });
    } catch (e) {
        carousel.scrollLeft = currentSlide * tileWidth;
    }

    // Fallback: ensure final position after animation (some browsers may interrupt)
    setTimeout(() => {
        carousel.scrollLeft = currentSlide * tileWidth;
        // After physical scroll, update UI and height
        updateNavButtons();
        adjustCarouselHeight(currentSlide);
    }, 300);

    // Also update immediately so buttons respond without waiting
    updateNavButtons();
}

function adjustCarouselHeight(index) {
    if (!carousel || !slides || !slides[index]) return;
    // Use the slide's natural height so shorter slides don't leave empty space
    const h = slides[index].getBoundingClientRect().height;
    carousel.style.height = `${Math.ceil(h)}px`;
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

    // If this slide is the results slide, hide both nav buttons and nav score
    if (current && current.dataset && current.dataset.questionId === 'results') {
        if (nextBtn) nextBtn.style.display = 'none';
        if (navScorePara) navScorePara.style.display = 'none';
    } else {
        if (prevBtn) prevBtn.style.display = (currentSlide === 0) ? 'none' : 'inline-block';
        if (nextBtn) nextBtn.style.display = 'inline-block';
        // Use index-based Finish: when the next index is the last slide, label Finish
        if (nextBtn) nextBtn.textContent = (currentSlide === slides.length - 2) ? 'Finish' : 'Next';
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

// Ensure height is recalculated after any DOM changes (e.g. results breakdown)
requestAnimationFrame(() => adjustCarouselHeight(currentSlide));

// Initialize listeners and UI
optionsListener();
// Set initial carousel height and listeners
updateNavButtons();
adjustCarouselHeight(currentSlide);

// Recalculate height on window resize and when media loads
window.addEventListener('resize', () => adjustCarouselHeight(currentSlide));
document.querySelectorAll('img').forEach(img => img.addEventListener('load', () => adjustCarouselHeight(currentSlide)));
document.querySelectorAll('audio').forEach(a => a.addEventListener('loadeddata', () => adjustCarouselHeight(currentSlide)));

// Expose moveSlides for inline onclick handlers (module scope doesn't expose functions to window)
window.moveSlides = moveSlides;

// Also attach click handlers to prev/next buttons so they work without inline attributes
if (prevBtn) prevBtn.addEventListener('click', () => moveSlides(-1));
if (nextBtn) nextBtn.addEventListener('click', () => {
    // Index-based: if we're on the slide before the last, go to the last (results)
    if (currentSlide === slides.length - 2) {
        currentSlide = slides.length - 1;
        const tileWidth = carousel ? carousel.offsetWidth : 0;
        if (carousel) carousel.scrollTo({ left: currentSlide * tileWidth, behavior: 'smooth' });
        updateNavButtons();
        return;
    }
    moveSlides(1);
});