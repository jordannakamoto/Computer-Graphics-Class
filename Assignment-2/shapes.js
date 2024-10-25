// Jordan Project 2
// TODO: Figure out how to get the tetras to initialize their rotations in different directions
//  - I thought selfRot was doing this but I don't know why it isn't

// Features:
// Some procedural jitter for the tetra array

const ms = new MatrixStack()

// rotation counters for spheres
let gl
let r1 = 0, r2 = 0, r3 = 0

// procedural tetras ------------------------------------- //
//   - set some jitter every time interval
//   - randomization controls: clamp and lerp + some validation
const numTetras = 15, jMag = 0.01, jSpeed = .01;
let tetras = [], rTetra = 0

let lastJitterTime = performance.now();
const jitterInterval = 500;

const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
const lerp = (s, e, t) => s + t * (e - s);
const isValidVector = v => v.some(n => n !== 0 && !isNaN(n));
// ------------------------------------------------------- //

// ============================================================ //
// [INIT] webgl canvas, depth buffer, shapes. tth is a template //
// ============================================================ //
function init() {
    let canvas = document.getElementById("webgl-canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) alert("Your Web browser doesn't support WebGL 2\nPlease contact Dave");
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 1);
    
    sphere = new Sphere(gl, 6, 6);
    sphere2 = new Sphere(gl, 12, 12);
    sphere3 = new Sphere(gl, 15, 15);
    ax = new Axes(gl);
    tth = new Tetrahedron(gl);
    // ----------------------------------- //

    // Disperse the Tetras
    for (let i = 0; i < numTetras; i++) {
        let scale = Math.random() * 0.10 + 0.01,
        // This should be for tetras spinning on their own axis, but I didn't do it right
        rotAx = [Math.random(), Math.random(), Math.random()],
        selfRot = [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
        // randomize the color in a blue-purple range
        color = vec4(
            clamp(Math.random() * 0.3 + 0.1, 0.1, 0.2),
            clamp(Math.random() * 0.1 + 0.05, 0.05, 0.15),
            clamp(Math.random() * 0.5 + 0.1, 0.1, 0.6),
            1.0
        ),
        // These values are for translating the tetra around the spheres in an orbital manner
        theta = Math.random() * 2 * Math.PI,
        phi = Math.random() * Math.PI,
        orbitR = Math.random() * 0.4 + 0.3;

        tetras.push({
            scale, rotAx, selfRot, color, theta, phi, orbitR,
            orbitS: Math.random() * 0.2 + 0.05,
            jitter: [0, 0, 0], targetJ: [0, 0, 0],
            jitterRot: [0, 0, 0], targetJR: [0, 0, 0]
        });
    }

    render();
}
// ============================================================ //
// [RENDER]
// ============================================================ //
function render() {
    // time interval for new jitter generation
    const currentTime = performance.now();
    const elapsedTime = currentTime - lastJitterTime;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // SPHERES

    // For the 3 spheres, the matrix stack operation/order is the same
    function sphereStackEffect(sphere, trans, scale, rot, color) {
        ms.push(); 
        ms.translate(...trans); 
        ms.scale(scale); 
        ms.rotate(rot, [Math.sin(rot / 50), Math.cos(rot / 50), 1]);
        sphere.MV = ms.current(); 
        sphere.color = color; 
        sphere.draw(); 
        ms.pop();
    }
    sphereStackEffect(sphere, [.25, 0, 0], .35, r1, vec4(0.1, 0, 0.3, 1));
    r1 += 0.3;
    sphereStackEffect(sphere2, [.25, 0, 0], .15, r2, vec4(0, 0, 1, 1));
    r2 += 0.5;
    sphereStackEffect(sphere3, [.25, 0, 0], .55, r3, vec4(0.1, 0.1, 0.1, 1));
    r3 += 0.1;

    // AXES, shares rotation with sphere 2
    ms.push(); 
    ms.translate(.25, 0, 0); 
    ms.scale(.72); 
    ms.rotate(r2, [.11, .85, 0]); 
    ax.MV = ms.current(); 
    ax.draw(); 
    ms.pop();

    // apply the jitter (translate and rotate) along with the main orbit rotation
    tetras.forEach(t => {
        let theta = t.theta + t.orbitS * rTetra;
        let phi = t.phi;
        let ox = t.orbitR * Math.sin(phi) * Math.cos(theta);
        let oy = t.orbitR * Math.cos(phi);
        let oz = t.orbitR * Math.sin(phi) * Math.sin(theta);

        // listen to time interval and
        // apply translate jitter 

        if (elapsedTime > jitterInterval) {
            t.targetJ = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5].map(x => clamp(x * jMag, -jMag, jMag));
            t.targetJR = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5].map(x => clamp(x * jMag, -jMag, jMag));
            lastJitterTime = currentTime;
        }

        t.jitter = t.jitter.map((j, i) => lerp(j, t.targetJ[i], jSpeed));

        ms.push();
        ms.translate(ox + t.jitter[0], oy + t.jitter[1], oz + t.jitter[2]);

        // apply scale and self rotation  -------------------------------------------------- //

        ms.scale(t.scale);

        ms.rotate(t.selfRot[0], [1, 0, 0]);
        ms.rotate(t.selfRot[1], [0, 1, 0]);
        ms.rotate(t.selfRot[2], [0, 0, 1]);
        
        // now apply rotation jitter ------------------------------------------------------- //

        t.jitterRot = t.jitterRot.map((jr, i) => lerp(jr, t.targetJR[i], jSpeed));

        if (isValidVector(t.rotAx)) ms.rotate(t.theta + rTetra, t.rotAx);
        if (isValidVector(t.jitterRot)) ms.rotate(rTetra, t.jitterRot);

        tth.MV = ms.current();
        tth.color = t.color;
        tth.draw();
        ms.pop();
    });

    rTetra += 0.01;
    requestAnimationFrame(render);
}

window.onload = init;