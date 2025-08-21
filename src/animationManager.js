import * as THREE from 'three';
import { isMobileDevice } from './deviceDetection.js'; // Reuse your device detection

let mixer = null; // Store the mixer globally
let animationFrameCounter = 0; // Counter for throttling updates

// Initialize animation mixer with mobile optimization
export function initializeAnimationMixer(model, animations) {
  if (!animations || animations.length === 0) {
    console.warn('No animations found in the model.');
    return;
  }

  mixer = new THREE.AnimationMixer(model);

  // Play animations with mobile optimizations
  animations.forEach((clip) => {
    const action = mixer.clipAction(clip);

    // Reduce animation speed on mobile devices
    if (isMobileDevice()) {
      action.timeScale = 0.66; // 25% slower on mobile
    }

    action.play();
  });
}

// Update animation mixer (to be called in the animation loop)
export function updateAnimationMixer(delta) {
  if (mixer) {
    // Throttle updates on mobile to reduce CPU load
    if (isMobileDevice()) {
      animationFrameCounter++;
      if (animationFrameCounter % 2 !== 0) return; // Update only every 2nd frame
    }

    mixer.update(delta);
  }
}

// Clean up the animation mixer when no longer needed
export function disposeAnimationMixer() {
  if (mixer) {
    mixer.stopAllAction();
    mixer = null;
  }
}
