import './css/Xbox360.css'; // CSS file for Xbox360 overlay (create if needed)
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import * as THREE from 'three';
import { isMobileDevice } from './deviceDetection.js';
import { pauseMusic, resumeMusic } from './musicPlayer.js';
import { hideVolumeSlider, showVolumeSlider } from './volumeSlider.js';
import { hitboxManager } from './hitboxManager.js';

export function initializeXbox360(scene, camera) { // Add camera parameter
  const Xbox360 = findXbox360InScene(scene); // Find the Xbox360 model in the 3D scene
  if (!Xbox360) {
    console.error('Xbox360 object not found in the scene.');
    return;
  }

  Xbox360.userData.clickable = true; // Mark the Xbox360 as interactive

  // Create the CSS overlay element
  const Xbox360Div = document.createElement('div');
  Xbox360Div.className = 'Xbox360-overlay';
  Xbox360Div.innerHTML = `<div class="Xbox360-hitbox" style="background: rgba(255, 0, 0, 0); border: 0px solid red; width: 200px; height: 200px;"></div>`; // Transparent by default

  // Attach the CSS object to the Xbox360's position
  const cssObject = new CSS3DObject(Xbox360Div);
  // TODO: Manually adjust X, Y, Z position as needed
  cssObject.position.set(23.5, 115.0, 194.0); // X, Y, Z - adjust these values to position the overlay
  cssObject.rotation.set(-0.00, 0.30, 0.00); // Change rotation if needed
  // TODO: Manually adjust scale for X, Y, Z size
  cssObject.scale.set(0.033, 0.033, 0.033); // X, Y, Z scale - adjust these values to resize the overlay
  scene.add(cssObject); // Add to scene

  // Register with hitbox manager for universal editing
  hitboxManager.registerHitbox('Xbox360', cssObject, Xbox360Div);

  let Xbox360Video = null; // Video will only be created on demand
  const Xbox360Hitbox = Xbox360Div.querySelector('.Xbox360-hitbox');

  // Event listener for click
  Xbox360Hitbox.addEventListener('click', () => {
    playXbox360Video();
    pauseMusic();
  });

  // Function to dynamically play video
  function playXbox360Video() {
    // If the video already exists, prevent re-creation
    if (!Xbox360Video) {
      Xbox360Video = createXbox360Video();
      document.body.appendChild(Xbox360Video);

      // Cleanup video when it ends
      Xbox360Video.addEventListener('ended', () => {
        Xbox360Video.style.display = 'none';
        Xbox360Video.pause();
        Xbox360Video.currentTime = 0;
        Xbox360Video.remove(); // Remove from DOM
        Xbox360Video = null; // Reset video reference
        resumeMusic();
        showVolumeSlider(); // Show volume slider again after video ends
      });
    }

    Xbox360Video.style.display = 'block';
    hideVolumeSlider(); // Hide volume slider during video playback
    Xbox360Video.play().catch((error) => console.error('Error playing video:', error));
  }

  // Function to create and return video element
  function createXbox360Video() {
    const videoElement = document.createElement('video');
    videoElement.id = 'Xbox360-video';
    videoElement.src = '/MLG/tv_content/videos/XBOX420INTRO.webm'; // Correct path to video
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

// Helper function to find the Xbox360 model in the scene
function findXbox360InScene(scene) {
  let Xbox360 = null;
  scene.traverse((child) => {
    if (child.name === 'XBox360_FBX_export') {
      Xbox360 = child;
    }
  });
  if (!Xbox360) {
    console.warn('Xbox360 model not found. Available models:', scene.children.map(c => c.name));
  }
  return Xbox360;
}
