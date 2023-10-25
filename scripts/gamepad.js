const gamepadAPI = {
  controller: {}, grab: {}, trolley: {}, bridge: {},
  //turbo: false, wtf is turbo
  init3d(grab, trolley, bridge) {
    this.grab = grab;
    this.trolley = trolley;
    this.bridge = bridge;
  },
  connect(gp, grab, trolley, bridge, evt) {
    gamepadAPI.controller = evt.gamepad;
    //gamepadAPI.turbo = true;
    console.log('Gamepad connected.');
    gamepadAPI.init3d(grab, trolley, bridge);
    gp.gamepad = gamepadAPI;//update done in threejs animate
  },
  disconnect(evt) {
    gamepadAPI.turbo = false;
    delete gamepadAPI.controller;
    console.log('Gamepad disconnected.');
  },
  update() {
    gamepadAPI.buttonsCache = [];   // Clear the buttons cache
    for (let k = 0; k < gamepadAPI.buttonsStatus.length; k++) {  // Move the buttons status from the previous frame to the cache
      gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
    }
    gamepadAPI.buttonsStatus = []; // Clear the buttons status
    const c = gamepadAPI.controller || {};
    const pressed = [];
    if (c.buttons) {
      for (let b = 0; b < c.buttons.length; b++) {
        if (c.buttons[b].pressed) {
          pressed.push(gamepadAPI.buttons[b]);
        }
      }
    }
    const axes = [];
    if (c.axes) {
      for (let a = 0; a < c.axes.length; a++) {
        axes.push(c.axes[a].toFixed(2));
      }
    }
    // Assign received values
    gamepadAPI.axesStatus = axes;
    gamepadAPI.buttonsStatus = pressed;
    gamepadAPI.updatePos();
    gamepadAPI.updateGrab();
    //return pressed;  // Return buttons for debugging purposes
  },

  buttonPressed(button, hold) {
    let newPress = false;
    for (let i = 0; i < gamepadAPI.buttonsStatus.length; i++) {      // Loop through pressed buttons
      if (gamepadAPI.buttonsStatus[i] === button) {
        newPress = true;
        if (!hold) {  // If we want to check the single press   
          for (let j = 0; j < gamepadAPI.buttonsCache.length; j++) {  // Loop through the cached states from the previous frame         
            newPress = (gamepadAPI.buttonsCache[j] !== button);  // If the button was already pressed, ignore new press
          }
        }
      }
    }
    return newPress;
  },

  buttons: [],
  buttonsCache: [],
  buttonsStatus: [],
  axesStatus: [],
  updatePos() {
    if (this.axesStatus[0] > 0.3 || this.axesStatus[0] < -0.3) {
      let sign = this.axesStatus[0] > 0.3 ? "+" : "-";
      this.grab.moveX(sign, this.speed(this.axesStatus[0]));
      this.trolley.moveX(sign, this.speed(this.axesStatus[0]));
      this.bridge.moveX(sign, this.speed(this.axesStatus[0]));
    }
    if (this.axesStatus[1] > 0.3 || this.axesStatus[1] < -0.3) {
      let sign = this.axesStatus[1] > 0.3 ? "+" : "-";
      this.grab.moveZ(sign, this.speed(this.axesStatus[1]));
      this.trolley.moveZ(sign, this.speed(this.axesStatus[1]));
    }
  },
  speed: function (axes) { return this.axesStatus[0] ? Math.abs(axes / 4) : 0; },
  updateGrab() {
   console.log(gamepadAPI.buttonsStatus);
    if (gamepadAPI.buttonPressed("B")) {
      grab.playGrabAnim();
    }
  }
};

export function createGameControls(gp, grab, trolley, bridge) {
  window.addEventListener("gamepadconnected", gamepadAPI.connect.bind(null, gp, grab, trolley, bridge));//;
  window.addEventListener("gamepaddisconnected", gamepadAPI.disconnect);
  console.log('created');
}