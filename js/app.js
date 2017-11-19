'use strict';

var camera;

var scene, renderer;
var gl_scene, gl_renderer;

// FPS表示
var stats;

// コントロール関連
var controls;

// スマホ用
var camera_move = 0;

// PC用
var moving = false;
var moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0 };
var pitchObject = new THREE.Object3D(), yawObject = new THREE.Object3D();
var FirstPersonControls = {};
var clock;

// スマホ判定
var ua = navigator.userAgent;
if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0) {
  var sp = true;
}else if(ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0){
  var sp = true;
}




init();
setControl();
animate();




function init() {
  createScene();
  createGLScene();
  createCamera();

  // createDisplay();
  // createGround();
  if(sp) loadOBJ( './torii/', 'torii', new THREE.Vector3(0, 0.0, 0), new THREE.Vector3(0, 0, 0), );
  else   loadOBJ( './torii/', 'torii_full', new THREE.Vector3(0, 0.0, 0), new THREE.Vector3(0, 0, 0), );
  createRandomBox();

  createLight();

  createControls();

  window.addEventListener('resize', onWindowResize, false);

  createBlocker();
  createStats();
}


function animate() {
  controls.update();
  if(camera_move ==  1 ) Foward();
  if(camera_move == -1 ) Back();

  gl_renderer.render(gl_scene, camera);
  renderer.render(scene, camera);
  stats.update();
  requestAnimationFrame(animate);
}



function createScene(){
  scene = new THREE.Scene();
  renderer = new THREE.CSS3DRenderer({ antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.style.zIndex = 0;
  renderer.domElement.style.position = 'absolute';
}

function createGLScene(){
  gl_scene = new THREE.Scene();
  gl_scene.fog = new THREE.FogExp2(0xbb9977, 0.01);
  gl_renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  gl_renderer.setClearColor(0x997755,1);
  gl_renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(gl_renderer.domElement);
  gl_renderer.domElement.style.zIndex = 1;
  gl_renderer.domElement.style.position = 'absolute';
  gl_renderer.shadowMap.enabled = true;
}

function createCamera(){
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 500);
  camera.position.y = 1.0;
  camera.position.z = 3.5;
}

function createLight(){
  var ambientLight = new THREE.AmbientLight(0x333333);
  gl_scene.add(ambientLight);
  var directionalLight = new THREE.DirectionalLight(0xff9966);
  directionalLight.position.set( 5, 50, 5 );
  directionalLight.castShadow            = true;
  directionalLight.shadow.camera.left    = -30;
  directionalLight.shadow.camera.right   =  30;
  directionalLight.shadow.camera.bottom  = -30;
  directionalLight.shadow.camera.top     =  30;
  directionalLight.shadow.camera.far     = 100;
  directionalLight.shadow.mapSize.width  = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  gl_scene.add(directionalLight);
}

function createControls(){
  if(sp) {
    controls = new THREE.DeviceOrientationControls( camera,gl_renderer.domElement );
    controls.connect();
    document.body.addEventListener('touchmove', function(event) {event.preventDefault();}, false );
    document.addEventListener( 'touchstart', function OnTouch(event){
      var x = event.pageX / window.innerHeight;
      var y = event.pageY / window.innerWidth;
      if(y<0.5) camera_move = 1;
      else      camera_move = -1;
    }, false );
    document.addEventListener( 'touchend', function(){camera_move = 0;}, false );
  } else {
    controls = FirstPersonControls;
  }
}








function createPlane(w, h, position, rotation) {
  var  material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    opacity: 0.0,
    side: THREE.DoubleSide,
    blending: THREE.NoBlending
  });
  var geometry = new THREE.PlaneGeometry(w, h);
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = position.x;
  mesh.position.y = position.y;
  mesh.position.z = position.z;
  mesh.rotation.x = rotation.x;
  mesh.rotation.y = rotation.y;
  mesh.rotation.z = rotation.z;
  return mesh;
}

function create3dPage( w, h, position, rotation, url ) {
  var plane = createPlane( w, h, position, rotation );
  gl_scene.add( plane );

  var div = document.createElement('div');
  div.style.width = 1000*w+'px';
  div.style.height = 1000*h+'px';
  div.style.overflow = 'auto';
  div.style.WebkitOverflowScrolling = 'touch';

  var iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.display = 'block';
  iframe.style.zoom = '0.001';
  iframe.src = url;

  div.appendChild(iframe);

  var cssObject = new THREE.CSS3DObject(div);

  cssObject.position.x = position.x;
  cssObject.position.y = position.y;
  cssObject.position.z = position.z;
  cssObject.rotation.x = rotation.x;
  cssObject.rotation.y = rotation.y;
  cssObject.rotation.z = rotation.z;

  cssObject.scale.set(0.001,0.001,0.001);

  scene.add(cssObject);
}

function createDisplay(){
  var position = new THREE.Vector3(3,0,-1);
  var box = new THREE.Mesh(
    new THREE.BoxGeometry(1.99,2,1.99),
    new THREE.MeshPhongMaterial({color: 0x999999})
  );

  box.position.x = position.x;
  box.position.y = position.y+1;
  box.position.z = position.z;
  box.castShadow = true;
  box.receiveShadow = true;
  gl_scene.add(box);

  create3dPage(
    1.8, 1.8,
    new THREE.Vector3(position.x, position.y+1, position.z-1),
    new THREE.Vector3(0, Math.PI, 0),
    'https://www.calculator29.com'
  );
  create3dPage(
    1.8, 1.8,
    new THREE.Vector3(position.x+1, position.y+1, position.z),
    new THREE.Vector3(0, Math.PI/2.0, 0),
    'https://www.calculator29.com/Robots'
  );
  create3dPage(
    1.8, 1.8,
    new THREE.Vector3(position.x, position.y+1, position.z+1),
    new THREE.Vector3(0, 0, 0),
    'https://www.calculator29.com/Software'
  );

  create3dPage(
    1.8, 1.8,
    new THREE.Vector3(position.x-1, position.y+1, position.z),
    new THREE.Vector3(0, -Math.PI/2.0, 0),
    'https://www.calculator29.com/Design'
  );
}

function createGround(){
  var plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1000,1000),
    new THREE.MeshPhongMaterial({color: 0x999999})
  );
  plane.rotation.x = -Math.PI/2.0;
  plane.receiveShadow = true;
  gl_scene.add(plane);
}

function loadOBJ( path, name, position, rotation ){
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.setPath( path );

  mtlLoader.load( name + '.mtl', function ( materials ) {
    materials.preload();

    var objLoader = new THREE.OBJLoader();
    objLoader.setPath( path );
    objLoader.setMaterials( materials );
    objLoader.load( name + '.obj', function ( objects ) {
      objects.traverse( function( object ){
        if ( object instanceof THREE.Mesh ) {
          object.castShadow    = true;
          object.receiveShadow = true;
          if( object.material instanceof Array ){
            object.material.forEach(function(mat){
              mat.alphaTest = 0.9;
              mat.blending = THREE.NormalBlending;
              mat.transparent = true;
              mat.side = THREE.DoubleSide;
            });
          }else{
            object.material.side = THREE.DoubleSide;
          }
        }
      });
      objects.position.set( position.x, position.y, position.z );
      objects.rotation.set( rotation.x, rotation.y, rotation.z );
      gl_scene.add( objects );
    });
  });
}

function loadJSON( path, name ){
  loader = new THREE.JSONLoader();　　
  loader.load( path + name + ".json" , function(geo, mat){
    var faceMat = new THREE.MeshFaceMaterial(mat);　　　
    var model = new THREE.Mesh(geo, faceMat);　　　
    model.position.set(0, 0, 0);　　　
    model.scale.set(0.1, 0.1, 0.1);　　　
    gl_scene.add( model );
  });　　
}

function createRandomBox(){
  for(var i=0;i<10;i++){
    var pos = {
      x: 30*(Math.random()-0.5),
      y: 20*Math.random(),
      z: 30*(Math.random()-0.5)
    };
    for(var j=0;j<10;j++){
      var Size = 0.5*Math.random();
      var box = new THREE.Mesh(
        new THREE.BoxGeometry(Size,Size,Size),
        new THREE.MeshPhongMaterial({color: Math.random()*0xffffff})
      );

      box.position.x = pos.x + 3*(Math.random()-0.5);
      box.position.y = pos.y + 3*(Math.random()-0.5);
      box.position.z = pos.z + 3*(Math.random()-0.5);

      box.castShadow = true;

      gl_scene.add(box);
    }
  }
}






function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  gl_renderer.setSize(window.innerWidth, window.innerHeight);
}

function createBlocker(){
  var blocker = document.createElement( 'blocker' );
  blocker.style.display = 'none';
  document.addEventListener( 'mousedown', function () { blocker.style.display = ''; } );
  document.addEventListener( 'mouseup', function () { blocker.style.display = 'none'; } );
}

function createStats(){
  stats = new Stats();
  document.body.appendChild( stats.dom );
}








function Foward(){
  var forward = new THREE.Vector4(0, 0, 1, 0);
  forward.applyMatrix4(camera.matrix).normalize();
  forward.multiplyScalar(-0.1);
  camera.position.add(forward);
}

function Back(){
  var forward = new THREE.Vector4(0, 0, 1, 0);
  forward.applyMatrix4(camera.matrix).normalize();
  forward.multiplyScalar(0.1);
  camera.position.add(forward);
}








function PointerLock(){
  gl_renderer.domElement.setAttribute("tabindex", "1");
  moving = false;
  gl_renderer.domElement.requestPointerLock = gl_renderer.domElement.requestPointerLock || gl_renderer.domElement.mozRequestPointerLock || gl_renderer.domElement.webkitRequestPointerLock;
  document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
  gl_renderer.domElement.addEventListener("mousedown", function (e) {
    if (e.buttons === 1) {
      if(moving){
        moving = false;
        document.exitPointerLock();
        console.log(JSON.stringify("unlocked"));
      }else{
        moving = true;
        gl_renderer.domElement.requestPointerLock();
        console.log(JSON.stringify("locked"));
      }
    }
  }, false);
}


function setControl(){
  clock = new THREE.Clock();

  PointerLock();

  function getForward(obj) {
    var pLocal = new THREE.Vector3(0, 0, -1);
    var pWorld = pLocal.applyMatrix4(obj.matrixWorld);
    var dir = pWorld.sub(obj.position).normalize();
    return dir;
  }

  function getHeight(){
    var TopOverPos = new THREE.Vector3(yawObject.position.x, yawObject.position.y, yawObject.position.z); //1.はるか上空のポイントを用意
    var downVect = new THREE.Vector3(0,-1,0);     //下向きのベクトルのみが入ったVector3を用意

    var ray = new THREE.Raycaster(TopOverPos, downVect.normalize());  //2.真下に向かう線がコレ

    var maxY = 0;  //衝突対象が複数あった場合、一番「高い」ものを取得するようにします
    var objs = ray.intersectObjects(gl_scene.children, true);   //衝突点検出！
    for (var i = 0; i < objs.length; i++) {
      if(maxY <  objs[i].point.y)
        maxY = objs[i].point.y;
    }

    return maxY;
  }

  FirstPersonControls.update = function() {
    var root = yawObject;
    var speed = 5*clock.getDelta();
    var forward = getForward(root).normalize();

    // Y軸に沿って移動
    root.position.y = getHeight() + 1.5 + 0.01*Math.sin( clock.oldTime * 0.002 );
    if (moveState.up)
      root.position.y += speed;
    if (moveState.down)
      root.position.y -= speed;

    // X,Z平面上を移動
    if (moveState.forward) {
      root.position.x += forward.x * speed;
      root.position.z += forward.z * speed;
    }
    if (moveState.left) {
      var left = forward.clone().applyAxisAngle(root.up, Math.PI / 2);
      root.position.x += left.x * speed;
      root.position.z += left.z * speed;
    }
    if (moveState.back) {
      var back = forward.clone().multiplyScalar(-1);
      root.position.x += back.x * speed;
      root.position.z += back.z * speed;
    }
    if (moveState.right) {
      var right = forward.clone().applyAxisAngle(root.up, -Math.PI / 2);
      root.position.x += right.x * speed;
      root.position.z += right.z * speed;
    }

  }


  // FPSのようにカメラ回転
  camera.position.set(0, 0, 0);
  camera.rotation.set(0, 0, 0);
  pitchObject.add(camera);
  yawObject.add(pitchObject);
  yawObject.position.set(0, 1.0, 3);
  gl_scene.add(yawObject);
  var PI_2 = Math.PI / 2;
  document.addEventListener("mousemove", function (e) {
    if (moving) {
      var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
      var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
      yawObject.rotation.y -= movementX * 0.001;
      pitchObject.rotation.x -= movementY * 0.001;
      pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
    }
  }, false);

  // WASD,shift,spaceキーの入力を保持
  gl_renderer.domElement.addEventListener("keydown", function (event) {
    switch (event.keyCode) {
    case 87:
      moveState.forward = 1;
      event.preventDefault();
      break;
    case 65:
      moveState.left = 1;
      event.preventDefault();
      break;
    case 83:
      moveState.back = 1;
      event.preventDefault();
      break;
    case 68:
      moveState.right = 1;
      event.preventDefault();
      break;
    case 32:
      moveState.up = 1;
      event.preventDefault();
      break;
    case 16:
      moveState.down = 1;
      event.preventDefault();
      break;
    }
  }, false);
  gl_renderer.domElement.addEventListener("keyup", function (event) {
    switch (event.keyCode) {
    case 87:
      moveState.forward = 0;
      break;
    case 65:
      moveState.left = 0;
      break;
    case 83:
      moveState.back = 0;
      break;
    case 68:
      moveState.right = 0;
      break;
    case 32:
      moveState.up = 0;
      break;
    case 16:
      moveState.down = 0;
      break;
    }
  }, false);
}
