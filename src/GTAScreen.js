import './css/GTAScreen.css'; // CSS file for GTAScreen overlay (create if needed)
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { isMobileDevice } from './deviceDetection.js'; // Import the shared device detection function
import { hitboxManager } from './hitboxManager.js';

export function initializeGTAScreen(scene, camera) {
  console.log('🎮 GTAScreen component initializing...');
  
  // GTAScreen disabled flag - set to true to completely disable the hitbox
  const GTAScreenDisabled = true;
  
  if (GTAScreenDisabled) {
    console.log('🎮 GTAScreen is disabled, skipping initialization');
    return {
      cssObject: null,
      element: null,
      disabled: true
    };
  }
  
  const GTAScreen = findGTAScreenInScene(scene); // Find the GTAScreen object in the 3D scene
  if (!GTAScreen) {
    console.warn('GTAScreen model not found. Available models:', scene.children.map(c => c.name));
  } else {
    GTAScreen.userData.clickable = true; // Mark the GTAScreen as interactive
    console.log('✓ GTAScreen 3D model found and marked as clickable');
  }

  // Create the CSS overlay element
  const GTAScreenDiv = document.createElement('div');
  GTAScreenDiv.className = 'GTAScreen-overlay';
  GTAScreenDiv.innerHTML = `<div class="GTAScreen-hitbox" style="background: rgba(0, 255, 0, 0.3); border: 2px solid #00ff00; width: 200px; height: 200px;"></div>`; // Temporarily visible for positioning

  // Attach the CSS object to the GTAScreen's position
  const cssObject = new CSS3DObject(GTAScreenDiv);
  // TODO: Manually adjust X, Y, Z position as needed
  cssObject.position.set(286.0, 206.0, 331.0); // X, Y, Z - moved to a more visible position
  cssObject.rotation.set(0.00, 0.30, 0.00); // Change rotation if needed
  // TODO: Manually adjust scale for X, Y, Z size
  cssObject.scale.set(0.500, 0.430, 0.380); // X, Y, Z scale - made larger for visibility
  scene.add(cssObject); // Add to scene

  // Register with hitbox manager for universal editing
  hitboxManager.registerHitbox('GTA Screen', cssObject, GTAScreenDiv);
  console.log('✓ GTAScreen hitbox registered with hitbox manager');

  const GTAScreenHitbox = GTAScreenDiv.querySelector('.GTAScreen-hitbox');
  console.log('✓ GTAScreen CSS element created and positioned');
  console.log('🎮 GTAScreen component fully initialized!');

  // Return an object with control functions (for future extensibility)
  return {
    cssObject,
    element: GTAScreenDiv
  };
}

// Helper function to find the GTAScreen model in the scene
function findGTAScreenInScene(scene) {
  let GTAScreen = null;
  scene.traverse((child) => {
    if (child.name === '') {
      GTAScreen = child;
    }
  });
  if (!GTAScreen) {
    console.warn('GTAScreen model not found. Available models:', scene.children.map(c => c.name));
  }
  return GTAScreen;
}
