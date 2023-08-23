

//export default class Extender {}
export function createCameraPresetButtons(text="left",camera,controls,x=120,y=50,z=20,targetX=0,targetY=0,targetZ=0 ){
    var button = document.createElement('button');
    button.id = "btn"+text;
    button.innerHTML = text;
    button.onclick = ()=>{
        //Set inactive all other buttons
        var buttons = document.getElementsByTagName('button');
        for (let i = 0; i < buttons.length; i++) {buttons[i].className = "";}
         //Set active current btn
        button.className = "active";
        setCameraPos(camera,controls,x, y, z,targetX,targetY,targetZ);
    }
    document.body.appendChild(button);
}
export function setCameraPos(camera,controls,x=120,y=50,z=20,targetX=0,targetY=0,targetZ=0){
    camera.position.set( x, y, z );
    controls.target.set(targetX, targetY, targetZ);
    controls.update();
    return camera;
} 
export function hexToRgb(hex) {
    return {
        r: parseInt(hex.substring(1, 3), 16),
        g: parseInt(hex.substring(3, 5), 16),
        b: parseInt(hex.substring(5, 7), 16)
    };
}
export function blendColors(colorA, colorB, weight) {
    return {
        r: Math.floor(colorA.r * (1 - weight) + colorB.r * weight),
        g: Math.floor(colorA.g * (1 - weight) + colorB.g * weight),
        b: Math.floor(colorA.b * (1 - weight) + colorB.b * weight)
    };
}
export function getColor(min, max, curr, minColor = "#abd4ed", maxColor = "#002942") {
    let perc = (curr - min) / (max - min);
    let blendedColor = blendColors(hexToRgb(minColor), hexToRgb(maxColor), perc);
    return "rgb(" + blendedColor.r + ", " + blendedColor.g + ", " + blendedColor.b + ")";
}
export function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}


//If not async will not work
export async function getUrlContent(url = "") {
    let baseUrl = "../";
    let ghUrl = "https://raw.githubusercontent.com/ossi1801/ThreeJs-Test/main/";
    let combinedLocal = baseUrl + url;
    let ghCombined = ghUrl + url;

    if (await UrlExists(combinedLocal)) {
        console.log(combinedLocal+ " local URL exists"); 
        return combinedLocal;
    }
    else if (await UrlExists(ghCombined)) {
        console.warn(ghCombined+ " local URL does not exists, loaded gh url");
        return ghCombined;
    }
    else {
        console.error(url +" does not exist");
        return "";
    }

}
//If not async will not work
async function UrlExists(url) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
  
    } catch(error) {
      return false;
    }
  }