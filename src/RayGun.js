import './css/RayGun.css'; // CSS file for RayGun overlay (create if needed)
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import * as THREE from 'three';
import { isMobileDevice } from './deviceDetection.js';
import { pauseMusic, resumeMusic } from './musicPlayer.js';
import { hideVolumeSlider, showVolumeSlider } from './volumeSlider.js';
import { hitboxManager } from './hitboxManager.js';

export function initializeRayGun(scene, camera) { // Add camera parameter
  const RayGun = findRayGunInScene(scene); // Find the RayGun model in the 3D scene
  if (!RayGun) {
    console.error('RayGun object not found in the scene.');
    return;
  }

  RayGun.userData.clickable = true; // Mark the RayGun as interactive

  // Create the CSS overlay element
  const RayGunDiv = document.createElement('div');
  RayGunDiv.className = 'RayGun-overlay';
  RayGunDiv.innerHTML = `<div class="RayGun-hitbox" style="background: rgba(255, 0, 0, 0); border: 0px solid red; width: 200px; height: 200px;"></div>`; // Transparent by default

  // Attach the CSS object to the RayGun's position
  const cssObject = new CSS3DObject(RayGunDiv);
  // TODO: Manually adjust X, Y, Z position as needed
  cssObject.position.set(50, 127, 30); // X, Y, Z - adjust these values to position the overlay
  cssObject.rotation.set(5, 5, 5); // Change rotation if needed
  // TODO: Manually adjust scale for X, Y, Z size
  cssObject.scale.set(.050, .025, .035); // X, Y, Z scale - adjust these values to resize the overlay
  scene.add(cssObject); // Add to scene

  // Register with hitbox manager for universal editing
  hitboxManager.registerHitbox('RayGun', cssObject, RayGunDiv);

  let RayGunAudio = null; // Audio will only be created on demand
  const RayGunHitbox = RayGunDiv.querySelector('.RayGun-hitbox');

  // Event listener for click
  RayGunHitbox.addEventListener('click', () => {
    playRayGunAudio();
    // Note: No need to pause music for audio - it can play alongside
  });

  // Function to dynamically play audio
  function playRayGunAudio() {
    // If the audio already exists, prevent re-creation
    if (!RayGunAudio) {
      RayGunAudio = createRayGunAudio();
      
      // Cleanup audio when it ends
      RayGunAudio.addEventListener('ended', () => {
        RayGunAudio.pause();
        RayGunAudio.currentTime = 0;
        // Note: No need to remove audio element or show volume slider for audio
      });
    }

    RayGunAudio.currentTime = 0; // Reset to start
    RayGunAudio.play().catch((error) => console.error('Error playing audio:', error));
  }

  // Function to create and return audio element
  function createRayGunAudio() {
    const audioElement = document.createElement('audio');
    audioElement.id = 'RayGun-audio';
    audioElement.src = '/MLG/tv_content/videos/RayGun.mp3'; // Fixed path to match actual location
    audioElement.autoplay = false;
    audioElement.loop = false;
    audioElement.controls = false;
    audioElement.preload = 'auto';
    return audioElement;
  }
}

// Helper function to find the RayGun model in the scene
function findRayGunInScene(scene) {
  let RayGun = null;
  scene.traverse((child) => {
    if (child.name === '') {
      RayGun = child;
    }
  });
  if (!RayGun) {
    console.warn('RayGun model not found. Available models:', scene.children.map(c => c.name));
  }
  return RayGun;
}
