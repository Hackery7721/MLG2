// Universal Hitbox Manager - Unity-like editor for all interactive elements
import * as THREE from 'three';

class HitboxManager {
  constructor() {
    this.hitboxes = new Map(); // Store all registered hitboxes
    this.selectedHitbox = null;
    this.debugMode = false;
    this.debugPanel = null;
    this.keyHandler = null;
    this.originalStyles = new Map(); // Store original hitbox styles
    this.mouseMode = false; // Toggle between keyboard and mouse controls
    this.mouseHandler = null;
    this.isDragging = false;
    this.isRotating = false;
    this.lastMousePos = { x: 0, y: 0 };
    this.gizmoSphere = null; // Visual rotation indicator
    this.activeTimeouts = new Map(); // Track active fade timeouts to cancel them
    this.keyframeMode = false; // Toggle for keyframe recording mode
    this.keyframes = new Map(); // Store keyframes for each hitbox
    this.isRecording = false; // Whether we're actively recording keyframes
  }

  // Register a hitbox for management
  registerHitbox(name, cssObject, element) {
    const hitboxData = {
      name: name,
      cssObject: cssObject,
      element: element,
      visible: false
    };
    
    this.hitboxes.set(name, hitboxData);
    
    // Store original styles
    const hitbox = element.querySelector(`[class*="hitbox"]`);
    if (hitbox) {
      this.originalStyles.set(name, {
        background: hitbox.style.background || 'transparent',
        border: hitbox.style.border || 'none'
      });
      
      // Set up for smooth transitions but keep invisible by default
      hitbox.style.transition = 'border 0.3s ease, background 0.3s ease';
      hitbox.style.border = 'none';
      hitbox.style.background = 'transparent';
    }
    
    console.log(`Registered hitbox: ${name}`);
  }

  // Toggle debug mode
  toggleDebugMode() {
    this.debugMode = !this.debugMode;
    
    if (this.debugMode) {
      this.createDebugPanel();
      this.addKeyboardControls();
      this.showAllDebugOutlines();
      console.log('Hitbox Debug Mode: ENABLED');
    } else {
      this.destroyDebugPanel();
      this.removeKeyboardControls();
      this.removeMouseControls();
      this.hideAllHitboxes();
      this.selectedHitbox = null;
      console.log('Hitbox Debug Mode: DISABLED');
    }
  }

  // Create debug control panel
  createDebugPanel() {
    this.debugPanel = document.createElement('div');
    this.debugPanel.id = 'hitbox-debug-panel';
    this.debugPanel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-family: monospace;
      font-size: 13px;
      z-index: 10000;
      line-height: 1.4;
      border: 2px solid #00ff00;
    `;

    this.updateDebugPanel();
    document.body.appendChild(this.debugPanel);
    
    // Add event listeners only once when panel is created
    this.addDebugPanelListeners();
  }

  // Update debug panel content
  updateDebugPanel() {
    if (!this.debugPanel) return;

    const hitboxOptions = Array.from(this.hitboxes.keys()).map(name => 
      `<option value="${name}" ${this.selectedHitbox === name ? 'selected' : ''}>${name}</option>`
    ).join('');

    const selectedInfo = this.selectedHitbox ? this.getSelectedHitboxInfo() : 'No hitbox selected';

    this.debugPanel.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px; color: #00ff00;"><strong>🎯 HITBOX MANAGER</strong></div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;"><strong>Select Hitbox:</strong></label>
        <select id="hitbox-dropdown" style="
          width: 100%; 
          padding: 8px; 
          background: #333; 
          color: white; 
          border: 1px solid #00ff00; 
          border-radius: 5px;
          font-family: monospace;
          font-size: 13px;
          max-height: 200px;
          overflow-y: auto;
        ">
          <option value="">-- Select Hitbox --</option>
          ${hitboxOptions}
        </select>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;"><strong>Mode:</strong></label>
        <select id="mode-dropdown" style="
          width: 100%; 
          padding: 8px; 
          background: #333; 
          color: white; 
          border: 1px solid #00ff00; 
          border-radius: 5px;
          font-family: monospace;
          font-size: 13px;
        ">
          <option value="normal" ${!this.keyframeMode ? 'selected' : ''}>Normal Mode</option>
          <option value="keyframe" ${this.keyframeMode ? 'selected' : ''}>Keyframe Mode</option>
        </select>
      </div>
      
      ${this.keyframeMode ? this.getKeyframeControls() : `
      <div style="margin-bottom: 15px; text-align: center;">
        <button id="toggle-mouse-mode" style="
          padding: 8px 16px;
          background: ${this.mouseMode ? '#00aa00' : '#333'};
          color: white;
          border: 1px solid #00ff00;
          border-radius: 5px;
          cursor: pointer;
          font-family: monospace;
          font-size: 12px;
        ">
          ${this.mouseMode ? '🖱️ Mouse Mode ON' : '⌨️ Keyboard Mode'}
        </button>
      </div>
      `}
      
      <div style="margin-bottom: 10px; padding: 10px; background: rgba(0,100,0,0.2); border-radius: 5px;">
        <strong>Selected:</strong> ${this.selectedHitbox || 'None'}<br>
        ${selectedInfo}
      </div>
      
      <div style="font-size: 11px; color: #ccc;">
        <strong>Controls:</strong><br>
        <strong>TAB:</strong> Toggle Debug Mode<br>
        <strong>V:</strong> Toggle Visibility<br>
        ${this.keyframeMode ? this.getKeyframeInstructions() : (this.mouseMode ? this.getMouseControls() : this.getKeyboardControls())}
      </div>
    `;
  }

  // Add debug panel event listeners (called only once)
  addDebugPanelListeners() {
    // Use event delegation to handle dropdown changes
    this.debugPanel.addEventListener('change', (e) => {
      if (e.target.id === 'hitbox-dropdown') {
        console.log(`Dropdown changed to: ${e.target.value}`);
        
        if (e.target.value) {
          // Clear any existing selection first
          if (this.selectedHitbox) {
            console.log(`Clearing previous selection: ${this.selectedHitbox}`);
            this.hideHitbox(this.selectedHitbox);
            this.selectedHitbox = null;
          }
          
          // Set new selection
          const targetValue = e.target.value;
          console.log(`Attempting to select: ${targetValue}`);
          this.selectHitbox(targetValue);
          
        } else {
          // Deselect if empty option chosen
          console.log(`Deselecting current hitbox`);
          if (this.selectedHitbox) {
            this.hideHitbox(this.selectedHitbox);
            this.selectedHitbox = null;
            this.updateDebugPanel();
          }
        }
      } else if (e.target.id === 'mode-dropdown') {
        const newMode = e.target.value === 'keyframe';
        this.toggleKeyframeMode(newMode);
      }
    });
    
    // Use event delegation to handle button clicks
    this.debugPanel.addEventListener('click', (e) => {
      if (e.target.id === 'toggle-mouse-mode') {
        this.toggleMouseMode();
      } else if (e.target.id === 'record-keyframe') {
        this.recordKeyframe();
      } else if (e.target.id === 'clear-keyframes') {
        this.clearKeyframes();
      } else if (e.target.id === 'export-keyframes') {
        this.exportKeyframes();
      }
    });
  }

  // Get keyboard controls text
  getKeyboardControls() {
    return `
      <strong>MOVEMENT:</strong><br>
      <strong>W</strong> Forward | <strong>S</strong> Backward<br>
      <strong>A</strong> Left | <strong>D</strong> Right<br>
      <strong>Q</strong> Up | <strong>E</strong> Down<br>
      <br>
      <strong>ROTATION:</strong><br>
      <strong>I</strong> Pitch Up | <strong>K</strong> Pitch Down<br>
      <strong>J</strong> Yaw Left | <strong>L</strong> Yaw Right<br>
      <strong>N</strong> Roll Left | <strong>M</strong> Roll Right<br>
      <br>
      <strong>SCALE:</strong><br>
      <strong>U</strong> Shrink All | <strong>O</strong> Grow All<br>
      <strong>H</strong> Narrow X | <strong>Y</strong> Widen X<br>
      <strong>G</strong> Shorter Y | <strong>T</strong> Taller Y<br>
      <strong>F</strong> Thinner Z | <strong>R</strong> Thicker Z<br>
      <br>
      <strong>MODIFIERS:</strong><br>
      <strong>SHIFT:</strong> 10x Speed | <strong>ALT:</strong> 0.1x Speed<br>
      <strong>CTRL+S:</strong> Copy Values
    `;
  }

  // Get mouse controls text
  getMouseControls() {
    return `
      <strong>Left Click + Drag:</strong> Move X/Y<br>
      <strong>Right Click + Drag:</strong> Rotate (with gizmo)<br>
      <strong>Mouse Wheel:</strong> Move Z (forward/back)<br>
      <strong>Shift + Wheel:</strong> Scale<br>
      <strong>CTRL+S:</strong> Copy Values<br>
      <em>Rotation gizmo shows when rotating</em>
    `;
  }

  // Toggle between mouse and keyboard mode
  toggleMouseMode() {
    this.mouseMode = !this.mouseMode;
    
    if (this.mouseMode) {
      this.addMouseControls();
      console.log('Mouse Mode: ENABLED');
    } else {
      this.removeMouseControls();
      this.hideGizmoSphere();
      console.log('Mouse Mode: DISABLED');
    }
    
    this.updateDebugPanel();
  }

  // Get info about selected hitbox
  getSelectedHitboxInfo() {
    if (!this.selectedHitbox) return '';
    
    const hitbox = this.hitboxes.get(this.selectedHitbox);
    if (!hitbox) return '';
    
    const pos = hitbox.cssObject.position;
    const rot = hitbox.cssObject.rotation;
    const scale = hitbox.cssObject.scale;
    
    return `
      Pos: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})<br>
      Rot: (${rot.x.toFixed(2)}, ${rot.y.toFixed(2)}, ${rot.z.toFixed(2)})<br>
      Scale: (${scale.x.toFixed(3)}, ${scale.y.toFixed(3)}, ${scale.z.toFixed(3)})
    `;
  }

  // Select a hitbox for editing
  selectHitbox(name) {
    console.log(`🎯 Attempting to select hitbox: ${name}`);
    
    // Hide previous selection
    if (this.selectedHitbox) {
      this.hideHitbox(this.selectedHitbox);
    }
    
    this.selectedHitbox = name;
    console.log(`✓ Selected hitbox set to: ${this.selectedHitbox}`);
    
    // Show the hitbox
    this.showHitbox(name);
    
    // Hide gizmo when switching selections
    this.hideGizmoSphere();
    
    // Force update the debug panel to reflect the new selection
    this.updateDebugPanel();
    
    console.log(`✓ Selection process completed for: ${name}`);
    this.logHitboxValues();
  }

  // Show hitbox visually
  showHitbox(name) {
    const hitbox = this.hitboxes.get(name);
    if (!hitbox) return;
    
    console.log(`🔍 Showing hitbox: ${name}`, hitbox.element);
    const hitboxElement = hitbox.element.querySelector(`[class*="hitbox"]`);
    console.log(`🔍 Found hitbox element:`, hitboxElement);
    
    if (hitboxElement) {
      // Force visibility with !important styles and clear any conflicting properties
      hitboxElement.style.setProperty('background', 'rgba(0, 255, 0, 0.5)', 'important');
      hitboxElement.style.setProperty('border', '3px solid #00ff00', 'important');
      hitboxElement.style.setProperty('box-sizing', 'border-box', 'important');
      hitboxElement.style.setProperty('opacity', '1', 'important');
      hitboxElement.style.setProperty('visibility', 'visible', 'important');
      hitboxElement.style.setProperty('pointer-events', 'auto', 'important');
      hitboxElement.style.setProperty('z-index', '9999', 'important');
      
      // Log current styles to debug
      console.log(`🎨 Applied styles to ${name}:`, {
        background: hitboxElement.style.background,
        border: hitboxElement.style.border,
        opacity: hitboxElement.style.opacity,
        visibility: hitboxElement.style.visibility,
        pointerEvents: hitboxElement.style.pointerEvents,
        zIndex: hitboxElement.style.zIndex
      });
      
      hitbox.visible = true;
      console.log(`✅ Applied green outline to ${name}`);
    } else {
      console.log(`❌ No hitbox element found for ${name} with selector [class*="hitbox"]`);
      // Try to log what classes are available
      if (hitbox.element.children.length > 0) {
        console.log(`Available child elements:`, Array.from(hitbox.element.children).map(child => ({
          tagName: child.tagName,
          className: child.className,
          id: child.id
        })));
      }
    }
  }

  // Hide hitbox visually
  hideHitbox(name) {
    const hitbox = this.hitboxes.get(name);
    if (!hitbox) return;
    
    // Cancel any existing fade animation for this hitbox
    const timeoutIds = this.activeTimeouts.get(name);
    if (timeoutIds) {
      timeoutIds.forEach(id => clearTimeout(id));
      this.activeTimeouts.delete(name);
    }
    
    const hitboxElement = hitbox.element.querySelector(`[class*="hitbox"]`);
    
    if (hitboxElement) {
      if (this.debugMode) {
        // In debug mode, show subtle debug outline instead of hiding completely
        hitboxElement.style.background = 'rgba(0, 255, 0, 0.1)';
        hitboxElement.style.border = '1px dashed #00ff00';
        hitboxElement.style.boxSizing = 'border-box';
      } else {
        // Normal mode - start the cool red fade effect then hide completely
        hitboxElement.style.background = 'transparent';
        hitboxElement.style.border = '1px solid rgba(255, 0, 0, 0.8)';
        hitboxElement.style.boxSizing = 'border-box';
        
        // Store timeout IDs so we can cancel them if needed
        const timeoutIds = [];
        
        // Fade out the red border over time, then hide completely
        const timeout1 = setTimeout(() => {
          hitboxElement.style.border = '1px solid rgba(255, 0, 0, 0.4)';
          const timeout2 = setTimeout(() => {
            hitboxElement.style.border = '1px solid rgba(255, 0, 0, 0.2)';
            const timeout3 = setTimeout(() => {
              hitboxElement.style.border = '1px solid rgba(255, 0, 0, 0.1)';
              const timeout4 = setTimeout(() => {
                // Finally, hide completely
                hitboxElement.style.border = 'none';
                hitboxElement.style.background = 'transparent';
                // Clean up timeout tracking
                this.activeTimeouts.delete(name);
              }, 300);
              timeoutIds.push(timeout4);
            }, 300);
            timeoutIds.push(timeout3);
          }, 300);
          timeoutIds.push(timeout2);
        }, 300);
        timeoutIds.push(timeout1);
        
        // Store all timeout IDs for this hitbox
        this.activeTimeouts.set(name, timeoutIds);
      }
      hitbox.visible = false;
    }
  }

  // Hide all hitboxes
  hideAllHitboxes() {
    this.hitboxes.forEach((hitbox, name) => {
      this.hideHitbox(name);
    });
  }

  // Show debug outlines for all hitboxes (when debug mode is enabled)
  showAllDebugOutlines() {
    this.hitboxes.forEach((hitbox, name) => {
      // Cancel any active fade animations first
      const timeoutIds = this.activeTimeouts.get(name);
      if (timeoutIds) {
        timeoutIds.forEach(id => clearTimeout(id));
        this.activeTimeouts.delete(name);
      }
      
      const hitboxElement = hitbox.element.querySelector(`[class*="hitbox"]`);
      if (hitboxElement) {
        // Show a subtle debug outline for all hitboxes using !important
        hitboxElement.style.setProperty('background', 'rgba(0, 255, 0, 0.1)', 'important');
        hitboxElement.style.setProperty('border', '1px dashed #00ff00', 'important');
        hitboxElement.style.setProperty('box-sizing', 'border-box', 'important');
        hitboxElement.style.setProperty('opacity', '1', 'important');
        hitboxElement.style.setProperty('visibility', 'visible', 'important');
      }
    });
  }

  // Add keyboard controls
  addKeyboardControls() {
    this.keyHandler = (event) => {
      if (!this.debugMode) return;

      if (event.key === 'v' || event.key === 'V') {
        event.preventDefault();
        if (this.selectedHitbox) {
          const hitbox = this.hitboxes.get(this.selectedHitbox);
          if (hitbox.visible) {
            this.hideHitbox(this.selectedHitbox);
          } else {
            this.showHitbox(this.selectedHitbox);
          }
          this.updateDebugPanel();
        }
        return;
      }

      // Copy values with Ctrl+S
      if (event.key === 's' && event.ctrlKey) {
        event.preventDefault();
        this.copySelectedHitboxValues();
        return;
      }

      if (!this.selectedHitbox) return;

      const hitbox = this.hitboxes.get(this.selectedHitbox);
      if (!hitbox) return;

      // Speed modifiers
      let posStep = event.shiftKey ? 10 : (event.altKey ? 0.1 : 1);
      let rotStep = event.shiftKey ? 0.5 : (event.altKey ? 0.01 : 0.1);
      let scaleStep = event.shiftKey ? 0.1 : (event.altKey ? 0.001 : 0.01);

      const cssObj = hitbox.cssObject;
      
      switch(event.key.toLowerCase()) {
        // Position controls
        case 'w': cssObj.position.z -= posStep; break;
        case 's': cssObj.position.z += posStep; break;
        case 'a': cssObj.position.x -= posStep; break;
        case 'd': cssObj.position.x += posStep; break;
        case 'q': cssObj.position.y += posStep; break;
        case 'e': cssObj.position.y -= posStep; break;
        
        // Rotation controls
        case 'i': cssObj.rotation.x -= rotStep; break;
        case 'k': cssObj.rotation.x += rotStep; break;
        case 'j': cssObj.rotation.y -= rotStep; break;
        case 'l': cssObj.rotation.y += rotStep; break;
        case 'n': cssObj.rotation.z -= rotStep; break;
        case 'm': cssObj.rotation.z += rotStep; break;
        
        // Scale controls - all axes
        case 'u': 
          cssObj.scale.x -= scaleStep;
          cssObj.scale.y -= scaleStep;
          cssObj.scale.z -= scaleStep;
          break;
        case 'o':
          cssObj.scale.x += scaleStep;
          cssObj.scale.y += scaleStep;
          cssObj.scale.z += scaleStep;
          break;
          
        // Scale controls - individual axes
        case 'y': cssObj.scale.x += scaleStep; break;
        case 'h': cssObj.scale.x -= scaleStep; break;
        case 't': cssObj.scale.y += scaleStep; break;
        case 'g': cssObj.scale.y -= scaleStep; break;
        case 'r': cssObj.scale.z += scaleStep; break;
        case 'f': cssObj.scale.z -= scaleStep; break;
        
        default: return;
      }
      
      event.preventDefault();
      this.updateDebugPanel();
      this.logHitboxValues();
    };
    
    document.addEventListener('keydown', this.keyHandler);
  }

  // Add mouse controls
  addMouseControls() {
    this.mouseHandler = {
      mousedown: (event) => {
        if (!this.debugMode || !this.selectedHitbox) return;
        
        if (event.button === 0) { // Left click - move
          this.isDragging = true;
          this.isRotating = false;
          this.hideGizmoSphere();
        } else if (event.button === 2) { // Right click - rotate
          this.isDragging = false;
          this.isRotating = true;
          this.showGizmoSphere();
        }
        
        this.lastMousePos = { x: event.clientX, y: event.clientY };
        event.preventDefault();
      },
      
      mousemove: (event) => {
        if (!this.debugMode || !this.selectedHitbox) return;
        if (!this.isDragging && !this.isRotating) return;
        
        const deltaX = event.clientX - this.lastMousePos.x;
        const deltaY = event.clientY - this.lastMousePos.y;
        const sensitivity = event.shiftKey ? 0.1 : (event.altKey ? 0.01 : 0.02);
        
        const hitbox = this.hitboxes.get(this.selectedHitbox);
        if (!hitbox) return;
        
        const cssObj = hitbox.cssObject;
        
        if (this.isDragging) {
          // Move X/Y with mouse drag
          cssObj.position.x += deltaX * sensitivity * 5;
          cssObj.position.y -= deltaY * sensitivity * 5; // Invert Y for intuitive movement
        } else if (this.isRotating) {
          // Rotate with mouse drag
          cssObj.rotation.y += deltaX * sensitivity;
          cssObj.rotation.x += deltaY * sensitivity;
          this.updateGizmoSphere();
        }
        
        this.lastMousePos = { x: event.clientX, y: event.clientY };
        this.updateDebugPanel();
        this.logHitboxValues();
        event.preventDefault();
      },
      
      mouseup: (event) => {
        if (this.isRotating) {
          this.hideGizmoSphere();
        }
        this.isDragging = false;
        this.isRotating = false;
      },
      
      wheel: (event) => {
        if (!this.debugMode || !this.selectedHitbox) return;
        
        const hitbox = this.hitboxes.get(this.selectedHitbox);
        if (!hitbox) return;
        
        const cssObj = hitbox.cssObject;
        const delta = event.deltaY > 0 ? -1 : 1;
        const step = event.shiftKey ? 0.01 : 1; // Shift for scaling
        
        if (event.shiftKey) {
          // Scale with shift + wheel
          const scaleStep = delta * step;
          cssObj.scale.x += scaleStep;
          cssObj.scale.y += scaleStep;
          cssObj.scale.z += scaleStep;
        } else {
          // Move Z with wheel
          cssObj.position.z += delta * step;
        }
        
        this.updateDebugPanel();
        this.logHitboxValues();
        event.preventDefault();
      },
      
      contextmenu: (event) => {
        // Prevent context menu when right-clicking for rotation
        if (this.debugMode && this.selectedHitbox) {
          event.preventDefault();
        }
      }
    };
    
    // Add all mouse event listeners
    document.addEventListener('mousedown', this.mouseHandler.mousedown);
    document.addEventListener('mousemove', this.mouseHandler.mousemove);
    document.addEventListener('mouseup', this.mouseHandler.mouseup);
    document.addEventListener('wheel', this.mouseHandler.wheel);
    document.addEventListener('contextmenu', this.mouseHandler.contextmenu);
  }

  // Remove mouse controls
  removeMouseControls() {
    if (this.mouseHandler) {
      document.removeEventListener('mousedown', this.mouseHandler.mousedown);
      document.removeEventListener('mousemove', this.mouseHandler.mousemove);
      document.removeEventListener('mouseup', this.mouseHandler.mouseup);
      document.removeEventListener('wheel', this.mouseHandler.wheel);
      document.removeEventListener('contextmenu', this.mouseHandler.contextmenu);
      this.mouseHandler = null;
    }
  }

  // Create Unity-style rotation gizmo sphere
  showGizmoSphere() {
    if (!this.selectedHitbox) return;
    
    // Remove existing gizmo
    this.hideGizmoSphere();
    
    const hitbox = this.hitboxes.get(this.selectedHitbox);
    if (!hitbox) return;
    
    // Create gizmo sphere element
    this.gizmoSphere = document.createElement('div');
    this.gizmoSphere.id = 'rotation-gizmo-sphere';
    this.gizmoSphere.style.cssText = `
      position: fixed;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      border: 3px solid #00ff00;
      background: radial-gradient(circle, rgba(0,255,0,0.1) 0%, rgba(0,255,0,0.05) 70%, transparent 100%);
      pointer-events: none;
      z-index: 10001;
      box-shadow: 0 0 20px rgba(0,255,0,0.5);
      transition: opacity 0.2s ease;
    `;
    
    // Add rotation rings
    const rings = ['X', 'Y', 'Z'];
    const colors = ['#ff0000', '#00ff00', '#0000ff'];
    
    rings.forEach((axis, index) => {
      const ring = document.createElement('div');
      ring.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid ${colors[index]};
        top: 0;
        left: 0;
        transform: rotate${axis === 'X' ? 'X' : axis === 'Y' ? 'Y' : 'Z'}(${axis === 'Y' ? '0' : '90'}deg);
        opacity: 0.7;
      `;
      this.gizmoSphere.appendChild(ring);
    });
    
    // Add center dot
    const center = document.createElement('div');
    center.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      background: #ffffff;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 10px #ffffff;
    `;
    this.gizmoSphere.appendChild(center);
    
    document.body.appendChild(this.gizmoSphere);
    this.updateGizmoSphere();
  }

  // Update gizmo sphere position
  updateGizmoSphere() {
    if (!this.gizmoSphere || !this.selectedHitbox) return;
    
    // Position gizmo in bottom-right corner
    this.gizmoSphere.style.bottom = '20px';
    this.gizmoSphere.style.right = '20px';
  }

  // Hide gizmo sphere
  hideGizmoSphere() {
    if (this.gizmoSphere) {
      this.gizmoSphere.remove();
      this.gizmoSphere = null;
    }
  }

  // Remove keyboard controls
  removeKeyboardControls() {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }

  // Log current values to console for copy-paste
  logHitboxValues() {
    if (!this.selectedHitbox) return;
    
    const hitbox = this.hitboxes.get(this.selectedHitbox);
    if (!hitbox) return;
    
    const pos = hitbox.cssObject.position;
    const rot = hitbox.cssObject.rotation;
    const scale = hitbox.cssObject.scale;
    
    console.log(`${this.selectedHitbox} Values:`);
    console.log(`  Position: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})`);
    console.log(`  Rotation: (${rot.x.toFixed(2)}, ${rot.y.toFixed(2)}, ${rot.z.toFixed(2)})`);
    console.log(`  Scale: (${scale.x.toFixed(3)}, ${scale.y.toFixed(3)}, ${scale.z.toFixed(3)})`);
  }

  // Copy selected hitbox values to clipboard
  async copySelectedHitboxValues() {
    if (!this.selectedHitbox) {
      console.warn('No hitbox selected to copy');
      return;
    }
    
    const hitbox = this.hitboxes.get(this.selectedHitbox);
    if (!hitbox) return;
    
    const pos = hitbox.cssObject.position;
    const rot = hitbox.cssObject.rotation;
    const scale = hitbox.cssObject.scale;
    
    // Format the values for copying
    const copyText = `${this.selectedHitbox} Values:
Position: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})
Rotation: (${rot.x.toFixed(2)}, ${rot.y.toFixed(2)}, ${rot.z.toFixed(2)})
Scale: (${scale.x.toFixed(3)}, ${scale.y.toFixed(3)}, ${scale.z.toFixed(3)})

Code Format:
cssObject.position.set(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)});
cssObject.rotation.set(${rot.x.toFixed(2)}, ${rot.y.toFixed(2)}, ${rot.z.toFixed(2)});
cssObject.scale.set(${scale.x.toFixed(3)}, ${scale.y.toFixed(3)}, ${scale.z.toFixed(3)});`;
    
    try {
      await navigator.clipboard.writeText(copyText);
      console.log(`📋 Copied ${this.selectedHitbox} values to clipboard!`);
      
      // Show visual feedback
      this.showCopyFeedback();
    } catch (err) {
      // Fallback for older browsers
      console.log('Clipboard API not supported, values logged to console:');
      console.log(copyText);
      
      // Try to select text in a temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = copyText;
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        console.log(`📋 Copied ${this.selectedHitbox} values to clipboard (fallback)!`);
        this.showCopyFeedback();
      } catch (fallbackErr) {
        console.error('Failed to copy to clipboard:', fallbackErr);
      }
      
      document.body.removeChild(textarea);
    }
  }

  // Show visual feedback when copying
  showCopyFeedback() {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 255, 0, 0.9);
      color: black;
      padding: 15px 25px;
      border-radius: 10px;
      font-family: monospace;
      font-weight: bold;
      font-size: 16px;
      z-index: 10002;
      box-shadow: 0 4px 20px rgba(0, 255, 0, 0.5);
      animation: copyFeedback 1.5s ease-out forwards;
    `;
    
    feedback.innerHTML = `📋 Copied ${this.selectedHitbox} Values!`;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes copyFeedback {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(feedback);
    
    // Remove after animation
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 1500);
  }

  // Toggle keyframe mode
  toggleKeyframeMode(enable = null) {
    this.keyframeMode = enable !== null ? enable : !this.keyframeMode;
    console.log(`Keyframe Mode: ${this.keyframeMode ? 'ENABLED' : 'DISABLED'}`);
    this.updateDebugPanel();
  }

  // Get keyframe controls HTML
  getKeyframeControls() {
    const keyframeCount = this.selectedHitbox ? (this.keyframes.get(this.selectedHitbox) || []).length : 0;
    
    return `
      <div style="margin-bottom: 15px; text-align: center;">
        <button id="record-keyframe" style="
          padding: 8px 16px;
          background: #ff4444;
          color: white;
          border: 1px solid #ff6666;
          border-radius: 5px;
          cursor: pointer;
          font-family: monospace;
          font-size: 12px;
          margin-right: 5px;
        " ${!this.selectedHitbox ? 'disabled' : ''}>
          🎬 Record Keyframe
        </button>
        <button id="clear-keyframes" style="
          padding: 8px 16px;
          background: #ff8800;
          color: white;
          border: 1px solid #ffaa33;
          border-radius: 5px;
          cursor: pointer;
          font-family: monospace;
          font-size: 12px;
          margin-right: 5px;
        " ${keyframeCount === 0 ? 'disabled' : ''}>
          🗑️ Clear
        </button>
        <button id="export-keyframes" style="
          padding: 8px 16px;
          background: #4444ff;
          color: white;
          border: 1px solid #6666ff;
          border-radius: 5px;
          cursor: pointer;
          font-family: monospace;
          font-size: 12px;
        " ${keyframeCount === 0 ? 'disabled' : ''}>
          📤 Export
        </button>
      </div>
      <div style="margin-bottom: 10px; padding: 8px; background: rgba(255,68,68,0.2); border-radius: 5px; font-size: 11px;">
        <strong>Keyframes:</strong> ${keyframeCount} recorded
      </div>
    `;
  }

  // Get keyframe instructions
  getKeyframeInstructions() {
    return `
      <strong>KEYFRAME MODE:</strong><br>
      1. Select a hitbox<br>
      2. Position it using normal controls<br>
      3. Click "Record Keyframe" to save position<br>
      4. Repeat to create animation path<br>
      5. Export to get animation code<br>
      <br>
      <strong>Use normal movement controls to position</strong>
    `;
  }

  // Record current position as keyframe
  recordKeyframe() {
    if (!this.selectedHitbox) {
      console.warn('No hitbox selected for keyframe recording');
      return;
    }

    const hitboxData = this.hitboxes.get(this.selectedHitbox);
    if (!hitboxData) return;

    const cssObject = hitboxData.cssObject;
    const keyframe = {
      timestamp: Date.now(),
      position: {
        x: parseFloat(cssObject.position.x.toFixed(3)),
        y: parseFloat(cssObject.position.y.toFixed(3)),
        z: parseFloat(cssObject.position.z.toFixed(3))
      },
      rotation: {
        x: parseFloat(cssObject.rotation.x.toFixed(3)),
        y: parseFloat(cssObject.rotation.y.toFixed(3)),
        z: parseFloat(cssObject.rotation.z.toFixed(3))
      },
      scale: {
        x: parseFloat(cssObject.scale.x.toFixed(3)),
        y: parseFloat(cssObject.scale.y.toFixed(3)),
        z: parseFloat(cssObject.scale.z.toFixed(3))
      }
    };

    // Initialize keyframes array if it doesn't exist
    if (!this.keyframes.has(this.selectedHitbox)) {
      this.keyframes.set(this.selectedHitbox, []);
    }

    const keyframes = this.keyframes.get(this.selectedHitbox);
    keyframes.push(keyframe);

    console.log(`Recorded keyframe ${keyframes.length} for ${this.selectedHitbox}:`, keyframe);
    
    // Show feedback
    this.showKeyframeRecordedFeedback();
    this.updateDebugPanel();
  }

  // Clear all keyframes for selected hitbox
  clearKeyframes() {
    if (!this.selectedHitbox) return;

    this.keyframes.set(this.selectedHitbox, []);
    console.log(`Cleared keyframes for ${this.selectedHitbox}`);
    this.updateDebugPanel();
  }

  // Export keyframes as code
  exportKeyframes() {
    if (!this.selectedHitbox) return;

    const keyframes = this.keyframes.get(this.selectedHitbox);
    if (!keyframes || keyframes.length === 0) return;

    const exportData = {
      hitboxName: this.selectedHitbox,
      keyframes: keyframes,
      animationCode: this.generateAnimationCode(keyframes)
    };

    // Copy to clipboard
    navigator.clipboard.writeText(exportData.animationCode).then(() => {
      console.log('Animation code copied to clipboard');
      this.showExportFeedback();
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });

    // Also log the full export data
    console.log('Keyframe Export Data:', exportData);
  }

  // Generate animation code from keyframes
  generateAnimationCode(keyframes) {
    if (keyframes.length === 0) return '';

    let code = `// Animation code for ${this.selectedHitbox}\n`;
    code += `// ${keyframes.length} keyframes recorded\n\n`;

    code += `const keyframes = [\n`;
    keyframes.forEach((keyframe, index) => {
      code += `  { // Keyframe ${index + 1}\n`;
      code += `    position: new THREE.Vector3(${keyframe.position.x}, ${keyframe.position.y}, ${keyframe.position.z}),\n`;
      code += `    rotation: { x: ${keyframe.rotation.x}, y: ${keyframe.rotation.y}, z: ${keyframe.rotation.z} },\n`;
      code += `    scale: new THREE.Vector3(${keyframe.scale.x}, ${keyframe.scale.y}, ${keyframe.scale.z})\n`;
      code += `  }${index < keyframes.length - 1 ? ',' : ''}\n`;
    });
    code += `];\n\n`;

    code += `// Example animation function\n`;
    code += `function animateHitbox(cssObject, duration = 1500) {\n`;
    code += `  const startTime = performance.now();\n`;
    code += `  const totalFrames = keyframes.length - 1;\n\n`;
    code += `  function animate() {\n`;
    code += `    const elapsed = performance.now() - startTime;\n`;
    code += `    const t = Math.min(elapsed / duration, 1);\n`;
    code += `    const frameIndex = Math.floor(t * totalFrames);\n`;
    code += `    const nextFrameIndex = Math.min(frameIndex + 1, totalFrames);\n`;
    code += `    const frameT = (t * totalFrames) - frameIndex;\n\n`;
    code += `    if (frameIndex < totalFrames) {\n`;
    code += `      const currentFrame = keyframes[frameIndex];\n`;
    code += `      const nextFrame = keyframes[nextFrameIndex];\n\n`;
    code += `      // Interpolate position\n`;
    code += `      cssObject.position.lerpVectors(currentFrame.position, nextFrame.position, frameT);\n`;
    code += `      // Interpolate scale\n`;
    code += `      cssObject.scale.lerpVectors(currentFrame.scale, nextFrame.scale, frameT);\n`;
    code += `      // Interpolate rotation\n`;
    code += `      cssObject.rotation.x = THREE.MathUtils.lerp(currentFrame.rotation.x, nextFrame.rotation.x, frameT);\n`;
    code += `      cssObject.rotation.y = THREE.MathUtils.lerp(currentFrame.rotation.y, nextFrame.rotation.y, frameT);\n`;
    code += `      cssObject.rotation.z = THREE.MathUtils.lerp(currentFrame.rotation.z, nextFrame.rotation.z, frameT);\n`;
    code += `    }\n\n`;
    code += `    if (t < 1) {\n`;
    code += `      requestAnimationFrame(animate);\n`;
    code += `    }\n`;
    code += `  }\n\n`;
    code += `  animate();\n`;
    code += `}`;

    return code;
  }

  // Show feedback when keyframe is recorded
  showKeyframeRecordedFeedback() {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 68, 68, 0.9);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      font-family: monospace;
      font-size: 16px;
      font-weight: bold;
      z-index: 10001;
      border: 2px solid #ff6666;
      animation: keyframeRecorded 1.2s ease-out forwards;
    `;
    
    feedback.innerHTML = `🎬 Keyframe Recorded!`;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes keyframeRecorded {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(feedback);
    
    // Remove after animation
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 1200);
  }

  // Show feedback when keyframes are exported
  showExportFeedback() {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(68, 68, 255, 0.9);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      font-family: monospace;
      font-size: 16px;
      font-weight: bold;
      z-index: 10001;
      border: 2px solid #6666ff;
      animation: exportFeedback 1.5s ease-out forwards;
    `;
    
    feedback.innerHTML = `📤 Animation Code Copied!`;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes exportFeedback {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(feedback);
    
    // Remove after animation
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 1500);
  }

  // Destroy debug panel
  destroyDebugPanel() {
    if (this.debugPanel) {
      this.debugPanel.remove();
      this.debugPanel = null;
    }
  }

  // Cleanup
  destroy() {
    this.destroyDebugPanel();
    this.removeKeyboardControls();
    this.removeMouseControls();
    this.hideGizmoSphere();
    this.hideAllHitboxes();
    this.hitboxes.clear();
  }
}

// Create global instance
const hitboxManager = new HitboxManager();
window.hitboxManager = hitboxManager; // Make globally accessible

// Add global keyboard listener for debug toggle (always active)
document.addEventListener('keydown', (event) => {
  // Handle TAB to toggle debug mode (global shortcut)
  if (event.key === 'Tab') {
    event.preventDefault();
    hitboxManager.toggleDebugMode();
    return;
  }
});

// Global toggle function
window.toggleHitboxDebug = () => {
  hitboxManager.toggleDebugMode();
};

// Add initial toggle instruction
console.log('🎯 Hitbox Manager loaded! Use toggleHitboxDebug() or press TAB to start editing');

export { hitboxManager };
