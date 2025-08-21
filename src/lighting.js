import * as THREE from 'three';
import { isMobileDevice } from './deviceDetection.js';

export function setupLighting(scene) {
  if (isMobileDevice()) {
    // Add light above the chair
    const pointLight = new THREE.PointLight(0xffffff, 120000, 1000, 2.1);
    pointLight.position.set(18, 180, 4.2);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Spotlight targeting sign
    const targetPosition = new THREE.Vector3(500, 300 , 0);

    const spotlight = new THREE.SpotLight(0xffffff, 1); // Color: white, Intensity: 1
    spotlight.position.set(150, 180, 0); // Spotlight's position in the scene
    spotlight.angle = Math.PI / 7; // Controls the cone angle (wider if increased, narrower if decreased)
    spotlight.penumbra = 0; // Soft edges for the spotlight cone (0 = hard edge, 1 = softest)
    spotlight.decay = 0; // How light intensity decreases over distance (higher values reduce intensity faster)
    spotlight.distance = 1000; // Maximum distance the spotlight reaches (set to a large value for testing)
    spotlight.castShadow = false; // Enable shadows for the spotlight
    spotlight.intensity = 4; // Increase the intensity to 2 (adjust as needed)

    const spotlightTarget = new THREE.Object3D();
    spotlightTarget.position.copy(targetPosition);
    scene.add(spotlightTarget);
    spotlight.target = spotlightTarget;

    scene.add(spotlight);
  } else {
    // Add light above the chair
    const pointLight = new THREE.PointLight(0xffffff, 120000, 1000, 2.1);
    pointLight.position.set(18, 180, 4.2);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Add light for gun under table
    const gunLight = new THREE.PointLight(0xffffff, 30, 1000, 1.2);
    gunLight.position.set(156, 27, 66);
    scene.add(gunLight);

    // add light for xbox420 
    const xboxLight = new THREE.PointLight(0xffffff, 300, 30, .9);
    xboxLight.position.set(21, 135, 177);
    xboxLight.penumbra = 0;
    scene.add(xboxLight);


    // Add a turquoise light for the gun
    const rayGunLight = new THREE.PointLight(0x00ffff, 1000, 30, 3);
    rayGunLight.position.set(135, 93, 76);
    rayGunLight.castShadow = true;
    scene.add(rayGunLight);

    const rayGunLight2 = new THREE.PointLight(0x00ffff, 600, 20, 3);
    rayGunLight2.position.set(130, 102, 90);
    rayGunLight2.castShadow = true;
    scene.add(rayGunLight2);

    // Add grow light behind MLG sign
    const growLight = new THREE.PointLight(0xff00ff, 500, 1000, 1.2);
    growLight.position.set(400, 230, 0);
    growLight.castShadow = true;
    scene.add(growLight);

    // Spotlight targeting sign
    const targetPosition = new THREE.Vector3(500, 300 , 0);

    const spotlight = new THREE.SpotLight(0xffffff, 1); // Color: white, Intensity: 1
    spotlight.position.set(150, 180, 0); // Spotlight's position in the scene
    spotlight.angle = Math.PI / 7; // Controls the cone angle (wider if increased, narrower if decreased)
    spotlight.penumbra = 1; // Soft edges for the spotlight cone (0 = hard edge, 1 = softest)
    spotlight.decay = 0; // How light intensity decreases over distance (higher values reduce intensity faster)
    spotlight.distance = 1000; // Maximum distance the spotlight reaches (set to a large value for testing)
    spotlight.castShadow = true; // Enable shadows for the spotlight
    spotlight.intensity = 4; // Increase the intensity to 2 (adjust as needed)

    const spotlightTarget = new THREE.Object3D();
    spotlightTarget.position.copy(targetPosition);
    scene.add(spotlightTarget);
    spotlight.target = spotlightTarget;

    scene.add(spotlight);
  }
}
