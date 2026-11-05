/* NEXUS — THE DIGITAL MIND · cinematic intro for SATHYA N
   Three.js r128 (global THREE) + GSAP 3 (global gsap).
   GO → BUFFERING → AUDIO + INTRO → PORTFOLIO
   Duration: ~14.4s
*/

(() => {
'use strict';

const $ = s => document.querySelector(s);

const intro = $('#intro');
const home = $('#home');

const goScreen = $('#goScreen');
const goButton = $('#goButton');
const loadingBar = $('#loadingFill');
const loadingText = $('#loadingText');
const loadingStatus = $('#loadingStatus');
const loadingPercent = $('#loadingPercent');

const mobile =
    matchMedia('(max-width:768px)').matches ||
    /Mobi|Android/i.test(navigator.userAgent);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const NAME = 'SATHYA N';
const TAG = 'BUILDING IDEAS INTO DIGITAL EXPERIENCES.';

const S = {
    core:0,
    part:0,
    grid:0,
    circ:0,
    world:0,
    conv:0,
    burst:0,
    trail:0,
    ring:0,
    glow:0,
    shock:0
};

const CAM = {
    x:0,
    y:.5,
    z:16,
    lz:-12
};

const ptr = {
    x:0,
    y:0,
    tx:0,
    ty:0
};

let tl;
let raf = 0;
let ended = false;
let started = false;
let three = null;

const introAudio = document.getElementById('introAudio');

let bufferAnimation = 0;


/* =====================================================
   GO BUTTON + AUDIO BUFFERING
===================================================== */

let visualProgress = 0;
let loadingInterval = null;

function updateLoadingProgress() {

    if (!introAudio || !loadingBar) return;

    let actualProgress = 0;

    try {

        if (
            introAudio.buffered.length > 0 &&
            introAudio.duration &&
            Number.isFinite(introAudio.duration)
        ) {

            const bufferedEnd =
                introAudio.buffered.end(
                    introAudio.buffered.length - 1
                );

            actualProgress = Math.min(
                100,
                (bufferedEnd / introAudio.duration) * 100
            );
        }

    } catch (error) {}

    // Smooth visual movement without claiming
    // the audio is fully buffered before it actually is.
    visualProgress = Math.min(
        95,
        Math.max(
            visualProgress,
            actualProgress,
            visualProgress + 1.6
        )
    );

    loadingBar.style.width = visualProgress + '%';

if (loadingPercent) {
    loadingPercent.textContent =
        Math.round(visualProgress) + '%';
}
}


function showLoading() {

    visualProgress = 0;

    if (goButton) {
        goButton.disabled = true;
        goButton.classList.add('loading');
    }

    if (goScreen) {
        goScreen.classList.add('is-loading');
    }

    if (loadingText) {
        loadingText.textContent = 'INITIALIZING DIGITAL EXPERIENCE...';
    }

    if (loadingBar) {
        loadingBar.style.width = '0%';
    }

    introAudio.addEventListener('progress', updateLoadingProgress);
    introAudio.addEventListener('loadeddata', updateLoadingProgress);
    introAudio.addEventListener('canplay', updateLoadingProgress);

    loadingInterval = setInterval(updateLoadingProgress, 50);

    introAudio.addEventListener('waiting', () => {
        if (loadingText && !started) {
            loadingText.textContent = 'BUFFERING AUDIO...';
        }
    });
}

function hideLoadingScreen() {

    if (loadingInterval) {
        clearInterval(loadingInterval);
        loadingInterval = null;
    }

    if (loadingBar) {
        loadingBar.style.width = '100%';
    }

    if (loadingText) {
        loadingText.textContent = 'SYSTEM READY';
    }

    if (goScreen) {
        goScreen.classList.add('is-hidden');
    }

    setTimeout(() => {
        if (goScreen) {
            goScreen.style.display = 'none';
        }
    }, 700);
}


/*
   IMPORTANT:
   audio.play() is called immediately inside the GO click.
   This uses the user's click as the browser's audio permission.
*/

async function startExperience() {

    if (started || ended) return;

    if (!introAudio) {
        console.error('Audio element #introAudio not found.');
        if (loadingText) {
            loadingText.textContent = 'AUDIO FILE NOT FOUND';
        }
        return;
    }

    started = true;

    showLoading();

    introAudio.pause();
    introAudio.muted = false;
    introAudio.volume = 1;
    introAudio.currentTime = 0;

    let playPromise;

    try {

        // Start audio directly from the GO button click.
        playPromise = introAudio.play();

    } catch (error) {

        console.error('Audio playback error:', error);

        started = false;

        if (loadingText) {
            loadingText.textContent = 'AUDIO COULD NOT START';
        }

        if (goButton) {
            goButton.disabled = false;
        }

        return;
    }

    try {

        // Wait until the browser confirms audio playback has started.
        await playPromise;

        if (ended) return;

        hideLoadingScreen();

        // Start the visual intro immediately after audio starts.
        launchIntro();

    } catch (error) {

        console.error('Audio playback blocked:', error);

        started = false;

        if (loadingText) {
            loadingText.textContent = 'AUDIO ERROR — CHECK introaudio.mp3';
        }

        if (goButton) {
            goButton.disabled = false;
            goButton.classList.remove('loading');
        }

        if (goScreen) {
            goScreen.classList.remove('is-loading');
        }
    }
}


/* GO button click */
if (goButton) {
    goButton.addEventListener('click', startExperience);
} else {
    console.error('GO button #goButton not found in intro.html');
}


/* =====================================================
   DOM TEXT PREPARATION
===================================================== */

$('#name').innerHTML = [...NAME]
    .map(c => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`)
    .join('');

$('#sheen').textContent = NAME;

$('#tag').innerHTML = TAG
    .split(' ')
    .map(w => `<span class="tw">${w}</span>`)
    .join(' ');

const letters = gsap.utils.toArray('.ch');
const words = gsap.utils.toArray('.tw');


/* =====================================================
   THREE.JS WORLD
===================================================== */

function init3D() {

    const renderer = new THREE.WebGLRenderer({
        antialias:false,
        alpha:true,
        powerPreference:'high-performance'
    });

    let pr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2);

    renderer.setPixelRatio(pr);
    renderer.setSize(innerWidth, innerHeight);

    $('#stage').appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const cam = new THREE.PerspectiveCamera(
        60,
        innerWidth / innerHeight,
        .1,
        220
    );

    const ADD = THREE.AdditiveBlending;
    const uTime = {value:0};

    const col = {
        cy:0x00e5ff,
        bl:0x2f6bff,
        vi:0x8a4dff
    };

    const rnd = (a, b) => a + Math.random() * (b - a);

    const cv = (w, h, f) => {

        const c = document.createElement('canvas');

        c.width = w;
        c.height = h;

        f(c.getContext('2d'), w, h);

        return new THREE.CanvasTexture(c);
    };


    /* Core glow texture */

    const glowTex = cv(128, 128, g => {

        const r = g.createRadialGradient(
            64,64,0,
            64,64,64
        );

        r.addColorStop(0,'rgba(255,255,255,1)');
        r.addColorStop(.2,'rgba(0,229,255,.6)');
        r.addColorStop(1,'rgba(0,229,255,0)');

        g.fillStyle = r;
        g.fillRect(0,0,128,128);
    });


    const sprMat = (o = {}) => new THREE.SpriteMaterial(
        Object.assign({
            map:glowTex,
            blending:ADD,
            transparent:true,
            depthWrite:false
        }, o)
    );


    /* Core light + volumetric halo */

    const core = new THREE.Sprite(sprMat());

    scene.add(core);

    const halo = new THREE.Sprite(
        sprMat({
            color:col.bl,
            opacity:0
        })
    );

    halo.scale.setScalar(26);

    scene.add(halo);


    /* Perspective grid */

    const gridMat = new THREE.ShaderMaterial({

        transparent:true,
        depthWrite:false,
        blending:ADD,

        uniforms:{
            uTime,
            uA:{value:0},
            uF:{value:0}
        },

        vertexShader:`
            varying vec3 vW;

            void main(){

                vec4 w = modelMatrix * vec4(position,1.);

                vW = w.xyz;

                gl_Position =
                    projectionMatrix *
                    viewMatrix *
                    w;
            }
        `,

        fragmentShader:`
            varying vec3 vW;

            uniform float uTime;
            uniform float uA;
            uniform float uF;

            void main(){

                vec2 p = vW.xz;

                vec2 g =
                    abs(fract(p*.5-.5)-.5)/.022;

                float l =
                    1.-min(min(g.x,g.y),1.);

                float d =
                    length(p-vec2(0.,-8.));

                float w =
                    pow(.5+.5*sin(d*.55-uTime*2.6),8.);

                vec3 c =
                    mix(
                        vec3(0.,.9,1.),
                        vec3(.54,.3,1.),
                        smoothstep(5.,60.,d)
                    );

                float f =
                    smoothstep(
                        75.,
                        4.,
                        distance(vW,cameraPosition)
                    );

                gl_FragColor =
                    vec4(
                        c*(1.+uF),
                        l*(.22+w*1.5)*f*uA
                    );
            }
        `
    });


    const grid = new THREE.Mesh(
        new THREE.PlaneGeometry(170,170),
        gridMat
    );

    grid.rotation.x = -Math.PI / 2;
    grid.position.set(0,-2.6,-50);

    scene.add(grid);


    /* Animated circuit-board pathways */

    const cp = [];
    const cd = [];
    const cs = [];

    for (let i = 0; i < (mobile ? 14 : 32); i++) {

        let x = rnd(-26,26);
        let z = rnd(-55,12);
        let d = 0;

        let a = Math.floor(Math.random()*4) * Math.PI/2;

        const s = Math.random();

        for (let k = 0; k < 8; k++) {

            const L = rnd(2,7);

            const nx = x + Math.cos(a)*L;
            const nz = z + Math.sin(a)*L;

            cp.push(
                x,-2.57,z,
                nx,-2.57,nz
            );

            cd.push(d,d+L);
            cs.push(s,s);

            d += L;

            x = nx;
            z = nz;

            a += (
                Math.random() < .5 ? 1 : -1
            ) * (
                Math.random() < .7
                    ? Math.PI/2
                    : Math.PI/4
            );
        }
    }


    const cg = new THREE.BufferGeometry();

    cg.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(cp,3)
    );

    cg.setAttribute(
        'aD',
        new THREE.Float32BufferAttribute(cd,1)
    );

    cg.setAttribute(
        'aS',
        new THREE.Float32BufferAttribute(cs,1)
    );


    const circMat = new THREE.ShaderMaterial({

        transparent:true,
        depthWrite:false,
        blending:ADD,

        uniforms:{
            uTime,
            uA:{value:0}
        },

        vertexShader:`
            attribute float aD,aS;

            varying float vD,vS;

            void main(){

                vD = aD;
                vS = aS;

                gl_Position =
                    projectionMatrix *
                    modelViewMatrix *
                    vec4(position,1.);
            }
        `,

        fragmentShader:`
            varying float vD,vS;

            uniform float uTime;
            uniform float uA;

            void main(){

                float p =
                    pow(
                        fract(vD*.05-uTime*.32+vS),
                        8.
                    );

                vec3 c =
                    mix(
                        vec3(0.,.9,1.),
                        vec3(1.,.24,.65),
                        step(.88,vS)
                    );

                gl_FragColor =
                    vec4(c,(.12+p*1.3)*uA);
            }
        `
    });

    scene.add(new THREE.LineSegments(cg,circMat));


    /* Particles */

    const N = mobile ? 900 : 2600;

    const P = new Float32Array(N*3);
    const A = new Float32Array(N*4);

    for (let i = 0; i < N; i++) {

        P.set([
            rnd(-17,17),
            rnd(-8,8),
            rnd(-26,14)
        ],i*3);

        A.set([
            Math.random(),
            rnd(1,4),
            Math.random(),
            rnd(.4,1.6)
        ],i*4);
    }


    const pg = new THREE.BufferGeometry();

    pg.setAttribute(
        'position',
        new THREE.BufferAttribute(P,3)
    );

    pg.setAttribute(
        'aA',
        new THREE.BufferAttribute(A,4)
    );


    const pMat = new THREE.ShaderMaterial({

        transparent:true,
        depthWrite:false,
        blending:ADD,

        uniforms:{
            uTime,
            uPx:{value:pr},
            uA:{value:0},
            uC:{value:0},
            uB:{value:0}
        },

        vertexShader:`
            attribute vec4 aA;

            uniform float uTime,uPx,uC,uB;

            varying vec3 vC;
            varying float vB;

            void main(){

                vec3 p = position;

                float t = uTime*aA.w;

                p.y += sin(t*.5+aA.x*6.28)*.45;
                p.x += cos(t*.4+aA.x*6.28)*.35;

                float an =
                    uTime*1.6*aA.w+aA.x*6.28;

                vec3 tg =
                    vec3(cos(an),sin(an),0.)*.28*aA.y;

                p = mix(
                    p,
                    tg,
                    smoothstep(0.,1.,uC)
                );

                p +=
                    normalize(
                        vec3(
                            sin(aA.x*40.),
                            cos(aA.x*23.),
                            sin(aA.x*17.)
                        )
                    ) * uB*(5.+aA.y*9.);

                vec4 mv =
                    modelViewMatrix*vec4(p,1.);

                gl_Position =
                    projectionMatrix*mv;

                gl_PointSize =
                    clamp(
                        aA.y*uPx*30./-mv.z*(1.+uB),
                        1.,
                        40.
                    );

                vC =
                    mix(
                        vec3(0.,.9,1.),
                        mix(
                            vec3(.18,.42,1.),
                            vec3(.54,.3,1.),
                            step(.8,aA.z)
                        ),
                        step(.45,aA.z)
                    );

                vB = uB;
            }
        `,

        fragmentShader:`
            uniform float uA;

            varying vec3 vC;
            varying float vB;

            void main(){

                float d =
                    length(gl_PointCoord-.5);

                gl_FragColor =
                    vec4(
                        vC*(1.+vB*1.6),
                        smoothstep(.5,0.,d)*uA
                    );
            }
        `
    });

    scene.add(new THREE.Points(pg,pMat));


    /* Neon energy trails */

    const T = mobile ? 40 : 90;

    const tp = [];
    const te = [];
    const td = [];

    for (let i = 0; i < T; i++) {

        const v = new THREE.Vector3(
            rnd(-1,1),
            rnd(-.6,.6),
            rnd(-1,1)
        )
        .normalize()
        .multiplyScalar(rnd(12,24));

        const dl = Math.random()*.45;

        tp.push(
            v.x,v.y,v.z,
            v.x,v.y,v.z
        );

        te.push(0,1);
        td.push(dl,dl);
    }


    const tg = new THREE.BufferGeometry();

    tg.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(tp,3)
    );

    tg.setAttribute(
        'aE',
        new THREE.Float32BufferAttribute(te,1)
    );

    tg.setAttribute(
        'aD',
        new THREE.Float32BufferAttribute(td,1)
    );


    const trailMat = new THREE.ShaderMaterial({

        transparent:true,
        depthWrite:false,
        blending:ADD,

        uniforms:{
            uP:{value:0}
        },

        vertexShader:`
            attribute float aE,aD;

            uniform float uP;

            varying float vA;

            void main(){

                float h =
                    clamp(uP*1.5-aD,0.,1.);

                vec3 hd =
                    mix(position,vec3(0.),h);

                vec3 tl =
                    mix(
                        position,
                        vec3(0.),
                        max(h-.3,0.)
                    );

                vA =
                    aE *
                    step(.001,h) *
                    (1.-smoothstep(.85,1.,h));

                gl_Position =
                    projectionMatrix *
                    modelViewMatrix *
                    vec4(mix(tl,hd,aE),1.);
            }
        `,

        fragmentShader:`
            varying float vA;

            void main(){

                gl_FragColor =
                    vec4(.3,.95,1.,vA);
            }
        `
    });


    const trails = new THREE.LineSegments(tg,trailMat);

    trails.frustumCulled = false;

    scene.add(trails);


    /* Holographic panels, code glyphs and wireframes */

    const world = new THREE.Group();

    scene.add(world);

    const fades = [];

    const reg = (mesh,o) => {

        mesh.material.userData.o = o;
        mesh.material.opacity = 0;

        fades.push(mesh.material);

        return mesh;
    };


    const pTex = [0,1,2].map(() =>
        cv(512,320,(g,w,h) => {

            g.fillStyle = 'rgba(6,20,48,.6)';
            g.fillRect(0,0,w,h);

            g.strokeStyle = 'rgba(0,229,255,.9)';
            g.lineWidth = 3;

            g.strokeRect(2,2,w-4,h-4);

            g.fillStyle = 'rgba(0,229,255,.28)';
            g.fillRect(0,0,w,34);

            g.fillStyle = '#00e5ff';

            for (let i = 0; i < 3; i++) {
                g.fillRect(14+i*20,12,10,10);
            }

            for (let i = 0; i < 9; i++) {

                g.globalAlpha = .85;

                g.fillStyle = [
                    '#00e5ff',
                    '#8a4dff',
                    '#cfefff',
                    '#2f6bff'
                ][Math.floor(Math.random()*4)];

                g.fillRect(
                    24+Math.floor(Math.random()*3)*26,
                    58+i*28,
                    rnd(50,300),
                    8
                );
            }
        })
    );


    const panels = [];

    for (let i = 0; i < (mobile ? 5 : 8); i++) {

        const side = i % 2 ? 1 : -1;

        const m = reg(
            new THREE.Mesh(
                new THREE.PlaneGeometry(3.2,2),
                new THREE.MeshBasicMaterial({
                    map:pTex[i%3],
                    transparent:true,
                    blending:ADD,
                    depthWrite:false,
                    side:THREE.DoubleSide
                })
            ),
            .8
        );

        m.position.set(
            side*rnd(3.4,7.5),
            rnd(-1,3),
            2-i*3.4
        );

        m.userData = {
            by:m.position.y,
            ry:-side*.55,
            ph:rnd(0,6)
        };

        world.add(m);
        panels.push(m);
    }


    const words2 = [
        '{ }','</>','01101','=>','AI',
        'fn()','git','API','λ','0xFF',
        'class','async','#!/','SQL','npm'
    ];

    const glyphs = [];

    for (let i = 0; i < (mobile ? 10 : 18); i++) {

        const tex = cv(256,96,(g,w,h) => {

            g.font = 'bold 52px monospace';
            g.textAlign = 'center';
            g.textBaseline = 'middle';

            g.shadowColor = '#00e5ff';
            g.shadowBlur = 16;

            g.fillStyle = i%4 ? '#7ff3ff' : '#b99bff';

            g.fillText(
                words2[i%words2.length],
                w/2,
                h/2
            );
        });

        const s = reg(
            new THREE.Sprite(sprMat({map:tex})),
            .85
        );

        s.scale.set(2.2,.82,1);

        let x = rnd(-10,10);

        if (Math.abs(x) < 2.2) {
            x += Math.sign(x||1)*3;
        }

        s.position.set(
            x,
            rnd(-1.6,4.6),
            rnd(-28,3)
        );

        s.userData = {
            by:s.position.y,
            ph:rnd(0,6)
        };

        world.add(s);
        glyphs.push(s);
    }


    const wires = [
        [
            new THREE.IcosahedronGeometry(1.3,1),
            -6,1.5,-8,col.cy
        ],
        [
            new THREE.OctahedronGeometry(1.2,0),
            7,-.2,-14,col.vi
        ],
        [
            new THREE.TorusKnotGeometry(.9,.25,64,8),
            -8.5,.8,-22,col.bl
        ]
    ].map(([g,x,y,z,c]) => {

        const m = reg(
            new THREE.Mesh(
                g,
                new THREE.MeshBasicMaterial({
                    color:c,
                    wireframe:true,
                    transparent:true,
                    blending:ADD,
                    depthWrite:false
                })
            ),
            .55
        );

        m.position.set(x,y,z);

        world.add(m);

        return m;
    });


    /* Final holographic circular interface */

    const hud = cv(1024,1024,g => {

        g.translate(512,512);

        g.strokeStyle = '#00e5ff';

        for (let i = 0; i < 180; i++) {

            const a = i/180*Math.PI*2;
            const L = i%10 ? 12 : 28;

            g.lineWidth = i%10 ? 1.5 : 3;

            g.beginPath();

            g.moveTo(
                Math.cos(a)*470,
                Math.sin(a)*470
            );

            g.lineTo(
                Math.cos(a)*(470-L),
                Math.sin(a)*(470-L)
            );

            g.stroke();
        }

        g.lineWidth = 2;
        g.beginPath();
        g.arc(0,0,496,0,6.283);
        g.stroke();

        g.strokeStyle = '#8a4dff';
        g.lineWidth = 9;

        [[0,1.1],[2.2,3.1],[4,5]].forEach(([a,b]) => {

            g.beginPath();
            g.arc(0,0,405,a,b);
            g.stroke();
        });

        g.strokeStyle = '#2f6bff';
        g.lineWidth = 3;

        g.beginPath();
        g.arc(0,0,360,.3,2.5);
        g.stroke();

        g.beginPath();
        g.arc(0,0,360,3.5,5.7);
        g.stroke();
    });


    const ringG = new THREE.Group();

    scene.add(ringG);

    const ringMats = [];

    const hudA = new THREE.Mesh(
        new THREE.PlaneGeometry(9,9),
        new THREE.MeshBasicMaterial({
            map:hud,
            transparent:true,
            blending:ADD,
            depthWrite:false,
            opacity:0
        })
    );

    const hudB = new THREE.Mesh(
        new THREE.PlaneGeometry(6.4,6.4),
        hudA.material.clone()
    );

    hudA.position.z = hudB.position.z = -1.5;

    ringG.add(hudA,hudB);

    ringMats.push(hudA.material,hudB.material);


    [
        [1.9,.012,col.cy,.5],
        [2.4,.007,col.vi,-.35],
        [3,.01,col.bl,.9]
    ].forEach(([r,t,c,tilt],i) => {

        const m = new THREE.Mesh(
            new THREE.TorusGeometry(r,t,8,128),
            new THREE.MeshBasicMaterial({
                color:c,
                transparent:true,
                blending:ADD,
                depthWrite:false,
                opacity:0
            })
        );

        m.rotation.x = tilt;

        m.userData.sp =
            (i+1)*.25*(i%2 ? -1 : 1);

        ringG.add(m);

        ringMats.push(m.material);
    });


    const shock = new THREE.Mesh(
        new THREE.TorusGeometry(1,.02,8,96),
        new THREE.MeshBasicMaterial({
            color:0x9ff4ff,
            transparent:true,
            blending:ADD,
            depthWrite:false,
            opacity:0
        })
    );

    scene.add(shock);


    /* Three.js animation update */

    const spin = (o,dt) => {

        o.rotation.y += dt*.3;
        o.rotation.x += dt*.2;
    };


    function update(t,dt) {

        uTime.value = t;

        ptr.x += (ptr.tx-ptr.x)*.04;
        ptr.y += (ptr.ty-ptr.y)*.04;

        cam.position.set(
            CAM.x+ptr.x*.7,
            CAM.y+ptr.y*.35,
            CAM.z
        );

        cam.lookAt(0,0,CAM.lz);

        gridMat.uniforms.uA.value = S.grid;
        gridMat.uniforms.uF.value = S.burst*2;

        circMat.uniforms.uA.value = S.circ;

        pMat.uniforms.uA.value = S.part;
        pMat.uniforms.uC.value = S.conv;
        pMat.uniforms.uB.value = S.burst;

        trailMat.uniforms.uP.value = S.trail;

        core.material.opacity = Math.min(1,S.core);

        core.scale.setScalar(
            .45*S.core+S.burst*7+S.conv*1.2
        );

        halo.material.opacity =
            S.glow*.45+S.burst*.5;

        fades.forEach(m => {
            m.opacity = m.userData.o*S.world;
        });

        panels.forEach(m => {

            const u = m.userData;

            m.rotation.y =
                u.ry+Math.sin(t*.5+u.ph)*.3;

            m.position.y =
                u.by+Math.sin(t*.7+u.ph)*.25;
        });

        glyphs.forEach(s => {

            s.position.y =
                s.userData.by+
                Math.sin(t*.8+s.userData.ph)*.3;
        });

        wires.forEach(w => spin(w,dt));

        ringG.visible = S.ring > .001;

        ringG.scale.setScalar(.6+.4*S.ring);

        ringMats.forEach((m,i) => {

            m.opacity =
                S.ring*(i<2 ? .75 : .85);
        });

        hudA.rotation.z += dt*.12;
        hudB.rotation.z -= dt*.2;

        ringG.children.forEach(c => {

            if (c.userData.sp) {
                c.rotation.z += c.userData.sp*dt;
            }
        });

        shock.visible =
            S.shock>0 && S.shock<1;

        shock.scale.setScalar(.2+S.shock*18);

        shock.material.opacity =
            (1-S.shock)*.8;

        renderer.render(scene,cam);
    }


    function resize() {

        cam.aspect = innerWidth/innerHeight;

        cam.updateProjectionMatrix();

        renderer.setSize(innerWidth,innerHeight);
    }


    function lowQuality() {

        pr = 1;

        renderer.setPixelRatio(1);

        pMat.uniforms.uPx.value = 1;

        renderer.setSize(innerWidth,innerHeight);
    }


    function dispose() {

        scene.traverse(o => {

            if (o.geometry) {
                o.geometry.dispose();
            }

            const m = o.material;

            (
                Array.isArray(m)
                    ? m
                    : m ? [m] : []
            ).forEach(x => {

                if (x.map) {
                    x.map.dispose();
                }

                x.dispose();
            });
        });

        glowTex.dispose();
        hud.dispose();

        pTex.forEach(t => t.dispose());

        renderer.dispose();
        renderer.forceContextLoss();

        renderer.domElement.remove();
    }


    return {
        update,
        resize,
        lowQuality,
        dispose
    };
}


/* =====================================================
   HUD HELPERS
===================================================== */

const phaseEl = $('#phase');
const pctEl = $('#pct');
const coordEl = $('#coord');
const barEl = $('#bar i');

const setPhase = t => {
    phaseEl.textContent = t;
};


function hudTick() {

    const p = tl.progress();

    pctEl.textContent =
        String(Math.round(p*100)).padStart(3,'0');

    barEl.style.transform = `scaleX(${p})`;

    coordEl.textContent =
        `X ${(CAM.x+ptr.x).toFixed(3)} · Z ${CAM.z.toFixed(3)}`;
}


/* =====================================================
   CINEMATIC TIMELINE
===================================================== */

function buildTimeline(has3D) {

    tl = gsap.timeline({
        onUpdate:hudTick,
        onComplete:finish
    });

    const gap = mobile ? '.18em' : '.38em';

    tl.to('#hud',{
        opacity:1,
        duration:1
    },.2)
    .to('#skip',{
        opacity:1,
        duration:.8
    },1);


    /* SCENE 1 — DIGITAL AWAKENING */

    tl.to(S,{
        core:1,
        duration:1.3,
        ease:'power2.out'
    },.3)

    .to(S,{
        part:1,
        duration:2.6,
        ease:'sine.inOut'
    },.8)

    .to(S,{
        grid:1,
        duration:2.4
    },1)

    .to(S,{
        glow:.7,
        duration:3
    },.5)

    .to(CAM,{
        z:4,
        duration:6.4,
        ease:'power1.inOut'
    },0)

    .to(CAM,{
        lz:0,
        duration:6,
        ease:'power1.inOut'
    },0)

    .call(setPhase,[
        '01 // DIGITAL AWAKENING'
    ],.3)

    .fromTo('#scan',{
        y:0,
        opacity:1
    },{
        y:innerHeight+200,
        duration:2.2,
        ease:'power1.inOut'
    },1.1)

    .set('#scan',{
        opacity:0
    },3.3);


    /* SCENE 2 — THE DIGITAL UNIVERSE */

    tl.call(setPhase,[
        '02 // THE DIGITAL UNIVERSE'
    ],3)

    .to(S,{
        world:1,
        duration:2,
        ease:'power2.out'
    },3)

    .to(S,{
        circ:1,
        duration:2
    },2.6)

    .fromTo('#scan',{
        y:0,
        opacity:1
    },{
        y:innerHeight+200,
        duration:2,
        ease:'power1.inOut'
    },4)

    .set('#scan',{
        opacity:0
    },6);


    /* SCENE 3 — CONVERGENCE */

    tl.call(setPhase,[
        '03 // CONVERGENCE'
    ],6)

    .to(S,{
        trail:1,
        duration:1.7,
        ease:'power2.in'
    },6)

    .to(S,{
        conv:1,
        duration:1.7,
        ease:'power3.in'
    },6)

    .to(S,{
        world:0,
        duration:1.4,
        ease:'power2.in'
    },6.2)

    .to('#rays',{
        opacity:.55,
        duration:2
    },7)

    .to(S,{
        burst:1,
        duration:.25,
        ease:'power2.out'
    },7.7)

    .to(S,{
        burst:0,
        duration:1.7,
        ease:'power2.in'
    },7.95)

    .to(S,{
        conv:0,
        duration:2.2,
        ease:'power2.out'
    },7.95)

    .set(S,{
        trail:0
    },7.8)

    .fromTo(S,{
        shock:0
    },{
        shock:1,
        duration:1.8,
        ease:'power2.out'
    },7.75)

    .fromTo('#flash',{
        opacity:0
    },{
        opacity:.85,
        duration:.12
    },7.7)

    .to('#flash',{
        opacity:0,
        duration:.9
    },7.82)

    .call(setPhase,[
        '04 // IDENTITY'
    ],7.8)

    .fromTo(letters,{
        opacity:0,
        yPercent:60,
        rotateX:-80,
        z:-420,
        filter:'blur(16px)'
    },{
        opacity:1,
        yPercent:0,
        rotateX:0,
        z:0,
        filter:'blur(0px)',
        duration:1.3,
        stagger:.07,
        ease:'expo.out'
    },7.8)

    .to(['#rule1','#rule2'],{
        scaleX:1,
        duration:1,
        ease:'power3.out'
    },8.6)

    .fromTo('#sub',{
        opacity:0,
        clipPath:'inset(0 50% 0 50%)',
        letterSpacing:'.9em'
    },{
        opacity:1,
        clipPath:'inset(0 0% 0 0%)',
        letterSpacing:gap,
        duration:1.4,
        ease:'power3.out'
    },8.8)

    .fromTo('#sheen',{
        backgroundPosition:'180% 0'
    },{
        backgroundPosition:'-80% 0',
        duration:1.6,
        ease:'power2.inOut'
    },9.2)

    .call(() => {
        $('#name').classList.add('live');
    },null,9.4);


    /* SCENE 4 — FINAL REVEAL */

    tl.call(setPhase,[
        '05 // READY'
    ],10)

    .to(S,{
        ring:1,
        duration:1.8,
        ease:'power3.out'
    },10)

    .fromTo(words,{
        opacity:0,
        y:14,
        filter:'blur(6px)'
    },{
        opacity:1,
        y:0,
        filter:'blur(0px)',
        duration:.9,
        stagger:.12,
        ease:'power2.out'
    },10.4)

    .fromTo(S,{
        shock:0
    },{
        shock:1,
        duration:1.8,
        ease:'power2.out'
    },11.3)

    .fromTo('#sheen',{
        backgroundPosition:'180% 0'
    },{
        backgroundPosition:'-80% 0',
        duration:1.6,
        ease:'power2.inOut'
    },11.6)

    .to(CAM,{
        z:10,
        duration:4,
        ease:'power2.inOut'
    },10);


    /* Seamless hand-off to portfolio */

    tl.to(intro,{
        opacity:0,
        duration:1.5,
        ease:'power2.inOut'
    },12.9)

    .fromTo(home,{
        scale:1.06,
        filter:'blur(10px)'
    },{
        scale:1,
        filter:'blur(0px)',
        duration:2,
        ease:'power3.out'
    },12.9);
}


/* =====================================================
   REDUCED MOTION / NO WEBGL FALLBACK
===================================================== */

function buildSimple() {

    tl = gsap.timeline({
        onComplete:finish
    });

    tl.set(letters,{
        opacity:1
    })

    .set(words,{
        opacity:1
    })

    .set('#sub',{
        opacity:1
    })

    .set(['#rule1','#rule2'],{
        scaleX:1
    })

    .to('#skip',{
        opacity:1,
        duration:.5
    })

    .from('#titleWrap',{
        opacity:0,
        duration:1.2
    },0)

    .to(intro,{
        opacity:0,
        duration:1,
        delay:1.8
    })

    .fromTo(home,{
        scale:1.06,
        filter:'blur(10px)'
    },{
        scale:1,
        filter:'blur(0px)',
        duration:1.2
    },'<');
}


/* =====================================================
   LIFECYCLE
===================================================== */

function loop(now) {

    raf = requestAnimationFrame(loop);

    const dt = Math.min(
        (now-loop.last)/1000,
        .1
    );

    loop.last = now;

    loop.slow =
        dt>.034
            ? loop.slow+1
            : Math.max(0,loop.slow-1);

    // Adaptive quality for slower devices.
    if (loop.slow>60) {

        three.lowQuality();

        loop.slow = -1e6;
    }

    document.getElementById('titleWrap').style.transform =
        `rotateY(${ptr.x*5}deg) rotateX(${-ptr.y*4}deg)`;

    three.update(
        (now-loop.t0)/1000,
        dt
    );
}


const onMove = e => {

    ptr.tx =
        (e.clientX/innerWidth-.5)*2;

    ptr.ty =
        -(e.clientY/innerHeight-.5)*2;
};


const onResize = () => {

    if (three) {
        three.resize();
    }
};


/* =====================================================
   FINISH — OPEN ORIGINAL PORTFOLIO
===================================================== */

function finish() {

    if (ended) return;

    ended = true;

    cancelAnimationFrame(raf);

    removeEventListener('pointermove',onMove);
    removeEventListener('resize',onResize);

    tl && tl.kill();

    if (three) {
        three.dispose();
    }

    three = null;

    // Stop intro audio before navigation.
    if (introAudio) {
        introAudio.pause();
    }

    // Remember that intro has played in this tab session.
    sessionStorage.setItem(
        'nexusIntroSeen',
        'true'
    );

    // Open your existing portfolio.
    window.location.href = './index.html';
}


/* =====================================================
   SKIP INTRO
===================================================== */

function skip() {

    // Do not allow skip before pressing GO.
    if (!started || ended) return;

    $('#skip').disabled = true;

    tl && tl.kill();

    gsap.to(intro,{
        opacity:0,
        duration:.5,
        ease:'power2.out',
        onComplete:finish
    });
}


$('#skip').addEventListener('click',skip);


addEventListener('keydown',e => {

    if (e.key === 'Escape') {
        skip();
    }
});


/* =====================================================
   START INTRO AFTER AUDIO BEGINS
===================================================== */

function launchIntro() {

    if (ended) return;

    try {

        if (reduced) {
            throw new Error('Reduced motion enabled');
        }

        three = init3D();

        addEventListener(
            'pointermove',
            onMove,
            {passive:true}
        );

        addEventListener(
            'resize',
            onResize
        );

        buildTimeline(true);

        loop.t0 = loop.last = performance.now();

        loop.slow = 0;

        raf = requestAnimationFrame(loop);

    } catch (error) {

        console.warn(
            'Using simple intro fallback:',
            error
        );

        three = null;

        buildSimple();
    }
}

})();