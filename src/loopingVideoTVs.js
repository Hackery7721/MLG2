import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import './css/loopingVideoTVs.css';

export function initializeLoopingVideoTVs(model) {
  const tvVideoMappings = [
    {
      tvName: 'TV4',
      videoSrc: '/MLG/tv_content/videos/Illuminatistockchart.webm',
      position: { x: 3650, y: 720, z: -4425 },
      rotation: { x: 0, y: -0.6, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      cssClass: 'stock-chart',
    },
    {
      tvName: 'TV8',
      videoSrc: '/MLG/tv_content/videos/slideShow1.webm',
      position: { x: 807, y: 970, z: 3100 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      cssClass: 'looping-video',
    },
    {
      tvName: 'TV8',
      videoSrc: '/MLG/tv_content/videos/slideShow.webm',
      position: { x: 807, y: -140, z: 3100 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      cssClass: 'looping-video',
    },
  ];

  tvVideoMappings.forEach(({ tvName, videoSrc, position, rotation, cssClass, scale }) => {
    const tv = findChildByName(model, tvName);
    if (!tv) return;

    const containerDiv = document.createElement('div');
    containerDiv.className = cssClass;

    const ext = videoSrc.split('.').pop().toLowerCase();

    if (['webm', 'mp4', 'ogg'].includes(ext)) {
      // Create video element explicitly
      const videoEl = document.createElement('video');
      videoEl.playsInline = true;
      videoEl.autoplay = true;
      videoEl.loop = true;
      videoEl.muted = true;
      videoEl.loading = 'lazy';
      videoEl.preload = 'auto';

      // Set CSS to fill container
      videoEl.style.display = 'block';

      const sourceEl = document.createElement('source');
      sourceEl.src = videoSrc;
      sourceEl.type = `video/${ext}`;
      videoEl.appendChild(sourceEl);

      containerDiv.appendChild(videoEl);

      // Explicitly call play() to ensure autoplay
      videoEl.play().catch(() => {
        // Autoplay blocked? You could show a play button here if needed.
      });

    } else if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)) {
      // Create image element explicitly
      const imgEl = document.createElement('img');
      imgEl.src = videoSrc;
      imgEl.alt = tvName;

      imgEl.style.objectFit = 'contain';  // maintain aspect ratio inside container
      containerDiv.appendChild(imgEl);

    } else {
      containerDiv.textContent = 'Unsupported media format.';
    }

    const css3dObject = new CSS3DObject(containerDiv);
    css3dObject.position.set(position.x, position.y, position.z);
    css3dObject.rotation.set(rotation.x, rotation.y, rotation.z);
    css3dObject.scale.set(scale.x, scale.y, scale.z);

    tv.add(css3dObject);
  });
}

function findChildByName(model, name) {
  let result = null;
  model.traverse((child) => {
    if (child.name === name) result = child;
  });
  return result;
}
