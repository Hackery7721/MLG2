import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { enableCamera, disableCamera } from './cameraControls.js';
import './css/rollingPaper.css';

// Utility functions to hide/show CSS3D overlays during camera movement
function hideAllCSS3DObjects(scene) {
  scene.traverse((child) => {
    if (child.isCSS3DObject && child.element) {
      child.element.style.visibility = 'hidden';
    }
  });
}

function showAllCSS3DObjects(scene) {
  scene.traverse((child) => {
    if (child.isCSS3DObject && child.element) {
      child.element.style.visibility = 'visible';
    }
  });
}

/**
 * Initialize the rolling paper with interaction.
 * @param {THREE.Object3D} model - The 3D model containing the rolling paper.
 * @param {THREE.Scene} scene - The Three.js scene.
 * @param {THREE.Camera} camera - The Three.js camera.
 * @param {THREE.WebGLRenderer} renderer - The Three.js WebGL renderer.
 */
export function initializeRollingPaperWithInteraction(model, scene, camera, renderer) {
  let isCameraLocked = false;
  let originalCameraPosition = camera.position.clone();
  let originalCameraQuaternion = camera.quaternion.clone();
  let exitButton; // The 'X' button

  // Locate the rolling paper in the scene
  let rollingPaper;
  model.traverse((child) => {
    if (child.name === 'rollingpaper') {
      rollingPaper = child;
    }
  });

  if (!rollingPaper) {
    console.error('Rolling paper object not found in the scene.');
    return;
  }

  // Create a div element for the rolling paper interaction
  const rollingPaperDiv = document.createElement('div');
  rollingPaperDiv.innerHTML = `<div class="rolling-paper"></div>`;

  // Wrap the div in a CSS3DObject
  const rollingPaperObject = new CSS3DObject(rollingPaperDiv);
  rollingPaperObject.position.set(4.8, -3, -1.6);
  rollingPaperObject.rotation.x = Math.PI / 2;

  rollingPaper.add(rollingPaperObject);

  rollingPaperDiv.addEventListener('click', () => {
    moveCameraToRollingPaper();
  });

  function moveCameraToRollingPaper() {
    const targetPosition = new THREE.Vector3();
    rollingPaper.getWorldPosition(targetPosition);

    const topDownOffset = new THREE.Vector3(0, 15, 0); // Adjust height for the top-down view
    const finalPosition = targetPosition.clone().add(topDownOffset);
    const lookAtPosition = targetPosition.clone(); // Camera looks at the rolling paper

    const duration = 1500; // Duration of the animation in milliseconds
    const startTime = performance.now();
    const startPosition = camera.position.clone();

    disableCamera(); // Disable custom camera controls
    hideAllCSS3DObjects(scene); // Hide TV overlays during camera movement

    function animate() {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Interpolate camera position
      camera.position.lerpVectors(startPosition, finalPosition, t);

      // Ensure the camera looks directly at the rolling paper
      camera.lookAt(lookAtPosition);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // Final adjustment to the camera position and rotation
        applyFinalRotation(camera, finalPosition, lookAtPosition);
        showExitButton(); // Show the exit button after the camera locks
        isCameraLocked = true;
      }
    }

    animate();
  }

  function moveCameraBackToOriginal() {
    const duration = 1500; // Duration of the animation in milliseconds
    const startTime = performance.now();
    const startPosition = camera.position.clone();
    const startQuaternion = camera.quaternion.clone(); // Starting rotation

    function animate() {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Interpolate camera position
      camera.position.lerpVectors(startPosition, originalCameraPosition, t);

      // Smoothly interpolate rotation
      camera.quaternion.slerp(startQuaternion, originalCameraQuaternion, t);

      if (t < 1) {
        requestAnimationFrame(animate);
        hideExitButton();
      } else {
        // Camera is back to its original position
        enableCamera();
        isCameraLocked = false;
        showAllCSS3DObjects(scene); // Show TV overlays again after camera movement
      }
    }

    animate();
  }

  function showExitButton() {
    if (!exitButton) {
        // Create the exit button
        const exitDiv = document.createElement('div');
        exitDiv.innerHTML = `<div class="exit-button"></div>`;

        exitDiv.addEventListener('click', moveCameraBackToOriginal);

        // Wrap the button in a CSS3DObject and add to the scene
        exitButton = new CSS3DObject(exitDiv);
        exitButton.position.set(40, 0, 12);
        exitButton.rotation.x = (Math.PI * 3) / 2; // Rotate the button
        scene.add(exitButton);
    }
    exitButton.element.style.display = 'block'; // Ensure the button is visible
}

function hideExitButton() {
    if (exitButton) {
        // Remove the DOM element from the parent (if any)
        if (exitButton.element.parentNode) {
            exitButton.element.parentNode.removeChild(exitButton.element);
        }

        // Optionally, remove the object from the scene
        if (scene.children.includes(exitButton)) {
            scene.remove(exitButton);
        }

        // Clear reference to prevent memory leaks
        exitButton = null;
    }
}


  /**
   * Applies the final manual rotation to the camera.
   * @param {THREE.Camera} camera - The camera to adjust.
   * @param {THREE.Vector3} position - The final position of the camera.
   * @param {THREE.Vector3} lookAtTarget - The target the camera should look at.
   */
  function applyFinalRotation(camera, position, lookAtTarget) {
    // Explicitly set the final position
    camera.position.copy(position);

    // Ensure the camera looks at the target
    camera.lookAt(lookAtTarget);

    // Adjust the camera's rotation manually
    const finalRotation = new THREE.Euler(
      Math.PI / 2, // Adjust X rotation (e.g., tilt)
      Math.PI,           // Adjust Y rotation
      Math.PI / 6  // Adjust Z rotation (e.g., roll)
    );

    camera.rotation.copy(finalRotation); // Apply the manual rotation
  }

  return {
    unlockCamera() {
      isCameraLocked = false;
      enableCamera(); // Re-enable custom camera controls
    },
  };
}
