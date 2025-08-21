import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { pauseMusic, resumeMusic } from './musicPlayer.js';
import { loadLobbyContent } from './lobby.js';
import { loadVaultContent, clearVaultTVs } from './vault.js';
import { loadServersContent } from './servers.js';
import { loadClanContent } from './clan.js';
import './css/tvNavMenu.css';

// Function to create and attach the TV navigation menu
export function initializeTVNavMenu(model, clearTVs) {
  let tvNavMenu;

  // Locate the TV for the navigation menu
  model.traverse((child) => {
    if (child.name === 'TV1') {
      tvNavMenu = child;
    }
  });

  if (tvNavMenu) {
    // Create the navigation menu as a div
    const menuDiv = document.createElement('div');
    menuDiv.innerHTML = `
      <div class="nav-tv">
        <div class="menu-item" data-target="lobby">LOBBY</div>
        <div class="menu-item" data-target="clan">CLAN</div>
        <div class="menu-item" data-target="servers">SERVERS</div>
        <div class="menu-item" data-target="vault">VAULT</div>
      </div>
    `;

    // Wrap the menu in a CSS3DObject
    const menuObject = new CSS3DObject(menuDiv);
    menuObject.position.set(-20.1, 21, -269); // Adjust based on the TV's position in the Blender model
    menuObject.scale.set(1.0, 1.0, 1.0); // X, Y, Z scale - adjust these values to resize the menu
    tvNavMenu.add(menuObject);

    // Add click event listener to menu items
    menuDiv.querySelectorAll('.menu-item').forEach((item) => {
      item.addEventListener('click', (event) => {
        const target = event.target.dataset.target;

        // Clear previous content
        clearTVs(model);
        
        // Load the corresponding content
        if (target === 'lobby') {
          loadLobbyContent(model);
          clearVaultTVs(model);
        }
        if (target === 'servers') {
          loadServersContent(model);
          clearVaultTVs(model);
        }
        if (target === 'vault') {
          loadVaultContent(model);
          pauseMusic(); 
        }
        if (target === 'clan') {
          loadClanContent(model);
          clearVaultTVs(model);
        }
      });
    });
  }

  // Initialize static TV screens with default video
  initializeStaticTVs(model);
}

// Initialize TVs with static videos before navigation
function initializeStaticTVs(model) {
  // Clan images as default TV content
  const tv1 = findChildByName(model, 'TV6');
  const tv2 = findChildByName(model, 'TV6');
  const tv3 = findChildByName(model, 'TV7');
  const tv4 = findChildByName(model, 'TV7');

  if (tv1) {
    const telegramDiv = document.createElement('div');
    telegramDiv.className = 'clan-content telegram';
    telegramDiv.innerHTML = `
      <a href="https://t.me/MLGCTOPORTAL" target="_blank">
        <img src="/MLG/tv_content/images/telegram.webp" alt="Telegram" />
      </a>`;
    const telegramObject = new CSS3DObject(telegramDiv);
    telegramObject.position.set(2500, 500, -1750);
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
    youtubeObject.position.set(2500, -415, -1750);
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
    discordObject.position.set(1195, 450, -2050);
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
    twitterObject.position.set(1195, -380, -2050);
    twitterObject.rotation.set(0, -0.9, 0);
    tv4.add(twitterObject);
  }
}


// Helper function to clear previous content from TVs
export function clearTVs(model) {
  const tvNames = ['TV6', 'TV7']; // Target TVs dynamically if needed

  tvNames.forEach((tvName) => {
    const tv = findChildByName(model, tvName);
    if (tv && tv.children) {
      // Filter and remove all CSS3DObjects
      const childrenToRemove = tv.children.filter((child) => child.isCSS3DObject);
      childrenToRemove.forEach((child) => {
        tv.remove(child);
      });
    } else {
      console.warn(`TV ${tvName} not found or has no children.`);
    }
  });

  // Resume music after all clearing
  resumeMusic();
}

// Helper function to find a child by name
export function findChildByName(model, name) {
  let result = null;
  model.traverse((child) => {
    if (child.name === name) {
      result = child;
    }
  });
  return result;
}
