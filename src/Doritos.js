import './css/Doritos.css'; // CSS file for Doritos overlay (create if needed)
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import * as THREE from 'three';
import { isMobileDevice } from './deviceDetection.js';
import { pauseMusic, resumeMusic } from './musicPlayer.js';
import { hideVolumeSlider, showVolumeSlider } from './volumeSlider.js';
import { hitboxManager } from './hitboxManager.js';

export function initializeDoritos(scene, camera) { // Add camera parameter
  const Doritos = findDoritosInScene(scene); // Find the Doritos model in the 3D scene
  if (!Doritos) {
    console.error('Doritos object not found in the scene.');
    return;
  }

  Doritos.userData.clickable = true; // Mark the Doritos as interactive

  // Create the CSS overlay element
  const DoritosDiv = document.createElement('div');
  DoritosDiv.className = 'Doritos-overlay';
  DoritosDiv.innerHTML = `<div class="Doritos-hitbox" style="background: rgba(255, 0, 0, 0); border: 0px solid red; width: 200px; height: 200px;"></div>`; // Transparent by default

  // Attach the CSS object to the Doritos's position
  const cssObject = new CSS3DObject(DoritosDiv);
  // TODO: Manually adjust X, Y, Z position as needed
  cssObject.position.set(81.0, 41.0, 196.0); // X, Y, Z - same position as Xbox360
  cssObject.rotation.set(0.26, 0.24, 0.00); // Change rotation if needed
  // TODO: Manually adjust scale for X, Y, Z size
  cssObject.scale.set(0.113, 0.183, 0.083); // X, Y, Z scale - same scale as Xbox360
  scene.add(cssObject); // Add to scene

  // Register with hitbox manager for universal editing
  hitboxManager.registerHitbox('Doritos', cssObject, DoritosDiv);

  let DoritosVideo = null; // Video will only be created on demand
  const DoritosHitbox = DoritosDiv.querySelector('.Doritos-hitbox');

  // Event listener for click
  DoritosHitbox.addEventListener('click', () => {
    playDoritosVideo();
    pauseMusic();
  });

  // Function to dynamically play video
  function playDoritosVideo() {
    // If the video already exists, prevent re-creation
    if (!DoritosVideo) {
      DoritosVideo = createDoritosVideo();
      document.body.appendChild(DoritosVideo);

      // Cleanup video when it ends
      DoritosVideo.addEventListener('ended', () => {
        DoritosVideo.style.display = 'none';
        DoritosVideo.pause();
        DoritosVideo.currentTime = 0;
        DoritosVideo.remove(); // Remove from DOM
        DoritosVideo = null; // Reset video reference
        resumeMusic();
        showVolumeSlider(); // Show volume slider again after video ends
      });
    }

    DoritosVideo.style.display = 'block';
    hideVolumeSlider(); // Hide volume slider during video playback
    DoritosVideo.play().catch((error) => console.error('Error playing video:', error));
  }

  // Function to create and return video element
  function createDoritosVideo() {
    const videoElement = document.createElement('video');
    videoElement.id = 'Doritos-video';
    videoElement.src = '/MLG/tv_content/videos/Red Vs. Blue Doritos.webm'; // TODO: Replace with correct path to video
    videoElement.autoplay = false;
    videoElement.loop = false;
    videoElement.controls = false;
    videoElement.setAttribute('muted', 'false');
    videoElement.muted = false;
    videoElement.style.display = 'none';
    videoElement.setAttribute('disablePictureInPicture', '');
    videoElement.setAttribute('playsinline', '');
    return videoElement;
  }
}

// Helper function to find the Doritos model in the scene
function findDoritosInScene(scene) {
  let Doritos = null;
  scene.traverse((child) => {
    if (child.name === '') {
      Doritos = child;
    }
  });
  if (!Doritos) {
    console.warn('Doritos model not found. Available models:', scene.children.map(c => c.name));
  }
  return Doritos;
}
