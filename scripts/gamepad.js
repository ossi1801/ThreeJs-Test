const gamepadAPI = {
  controller: {}, grab: {}, trolley: {}, bridge: {},
  //turbo: false, wtf is turbo
  init3d(grab, trolley, bridge) {
    this.grab = grab;
    this.trolley = trolley;
    this.bridge = bridge;
  },
  connect(gp, grab, trolley, bridge, evt) {
    console.log(this);
    console.log("evt", evt);
    console.log("grab", grab);
    console.log("trolley", trolley);
    console.log("bridge", bridge);
    gamepadAPI.controller = evt.gamepad;
    gamepadAPI.turbo = true;
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
    // Clear the buttons cache
    gamepadAPI.buttonsCache = [];
    // Move the buttons status from the previous frame to the cache
    for (let k = 0; k < gamepadAPI.buttonsStatus.length; k++) {
      gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
    }
    // Clear the buttons status
    gamepadAPI.buttonsStatus = [];
    // Get the gamepad object
    const c = gamepadAPI.controller || {};
    // Loop through buttons and push the pressed ones to the array
    const pressed = [];
    if (c.buttons) {
      for (let b = 0; b < c.buttons.length; b++) {
        if (c.buttons[b].pressed) {
          pressed.push(gamepadAPI.buttons[b]);
        }
      }
    }
    // Loop through axes and push their values to the array
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
    // Return buttons for debugging purposes
    //return pressed;
  },
  buttonPressed() { },
  buttons: [],
  buttonsCache: [],
  buttonsStatus: [],
  axesStatus: [],
  updatePos() {
    //console.log(this.axesStatus);
    if (this.axesStatus[0] > 0.3 || this.axesStatus[0] < -0.3) {
      let sign = this.axesStatus[0] > 0.3 ? "+" : "-";
      //console.log(this.axesStatus[0] + ">" + "0", this.axesStatus[0] > 0, sign);
      this.grab.moveX(sign, this.speed(this.axesStatus[0]));
      this.trolley.moveX(sign, this.speed(this.axesStatus[0]));
      this.bridge.moveX(sign, this.speed(this.axesStatus[0]));
    }
    if (this.axesStatus[1] > 0.3 || this.axesStatus[1] < -0.3) {
      let sign = this.axesStatus[0] > 0.3 ? "+" : "-";
      this.grab.moveZ(sign, this.speed(this.axesStatus[1]));
      this.trolley.moveZ(sign, this.speed(this.axesStatus[1]));
      //this.bridge.moveY(sign, this.speed(this.axesStatus[1]));
    }
  },
  speed: function (axes) {return this.axesStatus[0] ? Math.abs(axes / 4) : 0;}
};

export function createGameControls(gp, grab, trolley, bridge) {
  window.addEventListener("gamepadconnected", gamepadAPI.connect.bind(null, gp, grab, trolley, bridge));//;
  window.addEventListener("gamepaddisconnected", gamepadAPI.disconnect);
  console.log('created');
}