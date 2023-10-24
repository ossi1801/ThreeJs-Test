const gamepadAPI = {
    controller: {},
    turbo: false,
    connect(evt) {
        gamepadAPI.controller = evt.gamepad;
        gamepadAPI.turbo = true;
        console.log('Gamepad connected.');
        setInterval(this.update,100);
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
        this.updatePos();
        // Return buttons for debugging purposes
        //return pressed;
    },
    buttonPressed() { },
    buttons: [],
    buttonsCache: [],
    buttonsStatus: [],
    axesStatus: [],
    updatePos() {
        if (this.axesStatus[0].x > 0.5) {
            trolley.moveX("-", this.speed);
        }
        if (this.axesStatus[0].y > 0.5) {
            this.bridge.moveX("-", this.speed);
        }
        
        
    },
    init(grab, trolley, bridge){
        this.grab  = grab;
        this.trolley = trolley;
        this.bridge = bridge;
    },
    speed:0.05,
    grab:{}, trolley:{},bridge: {},
};

export function createGameControls(grab, trolley, bridge) {
    gamepadAPI.init(grab, trolley, bridge);
    window.addEventListener("gamepadconnected", gamepadAPI.connect);
    window.addEventListener("gamepaddisconnected", gamepadAPI.disconnect);
    window.addEventListener()
    console.log('created');
}