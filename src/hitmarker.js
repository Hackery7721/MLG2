import './css/hitmarker.css';

export function initializeHitmarker() {
  // Add a hitmarker on click
  document.addEventListener('click', (e) => {
      const hitmarker = document.createElement('div');
      hitmarker.className = 'hitmarker';

      let x, y;
      if (document.pointerLockElement) {
          // Place hitmarker at the center of the screen when pointer is locked
          x = window.innerWidth / 2;
          y = window.innerHeight / 2;
      } else {
          // Place hitmarker where the mouse clicks
          x = e.pageX;
          y = e.pageY;
      }

      // Set hitmarker position
      hitmarker.style.left = `${x - 20}px`; // Adjust for hitmarker size
      hitmarker.style.top = `${y - 20}px`;

      // Append hitmarker to the body
      document.body.appendChild(hitmarker);

      // Play hitmarker sound
      const audio = new Audio('/MLG/hitmarker.mp3'); // Replace with the correct path to your MP3 file
      audio.play();

      // Remove hitmarker after animation ends
      setTimeout(() => {
          hitmarker.remove();
      }, 600); // Match animation duration
  });
}