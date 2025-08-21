import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { initializeAnimationMixer } from './animationManager.js';
import { initializeMusicPlayerWithInteraction } from './musicPlayer.js';
import { initializeGrenade } from './grenade.js';
import { loadLiveData } from './livePriceTV.js';
import { initializeStartScreen, hideLoadingScreen } from './loadingScreen.js';
import { initializeTVNavMenu, clearTVs } from './tvNavMenu.js';
import { initializeRollingPaperWithInteraction } from './rollingPaper.js';
import { initializeLoopingVideoTVs } from './loopingVideoTVs.js';
import { initializeMountainDew } from './mountainDew.js';
import { initializeBongRip } from './bongRip.js';
import { initializeXbox360 } from './Xbox360.js';
import { initializeDoritos } from './Doritos.js';
import { initializeRayGun } from './RayGun.js';
import { initializeIntervention } from './Intervention.js';
import { initializeHaloAR } from './HaloAR.js';
import { initializeJoint } from './Joint.js';
import { initializeGlasses } from './Glasses.js';
import { initializeHeadphones } from './Headphones.js';
import { initializeNuketownSign } from './NuketownSign.js';
import { initializeIlluminati } from './Illuminati.js';
import { initializeGTAScreen } from './GTAScreen.js';
import { initializeVolumeSlider } from './volumeSlider.js';
import { initializeArcadeMachineHitbox } from './ArcadeMachine.js';


export function loadBlenderScene(scene, camera, renderer) {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); // Hosted by Google
  loader.setDRACOLoader(dracoLoader);

  // Initialize the start screen with a callback to load the scene
  initializeStartScreen((loadingScreen) => {
    loader.load(
      '/MLG/scene.glb',
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        // Hide the loading screen after the model is loaded\
        setTimeout(() => {
          hideLoadingScreen(loadingScreen);
          // Initialize volume slider after loading screen is hidden
          initializeVolumeSlider();
        }, 3000);

        // Initialize various components and interactions
        initializeBongRip(scene);
        initializeAnimationMixer(model, gltf.animations);
        initializeMusicPlayerWithInteraction(model, scene, camera, renderer);
        initializeGrenade(scene);
        initializeMountainDew(scene);
        loadLiveData(model);
        initializeTVNavMenu(model, clearTVs);
        initializeLoopingVideoTVs(model);
        initializeRollingPaperWithInteraction(model, scene, camera, renderer);
        initializeXbox360(scene, camera);
        initializeDoritos(scene, camera);
        initializeRayGun(scene, camera);
        initializeIntervention(scene, camera);
        initializeHaloAR(scene, camera);
        initializeJoint(scene, camera);
        initializeGlasses(scene, camera);
        initializeHeadphones(scene, camera);
        initializeNuketownSign(scene, camera);
        initializeIlluminati(scene, camera);
        console.log('🎮 Initializing GTAScreen component...');
        initializeGTAScreen(scene, camera);
        // Pass cssRenderer to ArcadeMachine hitbox for pointer events
        if (window.cssRenderer) {
          initializeArcadeMachineHitbox(scene, camera, window.cssRenderer);
        } else {
          initializeArcadeMachineHitbox(scene, camera);
        }
      },
      undefined,
      (error) => {
        console.error('Error loading Blender scene:', error);
      }
    );
  });
}
