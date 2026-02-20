//TODO
// - reorganize file
//
const phi = 1.61803398875;

//dumb funcs
function s(x){
    return 1/(1+Math.exp(1.5*x))
}
function n(x){
    return 1/(1+Math.exp(-1.5*x))
}
function distance(dx, dy){
    return Math.sqrt(dy**2 + dx**2)
}

//script test Simulation

var scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0d8ef);
let FOV = 75; //Field Of View
let nearD = 0.1;
let farD = 1000;
var camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, nearD, farD);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//RESIZE
window.addEventListener('resize', function(){
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
} );
//controls
var controls = new THREE.OrbitControls( camera, renderer.domElement );


// OBJECTS
objects = [];
n_o = 3

/*
//test surface
var tsg = new THREE.PlaneGeometry(30, 30, 100, 100)
//this works --- ridges with stream in middle

vs = []
for (var t = 0; t < 300; t++){
    x = Math.cos(150*t/2)*t**1
    y = Math.sin(150*t/2)*t**1
    vs.push([x,y])
}
for (var i = 0; i < tsg.vertices.length; i++){
    x = tsg.vertices[i].x
    y = tsg.vertices[i].y
    gx = Math.cos(30*i/1)*i**2
    gy = Math.sin(30*i/1)*i**2
    w = 0
    for (var j = 0; j < vs.length; j++){
        if (distance(vs[j][0]-x, vs[j][1]-y) < 1.2){
            w = 1
        }
    }

    //w = Math.exp(-1*( 10*gx)**2)
    tsg.vertices[i].z = w
}

var ts_m = new THREE.MeshPhongMaterial({
    color: 0xdddddd,
    wireframe: true
});
var ts_plane = new THREE.Mesh(tsg, ts_m)
scene.add(ts_plane)
*/



//Light
var Sunlight = new THREE.DirectionalLight(0xffffff,1);
Sunlight.position.set(20, 50, 20);//.set( 0, 0, 80 );
Sunlight.intensity = 1;
Sunlight.castShadow = true;
scene.add( Sunlight );
var sphereSize = 1;
var sun = new THREE.PointLightHelper( Sunlight, sphereSize );
scene.add( sun );

var amb_light = new THREE.AmbientLight(0xffffff,0.6);
amb_light.intensity = 1;
scene.add( amb_light );

var axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );


/* ----- Ground ----- */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200,200),
  new THREE.MeshStandardMaterial({color:'rgb(170,140,110)'})
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

/* ----- Trunk ----- */
const trunkHeight = 20;
const trunkRadiusBottom = 1.0;
const trunkRadiusTop = 0.3;
const trunkGeo = new THREE.CylinderGeometry(trunkRadiusTop, trunkRadiusBottom, trunkHeight, 16);
const trunkMat = new THREE.MeshStandardMaterial({color:'rgb(160,82,45)'});
const trunk = new THREE.Mesh(trunkGeo, trunkMat);
trunk.position.y = trunkHeight/2; // position.y = (ground_0) + center of height
scene.add(trunk);

const topHeight = trunkHeight*.35
const trunkTopGeo = new THREE.ConeGeometry(trunkRadiusTop, topHeight, 16);
const trunkTop = new THREE.Mesh(trunkTopGeo, trunkMat);
trunkTop.position.y = trunkHeight + topHeight/2; // position.y = (ground_0) + center of height
scene.add(trunkTop);

/* ----- Branch Curve Class ----- */
class SineBranch extends THREE.Curve {
  constructor(length, amplitude, waves) {
    super();
    this.length = length;
    this.amplitude = amplitude;
    this.waves = waves;
  }
  getPoint(t) {
    const x = t * this.length;
    //const y = Math.sin(t * this.waves * Math.PI * 2) * this.amplitude;
    const y = 2*t + Math.sin(t * this.waves * Math.PI * 2) * this.amplitude;
    const z = 0;
    return new THREE.Vector3(x, y, z);
  }
}

/* ----- Branch Generation ----- */
//const branchMaterial = new THREE.MeshStandardMaterial({color:0x2e8b57});
const levels = 60;          // number of branch levels
const branchCount = 1;      // one branch per level (we’ll rotate each level)
let branchAngle = 0;        // starting rotation

for (let i=0; i<levels; i++) {
  const height = (i+1)/(levels+1) * trunkHeight + 0.22*trunkHeight; // climb up trunk
  const branchLength = 6 * (1 - i/levels);       // shorter at top
  const branchRadius = 0.1 + 0.05*(1 - i/levels);
  const amplitude = 0.1 + 0.6*(1 - i/levels);    // slight wave
  const waves = 1;                               // number of sine cycles

  const curve = new SineBranch(branchLength, amplitude, waves);
  const branchGeo = new THREE.TubeGeometry(curve, 32, branchRadius, 8, false);
  const branch = new THREE.Mesh(branchGeo, trunkMat);

  // Position base of branch at trunk surface
  const radialDistance = trunkRadiusBottom * (1 - i/levels) -.2;


  //branch.position.y = height - trunkHeight/2;  // center trunk pivot
    branch.position.y = height


  branch.rotation.y = branchAngle;             // rotate around trunk
  branchAngle += 2*Math.PI*phi;                    // phi rotations

  // Offset outward from trunk center
  branch.position.x = radialDistance * Math.sin(branch.rotation.y);
  branch.position.z = radialDistance * Math.cos(branch.rotation.y);

  scene.add(branch);
}





//Test


camera.position.z = 150;
camera.position.y = 80;


camera.lookAt(new THREE.Vector3(0,0,0));




//game logic
var update = function(t){

    Sunlight.position.x = 100*Math.sin(t/10000);

    for (let i = 0; i < objects.length; i++){
        objects[i].UpdatePosition(objects)
    }
    t += 1;
};




//draw scene
var render = function(){
    renderer.render(scene, camera);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
};

//testchain()
//run game loop { update , draw}
var t = 0

function GameLoop(t){
    requestAnimationFrame(GameLoop);
    t = update(t);
    render();
};

GameLoop();


