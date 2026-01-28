/**
 * Global Audio Manager
 * Ensures only one audio file can play at a time across the entire site.
 * When a user starts playing a new audio, any currently playing audio is paused.
 */

class AudioManager {
  constructor() {
    this.currentlyPlaying = null;
  }

  /**
   * Initialize the audio manager by attaching listeners to all audio elements
   */
  init() {
    this.attachListeners();
    // Also watch for dynamically added audio elements
    this.observeDOMChanges();
  }

  /**
   * Attach play event listeners to all audio elements on the page
   */
  attachListeners() {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach((audio) => {
      // Remove any existing listeners to avoid duplicates
      audio.removeEventListener('play', this.handleAudioPlay.bind(this));
      audio.addEventListener('play', this.handleAudioPlay.bind(this));
    });
  }

  /**
   * Handle the play event - pause any other playing audio
   * @param {Event} event - The play event from an audio element
   */
  handleAudioPlay(event) {
    const audioElement = event.target;

    // If there's a currently playing audio and it's not the one being played now
    if (this.currentlyPlaying && this.currentlyPlaying !== audioElement) {
      this.currentlyPlaying.pause();
    }

    // Update the reference to the currently playing audio
    this.currentlyPlaying = audioElement;
  }

  /**
   * Observe the DOM for newly added audio elements and attach listeners to them
   */
  observeDOMChanges() {
    const observer = new MutationObserver(() => {
      this.attachListeners();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

// Initialize the audio manager when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const audioManager = new AudioManager();
    audioManager.init();
  });
} else {
  // DOM is already loaded
  const audioManager = new AudioManager();
  audioManager.init();
}
