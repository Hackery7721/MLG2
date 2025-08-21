import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import './css/clan.css';

export function loadClanContent(model) {
  
    // Locate TVs for Clan content
  const tv1 = findChildByName(model, 'TV6');
  const tv2 = findChildByName(model, 'TV6');
  const tv3 = findChildByName(model, 'TV7');
  const tv4 = findChildByName(model, 'TV7');

  // Define content for each TV
  if (tv1) {
    const telegramDiv = document.createElement('div');
    telegramDiv.className = 'clan-content telegram';
    telegramDiv.innerHTML = `
      <a href="https://t.me/MLGCTOPORTAL" target="_blank">
        <img src="/MLG/tv_content/images/telegram.webp" alt="Telegram" />
      </a>`;
    const telegramObject = new CSS3DObject(telegramDiv);
    telegramObject.position.set(2500, 500, -1750); // Adjust position as needed
    telegramObject.rotation.set(0, -1.2, 0);
    tv1.add(telegramObject);
  }

  if (tv2) {
    const youtubeDiv = document.createElement('div');
    youtubeDiv.className = 'clan-content youtube';
    youtubeDiv.innerHTML = `
      <a href="https://www.youtube.com/@MLGsolana420/videos" target="_blank">
        <img src="/MLG/tv_content/images/youtube.webp" alt="YouTube" />
      </a>`;
    const youtubeObject = new CSS3DObject(youtubeDiv);
    youtubeObject.position.set(2500, -415, -1750); // Adjust position as needed
    youtubeObject.rotation.set(0, -1.2, 0);
    tv2.add(youtubeObject);
  }

  if (tv3) {
    const discordDiv = document.createElement('div');
    discordDiv.className = 'clan-content discord';
    discordDiv.innerHTML = `
      <a href="https://discord.gg/munnopoly" target="_blank">
        <img src="/MLG/tv_content/images/discord.webp" alt="Discord" />
      </a>`;
    const discordObject = new CSS3DObject(discordDiv);
    discordObject.position.set(1195, 450, -2050); // Adjust position as needed
    discordObject.rotation.set(0, -0.9, 0);
    tv3.add(discordObject);
  }

  if (tv4) {
    const twitterDiv = document.createElement('div');
    twitterDiv.className = 'clan-content twitter';
    twitterDiv.innerHTML = `
      <a href="https://x.com/MLGsolana420" target="_blank">
        <img src="/MLG/tv_content/images/x.webp" alt="Twitter" />
      </a>`;
    const twitterObject = new CSS3DObject(twitterDiv);
    twitterObject.position.set(1195, -380, -2050); // Adjust position as needed
    twitterObject.rotation.set(0, -0.9, 0);
    tv4.add(twitterObject);
  }
}

// Helper function to find child by name
function findChildByName(model, name) {
  let result = null;
  model.traverse((child) => {
    if (child.name === name) {
      result = child;
    }
  });
  return result;
}
