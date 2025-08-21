import './css/Headphones.css'; // CSS file for Headphones overlay (create if needed)
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { isMobileDevice } from './deviceDetection.js'; // Import the shared device detection function
import { pauseMusic, resumeMusic } from './musicPlayer.js'; // Import the shared music player functions
import { hideVolumeSlider, showVolumeSlider } from './volumeSlider.js';
import { hitboxManager } from './hitboxManager.js';

export function initializeHeadphones(scene, camera) {
  const Headphones = findHeadphonesInScene(scene); // Find the Headphones object in the 3D scene
  if (!Headphones) {
    console.warn('Headphones model not found. Available models:', scene.children.map(c => c.name));
  } else {
    Headphones.userData.clickable = true; // Mark the Headphones as interactive
  }

  // Create the CSS overlay element
  const HeadphonesDiv = document.createElement('div');
  HeadphonesDiv.className = 'Headphones-overlay';
  HeadphonesDiv.innerHTML = `<div class="Headphones-hitbox" style="background: rgba(255, 0, 0, 0); border: 0px solid red; width: 200px; height: 200px;"></div>`; // Transparent by default

  // Attach the CSS object to the Headphones's position
  const cssObject = new CSS3DObject(HeadphonesDiv);
  // TODO: Manually adjust X, Y, Z position as needed
  cssObject.position.set(317.0, 0.0, -119.0); // X, Y, Z - adjust these values to position the overlay
  cssObject.rotation.set(0.10, -7.20, 0.00); // Change rotation if needed
  // TODO: Manually adjust scale for X, Y, Z size
  cssObject.scale.set(0.230, 0.130, 0.140); // X, Y, Z scale - adjust these values to resize the overlay
  scene.add(cssObject); // Add to scene

  // Register with hitbox manager for universal editing
  hitboxManager.registerHitbox('Headphones', cssObject, HeadphonesDiv);

  // Array of headphone sound effects
  const headphoneSounds = [
    '/MLG/HeadphoneSFX/And His Name is JOHN CENA - Sound Effect (HD).mp3',
    '/MLG/HeadphoneSFX/Damn Son Where\'d You Find This - Sound Effect (HD).mp3',
    '/MLG/HeadphoneSFX/Damn Son You Just Hit With the Wow Effect - Sound Effect (HD).mp3',
    '/MLG/HeadphoneSFX/Dank Meme Sound Effect.mp3',
    '/MLG/HeadphoneSFX/Dedotated Wam - Sound Effect (HD).mp3',
    '/MLG/HeadphoneSFX/FUCK HER RIGHT IN THE PUSSY (Interview Photobomb) MLG Meme Sound - Sound Effect for Editing.mp3',
    '/MLG/HeadphoneSFX/Gotta Go Fast (Sonic Theme) - Sound Effect (HD).mp3',
    '/MLG/HeadphoneSFX/Mario Jump - Sound Effect (HD).mp3',
    '/MLG/HeadphoneSFX/OH BABY A TRIPLE - Sound Effect (HD).mp3',
    '/MLG/HeadphoneSFX/Oh Hello There (Shrek Meme Sound) Earrape MLG - Sound Effect for editing.mp3',
    '/MLG/HeadphoneSFX/Ohh ohh OMFG (MOM GET THE CAMERA) MLG Sound - Sound Effect for Editing.mp3',
    '/MLG/HeadphoneSFX/Snoop Dogg Smoke Weed Everyday (MLG Meme Sound) - Sound Effect for Editing.mp3',
    '/MLG/HeadphoneSFX/THAT\'S RIGHT GET NOSCOPED (MLG Sound) - Sound Effect for Editing.mp3',
    '/MLG/HeadphoneSFX/What in the F_ck was that_ - Gaming Sound Effect (HD).mp3',
    '/MLG/HeadphoneSFX/WOMBO COMBO HAPPY FEET - Sound Effect (HD).mp3',
    '/MLG/HeadphoneSFX/WOW (MLG Sound) - Sound Effect for Editing.mp3'
  ];

  // Initialize the current sound index
  let currentSoundIndex = 0;

  // Shuffle the sound effects once when the page loads
  shuffleSounds();

  // Shuffle function for sound effects
  function shuffleSounds() {
    // Fisher-Yates shuffle algorithm
    for (let i = headphoneSounds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [headphoneSounds[i], headphoneSounds[j]] = [headphoneSounds[j], headphoneSounds[i]]; // Swap elements
    }
    currentSoundIndex = 0; // Reset index to the first shuffled sound
    console.log('Headphone sounds shuffled:', headphoneSounds);
  }

  let HeadphonesAudio = null; // Audio will only be created on demand
  const HeadphonesHitbox = HeadphonesDiv.querySelector('.Headphones-hitbox');

  // Event listener for click
  HeadphonesHitbox.addEventListener('click', () => {
    playNextHeadphonesSound();
  });

  // Function to play the next sound in the shuffled sequence
  function playNextHeadphonesSound() {
    // Get the current sound from the shuffled list
    const currentSound = headphoneSounds[currentSoundIndex];

    // Stop any currently playing headphones audio
    if (HeadphonesAudio) {
      HeadphonesAudio.pause();
      HeadphonesAudio.currentTime = 0;
      HeadphonesAudio.remove();
    }

    // Create new audio element
    HeadphonesAudio = document.createElement('audio');
    HeadphonesAudio.src = currentSound;
    HeadphonesAudio.volume = 0.7; // Set volume
    document.body.appendChild(HeadphonesAudio);

    // Play the sound
    HeadphonesAudio.play().catch((error) => {
      console.error('Error playing headphones sound:', error);
    });

    // Cleanup when finished
    HeadphonesAudio.addEventListener('ended', () => {
      HeadphonesAudio.remove();
      HeadphonesAudio = null;
    });

    console.log('Playing headphones sound:', currentSound);

    // Move to the next sound in the sequence (with wraparound)
    currentSoundIndex = (currentSoundIndex + 1) % headphoneSounds.length;
  }
}

// Helper function to find the Headphones object in the scene
function findHeadphonesInScene(scene) {
  let Headphones = null;
  scene.traverse((child) => {
    if (child.name === '') { // Update this with the actual object name
      Headphones = child;
    }
  });
  if (!Headphones) {
    console.warn('Headphones model not found. Available models:', scene.children.map(c => c.name));
  }
  return Headphones;
}
