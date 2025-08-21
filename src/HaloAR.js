import './css/HaloAR.css'; // CSS file for HaloAR overlay (create if needed)
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import * as THREE from 'three';
import { isMobileDevice } from './deviceDetection.js';
import { pauseMusic, resumeMusic } from './musicPlayer.js';
import { hideVolumeSlider, showVolumeSlider } from './volumeSlider.js';
import { hitboxManager } from './hitboxManager.js';

export function initializeHaloAR(scene, camera) { // Add camera parameter
  const HaloAR = findHaloARInScene(scene); // Find the HaloAR model in the 3D scene
  if (!HaloAR) {
    console.error('HaloAR object not found in the scene.');
    return;
  }

  HaloAR.userData.clickable = true; // Mark the HaloAR as interactive

  // Create the CSS overlay element
  const HaloARDiv = document.createElement('div');
  HaloARDiv.className = 'HaloAR-overlay';
  HaloARDiv.innerHTML = `<div class="HaloAR-hitbox" style="background: rgba(255, 0, 0, 0); border: 0px solid red; width: 200px; height: 200px;"></div>`; // Transparent by default

  // Attach the CSS object to the HaloAR's position
  const cssObject = new CSS3DObject(HaloARDiv);
  // TODO: Manually adjust X, Y, Z position as needed
  cssObject.position.set(-6, 120, 73); // X, Y, Z - adjust these values to position the overlay
  cssObject.rotation.set(-2.3, .7, 8.7); // Change rotation if needed
  // TODO: Manually adjust scale for X, Y, Z size
  cssObject.scale.set(.15, .03, .035); // X, Y, Z scale - adjust these values to resize the overlay
  scene.add(cssObject); // Add to scene

  // Register with hitbox manager for universal editing
  hitboxManager.registerHitbox('HaloAR', cssObject, HaloARDiv);

  let HaloARAudio = null; // Audio will only be created on demand
  const HaloARHitbox = HaloARDiv.querySelector('.HaloAR-hitbox');

  // Event listener for click
  HaloARHitbox.addEventListener('click', () => {
    playHaloARAudio();
    // Note: No need to pause music for audio - it can play alongside
  });

  // Function to dynamically play audio
  function playHaloARAudio() {
    // If the audio already exists, prevent re-creation
    if (!HaloARAudio) {
      HaloARAudio = createHaloARAudio();
      
      // Cleanup audio when it ends
      HaloARAudio.addEventListener('ended', () => {
        HaloARAudio.pause();
        HaloARAudio.currentTime = 0;
        // Note: No need to remove audio element or show volume slider for audio
      });
    }

    HaloARAudio.currentTime = 0; // Reset to start
    HaloARAudio.play().catch((error) => console.error('Error playing audio:', error));
  }

  // Function to create and return audio element
  function createHaloARAudio() {
    const audioElement = document.createElement('audio');
    audioElement.id = 'HaloAR-audio';
    audioElement.src = '/MLG/tv_content/videos/HaloAR.mp3'; // Fixed path to match actual location
    audioElement.autoplay = false;
    audioElement.loop = false;
    audioElement.controls = false;
    audioElement.preload = 'auto';
    return audioElement;
  }
}

// Helper function to find the HaloAR model in the scene
function findHaloARInScene(scene) {
  let HaloAR = null;
  scene.traverse((child) => {
    if (child.name === '') {
      HaloAR = child;
    }
  });
  if (!HaloAR) {
    console.warn('HaloAR model not found. Available models:', scene.children.map(c => c.name));
  }
  return HaloAR;
}
