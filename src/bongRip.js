import './css/bongRip.css'; // CSS file for bong rip overlay
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { isMobileDevice } from './deviceDetection.js';
import { pauseMusic, resumeMusic } from './musicPlayer.js';
import { hideVolumeSlider, showVolumeSlider } from './volumeSlider.js';

export function initializeBongRip(scene) {
  const bongRip = findBongRipInScene(scene); // Find the bong rip object in the 3D scene
  if (!bongRip) {
    console.error('Bong rip object not found in the scene.');
    return;
  }

  bongRip.userData.clickable = true; // Mark the bong rip as interactive

  // Create the CSS overlay element
  const bongRipDiv = document.createElement('div');
  bongRipDiv.className = 'bong-rip-overlay';
  bongRipDiv.innerHTML = `<div class="bong-rip-hitbox"></div>`;

  // Attach the CSS object to the bong rip's position
  const cssObject = new CSS3DObject(bongRipDiv);
  cssObject.position.set(93, -234, -600); // Adjust position relative to the bong rip
  cssObject.rotation.set(0, 0, 0); // Adjust rotation if necessary
  bongRip.add(cssObject);

  let bongRipVideo = null; // Video will only be created on demand
  const bongRipHitbox = bongRipDiv.querySelector('.bong-rip-hitbox');

  // Event listener for click
  bongRipHitbox.addEventListener('click', () => {
    playBongRipVideo();
    pauseMusic();
  });

  // Function to dynamically play video
  function playBongRipVideo() {
    // If the video already exists, prevent re-creation
    if (!bongRipVideo) {
      bongRipVideo = createBongRipVideo();
      document.body.appendChild(bongRipVideo);
      

      // Cleanup video when it ends
      bongRipVideo.addEventListener('ended', () => {
        bongRipVideo.style.display = 'none';
        bongRipVideo.pause();
        bongRipVideo.currentTime = 0;
        bongRipVideo.remove(); // Remove from DOM
        bongRipVideo = null; // Reset video reference
        resumeMusic(); // Resume music after the video ends
        showVolumeSlider(); // Show volume slider again after video ends
      });
    }

    bongRipVideo.style.display = 'block';
    hideVolumeSlider(); // Hide volume slider during video playback
    bongRipVideo.play().catch((error) => console.error('Error playing video:', error));
  }

  // Function to create and return video element
  function createBongRipVideo() {
    const videoElement = document.createElement('video');
    videoElement.id = 'bong-rip-video';
    videoElement.src = getVideoSource();
    videoElement.autoplay = false;
    videoElement.loop = false;
    videoElement.muted = false;
    videoElement.style.display = 'none';
    videoElement.setAttribute('disablePictureInPicture', '');
    videoElement.setAttribute('playsinline', '');
    return videoElement;
  }

  // Function to determine the appropriate video source using isMobileDevice()
  function getVideoSource() {
    return isMobileDevice() ? '/MLG/bongRipMobile.webm' : '/MLG/bongRip.webm';
  }
}

// Helper function to find the bong rip object in the scene
function findBongRipInScene(scene) {
  let bongRip = null;
  scene.traverse((child) => {
    if (child.name === 'g_bottle') { // Replace with the actual object name in your Blender scene
      bongRip = child;
    }
  });
  return bongRip;
}
