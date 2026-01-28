# Single Audio Playback Implementation

## Overview
A global audio manager has been implemented to ensure only one audio file can play at a time across the entire UTH Stroke PWA site.

## Files Created
- **[src/audio-manager.js](src/audio-manager.js)** - Main audio manager module that controls single audio playback

## How It Works

The `AudioManager` class provides the following functionality:

1. **Initialization**: Automatically initializes when the DOM is ready
2. **Listener Attachment**: Attaches `play` event listeners to all audio elements on the page
3. **Playback Control**: When a user plays an audio file, any currently playing audio is automatically paused
4. **Dynamic Elements**: Monitors the DOM for newly added audio elements and attaches listeners to them

## Technical Details

### Key Methods

- `init()`: Initializes the audio manager and sets up DOM observation
- `attachListeners()`: Finds all audio elements on the page and adds play event listeners
- `handleAudioPlay()`: Pause handler that stops any currently playing audio when a new one starts
- `observeDOMChanges()`: Uses MutationObserver to detect and handle dynamically added audio elements

### Implementation Pattern

```javascript
// When any audio element is played:
audioElement.addEventListener('play', (event) => {
  if (currentlyPlaying && currentlyPlaying !== event.target) {
    currentlyPlaying.pause(); // Pause the previous audio
  }
  currentlyPlaying = event.target; // Track the new playing audio
});
```

## Files Modified

The audio-manager.js script has been added to the following pages:

1. **Landing & Home Pages**
   - [index.html](index.html)

2. **Spanish Exam Pages**
   - [pages/Spanish-Pages/SPA-NIHSS.html](pages/Spanish-Pages/SPA-NIHSS.html)
   - [pages/Spanish-Pages/SPA-CN.html](pages/Spanish-Pages/SPA-CN.html)
   - [pages/Spanish-Pages/SPA-SQ.html](pages/Spanish-Pages/SPA-SQ.html)
   - [pages/Spanish-Pages/SPA-Post-NIHSS.html](pages/Spanish-Pages/SPA-Post-NIHSS.html)

3. **NIHSS Card Pages**
   - [pages/NIHSS-Cards/NIHSS-Card-Spanish-Objects.html](pages/NIHSS-Cards/NIHSS-Card-Spanish-Objects.html)
   - [pages/NIHSS-Cards/NIHSS-Card-Spanish-Phrases.html](pages/NIHSS-Cards/NIHSS-Card-Spanish-Phrases.html)
   - [pages/NIHSS-Cards/NIHSS-Card-Spanish-Words.html](pages/NIHSS-Cards/NIHSS-Card-Spanish-Words.html)
   - [pages/NIHSS-Cards/NIHSS-Card-Spanish-Scene.html](pages/NIHSS-Cards/NIHSS-Card-Spanish-Scene.html)

## Browser Compatibility

The implementation uses standard Web APIs:
- `document.querySelectorAll()` - supported in all modern browsers
- `audio.play()` and `audio.pause()` - HTML5 Audio API
- `MutationObserver` - supported in all modern browsers

## User Experience

- Users can click play on any audio element
- If another audio is currently playing, it automatically stops
- The currently playing audio continues unless the user manually pauses it or starts another audio
- The audio player controls (play, pause, volume, progress bar) remain fully functional with the native HTML5 `<audio controls>` element
