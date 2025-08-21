import * as THREE from 'three';
import { isMobileDevice } from './deviceDetection';

let isCameraEnabled = false; // Flag to track camera control state

// === CAMERA ROTATION LIMITS (degrees) ===
// PC controls limits (yaw: left/right, pitch: up/down)
const PC_YAW_LIMIT_LEFT_DEG =  -45;   // degrees
const PC_YAW_LIMIT_RIGHT_DEG =  45;   // degrees
const PC_PITCH_LIMIT_UP_DEG =    0;  // degrees 
const PC_PITCH_LIMIT_DOWN_DEG = -40;  // degrees

// Mobile controls limits (yaw: left/right, pitch: up/down)
const MOBILE_YAW_LIMIT_LEFT_DEG =  -90;  // degrees
const MOBILE_YAW_LIMIT_RIGHT_DEG =  90;  // degrees
const MOBILE_PITCH_LIMIT_UP_DEG =    0; // degrees
const MOBILE_PITCH_LIMIT_DOWN_DEG = -40; // degrees

// Helper to convert degrees to radians
function degToRad(deg) {
  return deg * Math.PI / 180;
}

export function initializeCameraControls(camera) {
  if (isMobileDevice()) {
    initializePhoneControls(camera); // Use touch-based controls for mobile
  } else {
    initializePCControls(camera); // Use mouse-based controls for desktop
  }
}

function initializePCControls(camera) {
  let yaw = 0;
  let pitch = 0;

  const initialEuler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
  yaw = initialEuler.y;
  pitch = initialEuler.x;

  // Convert limits to radians and offset by initial yaw
  const yawLimitLeft = yaw + degToRad(PC_YAW_LIMIT_LEFT_DEG);
  const yawLimitRight = yaw + degToRad(PC_YAW_LIMIT_RIGHT_DEG);
  const pitchLimitUp = degToRad(PC_PITCH_LIMIT_UP_DEG);
  const pitchLimitDown = degToRad(PC_PITCH_LIMIT_DOWN_DEG);

  document.addEventListener('mousemove', (event) => {
    if (!isCameraEnabled) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    yaw -= movementX * 0.002;
    pitch -= movementY * 0.002;

    yaw = Math.max(yawLimitLeft, Math.min(yawLimitRight, yaw));
    pitch = Math.max(pitchLimitDown, Math.min(pitchLimitUp, pitch));

    camera.rotation.set(pitch, yaw, 0, 'YXZ');
  });
}

function initializePhoneControls(camera) {
  let yaw = 0;
  let pitch = 0;
  let previousTouchPosition = null;

  let lastUpdateTime = Date.now();
  const updateInterval = 32;

  const initialEuler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
  yaw = initialEuler.y;
  pitch = initialEuler.x;

  const yawLimitLeft = yaw + degToRad(MOBILE_YAW_LIMIT_LEFT_DEG);
  const yawLimitRight = yaw + degToRad(MOBILE_YAW_LIMIT_RIGHT_DEG);
  const pitchLimitUp = degToRad(MOBILE_PITCH_LIMIT_UP_DEG);
  const pitchLimitDown = degToRad(MOBILE_PITCH_LIMIT_DOWN_DEG);

  document.addEventListener('touchmove', (event) => {
    if (!isCameraEnabled || event.touches.length !== 1) return;

    const now = Date.now();
    if (now - lastUpdateTime < updateInterval) return;
    lastUpdateTime = now;

    const touch = event.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    if (previousTouchPosition) {
      const deltaX = touchX - previousTouchPosition.x;
      const deltaY = touchY - previousTouchPosition.y;

      yaw -= deltaX * 0.006;
      pitch -= deltaY * 0.006;

      yaw = Math.max(yawLimitLeft, Math.min(yawLimitRight, yaw));
      pitch = Math.max(pitchLimitDown, Math.min(pitchLimitUp, pitch));

      camera.rotation.set(pitch, yaw, 0, 'YXZ');
    }

    previousTouchPosition = { x: touchX, y: touchY };
  });

  document.addEventListener('touchend', () => {
    previousTouchPosition = null;
  });
}

export function enableCamera() {
  isCameraEnabled = true;
}

export function disableCamera() {
  isCameraEnabled = false;
}
