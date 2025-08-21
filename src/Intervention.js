import './css/Intervention.css'; // CSS file for Intervention overlay (create if needed)
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import * as THREE from 'three';
import { isMobileDevice } from './deviceDetection.js';
import { pauseMusic, resumeMusic } from './musicPlayer.js';
import { hideVolumeSlider, showVolumeSlider } from './volumeSlider.js';
import { hitboxManager } from './hitboxManager.js';

export function initializeIntervention(scene, camera) { // Add camera parameter
  const Intervention = findInterventionInScene(scene); // Find the Intervention model in the 3D scene
  if (!Intervention) {
    console.error('Intervention object not found in the scene.');
    return;
  }

  Intervention.userData.clickable = true; // Mark the Intervention as interactive

  // Create the CSS overlay element
  const InterventionDiv = document.createElement('div');
  InterventionDiv.className = 'Intervention-overlay';
  InterventionDiv.innerHTML = `<div class="Intervention-hitbox" style="background: rgba(255, 0, 0, 0); border: 0px solid red; width: 200px; height: 200px;"></div>`; // Transparent by default

  // Attach the CSS object to the Intervention's position
  const cssObject = new CSS3DObject(InterventionDiv);
  // TODO: Manually adjust X, Y, Z position as needed
  cssObject.position.set(56.0, 118.0, -1.0); // X, Y, Z - adjust these values to position the overlay
  cssObject.rotation.set(5.10, 5.90, 8.70); // Change rotation if needed
  // TODO: Manually adjust scale for X, Y, Z size
  cssObject.scale.set(0.170, 0.030, -6.035); // X, Y, Z scale - adjust these values to resize the overlay
  scene.add(cssObject); // Add to scene

  // Register with hitbox manager for universal editing
  hitboxManager.registerHitbox('Intervention', cssObject, InterventionDiv);

  let InterventionAudio = null; // Audio will only be created on demand
  const InterventionHitbox = InterventionDiv.querySelector('.Intervention-hitbox');

  // Event listener for click
  InterventionHitbox.addEventListener('click', () => {
    playInterventionAudio();
    // Note: No need to pause music for audio - it can play alongside
  });

  // Function to dynamically play audio
  function playInterventionAudio() {
    // If the audio already exists, prevent re-creation
    if (!InterventionAudio) {
      InterventionAudio = createInterventionAudio();
      
      // Cleanup audio when it ends
      InterventionAudio.addEventListener('ended', () => {
        InterventionAudio.pause();
        InterventionAudio.currentTime = 0;
        // Note: No need to remove audio element or show volume slider for audio
      });
    }

    InterventionAudio.currentTime = 0; // Reset to start
    InterventionAudio.play().catch((error) => console.error('Error playing audio:', error));
  }

  // Function to create and return audio element
  function createInterventionAudio() {
    const audioElement = document.createElement('audio');
    audioElement.id = 'Intervention-audio';
    audioElement.src = '/MLG/tv_content/videos/Intervention.mp3'; // Fixed path to match actual location
    audioElement.autoplay = false;
    audioElement.loop = false;
    audioElement.controls = false;
    audioElement.preload = 'auto';
    return audioElement;
  }
}

// Helper function to find the Intervention model in the scene
function findInterventionInScene(scene) {
  let Intervention = null;
  scene.traverse((child) => {
    if (child.name === '') {
      Intervention = child;
    }
  });
  if (!Intervention) {
    console.warn('Intervention model not found. Available models:', scene.children.map(c => c.name));
  }
  return Intervention;
}
