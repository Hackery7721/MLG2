
// Global Volume Slider for specific sounds (music and vault items only)
import { audio as musicAudio } from './musicPlayer.js';

// Store specific video and audio elements for volume control
const managedMedia = new Set();
// Store excluded audio that should not be controlled by volume slider
const excludedAudio = new Set();

// Audio analysis variables for heartbeat effect
let audioContext = null;
let analyser = null;
let audioSource = null;
let bassFrequencyData = null;
let heartbeatAnimationId = null;

// Function to determine if audio should be excluded from volume control
function isExcludedAudio(audioElement) {
  if (!audioElement.id && !audioElement.src) return false;
  
  // INCLUDE only music and vault items (everything else is excluded)
  const src = audioElement.src || '';
  
  // Check if src contains music paths - these should be INCLUDED (not excluded)
  const musicPaths = ['/MLG/music/', 'music/'];
  const isMusic = musicPaths.some(path => src.includes(path));
  if (isMusic) return false; // Don't exclude music
  
  // Check for vault audio/video paths - these should also be INCLUDED
  const vaultPaths = ['/MLG/tv_content/videos/', 'tv_content/videos/'];
  const isVault = vaultPaths.some(path => src.includes(path));
  if (isVault) {
    // Only include vault-specific content (contains "Vault" in filename)
    const isVaultContent = src.includes('Vault') || src.includes('vault');
    if (isVaultContent) return false; // Don't exclude vault content
  }
  
  // Everything else (other videos, sound effects, etc.) is excluded from volume control
  return true;
}

// Helper to set volume for managed media only
function setGlobalVolume(vol) {
  // Set music player volume
  if (musicAudio) musicAudio.volume = vol;
  // Set all tracked video/audio elements (excluding RayGun and similar)
  managedMedia.forEach((el) => {
    try {
      el.volume = vol;
    } catch (e) {}
  });
  // Store in localStorage for persistence
  localStorage.setItem('mlg_global_volume', vol);
}

// Observe new video/audio elements added to the DOM (selective)
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.tagName === 'VIDEO' || node.tagName === 'AUDIO') {
        // Only add to managed media if it's not excluded
        if (!isExcludedAudio(node)) {
          managedMedia.add(node);
          // Set initial volume
          node.volume = getCurrentVolume();
        } else {
          excludedAudio.add(node);
          // Set excluded audio to a default volume
          node.volume = 1; // Default volume for excluded audio
        }
      }
      // Also check children (for nested video/audio)
      if (node.querySelectorAll) {
        node.querySelectorAll('video, audio').forEach((el) => {
          if (!isExcludedAudio(el)) {
            managedMedia.add(el);
            el.volume = getCurrentVolume();
          } else {
            excludedAudio.add(el);
            el.volume = 0.7; // Default volume for excluded audio
          }
        });
      }
    });
  });
});
observer.observe(document.body, { childList: true, subtree: true });

// Intercept creation of new Audio objects (for managed audio only)
const OriginalAudio = window.Audio;
window.Audio = function(...args) {
  const audioEl = new OriginalAudio(...args);
  
  // Check if this audio should be managed or excluded
  setTimeout(() => {
    if (!isExcludedAudio(audioEl)) {
      managedMedia.add(audioEl);
      audioEl.volume = getCurrentVolume();
    } else {
      excludedAudio.add(audioEl);
      audioEl.volume = 0.7;
    }
  }, 0);
  
  return audioEl;
};
window.Audio.prototype = OriginalAudio.prototype;

// Get current volume from localStorage or default
function getCurrentVolume() {
  const stored = localStorage.getItem('mlg_global_volume');
  return stored !== null ? parseFloat(stored) : 0.5;
}

// Initialize audio analysis for heartbeat effect
function initializeAudioAnalysis() {
  if (!musicAudio || audioContext) return;
  
  try {
    // Create audio context and analyser
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    
    // Configure analyser for bass frequencies
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;
    bassFrequencyData = new Uint8Array(analyser.frequencyBinCount);
    
    // Connect audio source to analyser
    audioSource = audioContext.createMediaElementSource(musicAudio);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    
    // Start heartbeat animation
    startHeartbeatAnimation();
  } catch (error) {
    console.warn('Could not initialize audio analysis for heartbeat effect:', error);
  }
}

// Start the heartbeat animation loop
function startHeartbeatAnimation() {
  function animate() {
    if (!analyser || !bassFrequencyData) return;
    
    // Get frequency data
    analyser.getByteFrequencyData(bassFrequencyData);
    
    // Calculate bass level (focus on low frequencies 0-8 which represent bass)
    let bassSum = 0;
    const bassRange = 8; // First 8 frequency bins for bass
    for (let i = 0; i < bassRange; i++) {
      bassSum += bassFrequencyData[i];
    }
    const bassLevel = bassSum / (bassRange * 255); // Normalize to 0-1
    
    // Apply heartbeat effect to the border
    const sliderContainer = document.getElementById('volume-slider-container');
    if (sliderContainer) {
      const pseudoElement = sliderContainer;
      // Scale the pulse intensity based on bass level
      const pulseIntensity = 0.5 + (bassLevel * 1.5); // Range from 0.5 to 2.0
      const blurAmount = 6 + (bassLevel * 10); // Blur from 6px to 16px
      const brightness = 1.2 + (bassLevel * 0.8); // Brightness from 1.2 to 2.0
      
      // Update CSS custom properties for dynamic animation
      pseudoElement.style.setProperty('--pulse-intensity', pulseIntensity);
      pseudoElement.style.setProperty('--blur-amount', `${blurAmount}px`);
      pseudoElement.style.setProperty('--brightness', brightness);
    }
    
    heartbeatAnimationId = requestAnimationFrame(animate);
  }
  animate();
}

// Stop heartbeat animation
function stopHeartbeatAnimation() {
  if (heartbeatAnimationId) {
    cancelAnimationFrame(heartbeatAnimationId);
    heartbeatAnimationId = null;
  }
}

// Create the slider UI
function createVolumeSlider() {
  // First, add CSS animation keyframes to the document
  // No rainbow border, just basic styling
  if (!document.getElementById('volume-slider-basic-style')) {
    const style = document.createElement('style');
    style.id = 'volume-slider-basic-style';
    style.textContent = `
      #volume-slider-container {
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 9999;
        padding: 0;
        border-radius: 14px;
        display: flex;
        align-items: center;
        box-shadow: 0 2px 8px #0008;
        background: rgba(0,0,0,0.25);
      }
    `;
    document.head.appendChild(style);
  }

  const sliderContainer = document.createElement('div');
  sliderContainer.id = 'volume-slider-container'; // Add ID for easy access
  // All styling is handled by the CSS above
  
  // Create inner container for black background
  const innerContainer = document.createElement('div');
  innerContainer.style.background = 'rgba(0,0,0,0.4)'; // More see-through black
  innerContainer.style.padding = '10px 18px';
  innerContainer.style.borderRadius = '12px';
  innerContainer.style.display = 'flex';
  innerContainer.style.alignItems = 'center';
  innerContainer.style.position = 'relative'; // Ensure it's above the pseudo-element
  innerContainer.style.zIndex = '1';

  const label = document.createElement('span');
  label.textContent = getCurrentVolume() > 0 ? '🔊' : '🔇';
  label.style.marginRight = '8px';
  label.style.fontSize = '20px';
  label.style.cursor = 'pointer';
  let lastVolume = getCurrentVolume();
  label.addEventListener('click', () => {
    const currentVol = getCurrentVolume();
    if (currentVol > 0) {
      lastVolume = currentVol;
      setGlobalVolume(0);
      slider.value = 0;
      label.textContent = '🔇';
    } else {
      setGlobalVolume(lastVolume > 0 ? lastVolume : 0.5);
      slider.value = lastVolume > 0 ? lastVolume : 0.5;
      label.textContent = '🔊';
    }
  });

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '1';
  slider.step = '0.01';
  slider.value = getCurrentVolume();
  slider.style.width = '120px';

  slider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    setGlobalVolume(val);
    label.textContent = val > 0 ? '🔊' : '🔇';
    if (val > 0) lastVolume = val;
  });

  innerContainer.appendChild(label);
  innerContainer.appendChild(slider);
  sliderContainer.appendChild(innerContainer);
  document.body.appendChild(sliderContainer);
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Add music audio to managedMedia if present
  if (musicAudio) managedMedia.add(musicAudio);
  // Set initial volume for all managed
  setGlobalVolume(getCurrentVolume());
  // Don't create volume slider here - wait for scene to load
  
  // Initialize audio analysis for heartbeat effect
  if (musicAudio) {
    // Wait for user interaction to initialize audio context (required by browsers)
    const initAudioOnInteraction = () => {
      initializeAudioAnalysis();
      document.removeEventListener('click', initAudioOnInteraction);
      document.removeEventListener('keydown', initAudioOnInteraction);
    };
    document.addEventListener('click', initAudioOnInteraction);
    document.addEventListener('keydown', initAudioOnInteraction);
    
    // Also initialize when music starts playing
    musicAudio.addEventListener('play', () => {
      if (!audioContext) initializeAudioAnalysis();
    });
  }
});

// Export function to initialize volume slider after scene loads
export function initializeVolumeSlider() {
  createVolumeSlider();
}

// Functions to hide/show volume slider during video playback
export function hideVolumeSlider() {
  const slider = document.getElementById('volume-slider-container');
  if (slider) {
    slider.style.display = 'none';
  }
  // Pause heartbeat animation when hidden
  stopHeartbeatAnimation();
}

export function showVolumeSlider() {
  const slider = document.getElementById('volume-slider-container');
  if (slider) {
    slider.style.display = 'flex';
  }
  // Resume heartbeat animation when shown
  if (audioContext && analyser) {
    startHeartbeatAnimation();
  }
}

// Update volume function for compatibility
export function updateVolume(vol) {
  setGlobalVolume(vol);
}
