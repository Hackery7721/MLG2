// ArcadeLevelSelect.js
// Level select screen logic using provided code snippet
import { hitboxManager } from './hitboxManager.js';

export function initializeArcadeLevelSelect(scene, camera, css3DRenderer, options = {}) {
  // List of level select images based on actual files in directory
  const levelSelectImages = [
    '/MLG/tv_content/Level Select/MemeHunt1.png',
    '/MLG/tv_content/Level Select/MemeHunt2.png',
    '/MLG/tv_content/Level Select/MemeHunt3.png',
    '/MLG/tv_content/Level Select/MemeHunt4.png',
    '/MLG/tv_content/Level Select/MemeHunt5.png'
  ];

  // Corresponding game images based on actual files in directory
  const gameImages = [
    '/MLG/tv_content/Level Select/MemeHunt1Game.png',
    '/MLG/tv_content/Level Select/MemeHunt2Game.png',
    '/MLG/tv_content/Level Select/MemeHunt3Game.png',
    '/MLG/tv_content/Level Select/MemeHunt4Game.png',
    '/MLG/tv_content/Level Select/MemeHunt5Game.png'
  ];

  let currentLevelIndex = (options && typeof options.startLevelIndex === 'number') ? options.startLevelIndex : 0;
  let isInGameView = false; // Track whether we're viewing the game screen or select screen

  // Remove previous level select screen if present
  const oldScreen = document.getElementById('arcade-level-select');
  if (oldScreen) oldScreen.parentNode.removeChild(oldScreen);

  // Create level select container
  const levelSelectContainer = document.createElement('div');
  levelSelectContainer.id = 'arcade-level-select';
  levelSelectContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: black;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // Create level image display
  const levelImage = document.createElement('img');
  levelImage.style.cssText = `
    max-width: 80%;
    max-height: 80%;
    object-fit: contain;
    user-select: none;
    pointer-events: none;
    border: none;
    border-radius: 0;
    box-shadow: none;
    image-rendering: pixelated;
    outline: none;
    outline-offset: 0;
    transition: none;
  `;
  levelImage.src = levelSelectImages[currentLevelIndex];
  levelImage.alt = `Level ${currentLevelIndex + 1}`;

  // Create left arrow using custom image
  const leftArrow = document.createElement('img');
  leftArrow.src = '/MLG/tv_content/Level Select/ArrowLeft.png';
  leftArrow.style.cssText = `
    position: absolute;
    left: 50px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    user-select: none;
    z-index: 10001;
    transition: all 0.2s cubic-bezier(.4,0,.2,1);
    max-width: 80px;
    max-height: 80px;
    filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.8));
  `;
  leftArrow.addEventListener('mouseenter', () => {
    leftArrow.style.maxWidth = '96px';
    leftArrow.style.maxHeight = '96px';
    leftArrow.style.filter = 'drop-shadow(0 0 12px #fff)';
  });
  leftArrow.addEventListener('mouseleave', () => {
    leftArrow.style.maxWidth = '80px';
    leftArrow.style.maxHeight = '80px';
    leftArrow.style.filter = 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))';
  });

  // Create right arrow using custom image
  const rightArrow = document.createElement('img');
  rightArrow.src = '/MLG/tv_content/Level Select/ArrowRight.png';
  rightArrow.style.cssText = `
    position: absolute;
    right: 50px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    user-select: none;
    z-index: 10001;
    transition: all 0.2s cubic-bezier(.4,0,.2,1);
    max-width: 80px;
    max-height: 80px;
    filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.8));
  `;
  rightArrow.addEventListener('mouseenter', () => {
    rightArrow.style.maxWidth = '96px';
    rightArrow.style.maxHeight = '96px';
    rightArrow.style.filter = 'drop-shadow(0 0 12px #fff)';
  });
  rightArrow.addEventListener('mouseleave', () => {
    rightArrow.style.maxWidth = '80px';
    rightArrow.style.maxHeight = '80px';
    rightArrow.style.filter = 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))';
  });

  // Create level counter
  const levelCounter = document.createElement('div');
  levelCounter.style.cssText = `
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-family: 'Golden age', sans-serif;
    font-size: 24px;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    z-index: 10001;
  `;

  function updateLevelCounter() {
    const viewText = isInGameView ? ' - Game View' : '';
    levelCounter.textContent = `Level ${currentLevelIndex + 1} / ${levelSelectImages.length}${viewText}`;
  }
  // Ensure counter is visible on initial load
  updateLevelCounter();

  function updateArrowVisibility() {
    leftArrow.style.display = currentLevelIndex === 0 ? 'none' : 'block';
    rightArrow.style.display = currentLevelIndex === levelSelectImages.length - 1 ? 'none' : 'block';
  }

  function updateLevelImage() {
    levelImage.src = levelSelectImages[currentLevelIndex];
    levelImage.alt = `Level ${currentLevelIndex + 1}`;
    levelImage.style.boxShadow = 'none';
    levelImage.style.border = 'none';
    levelImage.style.borderRadius = '0';
    levelImage.style.imageRendering = 'pixelated';
    levelImage.style.outline = 'none';
    levelImage.style.outlineOffset = '0';
    updateArrowVisibility();
  }

  // Add StartLevel and ExitMachine hitboxes
  function addHitboxes() {
    // StartLevel hitbox (now on every level)
    if (!document.getElementById('start-level-hitbox')) {
      const startLevelHitbox = document.createElement('div');
      startLevelHitbox.className = 'ArcadeStartScreen-hitbox';
      startLevelHitbox.id = 'start-level-hitbox';
      startLevelHitbox.style.cssText = `
        position: fixed;
        top: 60%;
        left: 50%;
        width: 300px;
        height: 80px;
        pointer-events: auto;
        z-index: 10002;
        transform: translate(-50%, -50%);
        border: 2px solid #00ff00;
        background: rgba(0,255,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-family: 'Comic Sans MS', sans-serif;
        font-size: 2em;
        border-radius: 16px;
        box-shadow: 0 0 16px #00ff00;
        user-select: none;
        opacity: 0;
        transition: opacity 0.2s;
      `;
      startLevelHitbox.textContent = 'Start Level';
      startLevelHitbox.addEventListener('mouseenter', () => {
        startLevelHitbox.style.cursor = 'pointer';
      });
      startLevelHitbox.addEventListener('mouseleave', () => {
        startLevelHitbox.style.cursor = '';
      });
      startLevelHitbox.onclick = () => {
        // Remove level select UI
        if (levelSelectContainer.parentNode) levelSelectContainer.parentNode.removeChild(levelSelectContainer);
        // Remove hitboxes
        if (startLevelHitbox.parentNode) startLevelHitbox.parentNode.removeChild(startLevelHitbox);
        const exitBox = document.getElementById('exit-machine-hitbox');
        if (exitBox && exitBox.parentNode) exitBox.parentNode.removeChild(exitBox);
        // Start the game using Game.js
        import('./Game.js').then(module => {
          if (module.initializeGameScreen) {
            module.initializeGameScreen(currentLevelIndex, scene, camera, css3DRenderer, options);
          }
        });
      };
      document.body.appendChild(startLevelHitbox);
      // Controller object for hitboxManager
      const startLevelController = {
        position: { x: 0.0, y: -57.0, z: -9.0 },
        rotation: { x: 0.00, y: 0.00, z: 0.00 },
        scale: { x: 0.980, y: 1.020, z: 1.000 },
        element: startLevelHitbox,
        updateHitbox() {
          const baseWidth = 300;
          const baseHeight = 80;
          const newWidth = baseWidth * this.scale.x;
          const newHeight = baseHeight * this.scale.y;
          startLevelHitbox.style.width = `${newWidth}px`;
          startLevelHitbox.style.height = `${newHeight}px`;
          startLevelHitbox.style.transform = `translate(-50%, -50%) translate(${this.position.x}px, ${this.position.y}px) rotateX(${this.rotation.x}rad) rotateY(${this.rotation.y}rad) rotateZ(${this.rotation.z}rad)`;
        },
        setDebugVisible(visible) {
          startLevelHitbox.style.opacity = visible ? '1' : '0';
          startLevelHitbox.style.pointerEvents = 'auto';
        }
      };
      startLevelController.updateHitbox();
      hitboxManager.registerHitbox('StartLevel', startLevelController, startLevelHitbox);
      function animateStartLevelHitbox() {
        startLevelController.updateHitbox();
        requestAnimationFrame(animateStartLevelHitbox);
      }
      animateStartLevelHitbox();
    }

    // ExitMachine hitbox (still only on level 1)
    if (currentLevelIndex === 0 && !document.getElementById('exit-machine-hitbox')) {
      const exitMachineHitbox = document.createElement('div');
      exitMachineHitbox.className = 'ArcadeStartScreen-hitbox';
      exitMachineHitbox.id = 'exit-machine-hitbox';
      exitMachineHitbox.style.cssText = `
        position: fixed;
        top: 10%;
        left: 85%;
        width: 220px;
        height: 64px;
        pointer-events: auto;
        z-index: 10002;
        transform: translate(-50%, -50%);
        border: 2px solid #ff0000;
        background: rgba(255,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-family: 'Comic Sans MS', sans-serif;
        font-size: 1.2em;
        border-radius: 12px;
        box-shadow: 0 0 12px #ff0000;
        user-select: none;
        opacity: 0;
        transition: opacity 0.2s;
      `;
      exitMachineHitbox.textContent = 'Exit Machine';
      exitMachineHitbox.addEventListener('mouseenter', () => {
        exitMachineHitbox.style.cursor = 'pointer';
      });
      exitMachineHitbox.addEventListener('mouseleave', () => {
        exitMachineHitbox.style.cursor = '';
      });
      exitMachineHitbox.onclick = () => {
        // Remove all overlays, level select, and game UI
        document.querySelectorAll('#arcade-level-select, .ArcadeStartScreen-hitbox, img, button, #rotate-overlay').forEach(el => {
          if (el.parentNode) el.parentNode.removeChild(el);
        });
        // Call custom scene initialization if available
        if (typeof window.initializeNormalScene === 'function') {
          window.initializeNormalScene();
        }
      };
      document.body.appendChild(exitMachineHitbox);
      // Controller object for hitboxManager
      const exitMachineController = {
        position: { x: -675.0, y: 596.0, z: 2.0 },
        rotation: { x: 0.00, y: 0.00, z: 0.00 },
        scale: { x: 0.980, y: 1.280, z: 1.060 },
        element: exitMachineHitbox,
        updateHitbox() {
          const baseWidth = 220;
          const baseHeight = 64;
          const newWidth = baseWidth * this.scale.x;
          const newHeight = baseHeight * this.scale.y;
          exitMachineHitbox.style.width = `${newWidth}px`;
          exitMachineHitbox.style.height = `${newHeight}px`;
          exitMachineHitbox.style.transform = `translate(-50%, -50%) translate(${this.position.x}px, ${this.position.y}px) rotateX(${this.rotation.x}rad) rotateY(${this.rotation.y}rad) rotateZ(${this.rotation.z}rad)`;
        },
        setDebugVisible(visible) {
          exitMachineHitbox.style.opacity = visible ? '1' : '0';
          exitMachineHitbox.style.pointerEvents = 'auto';
        }
      };
      exitMachineController.updateHitbox();
      hitboxManager.registerHitbox('ExitMachine', exitMachineController, exitMachineHitbox);
      function animateExitMachineHitbox() {
        exitMachineController.updateHitbox();
        requestAnimationFrame(animateExitMachineHitbox);
      }
      animateExitMachineHitbox();
    }
  }

  // Call addHitboxes on init and navigation
  addHitboxes();
  leftArrow.addEventListener('click', () => {
    if (currentLevelIndex > 0) {
      currentLevelIndex--;
      isInGameView = false;
      updateLevelImage();
      updateLevelCounter();
      addHitboxes();
    }
  });
  rightArrow.addEventListener('click', () => {
    if (currentLevelIndex < levelSelectImages.length - 1) {
      currentLevelIndex++;
      isInGameView = false;
      updateLevelImage();
      updateLevelCounter();
      addHitboxes();
    }
  });

  // Add CSS to container to prevent all selection and dragging
  levelSelectContainer.style.userSelect = 'none';
  levelSelectContainer.style.webkitUserSelect = 'none';
  levelSelectContainer.style.msUserSelect = 'none';
  levelSelectContainer.style.MozUserSelect = 'none';
  levelSelectContainer.setAttribute('unselectable', 'on');

  // Prevent drag, drop, and selection/highlighting on level image and arrows
  [levelImage, leftArrow, rightArrow].forEach(el => {
    el.setAttribute('draggable', 'false');
    el.ondragstart = (e) => e.preventDefault();
    el.onmousedown = (e) => e.preventDefault();
    el.onselectstart = (e) => false;
    el.style.userSelect = 'none';
    el.style.webkitUserSelect = 'none';
    el.style.msUserSelect = 'none';
    el.style.MozUserSelect = 'none';
  });
  // Prevent selection/highlighting of the level counter
  levelCounter.setAttribute('unselectable', 'on');
  levelCounter.style.userSelect = 'none';
  levelCounter.style.webkitUserSelect = 'none';
  levelCounter.style.msUserSelect = 'none';
  levelCounter.style.MozUserSelect = 'none';
  levelCounter.onselectstart = (e) => false;

  // Prevent pointer events on the image to block all interaction
  levelImage.style.pointerEvents = 'none';

  // Append elements
  levelSelectContainer.appendChild(levelImage);
  levelSelectContainer.appendChild(leftArrow);
  levelSelectContainer.appendChild(rightArrow);
  levelSelectContainer.appendChild(levelCounter);

  document.body.appendChild(levelSelectContainer);
}
