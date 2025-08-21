import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import './css/vault.css';
import { pauseMusic, resumeMusic, audio } from './musicPlayer.js';
import { isMobileDevice } from './deviceDetection.js';

export function loadVaultContent(model) {
  const tvs = []; // Array to store references to all TVs and their videos
  let currentPlayingVideo = null; // Track the currently playing video
  let isVaultPlaying = false; // Track if any vault video is playing
  
  // Pause music when entering the vault
  console.log('Entering Vault: Pausing Music...');
  
  // Helper function to initialize a TV
  function initializeTV(tv, videoSrc, position, rotation = { x: 0, y: 0, z: 0 }, tvClass) {
    if (!tv) {
      console.error(`TV not found for ${tvClass}`);
      return;
    }
  
    console.log(`Initializing TV: ${tvClass}`, tv);

    const videoElement = document.createElement('video');
    
    if (isMobileDevice()) {
      videoElement.muted = true;
    }
    else {
      videoElement.muted = false;
    }

    videoElement.setAttribute('autoplay', 'true');
    videoElement.autoplay = true;
    videoElement.setAttribute('loop', '');
    videoElement.setAttribute('playsinline', ''); // Required for iOS
    videoElement.setAttribute('disablePictureInPicture', ''); // Disable PiP mode
    videoElement.className = tvClass; // Apply specific class to the video element
    videoElement.innerHTML = `
      <source src="${videoSrc}" type="video/webm">
      Your browser does not support the video tag.
    `;
  
    const vaultDiv = document.createElement('div');
    vaultDiv.className = 'vault-content'; // General styles
    vaultDiv.appendChild(videoElement);
  
    const tvObject = new CSS3DObject(vaultDiv);
    tvObject.position.set(...position); // Set position
    tvObject.rotation.set(rotation.x, rotation.y, rotation.z); // Set rotation
    tv.add(tvObject);
  
    // Add click event listener to play audio for this TV
    videoElement.addEventListener('click', () => {
      console.log('Click event triggered for:', videoElement);
      playAudioForTV(videoElement);
    });
  
    // Test video playback
    videoElement.play().then(() => {
      console.log('Video is playing:', videoElement);
    }).catch((error) => {
      console.error('Error playing video:', error);
    });
  
    // Store TV and video reference
    tvs.push({ tvObject, videoElement });
  }
  

  // Initialize TVs with content and specific CSS classes
  initializeTV(
    findChildByName(model, 'TV6'),
    '/MLG/tv_content/videos/greenVault.webm',
    [2500, 500, -1750], // Position
    { x: 0, y: -1.2, z: 0 }, // Rotation
    'vault-tv6-1' // Specific CSS class
  );

  initializeTV(
    findChildByName(model, 'TV6'),
    '/MLG/tv_content/videos/teletubbyVault.webm',
    [2500, -415, -1750], // Position
    { x: 0, y: -1.2, z: 0 }, // Rotation
    'vault-tv6-2' // Specific CSS class
  );

  initializeTV(
    findChildByName(model, 'TV7'),
    '/MLG/tv_content/videos/FazeVault.webm',
    [1195, 450, -2050], // Position
    { x: 0, y: -0.9, z: 0 }, // Rotation
    'vault-tv7-1' // Specific CSS class
  );

  initializeTV(
    findChildByName(model, 'TV7'),
    '/MLG/tv_content/videos/snoopVault.webm',
    [1195, -380, -2050], // Position
    { x: 0, y: -0.9, z: 0 }, // Rotation
    'vault-tv7-2' // Specific CSS class
  );

  initializeTV(
    findChildByName(model, 'TV8'),
    '/MLG/tv_content/videos/Fazemontage.webm',
    [807, 970, 3100], // Position
    { x: 0, y: 0, z: 0 }, // Rotation
    'vault-tv8' // Specific CSS class
  );

  initializeTV(
    findChildByName(model, 'TV8'),
    '/MLG/tv_content/videos/Fazemontage1.webm',
    [807, -140, 3100], // Position
    { x: 0, y: 0, z: 0 }, // Rotation
    'vault-tv8' // Specific CSS class
  );

  // Function to mute all TVs except the clicked one and pause the current video if clicked again
  function playAudioForTV(selectedVideo) {
    if (currentPlayingVideo === selectedVideo) {
      // If the selected TV is already playing, pause it
      selectedVideo.muted = true;
      selectedVideo.pause();
      currentPlayingVideo = null; // Reset the current playing video

      if (!tvs.some(({ videoElement }) => !videoElement.paused)) {
        // If no other videos are playing, resume music
        console.log('All videos paused. Resuming music...');
        resumeMusic();
      }

    } else {
      // Otherwise, play the selected video and pause all others
      tvs.forEach(({ videoElement }) => {
        if (videoElement === selectedVideo) {
          videoElement.muted = false; // Unmute the selected video
          videoElement.play(); // Ensure it plays
          currentPlayingVideo = selectedVideo; // Update the current playing video
          pauseMusic(); // Pause music when a video is playing
        } else {
          videoElement.muted = true; // Mute all others
          videoElement.pause(); // Pause muted videos
        }
      });
    }
  }
}

// Function to clear only overlayed videos specifically on TV8s
export function clearVaultTVs(model) {
  console.log('Clearing overlayed videos from vault TV8s...');

  // Find all TV8 objects in the model
  const tvNames = ['TV8'];

  tvNames.forEach((tvName) => {
    const tv = findChildByName(model, tvName); // Locate TV8 in the scene

    if (tv) {
      // Loop through all the children of TV8
      for (let i = tv.children.length - 1; i >= 0; i--) {
        const child = tv.children[i];

        // Check if the child has a video element (CSS3DObject) with the specific class
        const videoElement = child.element.querySelector('video.vault-tv8');
        if (videoElement) {
          console.log(`Pausing and removing overlayed video from: ${tvName}`);
          videoElement.pause(); // Stop the video playback
          videoElement.currentTime = 0; // Reset video playback to start
          videoElement.parentElement.style.display = 'none'; // Hide video container
          tv.remove(child); // Remove the overlay video (CSS3DObject) from TV8
        }
      }
    } else {
      console.warn(`TV with name "${tvName}" not found in the scene.`);
    }
  });

  console.log('Overlayed videos have been cleared from vault TV8s.');
}

// Helper function to find child by name
function findChildByName(model, name) {
  let result = null;
  model.traverse((child) => {
    if (child.name === name) {
      result = child;
    }
  });
  return result;
}
