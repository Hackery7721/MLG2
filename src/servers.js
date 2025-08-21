import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { disableCamera, enableCamera } from './cameraControls';
import './css/servers.css'; // Import scoped CSS for servers menu


export function loadServersContent(model) {
  // Helper function to initialize a TV
  function initializeTV(tv, imageSrc, position, rotation = { x: 0, y: 0, z: 0 }, title, tvClass, onClickAction) {
    if (!tv) {
      console.error(`TV not found for ${tvClass}`);
      return;
    }

    console.log(`Initializing TV: ${tvClass}`, tv);

    // Create an image element
    const imageElement = document.createElement('img');
    imageElement.src = imageSrc;
    imageElement.alt = title;
    imageElement.className = `${tvClass}`;
    imageElement.style.width = '100%';
    imageElement.style.height = '100%';
    imageElement.style.cursor = 'pointer'; // Default cursor
    imageElement.style.pointerEvents = 'auto'; // Enable pointer events

    // Create a container for the image and title
    const serverDiv = document.createElement('div');
    serverDiv.className = `servers-content ${tvClass}`;
    serverDiv.style.pointerEvents = 'auto'; // Enable pointer events for this container

    // Add the image to the container
    serverDiv.appendChild(imageElement);

    const tvObject = new CSS3DObject(serverDiv);
    tvObject.position.set(...position); // Set position
    tvObject.rotation.set(rotation.x, rotation.y, rotation.z); // Set rotation
    tv.add(tvObject);

    // Add click event listener to open the server menu
    serverDiv.addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();
      showServerMenu(onClickAction); // Show server menu overlay
    });
  }

  // Show the server menu overlay or open external URL
  function showServerMenu(menuContent) {
    // Check if menuContent is valid
    if (!menuContent) {
      console.warn('No content provided for the server menu. Menu will not be displayed.');
      return; // Exit the function early
    }
    
    // Check if menuContent is a URL (starts with http)
    if (typeof menuContent === 'string' && menuContent.startsWith('http')) {
      console.log(`Opening external URL: ${menuContent}`);
      try {
        // Open URL in new tab/window
        window.open(menuContent, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Error opening URL:', error);
        // Fallback: try to navigate to the URL in the same window
        window.location.href = menuContent;
      }
      return; // Exit early since we're opening a URL, not a menu
    }
    
    disableCamera(); // Disable camera controls while the overlay
    // Create the overlay container
    const overlay = document.createElement('div');
    overlay.id = 'server-menu-overlay'; // Assign a unique ID for the overlay
    overlay.innerHTML = menuContent;
  
    // Style the overlay to take up the full screen
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(13, 17, 23, 0.95)'; // Semi-transparent background
    overlay.style.color = '#c9d1d9';
    overlay.style.zIndex = '9999'; // Ensure it's above all other elements
    overlay.style.overflowY = 'auto'; // Allow scrolling for long content
    overlay.style.padding = '20px';
    overlay.style.boxSizing = 'border-box';

    document.body.appendChild(overlay);
  
    // Add event listener for "Back to Lobby" link
    const backButton = overlay.querySelector('[data-action="close-page"]');
    if (backButton) {
      backButton.addEventListener('click', (event) => {
        event.preventDefault();
        overlay.remove(); // Remove the overlay when "Back to Lobby" is clicked
        enableCamera(); // Re-enable camera controls
      });
    }
  }
  

  // HTML content for the Call of Duty server menu
  const codServerMenuHTML = `
    <header>
      <nav>
        <ul class="nav-list">
          <li><a href="#" class="nav-link" data-action="close-page">Back To Lobby</a></li>
          <li><a href="https://discord.gg/munnopoly" target="_blank" class="nav-link">Discord</a></li>
        </ul>
      </nav>
    </header>
    <main>
      <section class="intro">
        <h1>$MLG CALL OF DUTY SERVERS</h1>
      </section>
      <section class="instructions">
        <h2>HOW TO PLAY</h2>
        <ol class="instructions-list">
          <li>1. Join the <a href="https://discord.gg/munnopoly" target="_blank" class="external-link"> Discord</a></li>
          <li>2. Follow the install guide in the “Game Downloads” channel</li>
          <li>3. Download the MLG texture packs in the “Releases” channel</li>
          <li>4. Search “$MLG” in the server browser</li>
        </ol>
      </section>
      <section class="server-info">
        <h2>Current Servers</h2>
        <ul class="server-list">
          <li>2011 MW3</li>
          <li>BO2</li>
          <li>HMW (MW2 Remastered)</li>
        </ul>
        <h3>Coming Soon</h3>
        <ul class="coming-soon-list">
          <li>WAW</li>
          <li>COD4</li>
          <li>BO1</li>
          <li>Ghost</li>
        </ul>
      </section>
    </main>
  `;

  // Initialize TVs with content and specific CSS classes for TV6 and TV7
  initializeTV(
    findChildByName(model, 'TV6'),
    '/MLG/tv_content/images/codscreen1.webp',
    [2500, 500, -1750],
    { x: 0, y: -1.2, z: 0 },
    'Call of Duty',
    'tv6-content',
    codServerMenuHTML
  );

  initializeTV(
    findChildByName(model, 'TV6'),
    '/MLG/tv_content/images/Minecraftscreen.webp',
    [2500, -415, -1750],
    { x: 0, y: -1.2, z: 0 },
    'Minecraft',
    'tv6-content',
    null
  );

  initializeTV(
    findChildByName(model, 'TV7'),
    '/MLG/tv_content/images/GTA5screen.webp',
    [1195, 450, -2050],
    { x: 0, y: -0.9, z: 0 },
    'GTA V',
    'tv7-content',
    'https://x.com/DrakeKurosaki/status/1953233977675780522'
  );

  initializeTV(
    findChildByName(model, 'TV7'),
    '/MLG/tv_content/images/TBDscreen.webp',
    [1195, -380, -2050],
    { x: 0, y: -0.9, z: 0 },
    'TBD',
    'tv7-content',
    null
  );
  // Add other server TV initializations here...
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
