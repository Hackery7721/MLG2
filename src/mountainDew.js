import './css/MountainDew.css'; // Updated CSS file for MountainDew
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { isMobileDevice } from './deviceDetection.js'; // Import the shared device detection function
import { pauseMusic, resumeMusic } from './musicPlayer.js'; // Import the shared music player functions
import { hideVolumeSlider, showVolumeSlider } from './volumeSlider.js';
import { hitboxManager } from './hitboxManager.js';

export function initializeMountainDew(scene) {
  const MountainDew = findMountainDewInScene(scene); // Find the MountainDew box in the 3D scene
  if (!MountainDew) {
    console.error('MountainDew object not found in the scene.');
    return;
  }

  MountainDew.userData.clickable = true; // Mark the MountainDew box as interactive

  // Create the CSS overlay element
  const MountainDewDiv = document.createElement('div');
  MountainDewDiv.className = 'MountainDew-overlay';
  MountainDewDiv.innerHTML = `<div class="MountainDew-hitbox" style="background: rgba(255, 0, 0, 0); border: 0px solid red; width: 200px; height: 200px;"></div>`; // Transparent by default

  // Attach the CSS object to the MountainDew's position
  const cssObject = new CSS3DObject(MountainDewDiv);
  cssObject.position.set(16.0, 300.0, -5.0); // Position relative to the MountainDew box
  cssObject.rotation.set(1.50, -0.40, 0.00);
  cssObject.scale.set(0.340, 0.210, 0.200); // Adjust scale as needed
  MountainDew.add(cssObject);

  // Register with hitbox manager for universal editing
  hitboxManager.registerHitbox('MountainDew', cssObject, MountainDewDiv);

  let MountainDewVideo = null; // Video will only be created on demand
  const MountainDewHitbox = MountainDewDiv.querySelector('.MountainDew-hitbox');

  // Event listener for click
  MountainDewHitbox.addEventListener('click', () => {
    playMountainDewVideo();
    pauseMusic(); // Pause music when the video starts playing
  });

  // Function to dynamically play video
  function playMountainDewVideo() {
    // If the video already exists, prevent re-creation
    if (!MountainDewVideo) {
      MountainDewVideo = createMountainDewVideo();
      document.body.appendChild(MountainDewVideo);

      // Cleanup video when it ends
      MountainDewVideo.addEventListener('ended', () => {
        MountainDewVideo.style.display = 'none';
        MountainDewVideo.pause();
        MountainDewVideo.currentTime = 0;
        MountainDewVideo.remove(); // Remove from DOM
        MountainDewVideo = null; // Reset video reference
        resumeMusic(); // Resume music after the video ends
        showVolumeSlider(); // Show volume slider again after video ends
      });
    }

    MountainDewVideo.style.display = 'block';
    hideVolumeSlider(); // Hide volume slider during video playback
    MountainDewVideo.play().catch((error) => console.error('Error playing video:', error));
  }

  // Function to create and return video element
  function createMountainDewVideo() {
    const videoElement = document.createElement('video');
    videoElement.id = 'MountainDew-video';
    videoElement.src = '/MLG/mountainDew.webm'; // Use the same video source
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

// Helper function to find the MountainDew box in the scene
function findMountainDewInScene(scene) {
  let MountainDew = null;
  scene.traverse((child) => {
    if (child.name === 'Object_2') {
      MountainDew = child;
    }
  });
  return MountainDew;
}
