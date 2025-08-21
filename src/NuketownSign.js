import './css/NuketownSign.css'; // CSS file for NuketownSign overlay (create if needed)
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { isMobileDevice } from './deviceDetection.js'; // Import the shared device detection function
import { pauseMusic, resumeMusic } from './musicPlayer.js'; // Import the shared music player functions
import { hideVolumeSlider, showVolumeSlider } from './volumeSlider.js';
import { hitboxManager } from './hitboxManager.js';

export function initializeNuketownSign(scene, camera) {
  const NuketownSign = findNuketownSignInScene(scene); // Find the NuketownSign object in the 3D scene
  if (!NuketownSign) {
    console.warn('NuketownSign model not found. Available models:', scene.children.map(c => c.name));
  } else {
    NuketownSign.userData.clickable = true; // Mark the NuketownSign as interactive
  }

  // Create the CSS overlay element
  const NuketownSignDiv = document.createElement('div');
  NuketownSignDiv.className = 'NuketownSign-overlay';
  NuketownSignDiv.innerHTML = `<div class="NuketownSign-hitbox" style="background: rgba(255, 0, 0, 0); border: 0px solid red; width: 200px; height: 200px;"></div>`; // Transparent by default

  // Attach the CSS object to the NuketownSign's position
  const cssObject = new CSS3DObject(NuketownSignDiv);
  // TODO: Manually adjust X, Y, Z position as needed
  cssObject.position.set(508.0, 308.0, -12.0); // X, Y, Z - adjust these values to position the overlay
  cssObject.rotation.set(0.00, 1.50, 0.00); // Change rotation if needed
  // TODO: Manually adjust scale for X, Y, Z size
  cssObject.scale.set(1.370, 0.500, 0.400); // X, Y, Z scale - adjust these values to resize the overlay
  scene.add(cssObject); // Add to scene

  // Register with hitbox manager for universal editing
  hitboxManager.registerHitbox('NuketownSign', cssObject, NuketownSignDiv);

  let NuketownSignVideo = null; // Video will only be created on demand
  let NuketownSignVideoElement = null; // Reference to the video element in DOM
  const NuketownSignHitbox = NuketownSignDiv.querySelector('.NuketownSign-hitbox');

  // Event listener for click
  NuketownSignHitbox.addEventListener('click', () => {
    playNuketownSignVideo();
    pauseMusic(); // Pause music when the video starts playing
  });

  // Function to dynamically play video
  function playNuketownSignVideo() {
    // If the video already exists, prevent re-creation
    if (!NuketownSignVideo) {
      console.log('Creating new NuketownSign video'); // Debug log
      NuketownSignVideo = createNuketownSignVideo();
      
      // Cleanup video when it ends
      NuketownSignVideo.addEventListener('ended', () => {
        NuketownSignVideo.pause();
        NuketownSignVideo.currentTime = 0;
        // Hide the video element
        if (NuketownSignVideoElement) {
          NuketownSignVideoElement.style.display = 'none';
        }
        // Show volume slider when video ends
        showVolumeSlider();
        resumeMusic(); // Resume music after the video ends
      });
    }

    // Hide volume slider when video starts playing
    hideVolumeSlider();
    
    // Show and play the video
    if (NuketownSignVideoElement) {
      NuketownSignVideoElement.style.display = 'block';
    }
    NuketownSignVideo.currentTime = 0; // Reset to start
    NuketownSignVideo.play().catch((error) => console.error('Error playing video:', error));
  }

  // Function to create and return video element with transparent background
  function createNuketownSignVideo() {
    const videoElement = document.createElement('video');
    videoElement.id = 'NuketownSign-video';
    videoElement.src = '/MLG/tv_content/videos/BO2.webm'; // Video not added yet
    videoElement.autoplay = false;
    videoElement.loop = false;
    videoElement.controls = false;
    videoElement.setAttribute('muted', 'false');
    videoElement.muted = false;
    videoElement.style.position = 'fixed';
    videoElement.style.top = '0';
    videoElement.style.left = '0';
    videoElement.style.width = '100vw';
    videoElement.style.height = '100vh';
    videoElement.style.objectFit = 'cover';
    videoElement.style.pointerEvents = 'none'; // Don't interfere with scene interactions
    videoElement.style.zIndex = '1000'; // Ensure it's on top but below UI elements
    videoElement.style.display = 'none'; // Hidden by default
    videoElement.style.mixBlendMode = 'normal'; // Ensure proper blending
    videoElement.style.background = 'transparent'; // Force transparent background
    
    // Append to body so it overlays the entire scene
    document.body.appendChild(videoElement);
    NuketownSignVideoElement = videoElement;
    
    return videoElement;
  }
}

// Helper function to find the NuketownSign model in the scene
function findNuketownSignInScene(scene) {
  let NuketownSign = null;
  scene.traverse((child) => {
    if (child.name === '') {
      NuketownSign = child;
    }
  });
  if (!NuketownSign) {
    console.warn('NuketownSign model not found. Available models:', scene.children.map(c => c.name));
  }
  return NuketownSign;
}
