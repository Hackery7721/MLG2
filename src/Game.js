// Game.js
// Main entry for game logic after user starts a level from ArcadeLevelSelect

export function initializeGameScreen(levelIndex, scene, camera, css3DRenderer, options = {}) {
  // Detect mobile and orientation
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  function isPortrait() {
    return window.innerHeight > window.innerWidth;
  }

  function showRotateOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'rotate-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.95);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2em;
      font-family: 'Comic Sans MS', sans-serif;
      z-index: 10001;
      text-align: center;
      pointer-events: auto;
    `;
    overlay.textContent = 'Please rotate your device sideways (landscape) to play.';
    document.body.appendChild(overlay);
    return overlay;
  }

  function removeRotateOverlay() {
    const overlay = document.getElementById('rotate-overlay');
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  // Show the game PNG for the selected level
  const gameImages = [
    '/MLG/tv_content/Level Select/MemeHunt1Game.png',
    '/MLG/tv_content/Level Select/MemeHunt2Game.png',
    '/MLG/tv_content/Level Select/MemeHunt3Game.png',
    '/MLG/tv_content/Level Select/MemeHunt4Game.png',
    '/MLG/tv_content/Level Select/MemeHunt5Game.png'
  ];
  const gameImage = document.createElement('img');
  gameImage.src = gameImages[levelIndex];
  gameImage.alt = `Game Level ${levelIndex + 1}`;
  gameImage.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    background: #000;
    z-index: 10000;
    user-select: none;
    pointer-events: none;
    transition: transform 0.4s;
  `;
  document.body.appendChild(gameImage);

  // Add fullscreen overlay to block all interaction behind game screen
  const blockOverlay = document.createElement('div');
  blockOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000;
    z-index: 9999;
    pointer-events: auto;
  `;
  document.body.appendChild(blockOverlay);

  // Mobile orientation logic
  function handleOrientation() {
    setTimeout(() => {
      if (isMobile() && isPortrait()) {
        gameImage.style.transform = 'rotate(90deg)';
        showRotateOverlay();
      } else {
        gameImage.style.transform = '';
        removeRotateOverlay();
      }
    }, 0);
  }
  handleOrientation();
  window.addEventListener('resize', handleOrientation);
  window.addEventListener('orientationchange', handleOrientation);

  // Add back button to return to level select
  const backButton = document.createElement('button');
  backButton.textContent = 'Back to Level Select';
  backButton.draggable = false;
  backButton.style.cssText = `
  position: fixed;
  top: 40px;
  left: 40px;
  padding: 16px 32px;
  font-size: 1.2em;
  font-family: 'Comic Sans MS', sans-serif;
  color: #fff;
  background: #222;
  border: 2px solid #00ffea;
  border-radius: 12px;
  box-shadow: 0 0 12px #00ffea;
  cursor: pointer;
  z-index: 10001;
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  pointer-events: auto;
  `;
  backButton.addEventListener('dragstart', e => e.preventDefault());
  backButton.onclick = () => {
    if (gameImage.parentNode) gameImage.parentNode.removeChild(gameImage);
    if (backButton.parentNode) backButton.parentNode.removeChild(backButton);
    if (blockOverlay.parentNode) blockOverlay.parentNode.removeChild(blockOverlay);
    // Import and show ArcadeLevelSelect at the same level
    import('./ArcadeLevelSelect.js').then(module => {
      if (module.initializeArcadeLevelSelect) {
        module.initializeArcadeLevelSelect(scene, camera, css3DRenderer, { startLevelIndex: levelIndex });
      }
    });
  };
  document.body.appendChild(backButton);

  // --- Enemy spawn and render logic ---
  import('./level1Entities.js').then(({ enemies, normalEnemyConfig, getRandomEnemy, player }) => {
    // --- Player rendering and movement ---
    const playerImg = document.createElement('img');
    playerImg.src = player.images.idle;
    playerImg.alt = 'Player';
    playerImg.draggable = false;
    playerImg.style.cssText = `
  position: absolute;
  width: 80px;
  height: 80px;
  left: ${window.innerWidth / 2 - 40}px;
  top: ${window.innerHeight - 80}px;
  z-index: 10002;
  pointer-events: auto;
  user-select: none;
  transition: left 0.1s;
    `;
    playerImg.addEventListener('dragstart', e => e.preventDefault());
    document.body.appendChild(playerImg);

    let playerX = window.innerWidth / 2 - 40;
    const playerY = window.innerHeight - 80;
    let movingLeft = false;
    let movingRight = false;
    let runningFrame = 0;
    let lastDirection = 'right';
    let lastMoveTime = Date.now();
      let inGame = true; // Set to true when player is in game, false otherwise

      // --- Bullet firing logic with array, fire rate, and max bullets ---
      const bulletLayer = document.createElement('div');
      bulletLayer.id = 'bullet-layer';
      bulletLayer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 10003;
      `;
      document.body.appendChild(bulletLayer);

      // Bullet config
      const bulletConfig = {
        fireRate: 0, // ms between shots, 0 = unlimited
        maxBullets: 0, // 0 = unlimited
        speed: 16 // bullet speed
      };
      let lastFireTime = 0;
      const bullets = [];

      function fireBullet() {
        if (!inGame) return;
        const now = Date.now();
        if (bulletConfig.fireRate > 0 && now - lastFireTime < bulletConfig.fireRate) return;
        if (bulletConfig.maxBullets > 0 && bullets.length >= bulletConfig.maxBullets) return;
        lastFireTime = now;
        const bulletImg = document.createElement('img');
        bulletImg.src = '/MLG/tv_content/Player/Bullet.png';
        bulletImg.alt = 'Bullet';
        bulletImg.draggable = false;
        bulletImg.style.cssText = `
          position: absolute;
          width: 32px;
          height: 32px;
          left: ${playerX + 24}px;
          top: ${playerY - 16}px;
          z-index: 10003;
          pointer-events: auto;
          user-select: none;
          transition: top 0.1s;
        `;
        bulletImg.addEventListener('dragstart', e => e.preventDefault());
        bulletLayer.appendChild(bulletImg);
        const bulletObj = {
          img: bulletImg,
          x: playerX + 24,
          y: playerY - 16,
          speed: bulletConfig.speed // Each bullet tracks its own speed
        };
        bullets.push(bulletObj);
      }

      function updateBullets() {
        for (let i = bullets.length - 1; i >= 0; i--) {
          const bullet = bullets[i];
          bullet.y -= bullet.speed;
          bullet.img.style.top = `${bullet.y}px`;

          // Improved collision detection with enemies using getBoundingClientRect
          let bulletHit = false;
          const bulletRect = bullet.img.getBoundingClientRect();
          for (let j = spawnedEnemies.length - 1; j >= 0; j--) {
            const enemyObj = spawnedEnemies[j];
            const enemyRect = enemyObj.img.getBoundingClientRect();
            // Check for overlap
            if (
              bulletRect.right > enemyRect.left &&
              bulletRect.left < enemyRect.right &&
              bulletRect.bottom > enemyRect.top &&
              bulletRect.top < enemyRect.bottom
            ) {
              // Hit! Subtract health
              enemyObj.health = (enemyObj.health || 50) - 25;
              if (enemyObj.health <= 0) {
                if (enemyObj.img.parentNode) enemyObj.img.parentNode.removeChild(enemyObj.img);
                spawnedEnemies.splice(j, 1);
              }
              // Remove bullet
              if (bullet.img.parentNode) bullet.img.parentNode.removeChild(bullet.img);
              bullets.splice(i, 1);
              bulletHit = true;
              break;
            }
          }

          if (bulletHit) {
            continue; // Skip further checks for this bullet
          }
          if (bullet.y + 1000 < 0) {
            if (bullet.img.parentNode) bullet.img.parentNode.removeChild(bullet.img);
            bullets.splice(i, 1);
          }
        }
        requestAnimationFrame(updateBullets);
      }
      updateBullets();

      // Mouse and keyboard fire events
      let spacePressed = false;
      function handleFireEvent(e) {
        if (!inGame) return;
        // Only fire once per spacebar press
        if (e.type === 'keydown' && e.code === 'Space') {
          if (!spacePressed) {
            fireBullet();
            spacePressed = true;
          }
        }
        if (e.type === 'keyup' && e.code === 'Space') {
          spacePressed = false;
        }
        // Mouse click fires as usual
        if (e.type === 'mousedown' && (e.button === 0 || e.button === 2)) {
          fireBullet();
        }
      }
      window.addEventListener('keydown', handleFireEvent);
      window.addEventListener('keyup', handleFireEvent);
      window.addEventListener('mousedown', handleFireEvent);

      // Mobile fire button
      function createMobileFireButton() {
        const fireBtn = document.createElement('button');
        fireBtn.innerText = 'FIRE';
        fireBtn.style.cssText = `
          position: fixed;
          right: 24px;
          bottom: 24px;
          width: 80px;
          height: 80px;
          font-size: 2em;
          z-index: 10010;
          background: #ff0;
          border-radius: 50%;
          border: 2px solid #333;
          box-shadow: 0 0 10px #000;
          user-select: none;
          touch-action: manipulation;
        `;
        fireBtn.addEventListener('touchstart', function(e) {
          e.preventDefault();
          fireBullet();
        }, { passive: false });
        fireBtn.addEventListener('mousedown', function(e) {
          e.preventDefault();
          fireBullet();
        });
        document.body.appendChild(fireBtn);
        return fireBtn;
      }
      function createMobileMoveButtons() {
        const leftBtn = document.createElement('button');
        leftBtn.innerText = '←';
        leftBtn.style.cssText = `
          position: fixed;
          left: 24px;
          bottom: 24px;
          width: 64px;
          height: 64px;
          font-size: 2em;
          z-index: 10010;
          background: #fff;
          border-radius: 50%;
          border: 2px solid #333;
          box-shadow: 0 0 10px #000;
          user-select: none;
          touch-action: manipulation;
        `;
        leftBtn.addEventListener('touchstart', function(e) {
          e.preventDefault();
          movingLeft = true;
        }, { passive: false });
        leftBtn.addEventListener('touchend', function(e) {
          e.preventDefault();
          movingLeft = false;
        });
        leftBtn.addEventListener('mousedown', function(e) {
          e.preventDefault();
          movingLeft = true;
        });
        leftBtn.addEventListener('mouseup', function(e) {
          e.preventDefault();
          movingLeft = false;
        });

        const rightBtn = document.createElement('button');
        rightBtn.innerText = '→';
        rightBtn.style.cssText = `
          position: fixed;
          left: 100px;
          bottom: 24px;
          width: 64px;
          height: 64px;
          font-size: 2em;
          z-index: 10010;
          background: #fff;
          border-radius: 50%;
          border: 2px solid #333;
          box-shadow: 0 0 10px #000;
          user-select: none;
          touch-action: manipulation;
        `;
        rightBtn.addEventListener('touchstart', function(e) {
          e.preventDefault();
          movingRight = true;
        }, { passive: false });
        rightBtn.addEventListener('touchend', function(e) {
          e.preventDefault();
          movingRight = false;
        });
        rightBtn.addEventListener('mousedown', function(e) {
          e.preventDefault();
          movingRight = true;
        });
        rightBtn.addEventListener('mouseup', function(e) {
          e.preventDefault();
          movingRight = false;
        });

        document.body.appendChild(leftBtn);
        document.body.appendChild(rightBtn);
        return [leftBtn, rightBtn];
      }
      let mobileFireBtn = null;
      let mobileMoveBtns = null;
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        mobileFireBtn = createMobileFireButton();
        mobileMoveBtns = createMobileMoveButtons();
      }

    function updatePlayerPosition() {
      let moved = false;
      if (movingLeft) {
        playerX -= player.speed;
        if (playerX < 0) playerX = 0;
        lastDirection = 'left';
        moved = true;
      }
      if (movingRight) {
        playerX += player.speed;
        if (playerX > window.innerWidth - 80) playerX = window.innerWidth - 80;
        lastDirection = 'right';
        moved = true;
      }
      playerImg.style.left = `${playerX}px`;
      playerImg.style.top = `${playerY}px`;

      // Animation: running or idle
      if (moved) {
        runningFrame = (runningFrame + 1) % player.images.runningRight.length;
        // Alternate between Running1 and Running2 for both directions
        const runningImg = player.images.runningRight[runningFrame];
        playerImg.src = runningImg;
        if (lastDirection === 'left') {
          playerImg.style.transform = 'scaleX(1)';
        } else {
          playerImg.style.transform = 'scaleX(-1)';
        }
        lastMoveTime = Date.now();
      } else {
        // If not moved for 200ms, show idle
        if (Date.now() - lastMoveTime > 200) {
          playerImg.src = player.images.idle;
          playerImg.style.transform = lastDirection === 'left' ? 'scaleX(-1)' : 'scaleX(1)';
        }
      }
      requestAnimationFrame(updatePlayerPosition);
    }
    updatePlayerPosition();

    // Keyboard controls
    function handleKeyDown(e) {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') movingLeft = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') movingRight = true;
    }
    function handleKeyUp(e) {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') movingLeft = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') movingRight = false;
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Clean up player on exit
    function cleanupPlayer() {
      if (playerImg.parentNode) playerImg.parentNode.removeChild(playerImg);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('keydown', handleFireEvent);
    window.removeEventListener('mousedown', handleFireEvent);
    if (bulletLayer.parentNode) bulletLayer.parentNode.removeChild(bulletLayer);
    if (mobileFireBtn && mobileFireBtn.parentNode) mobileFireBtn.parentNode.removeChild(mobileFireBtn);
    }
    backButton.addEventListener('click', cleanupPlayer);
    window.addEventListener('game-exit', cleanupPlayer);
    const spawnedEnemies = [];
    const enemyLayer = document.createElement('div');
    enemyLayer.id = 'enemy-layer';
    enemyLayer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 10001;
    `;
    document.body.appendChild(enemyLayer);

    function spawnEnemy() {
      if (spawnedEnemies.length >= normalEnemyConfig.maxOnScreen) return;
      const enemy = getRandomEnemy();
      const enemyImg = document.createElement('img');
      enemyImg.src = enemy.image;
      enemyImg.alt = enemy.name;
      enemyImg.draggable = false;
      const enemyWidth = 80;
      const enemyHeight = 80;
      const startX = Math.random() * (window.innerWidth - enemyWidth);
      enemyImg.style.cssText = `
  position: absolute;
  width: ${enemyWidth}px;
  height: ${enemyHeight}px;
  left: ${startX}px;
  top: 0px;
  pointer-events: auto;
  user-select: none;
  z-index: 10001;
  transition: left 0.2s, top 0.2s;
    // Prevent drag for all images in the game area
    document.addEventListener('dragstart', function(e) {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    });
      `;
      enemyImg.addEventListener('dragstart', e => e.preventDefault());
      enemyLayer.appendChild(enemyImg);
      spawnedEnemies.push({ img: enemyImg, y: 0, speed: enemy.speed || 3 });
    }

    // Move enemies down the screen
    function updateEnemies() {
      for (let i = spawnedEnemies.length - 1; i >= 0; i--) {
        const enemyObj = spawnedEnemies[i];
        enemyObj.y += enemyObj.speed;
        enemyObj.img.style.top = `${enemyObj.y}px`;
        if (enemyObj.y > window.innerHeight) {
          // Remove enemy if off screen
          if (enemyObj.img.parentNode) enemyObj.img.parentNode.removeChild(enemyObj.img);
          spawnedEnemies.splice(i, 1);
        }
      }
      requestAnimationFrame(updateEnemies);
    }
    updateEnemies();

    // Spawn enemies at interval
    const spawnInterval = setInterval(spawnEnemy, normalEnemyConfig.spawnRate * 1000);

    // Clean up enemies and interval on exit
    function cleanupEnemies() {
      clearInterval(spawnInterval);
      spawnedEnemies.forEach(obj => {
        if (obj.img.parentNode) obj.img.parentNode.removeChild(obj.img);
      });
      spawnedEnemies.length = 0;
      if (enemyLayer.parentNode) enemyLayer.parentNode.removeChild(enemyLayer);
    }

    // Attach cleanup to back button
    backButton.addEventListener('click', cleanupEnemies);
    // Also clean up if game screen is removed
    window.addEventListener('game-exit', cleanupEnemies);
  });
}
