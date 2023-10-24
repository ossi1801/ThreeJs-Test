const gamepadAPI = {
    controller: {},
    turbo: false,
    connect(evt) {
        gamepadAPI.controller = evt.gamepad;
        gamepadAPI.turbo = true;
        console.log('Gamepad connected.');
    },
    disconnect(evt) {
        gamepadAPI.turbo = false;
        delete gamepadAPI.controller;
        console.log('Gamepad disconnected.');
      },      
    update() {},
    buttonPressed() {},
    buttons: [],
    buttonsCache: [],
    buttonsStatus: [],
    axesStatus: [],
  };
  
  export function createGameControls(){
    window.addEventListener("gamepadconnected", gamepadAPI.connect);
    window.addEventListener("gamepaddisconnected", gamepadAPI.disconnect);
    console.log('created');
  }