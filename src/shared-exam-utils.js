/**
 * Shared utilities for exam data across multiple pages
 * This file contains reusable functions and data for exam titles, sharing, and formatting
 */

/**
 * Define all exam questions for title lookup
 */
const REQUIRED_EXAM_QUESTIONS = [
    // SPA-NIHSS.html questions
    { id: '1a', title: '1a. Level of consciousness', exam: 'SPA-NIHSS' },
    { id: '1b', title: '1b. Level of consciousness questions', exam: 'SPA-NIHSS' },
    { id: '1c', title: '1c. Level of consciousness questions', exam: 'SPA-NIHSS' },
    { id: '2', title: '2. Best gaze', exam: 'SPA-NIHSS' },
    { id: '3', title: '3. Visual', exam: 'SPA-NIHSS' },
    { id: '4', title: '4. Facial palsy', exam: 'SPA-NIHSS' },
    { id: '5', title: '5a. Motor: left arm', exam: 'SPA-NIHSS' },
    { id: '5b', title: '5b. Motor: right arm', exam: 'SPA-NIHSS' },
    { id: '6a', title: '6a. Motor: left leg', exam: 'SPA-NIHSS' },
    { id: '6b', title: '6b. Motor: right leg', exam: 'SPA-NIHSS' },
    { id: '7', title: '7. Limb ataxia', exam: 'SPA-NIHSS' },
    { id: '8', title: '8. Sensory', exam: 'SPA-NIHSS' },
    { id: '9', title: '9. Best language', exam: 'SPA-NIHSS' },
    { id: '10', title: '10. Dysarthria', exam: 'SPA-NIHSS' },
    { id: '11', title: '11. Extinction and Inattention', exam: 'SPA-NIHSS' },
    // SPA-Post-NIHSS.html questions
    { id: '12', title: '12. Cough', exam: 'SPA-Post-NIHSS' },
    { id: '13', title: '13. Dysphagia', exam: 'SPA-Post-NIHSS' },
    { id: '14', title: '14. Gait/Trunk Ataxia and Limb Ataxia', exam: 'SPA-Post-NIHSS' }
];

/**
 * Get question title by ID
 * @param {string} questionId - The question ID to look up
 * @returns {string} The full question title or the ID if not found
 */
function getQuestionTitle(questionId) {
    const question = REQUIRED_EXAM_QUESTIONS.find(q => q.id === questionId);
    return question ? question.title : questionId;
}

/**
 * Format exam name for display
 * @param {string} examName - The exam name from storage
 * @returns {string} Formatted exam name
 */
function formatExamNameForDisplay(examName) {
    return examName.replace(/-/g, ' - ').replace(/SPA/g, 'Spanish');
}

/**
 * Format date for display
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDateForDisplay(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString();
}

/**
 * Generate text-only version of exam results for sharing
 * @param {Object} exam - The exam object from history
 * @param {Object} metadata - The exam metadata
 * @returns {string} Formatted text for sharing
 */
function generateShareText(exam, metadata = {}) {
    if (!exam) return '';
    
    let text = 'Stroke Assessment\n';
    text += `${formatExamNameForDisplay(exam.examName)}\n`;
    text += `Completed: ${formatDateForDisplay(exam.completedAt)}\n\n`;
    
    text += `Exam ID: ${exam.examID}\n\n`;
    
    text += `Total Score: ${exam.totalScore}\n\n`;
    
    text += 'Exam Details:\n';
    text += `Name: ${metadata.patientName || 'N/A'}\n`;
    text += `ID #: ${metadata.patientID || 'N/A'}\n`;
    text += `DOB: ${metadata.dateOfBirth || 'N/A'}\n`;
    text += `Last Known Well: ${metadata.lastKnownWell || 'N/A'}\n`;
    text += `NIHSS Score: ${metadata.nihssScore || 0} / 42\n`;
    text += `Modified Rankin: ${metadata.modifiedRankin || 'N/A'}\n`;
    text += `Interval: ${metadata.interval || 'N/A'}\n`;
    text += `Location: ${metadata.location || 'N/A'}\n`;
    text += `Notes: ${metadata.notes || 'N/A'}\n\n`;
    
    text += 'Answers Breakdown:\n';
    const answers = exam.answers || {};
    Object.entries(answers).forEach(([questionId, answer]) => {
        if (answer.text && answer.points !== undefined) {
            const questionTitle = getQuestionTitle(questionId);
            text += `${questionTitle}\n`;
            text += `${answer.points} point${answer.points !== 1 ? 's' : ''}\n`;
            text += `Answer: ${answer.text}\n`;
            if (answer['un-reason-text']) {
                text += `Reason: ${answer['un-reason-text']}\n`;
            }
            text += '\n';
        }
    });
    
    return text;
}

/**
 * Copy text to clipboard
 * @param {string} text - The text to copy
 * @returns {Promise} Resolves when copy is complete
 */
function copyToClipboard(text) {
    return navigator.clipboard.writeText(text);
}

/**
 * Download text as a file
 * @param {string} text - The text to download
 * @param {string} filename - The filename for the download
 */
function downloadTextAsFile(text, filename) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Expose to window for use in inline scripts
window.getQuestionTitle = getQuestionTitle;
window.generateShareText = generateShareText;
window.copyToClipboard = copyToClipboard;
window.downloadTextAsFile = downloadTextAsFile;
window.formatExamNameForDisplay = formatExamNameForDisplay;
window.formatDateForDisplay = formatDateForDisplay;
