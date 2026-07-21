const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
let w, h;
let ima = 'timer-view'; 

function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    if (ok) initScene();
}
window.addEventListener('resize', resize);
const R = (a, b) => Math.random() * (b - a) + a;

const imgs = {
    'earth': 'assets/planet_earth.png',
    'lava': 'assets/planet_lava.png',
    'moon': 'assets/planet_moon.png',
    'gas': 'assets/planet_gas.png',
    'ringed': 'assets/planet_ringed.png',
    'ice': 'assets/planet_ice.png',
    'sun': 'assets/planet_sun.png',
    'galaxy': 'assets/galaxy.png',
    'blackhole': 'assets/blackhole.png',
    'nebula_red': 'assets/nebula_red.png',
    'nebula_blue': 'assets/nebula_blue.png',
    'nebula_purple': 'assets/nebula_purple.png',
    'nebula_green': 'assets/nebula_green.png'
};
const dict = {};
let ok = false;
let c = 0;
let t = Object.keys(imgs).length;
for (let k in imgs) {
    let piyo = new Image();
    piyo.onload = () => {
        c++;
        if (c === t) { ok = true; resize(); }
    };
    piyo.src = imgs[k];
    dict[k] = piyo;
}
let tama = [];
let moya = null;

function initScene() {
    tama = [];
    let nani = [];
    
    if (ima === 'timer-view') {
        moya = dict['nebula_red'];
        nani = ['lava', 'blackhole', 'gas', 'sun'];
    } else if (ima === 'task-view') {
        moya = dict['nebula_blue'];
        nani = ['earth', 'moon', 'ringed', 'galaxy', 'ice'];
    } else if (ima === 'stats-view') {
        moya = dict['nebula_purple'];
        nani = ['galaxy', 'moon', 'blackhole', 'earth', 'sun'];
    } else if (ima === 'settings-view') {
        moya = dict['nebula_green'];
        nani = ['gas', 'ringed', 'moon', 'lava', 'ice'];
    }
    
    for (let t of nani) {
        let r = (Math.min(w, h) * R(0.05, 0.50)) / 2;
        let x, y, kaburi = true, kai = 0;
        
        while (kaburi && kai < 500) {
            x = R(r + 20, w - r - 20);
            y = R(r + 20, h - r - 20);
            kaburi = false;
            
            for (let e of tama) {
                if (Math.hypot(x - e.x, y - e.y) < r + e.r + 30) {
                    kaburi = true; break;
                }
            }
            kai++;
            if (kaburi && kai % 50 === 0) r *= 0.9;
        }
        
        if (!kaburi) tama.push({ t, i: dict[t], x, y, r });
    }
    render(); 
}

function render() {
    if (!ok) return;
    
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, w, h);
    
    if (moya) {
        const bgOff = document.createElement('canvas');
        bgOff.width = w * 0.2;
        bgOff.height = h * 0.2;
        const oCtx = bgOff.getContext('2d');
        oCtx.imageSmoothingEnabled = true;
        const sc = Math.max(bgOff.width / moya.width, bgOff.height / moya.height);
        const dw = moya.width * sc, dh = moya.height * sc;
        oCtx.drawImage(moya, (bgOff.width - dw) / 2, (bgOff.height - dh) / 2, dw, dh);
        
        ctx.globalCompositeOperation = 'screen'; 
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(bgOff, 0, 0, bgOff.width, bgOff.height, 0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
    }

    tama.sort((a, b) => a.r - b.r);
    for (let obj of tama) {
        const s = obj.r * 2 * 0.2;
        const off = document.createElement('canvas');
        off.width = off.height = s;
        const oCtx = off.getContext('2d');
        oCtx.imageSmoothingEnabled = false;
        oCtx.drawImage(obj.i, 0, 0, s, s);

        if (['galaxy', 'blackhole', 'ringed'].includes(obj.t)) {
            ctx.globalCompositeOperation = 'screen';
            ctx.drawImage(off, 0, 0, s, s, obj.x - obj.r, obj.y - obj.r, obj.r * 2, obj.r * 2);
            ctx.globalCompositeOperation = 'source-over';
        } else {
            ctx.save();
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.r * 0.86, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(off, 0, 0, s, s, obj.x - obj.r, obj.y - obj.r, obj.r * 2, obj.r * 2);
            ctx.restore();
        }
    }
}

window.setSpaceScene = function(id) {
    if (ima !== id) { ima = id; initScene(); }
};
