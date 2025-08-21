import './css/ZoomTarget.css'; // CSS file for ZoomTarget overlay
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { isMobileDevice } from './deviceDetection.js'; // Import the shared device detection function
import { hitboxManager } from './hitboxManager.js';

export function initializeGame(scene, camera, css3DRenderer, targetName = 'Game', imageSrc = null) {
  const Game = findGameInScene(scene); // Find the Game object in the 3D scene
  if (!Game) {
    console.warn('Game model not found. Available models:', scene.children.map(c => c.name));
  } else {
    Game.userData.clickable = true; // Mark the Game as interactive
  }

  // Create the CSS overlay element with optional image
  const GameDiv = document.createElement('div');
  GameDiv.className = 'game-overlay';
  
  // Create hitbox content - can be an image or just a colored div
  let hitboxContent = '';
  if (imageSrc) {
    hitboxContent = `
      <div class="game-hitbox" style="
        background: rgba(255, 0, 0, 0); 
        border: 0px solid red; 
        width: 200px; 
        height: 200px;
        background-image: url('${imageSrc}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      "></div>
    `;
  } else {
    hitboxContent = `
      <div class="game-hitbox" style="
        background: rgba(255, 0, 0, 0); 
        border: 0px solid red; 
        width: 200px; 
        height: 200px;
      "></div>
    `;
  }
  
  GameDiv.innerHTML = hitboxContent;

  // Attach the CSS object to the Game's position
  const cssObject = new CSS3DObject(GameDiv);
  // TODO: Manually adjust X, Y, Z position as needed
  cssObject.position.set(0.0, 0.0, 0.0); // X, Y, Z - adjust these values to position the overlay
  cssObject.rotation.set(0.00, 0.00, 0.00); // Change rotation if needed
  // TODO: Manually adjust scale for X, Y, Z size
  cssObject.scale.set(0.030, 0.030, 0.030); // X, Y, Z scale - adjust these values to resize the overlay
  scene.add(cssObject); // Add to scene

  // Make sure the CSS3D renderer includes this object
  if (css3DRenderer && css3DRenderer.domElement) {
    // The CSS3DRenderer will automatically handle CSS3DObjects added to the scene
    console.log(`Game CSS object added to scene for CSS3D rendering`);
  }

  // Register with hitbox manager for universal editing
  hitboxManager.registerHitbox(targetName, cssObject, GameDiv);

  const GameHitbox = GameDiv.querySelector('.game-hitbox');
  let isZoomed = false;
  let originalCameraPosition = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  let originalCameraRotation = { x: camera.rotation.x, y: camera.rotation.y, z: camera.rotation.z };

  // Event listener for click
  GameHitbox.addEventListener('click', () => {
    if (!isZoomed) {
      zoomToTarget();
    } else {
      zoomOut();
    }
  });

  // Function to zoom camera to the target
  function zoomToTarget() {
    console.log(`Zooming to ${targetName}`);
    
    // Store original camera position and rotation
    originalCameraPosition = { 
      x: camera.position.x, 
      y: camera.position.y, 
      z: camera.position.z 
    };
    originalCameraRotation = { 
      x: camera.rotation.x, 
      y: camera.rotation.y, 
      z: camera.rotation.z 
    };

    // Calculate zoom position (move camera closer to the target)
    const targetPosition = cssObject.position;
    const zoomDistance = 50; // Distance from target when zoomed
    
    // Animate camera to zoom position
    animateCamera(
      camera.position,
      {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z + zoomDistance
      },
      1000, // 1 second animation
      () => {
        isZoomed = true;
        console.log(`Zoomed into ${targetName}`);
      }
    );

    // Also rotate camera to look at target if needed
    // camera.lookAt(targetPosition.x, targetPosition.y, targetPosition.z);
  }

  // Function to zoom camera back out
  function zoomOut() {
    console.log(`Zooming out from ${targetName}`);
    
    // Animate camera back to original position
    animateCamera(
      camera.position,
      originalCameraPosition,
      1000, // 1 second animation
      () => {
        // Restore original rotation
        camera.rotation.set(
          originalCameraRotation.x,
          originalCameraRotation.y,
          originalCameraRotation.z
        );
        isZoomed = false;
        console.log(`Zoomed out from ${targetName}`);
      }
    );
  }

  // Helper function to animate camera movement
  function animateCamera(startPos, endPos, duration, onComplete) {
    const startTime = Date.now();
    
    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function (ease-in-out)
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      // Interpolate position
      camera.position.x = startPos.x + (endPos.x - startPos.x) * easeProgress;
      camera.position.y = startPos.y + (endPos.y - startPos.y) * easeProgress;
      camera.position.z = startPos.z + (endPos.z - startPos.z) * easeProgress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (onComplete) {
        onComplete();
      }
    }
    
    animate();
  }

  // Function to update the image source dynamically
  function updateImage(newImageSrc) {
    if (newImageSrc) {
      GameHitbox.style.backgroundImage = `url('${newImageSrc}')`;
      GameHitbox.style.backgroundSize = 'cover';
      GameHitbox.style.backgroundPosition = 'center';
      GameHitbox.style.backgroundRepeat = 'no-repeat';
    } else {
      GameHitbox.style.backgroundImage = 'none';
    }
  }

  // Return an object with control functions
  return {
    zoomToTarget,
    zoomOut,
    updateImage,
    isZoomed: () => isZoomed,
    cssObject,
    element: GameDiv
  };
}

// Helper function to find the Game model in the scene
function findGameInScene(scene) {
  let Game = null;
  scene.traverse((child) => {
    if (child.name === '') {
      Game = child;
    }
  });
  if (!Game) {
    console.warn('Game model not found. Available models:', scene.children.map(c => c.name));
  }
  return Game;
}
