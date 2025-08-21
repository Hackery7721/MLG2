import './css/Illuminati.css'; // CSS file for Illuminati overlay (create if needed)
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { isMobileDevice } from './deviceDetection.js'; // Import the shared device detection function
import { pauseMusic, resumeMusic } from './musicPlayer.js'; // Import the shared music player functions
import { hideVolumeSlider, showVolumeSlider } from './volumeSlider.js';
import { hitboxManager } from './hitboxManager.js';

export function initializeIlluminati(scene, camera) {
  const Illuminati = findIlluminatiInScene(scene); // Find the Illuminati object in the 3D scene
  if (!Illuminati) {
    console.warn('Illuminati model not found. Available models:', scene.children.map(c => c.name));
  } else {
    Illuminati.userData.clickable = true; // Mark the Illuminati as interactive
  }

  // Create the CSS overlay element
  const IlluminatiDiv = document.createElement('div');
  IlluminatiDiv.className = 'Illuminati-overlay';
  IlluminatiDiv.innerHTML = `<div class="Illuminati-hitbox" style="background: rgba(255, 0, 0, 0); border: 0px solid red; width: 200px; height: 200px;"></div>`; // Transparent by default

  // Attach the CSS object to the Illuminati's position
  const cssObject = new CSS3DObject(IlluminatiDiv);
  // TODO: Manually adjust X, Y, Z position as needed
  cssObject.position.set(144.0, 152.2, 44.0); // X, Y, Z - adjust these values to position the overlay
  cssObject.rotation.set(0.00, 1.50, 0.00); // Change rotation if needed
  // TODO: Manually adjust scale for X, Y, Z size
  cssObject.scale.set(0.030, 0.030, 0.030); // X, Y, Z scale - adjust these values to resize the overlay
  scene.add(cssObject); // Add to scene

  // Register with hitbox manager for universal editing
  hitboxManager.registerHitbox('Illuminati', cssObject, IlluminatiDiv);

  let IlluminatiAudio = null; // Audio will only be created on demand
  const IlluminatiHitbox = IlluminatiDiv.querySelector('.Illuminati-hitbox');

  // Event listener for click
  IlluminatiHitbox.addEventListener('click', () => {
    playIlluminatiAudio();
    pauseMusic(); // Pause music when the sound effect starts playing
  });

  // Function to dynamically play audio
  function playIlluminatiAudio() {
    // If the audio already exists, prevent re-creation
    if (!IlluminatiAudio) {
      console.log('Creating new Illuminati audio'); // Debug log
      IlluminatiAudio = createIlluminatiAudio();
      
      // Cleanup audio when it ends
      IlluminatiAudio.addEventListener('ended', () => {
        IlluminatiAudio.pause();
        IlluminatiAudio.currentTime = 0;
        console.log('Illuminati audio finished playing');
        resumeMusic(); // Resume music after the sound effect ends
      });
    }

    IlluminatiAudio.currentTime = 0; // Reset to start
    IlluminatiAudio.play().catch((error) => console.error('Error playing Illuminati audio:', error));
  }

  // Function to create and return audio element
  function createIlluminatiAudio() {
    const audioElement = document.createElement('audio');
    audioElement.id = 'Illuminati-audio';
    audioElement.src = '/MLG/tv_content/videos/Hyper Distorted Illuminati Confirmed - Sound Effect (HD).mp3'; // Fixed path to match actual location
    audioElement.autoplay = false;
    audioElement.loop = false;
    audioElement.preload = 'auto';
    audioElement.volume = 1.0; // Full volume
    
    return audioElement;
  }
}

// Helper function to find the Illuminati model in the scene
function findIlluminatiInScene(scene) {
  let Illuminati = null;
  scene.traverse((child) => {
    if (child.name === '') {
      Illuminati = child;
    }
  });
  if (!Illuminati) {
    console.warn('Illuminati model not found. Available models:', scene.children.map(c => c.name));
  }
  return Illuminati;
}
