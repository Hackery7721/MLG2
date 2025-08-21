import './css/Glasses.css'; // CSS file for Glasses overlay (create if needed)
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { isMobileDevice } from './deviceDetection.js'; // Import the shared device detection function
import { pauseMusic, resumeMusic } from './musicPlayer.js'; // Import the shared music player functions
import { hideVolumeSlider, showVolumeSlider } from './volumeSlider.js';
import { hitboxManager } from './hitboxManager.js';

export function initializeGlasses(scene, camera) { // Add camera parameter
  const Glasses = findGlassesInScene(scene); // Find the Glasses object in the 3D scene
  if (!Glasses) {
    console.warn('Glasses model not found. Available models:', scene.children.map(c => c.name));
  } else {
    Glasses.userData.clickable = true; // Mark the Glasses as interactive
  }

  // Create the CSS overlay element
  const GlassesDiv = document.createElement('div');
  GlassesDiv.className = 'Glasses-overlay';
  GlassesDiv.innerHTML = `<div class="Glasses-hitbox" style="background: rgba(255, 0, 0, 0); border: 0px solid red; width: 200px; height: 200px;"></div>`; // Transparent by default

  // Attach the CSS object to the Glasses's position
  const cssObject = new CSS3DObject(GlassesDiv);
  // TODO: Manually adjust X, Y, Z position as needed
  cssObject.position.set(156.0, 0.0, -247.0); // X, Y, Z - adjust these values to position the overlay
  cssObject.rotation.set(0.20, -7.40, 0.00); // Change rotation if needed
  // TODO: Manually adjust scale for X, Y, Z size
  cssObject.scale.set(0.230, 0.130, 0.140); // X, Y, Z scale - adjust these values to resize the overlay
  scene.add(cssObject); // Add to scene

  // Register with hitbox manager for universal editing
  hitboxManager.registerHitbox('Glasses', cssObject, GlassesDiv);

  let GlassesVideo = null; // Video will only be created on demand
  const GlassesHitbox = GlassesDiv.querySelector('.Glasses-hitbox');

  // Event listener for click
  GlassesHitbox.addEventListener('click', () => {
    playGlassesVideo();
    pauseMusic(); // Pause music when the video starts playing
  });

  // Function to dynamically play video
  function playGlassesVideo() {
    // If the video already exists, prevent re-creation
    if (!GlassesVideo) {
      GlassesVideo = createGlassesVideo();
      document.body.appendChild(GlassesVideo);

      // Cleanup video when it ends
      GlassesVideo.addEventListener('ended', () => {
        GlassesVideo.style.display = 'none';
        GlassesVideo.pause();
        GlassesVideo.currentTime = 0;
        GlassesVideo.remove(); // Remove from DOM
        GlassesVideo = null; // Reset video reference
        resumeMusic(); // Resume music after the video ends
        showVolumeSlider(); // Show volume slider again after video ends
      });
    }

    GlassesVideo.style.display = 'block';
    hideVolumeSlider(); // Hide volume slider during video playback
    GlassesVideo.play().catch((error) => console.error('Error playing video:', error));
  }

  // Function to create and return video element
  function createGlassesVideo() {
    const videoElement = document.createElement('video');
    videoElement.id = 'Glasses-video';
    videoElement.src = '/MLG/tv_content/videos/MLGglasses.webm';
    videoElement.autoplay = false;
    videoElement.loop = false;
    videoElement.controls = false;
    videoElement.setAttribute('muted', 'false');
    videoElement.muted = false;
    videoElement.setAttribute('disablePictureInPicture', '');
    videoElement.setAttribute('playsinline', '');
    
    // Use the same styling approach as Joint (which works perfectly)
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
    
    return videoElement;
  }
}

// Helper function to find the Glasses object in the scene
function findGlassesInScene(scene) {
  let Glasses = null;
  scene.traverse((child) => {
    if (child.name === '') { // Update this with the actual object name
      Glasses = child;
    }
  });
  if (!Glasses) {
    console.warn('Glasses model not found. Available models:', scene.children.map(c => c.name));
  }
  return Glasses;
}
