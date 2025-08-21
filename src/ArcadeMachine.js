import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { hitboxManager } from './hitboxManager.js';
import { disableCamera, enableCamera } from './cameraControls.js';

export function initializeArcadeMachineHitbox(scene, camera, css3DRenderer, options = {}) {
	// Options: { onClick }
	const {
		onClick = null
	} = options;

	// Create the CSS overlay element
	const hitboxDiv = document.createElement('div');
	hitboxDiv.className = 'ArcadeMachine-overlay';
	hitboxDiv.innerHTML = `<div class="ArcadeMachine-hitbox" style="background: rgba(255, 0, 0, 0); border: 0px solid red; width: 200px; height: 200px; pointer-events: auto;"></div>`;

	// Attach the CSS object to the ArcadeMachine's position
	const cssObject = new CSS3DObject(hitboxDiv);
	cssObject.position.set(21.0, 127.0, -110.0);
	cssObject.rotation.set(-0.20, 0.00, 0.00);
	cssObject.scale.set(0.170, 0.190, 0.170);
	scene.add(cssObject);

	// Register with hitbox manager for universal editing
	hitboxManager.registerHitbox('ArcadeMachine', cssObject, hitboxDiv);

	const ArcadeMachineHitbox = hitboxDiv.querySelector('.ArcadeMachine-hitbox');
	ArcadeMachineHitbox.style.pointerEvents = 'auto'; // Always clickable

	// Cursor change on hover
	ArcadeMachineHitbox.addEventListener('mouseenter', () => {
		ArcadeMachineHitbox.style.cursor = 'pointer';
	});
	ArcadeMachineHitbox.addEventListener('mouseleave', () => {
		ArcadeMachineHitbox.style.cursor = '';
	});

	// Click handler: smooth camera zoom, fade to black, then show video
		// Store clicked state globally so it can be reset
		if (!window.arcadeMachineClicked) window.arcadeMachineClicked = false;
		let arcadeMachineClicked = window.arcadeMachineClicked;
	ArcadeMachineHitbox.addEventListener('click', () => {
				// Hide LOBBY, CLAN, SERVERS, VAULT screens
				const hideSelectors = [
					'.lobby-content', '.lobby-content2', '.lobby-overlay',
					'.clan-content',
					'.servers-content',
					'.vault-content'
				];
				hideSelectors.forEach(sel => {
					document.querySelectorAll(sel).forEach(el => {
						el.style.display = 'none';
					});
				});
		if (window.arcadeMachineClicked) return;
		window.arcadeMachineClicked = true;
		// Disable camera controls during animation
		if (typeof disableCamera === 'function') disableCamera();

		// 1. Fade overlay (starts transparent)
		const fadeOverlay = document.createElement('div');
		fadeOverlay.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:black;opacity:0;z-index:9999;transition:opacity 3.6s;pointer-events:none;`;
		document.body.appendChild(fadeOverlay);

		// 2. Smooth camera zoom
		// Move camera even closer for a stronger zoom effect, and shift right
		const cameraOffset = { x: 0, y: 5, z: 15 }; // x: 6 moves camera right
		const finalCameraPosition = {
			x: cssObject.position.x + cameraOffset.x,
			y: cssObject.position.y + cameraOffset.y,
			z: cssObject.position.z + cameraOffset.z
		};
		const startCameraPosition = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
		const duration = 3000; // 3x slower (was 1200)
		const startTime = performance.now();
		let fadeStarted = false;
		function animateZoom() {
			const elapsed = performance.now() - startTime;
			const t = Math.min(elapsed / duration, 1);
			// Ease-in-out
			const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
			camera.position.x = startCameraPosition.x + (finalCameraPosition.x - startCameraPosition.x) * easeT;
			camera.position.y = startCameraPosition.y + (finalCameraPosition.y - startCameraPosition.y) * easeT;
			camera.position.z = startCameraPosition.z + (finalCameraPosition.z - startCameraPosition.z) * easeT;
			camera.lookAt(cssObject.position.x, cssObject.position.y, cssObject.position.z);
			// Start fade after 1/3 of animation
			if (!fadeStarted && t > 0.33) {
				fadeOverlay.style.opacity = '1';
				fadeStarted = true;
			}
			if (t < 1) {
				requestAnimationFrame(animateZoom);
			} else {
				setTimeout(() => {
					showFullscreenVideo();
					if (fadeOverlay.parentNode) fadeOverlay.parentNode.removeChild(fadeOverlay);
				}, 400);
			}
		}
		animateZoom();
	});

	function showFullscreenVideo() {
		// Create fullscreen video container
		const videoContainer = document.createElement('div');
		videoContainer.style.cssText = `
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
		const video = document.createElement('video');
		video.style.cssText = `width: 100%; height: 100%; object-fit: contain;`;
		video.src = '/MLG/tv_content/videos/MemeHuntStartGame.webm';
		video.autoplay = true;
		video.loop = true;
		video.muted = true;
		video.controls = false;
		videoContainer.appendChild(video);
		document.body.appendChild(videoContainer);

		// Create wrapper div for hitboxManager compatibility
		const wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'ArcadeStartScreen-wrapper';
		wrapperDiv.style.cssText = `
			position: fixed;
			top: 50%;
			left: 50%;
			width: 300px;
			height: 300px;
			pointer-events: none;
			z-index: 999999;
			transform: translate(-50%, -50%);
		`;
		wrapperDiv.innerHTML = '<div class="ArcadeStartScreen-hitbox" style="width: 100%; height: 100%; border: 2px solid #00ff00; background: rgba(0,255,0,0.3); pointer-events: auto;"></div>';
		document.body.appendChild(wrapperDiv);
		const fullscreenHitbox = wrapperDiv.querySelector('.ArcadeStartScreen-hitbox');

			// Cursor change on hover for fullscreen hitbox
			fullscreenHitbox.addEventListener('mouseenter', () => {
				fullscreenHitbox.style.cursor = 'pointer';
			});
			fullscreenHitbox.addEventListener('mouseleave', () => {
				fullscreenHitbox.style.cursor = '';
			});

			// Click handler: go to level select screen
			fullscreenHitbox.addEventListener('click', () => {
				// Remove video and start screen elements
				if (videoContainer.parentNode) videoContainer.parentNode.removeChild(videoContainer);
				if (wrapperDiv.parentNode) wrapperDiv.parentNode.removeChild(wrapperDiv);
				// Call ArcadeLevelSelect logic
				import('./ArcadeLevelSelect.js').then(module => {
					if (module.initializeArcadeLevelSelect) {
						module.initializeArcadeLevelSelect(scene, camera, null, {});
					}
				});
			});

		// Create controller object for hitboxManager compatibility
		const hitboxController = {
			position: { x: -3.0, y: 76.0, z: -55.0 },
			rotation: { x: 0.00, y: -2.20, z: 0.00 },
			scale: { x: 3.500, y: 0.430, z: 12.030 },
			element: wrapperDiv,
			updateHitbox() {
				const baseWidth = 300;
				const baseHeight = 300;
				const newWidth = baseWidth * this.scale.x;
				const newHeight = baseHeight * this.scale.y;
				wrapperDiv.style.width = `${newWidth}px`;
				wrapperDiv.style.height = `${newHeight}px`;
				wrapperDiv.style.transform = `translate(-50%, -50%) translate(${this.position.x}px, ${this.position.y}px) rotateX(${this.rotation.x}rad) rotateY(${this.rotation.y}rad) rotateZ(${this.rotation.z}rad)`;
			},
			setDebugVisible(visible) {
				wrapperDiv.style.display = visible ? 'block' : 'none';
				fullscreenHitbox.style.background = visible ? 'rgba(0,255,0,0.3)' : 'rgba(255,0,0,0.0)';
				fullscreenHitbox.style.border = visible ? '2px solid #00ff00' : '2px dashed #fff';
				fullscreenHitbox.style.pointerEvents = visible ? 'auto' : 'none';
			}
		};
		hitboxController.updateHitbox();
		hitboxManager.registerHitbox('ArcadeStartScreen', hitboxController, wrapperDiv);
	}

	// Helper to toggle visibility for debug mode
	cssObject.setDebugVisible = (visible) => {
		ArcadeMachineHitbox.style.background = visible ? 'rgba(0,255,0,0.3)' : 'rgba(255, 0, 0, 0)';
		ArcadeMachineHitbox.style.border = visible ? '2px solid #fff' : '0px solid red';
		ArcadeMachineHitbox.style.pointerEvents = 'auto'; // Always clickable
	};

	// Hide by default (but clickable)
	cssObject.setDebugVisible(false);

	return {
			cssObject,
			element: ArcadeMachineHitbox,
			setDebugVisible: cssObject.setDebugVisible,
			resetClicked: () => { window.arcadeMachineClicked = false; }
		};
}
