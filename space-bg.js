const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
let width, height;
let currentScene = 'timer-view'; 
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    if (assetsLoaded) initScene();
}
window.addEventListener('resize', resize);
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];
const assets = {
    'earth': 'assets/planet_earth.png',
    'lava': 'assets/planet_lava.png',
    'desert': 'assets/planet_desert.png',
    'moon': 'assets/planet_moon.png',
    'gas': 'assets/planet_gas.png',
    'ringed': 'assets/planet_ringed.png',
    'galaxy': 'assets/galaxy.png',
    'blackhole': 'assets/blackhole.png',
    'nebula_red': 'assets/nebula_red.png',
    'nebula_blue': 'assets/nebula_blue.png',
    'nebula_purple': 'assets/nebula_purple.png',
    'nebula_green': 'assets/nebula_green.png'
};
const images = {};
let assetsLoaded = false;
let loadedCount = 0;
const totalAssets = Object.keys(assets).length;
for (let key in assets) {
    const img = new Image();
    img.onload = () => {
        loadedCount++;
        if (loadedCount === totalAssets) {
            assetsLoaded = true;
            resize();
        }
    };
    img.src = assets[key];
    images[key] = img;
}
let celestialBodies = [];
let activeNebula = null;
function initScene() {
    celestialBodies = [];
    let planetTypes = [];
    if (currentScene === 'timer-view') {
        activeNebula = images['nebula_red'];
        planetTypes = ['lava', 'desert', 'blackhole', 'gas'];
    } else if (currentScene === 'task-view') {
        activeNebula = images['nebula_blue'];
        planetTypes = ['earth', 'moon', 'ringed', 'galaxy'];
    } else if (currentScene === 'stats-view') {
        activeNebula = images['nebula_purple'];
        planetTypes = ['galaxy', 'moon', 'blackhole', 'earth', 'desert'];
    } else if (currentScene === 'settings-view') {
        activeNebula = images['nebula_green'];
        planetTypes = ['gas', 'ringed', 'moon', 'lava'];
    }
    for (let type of planetTypes) {
        const radius = (type === 'galaxy' || type === 'blackhole') ? randInt(100, 200) : randInt(40, 100);
        const x = rand(radius + 20, width - radius - 20);
        const y = rand(radius + 20, height - radius - 20);
        celestialBodies.push({
            type: type,
            img: images[type],
            x: x,
            y: y,
            radius: radius
        });
    }
    render(); 
}
function render() {
    if (!assetsLoaded) return;
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, width, height);
    if (activeNebula) {
        ctx.globalCompositeOperation = 'screen'; 
        ctx.drawImage(activeNebula, 0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
    }
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 200; i++) {
        ctx.globalAlpha = rand(0.2, 0.8);
        const sx = rand(0, width);
        const sy = rand(0, height);
        const size = randInt(1, 2);
        ctx.fillRect(sx, sy, size, size);
    }
    ctx.globalAlpha = 1.0;
    celestialBodies.sort((a,b) => a.radius - b.radius);
    ctx.imageSmoothingEnabled = false;
    for (let obj of celestialBodies) {
        const pixelationFactor = 0.2; 
        const smallSize = obj.radius * 2 * pixelationFactor;
        const offCanvas = document.createElement('canvas');
        offCanvas.width = smallSize;
        offCanvas.height = smallSize;
        const offCtx = offCanvas.getContext('2d');
        offCtx.imageSmoothingEnabled = false;
        offCtx.drawImage(obj.img, 0, 0, smallSize, smallSize);
        if (obj.type === 'galaxy' || obj.type === 'blackhole') {
            ctx.globalCompositeOperation = 'screen';
            ctx.drawImage(offCanvas, 0, 0, smallSize, smallSize, obj.x - obj.radius, obj.y - obj.radius, obj.radius * 2, obj.radius * 2);
            ctx.globalCompositeOperation = 'source-over';
        } else {
            ctx.save();
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.radius * 0.95, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(offCanvas, 0, 0, smallSize, smallSize, obj.x - obj.radius, obj.y - obj.radius, obj.radius * 2, obj.radius * 2);
            ctx.restore();
            if (obj.type === 'ringed') {
                ctx.globalCompositeOperation = 'screen';
                ctx.drawImage(offCanvas, 0, 0, smallSize, smallSize, obj.x - obj.radius, obj.y - obj.radius, obj.radius * 2, obj.radius * 2);
                ctx.globalCompositeOperation = 'source-over';
            }
        }
    }
}
window.setSpaceScene = function(sceneId) {
    if (currentScene !== sceneId) {
        currentScene = sceneId;
        initScene();
    }
};
