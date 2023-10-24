const gamepadAPI = {
  controller: {},
  turbo: false,
  connect(grab, trolley, bridge, evt) {
    console.log(this);
    console.log("evt", evt);
    console.log("grab", grab);
    console.log("trolley", trolley);
    console.log("bridge", bridge);
    gamepadAPI.controller = evt.gamepad;
    gamepadAPI.turbo = true;
    console.log('Gamepad connected.');
    gamepadAPI.init(grab, trolley, bridge);
    setInterval(gamepadAPI.update, 100);

    //gamepadAPI.update();
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
      let sign = this.axesStatus[0] > 0.3 ? "+":"-";
      this.speed = this.axesStatus[0] /10;
      console.log(this.axesStatus[0]+">"+"0",this.axesStatus[0] > 0 ,sign);
      this.grab.moveX(sign, this.speed);
      this.trolley.moveX(sign, this.speed);
      this.bridge.moveX(sign, this.speed);
    }
    if (this.axesStatus[2] > 0.3) {
      this.bridge.moveX("-", this.speed);
    }


  },
  init(grab, trolley, bridge) {
    this.grab = grab;
    this.trolley = trolley;
    this.bridge = bridge;
  },
  speed: 0.05,
  grab: {}, trolley: {}, bridge: {},
};

export function createGameControls(grab, trolley, bridge) {

  window.addEventListener("gamepadconnected", gamepadAPI.connect.bind(null, grab, trolley, bridge));//;
  window.addEventListener("gamepaddisconnected", gamepadAPI.disconnect);
  console.log('created');
}