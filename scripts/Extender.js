//export default class Extender {}
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
