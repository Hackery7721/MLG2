import './css/Joint.css'; // CSS file for Joint overlay (create if needed)
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import * as THREE from 'three';
import { isMobileDevice } from './deviceDetection.js';
import { pauseMusic, resumeMusic } from './musicPlayer.js';
import { hideVolumeSlider, showVolumeSlider } from './volumeSlider.js';
import { hitboxManager } from './hitboxManager.js';

export function initializeJoint(scene, camera) { // Add camera parameter
  const Joint = findJointInScene(scene); // Find the Joint model in the 3D scene
  if (!Joint) {
    console.warn('Joint model not found. Available models:', scene.children.map(c => c.name));
  } else {
    Joint.userData.clickable = true; // Mark the Joint as interactive
  }

  // Create the CSS overlay element
  const JointDiv = document.createElement('div');
  JointDiv.className = 'Joint-overlay';
  JointDiv.innerHTML = `<div class="Joint-hitbox" style="background: rgba(255, 0, 0, 0); border: 0px solid red; width: 200px; height: 200px;"></div>`; // Transparent by default

  // Attach the CSS object to the Joint's position
  const cssObject = new CSS3DObject(JointDiv);
  // TODO: Manually adjust X, Y, Z position as needed
  cssObject.position.set(342.0, 8.6, 89.0); // X, Y, Z - adjust these values to position the overlay
  cssObject.rotation.set(2.28, -2.40, -9.00); // Change rotation if needed
  // TODO: Manually adjust scale for X, Y, Z size
  cssObject.scale.set(0.040, 0.110, 0.030); // X, Y, Z scale - adjust these values to resize the overlay
  scene.add(cssObject); // Add to scene

  // Register with hitbox manager for universal editing
  hitboxManager.registerHitbox('Joint', cssObject, JointDiv);

  let JointVideo = null; // Video will only be created on demand
  let JointVideoElement = null; // The actual video DOM element
  const JointHitbox = JointDiv.querySelector('.Joint-hitbox');

  // Event listener for click
  JointHitbox.addEventListener('click', () => {
    console.log('Joint hitbox clicked!'); // Debug log
    playJointVideo();
    // Note: No need to pause music for video - it can play alongside
  });

  // Function to dynamically play video with transparent background
  function playJointVideo() {
    console.log('playJointVideo called'); // Debug log
    // If the video already exists, prevent re-creation
    if (!JointVideo) {
      console.log('Creating new joint video'); // Debug log
      JointVideo = createJointVideo();
      
      // Cleanup video when it ends
      JointVideo.addEventListener('ended', () => {
        JointVideo.pause();
        JointVideo.currentTime = 0;
        // Hide the video element
        if (JointVideoElement) {
          JointVideoElement.style.display = 'none';
        }
        // Show volume slider when video ends
        showVolumeSlider();
      });
    }

    // Hide volume slider when video starts playing
    hideVolumeSlider();
    
    // Show and play the video
    if (JointVideoElement) {
      JointVideoElement.style.display = 'block';
    }
    JointVideo.currentTime = 0; // Reset to start
    JointVideo.play().catch((error) => console.error('Error playing video:', error));
  }

  // Function to create and return video element with transparent background
  function createJointVideo() {
    const videoElement = document.createElement('video');
    videoElement.id = 'Joint-video';
    
    // Try multiple formats for better browser compatibility
    videoElement.innerHTML = `
      <source src="/MLG/tv_content/videos/SmokingJoint.webm" type="video/webm">
    `;
    
    videoElement.autoplay = false;
    videoElement.loop = false;
    videoElement.controls = false;
    videoElement.preload = 'auto';
    videoElement.muted = false; // Allow audio from the video
    
    // Add error handling and load event
    videoElement.addEventListener('loadeddata', () => {
      console.log('Joint video loaded successfully');
    });
    
    videoElement.addEventListener('error', (e) => {
      console.error('Error loading Joint video:', e);
      console.error('Video error code:', videoElement.error?.code);
      console.error('Video error message:', videoElement.error?.message);
    });
    
    // Style the video to overlay on the scene with transparency
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
    JointVideoElement = videoElement;
    
    return videoElement;
  }
}

// Helper function to find the Joint model in the scene
function findJointInScene(scene) {
  let Joint = null;
  scene.traverse((child) => {
    if (child.name === '') {
      Joint = child;
    }
  });
  if (!Joint) {
    console.warn('Joint model not found. Available models:', scene.children.map(c => c.name));
  }
  return Joint;
}
