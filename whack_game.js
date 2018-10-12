/*
  Three.js Whack Game
  Víctor Rendón Suárez | A01022462
  11/10/2018
*/
var renderer = null,
scene = null,
camera = null,
root = null,
flamingo = null,
group = null,
orbitControls = null,
mixer = null,
raycaster = null,
mouse = new THREE.Vector2(), INTERSECTED, CLICKED;

var morphs = [];

var currentTime = Date.now(),
animator = null,
duration = 0.5,
loopAnimation = false;

function loadGLTF(pos)
{
  mixer = new THREE.AnimationMixer( scene );
  var loader = new THREE.GLTFLoader();

  loader.load( "../models/Flamingo.glb", function( gltf ) {
    flamingo = gltf.scene.children[ 0 ];
    flamingo.scale.set( 0.03, 0.03, 0.03 );
    flamingo.position.x = pos;
    flamingo.position.y += pos/2;
    flamingo.position.x += 3;
    flamingo.position.z = -50 - Math.random() * 50;
    flamingo.castShadow = true;
    flamingo. receiveShadow = true;
    scene.add( flamingo );
    morphs.push(flamingo);
    mixer.clipAction( gltf.animations[ 0 ], flamingo).setDuration( 1 ).play();
    // console.log(gltf.animations);
  } );
}

function animate()
{
  var now = Date.now();
  var deltat = now - currentTime;
  currentTime = now;

  if ( mixer ) {
    mixer.update( ( deltat ) * 0.001 );
  }

  for(var morph of morphs) {
    morph.position.z += 0.01 * deltat;
    if(morph.position.z > 40)
      morph.position.z = -70 - Math.random() * 50;
  }
}

function run() {
  requestAnimationFrame(function() { run(); });
  // Render the scene
  KF.update();
  renderer.render( scene, camera );
  animate();
  // Update the camera controller
  // orbitControls.update();
}

function setLightColor(light, r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  light.color.setRGB(r, g, b);
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "water_texture.jpg";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas)
{
  renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

  // Set the viewport size
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Turn on shadows
  renderer.shadowMap.enabled = true;
  // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Create a new Three.js scene
  scene = new THREE.Scene();

  // Add  a camera so we can view the scene
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );
  // orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
  // camera.position.set(-11.1,56.8,-9.9);
  // camera.rotation.set(-1.6, -0.6, -1.6);
  camera.position.set(-11.7,29,0.3);
  camera.rotation.set(-1.6, -0.8, -1.6);
  scene.add(camera);


  // Create a group to hold all the objects
  root = new THREE.Object3D;

  spotLight = new THREE.SpotLight (0xffffff);
  spotLight.position.set(-60, 8, 0);
  spotLight.target.position.set(-2, 0, -2);
  root.add(spotLight);

  spotLight.castShadow = true;

  spotLight.shadow.camera.near = 1;
  spotLight.shadow.camera.far = 200;
  spotLight.shadow.camera.fov = 45;

  spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
  spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

  ambientLight = new THREE.AmbientLight ( 0x888888 );
  root.add(ambientLight);

  for ( var i = 0; i < 18; i ++ ) {
    // Create flamingoes
    loadGLTF(i*4);
    loadGLTF(i*2);
  }
  // Create a group to hold the objects
  group = new THREE.Object3D;
  root.add(group);

  // Create a texture map
  var map = new THREE.TextureLoader().load(mapUrl);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(8, 8);

  var color = 0xffffff;

  // Put in a ground plane to show off the lighting
  geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
  var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -4.02;
  mesh.name = 'lakeMap'
  // Add the mesh to our group
  group.add( mesh );
  mesh.castShadow = false;
  mesh.receiveShadow = true;


  raycaster = new THREE.Raycaster();
  document.addEventListener('mousedown', onDocumentMouseDown);
  addPoint(0,true);
  initAnimations();
  // Now add the group to our scene
  scene.add( root );
}

function onDocumentMouseDown(event)
{
  event.preventDefault();
  event.preventDefault();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  // find intersections
  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects( scene.children, true );

  if ( intersects.length > 0 && intersects[ 0 ].object.name != 'lakeMap') {
    CLICKED = intersects[ 0 ].object;
    // CLICKED.material.emissive.setHex( 0x00ff00 );

    if(!animator.running) {
      animator.interps[0].target = CLICKED.rotation;
      animator.interps[1].target = CLICKED.position;
      console.log('Hit');
      startAnimator();
      addPoint(1);
    }
  } else {
    CLICKED = null;
  }
}

function initAnimations(){
  animator = new KF.KeyFrameAnimator;
  animator.init({
    interps:[
      {
        keys:[0, 1],
        values:[
          { x : 0 },
          { x : -(Math.PI/2)  },
        ],
      },
      {
        keys:[0.7,1],
        values:[
          { y : 0 },
          { y : -200  },
        ],
      },
    ],
    loop: loopAnimation,
    duration:duration * 1000,
  });
}

function startAnimator(){
  animator.start();
}
