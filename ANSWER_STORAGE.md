# Exam Answer Storage API

This document describes the localStorage-based answer persistence system implemented in `exam.js`.

## Overview

The exam system now automatically saves user answers to browser `localStorage` with the following data for each answer:
- **points**: The numeric value from `data-points` attribute
- **text**: The exact text content of the selected button
- **timestamp**: When the answer was recorded (ISO format)

Answers are stored and can be accessed across multiple pages without requiring server communication.

## Key Functions

### `saveAnswerToStorage(questionId, points, answerText)`
Saves an answer for a specific question.
- **Parameters**:
  - `questionId` (string): The value of `data-question-id` attribute from the slide
  - `points` (number): The point value for this answer
  - `answerText` (string): The text content of the button clicked
- **Called automatically** when a user clicks an option button

### `getAnswersFromStorage()`
Retrieves all saved answers.
- **Returns**: Object with structure `{ questionId: {points, text, timestamp}, ... }`
- **Example**:
```javascript
const allAnswers = getAnswersFromStorage();
// Output:
// {
//   "1a": { points: 0, text: "0. Alert; keenly responsive.", timestamp: "2026-01-17T..." },
//   "2": { points: 1, text: "1. Gaze normal.", timestamp: "2026-01-17T..." },
//   ...
// }
```

### `getAnswerForQuestion(questionId)`
Retrieves the answer for a specific question.
- **Parameters**:
  - `questionId` (string): The question ID to look up
- **Returns**: Object `{points, text, timestamp}` or `null` if not found
- **Example**:
```javascript
const answer = getAnswerForQuestion('5a');
if (answer) {
    console.log(`User selected: ${answer.text}`); // "0. No drift"
    console.log(`Points: ${answer.points}`); // 0
}
```

### `clearAnswersFromStorage()`
Clears all saved answers from localStorage.
- **Call this** to reset the exam state
- **Example**: `clearAnswersFromStorage();`

### `restorePreviousAnswers()`
Restores all previously selected answers to the current page's UI.
- **Called automatically** when the page loads
- **Useful for**: Pages where users navigate back to an exam

## Usage Examples

### Access answers from another page
```javascript
// On a results or summary page, get all answers
const answers = getAnswersFromStorage();

// Build a report
Object.entries(answers).forEach(([questionId, answer]) => {
    console.log(`Q${questionId}: ${answer.text} (${answer.points} points)`);
});
```

### Check if a specific question was answered
```javascript
const answer = getAnswerForQuestion('7');
if (answer) {
    console.log('Question 7 was answered');
} else {
    console.log('Question 7 was not answered');
}
```

### Get summary statistics
```javascript
const answers = getAnswersFromStorage();
const totalPoints = Object.values(answers).reduce((sum, a) => sum + a.points, 0);
const totalAnswered = Object.keys(answers).length;
console.log(`${totalAnswered} questions answered, ${totalPoints} total points`);
```

## Storage Format

Data is stored in browser localStorage under the key `'examAnswers'`:

```json
{
  "1a": {
    "points": 0,
    "text": "0. Alert; keenly responsive.",
    "timestamp": "2026-01-17T14:32:45.123Z"
  },
  "1b": {
    "points": 1,
    "text": "1. Answers one question correctly.",
    "timestamp": "2026-01-17T14:32:50.456Z"
  }
}
```

## Persistence Across Pages

- **Automatic saving**: Each time a user selects an answer, it's saved to localStorage
- **Cross-page access**: Any page can retrieve answers using `getAnswersFromStorage()`
- **Browser storage**: Data persists as long as the browser hasn't cleared localStorage
- **Mobile-friendly**: Works on PWA installations and regular web pages

## Clearing Data

To clear all exam answers (for a new exam or test reset):
```javascript
clearAnswersFromStorage();
```

Or manually in browser console:
```javascript
localStorage.removeItem('examAnswers');
```

## Browser Compatibility

- Requires browsers with localStorage support (all modern browsers)
- Fails gracefully with console warnings if localStorage is unavailable
- Works offline (no server communication required)
