THREE.OriginControls = function ( object, domElement, scene ){
  var moving = false;
  var moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0 };
  var pitchObject = new THREE.Object3D(), yawObject = new THREE.Object3D();
  var clock;
  var velocity = new THREE.Vector3(0,0,0);
  var acceleration = new THREE.Vector3(0,0,0);
  var ground = true;

  clock = new THREE.Clock();
  init();

  this.position = yawObject.position;

  this.update = function() {
    var playerWidth     = 0.5;
    var playerHeight    = 1.5;
    var playerHead      = 0.2;
    var jumpHeight      = 0.5;
    var root = yawObject;
    var delta = clock.getDelta();
    var acc = 0, viscosity = 0, e = 0.1;
    var forward = getForward(root).normalize();

    /* パラメータ設定 */
    if (moveState.down) playerHeight = 1.3;
    if( ground ){
      if (moveState.down) acc = 10;
      else acc = 50;

      viscosity = 15;
      if (moveState.up) velocity.y = 500*delta;
    }else{
      viscosity = 1;
      acc = 5;
    }

    /* 加速度 */
    acceleration.x =   0 - viscosity*velocity.x;
    acceleration.y = -20 - viscosity*velocity.y;
    acceleration.z =   0 - viscosity*velocity.z;

    /* 操作量 */
    if (moveState.forward) {
      acceleration.x += forward.x * acc;
      acceleration.z += forward.z * acc;
    }
    if (moveState.left) {
      var left = forward.clone().applyAxisAngle(root.up, Math.PI / 2);
      acceleration.x += left.x * acc;
      acceleration.z += left.z * acc;
    }
    if (moveState.back) {
      var back = forward.clone().multiplyScalar(-1);
      acceleration.x += back.x * acc;
      acceleration.z += back.z * acc;
    }
    if (moveState.right) {
      var right = forward.clone().applyAxisAngle(root.up, -Math.PI / 2);
      acceleration.x += right.x * acc;
      acceleration.z += right.z * acc;
    }

    /* 速度 */
    velocity.x += acceleration.x*delta;
    velocity.y += acceleration.y*delta;
    velocity.z += acceleration.z*delta;

    /* 衝突判定 */
    if( checkHorizon( velocity.x, 0 ) ) velocity.x *= -e;
    else root.position.x += velocity.x * delta;
    if( checkHorizon( 0, velocity.z ) ) velocity.z *= -e;
    else root.position.z += velocity.z * delta;
    if( checkVertical( velocity.y ) ) velocity.y *= -e;
    else root.position.y += velocity.y * delta;

    /* 着地判定 */
    ground = false;
    var groundHeight = getHeight();
    if( root.position.y < groundHeight + playerHeight ){
      ground = true;
      root.position.y = groundHeight + playerHeight - 0.001;
    }


    function getDistance( position, x, y, z ){
      var distance = 999;
      var ray = new THREE.Raycaster( position, new THREE.Vector3( x, y, z ).normalize() );
      var objs = ray.intersectObjects( scene.children, true );
      for( var i=0; i<objs.length; i++ )
        if( distance > objs[i].distance ) distance = objs[i].distance;
      return distance;
    }

    function checkHorizon( x, z ){
      var scanTop = yawObject.position.y + playerHead;
      var space   = getDistance( yawObject.position, 0, 1, 0 ) - playerHead;

      if( space > jumpHeight )
        var scanBottom = yawObject.position.y - playerHeight + jumpHeight;
      else
        var scanBottom = yawObject.position.y - playerHeight + space;

      var position = yawObject.position.clone();
      var NUM = 10;
      for(var i=0;i<NUM;i++){
        var s = i/(NUM-1);
        position.y = s*scanTop+(1-s)*scanBottom;
        if( getDistance( position, x, 0, z ) < playerWidth/2 ) return true;
      }
      return false;
    }

    function checkVertical( y ){
      if( yawObject.position.y < playerHeight && y < 0 ) return true;
      var position = yawObject.position.clone();
      position.setY( yawObject.position.y - playerHeight/2 + playerHead/2 );
      if( getDistance( position, 0, y, 0 ) < playerHeight/2 + playerHead/2 ) return true;
      return false;
    }

    function getHeight(){
      var position = yawObject.position.clone();
      var height = yawObject.position.y - getDistance( position, 0, -1, 0 );
      return height;
    }


  }


  function PointerLock(){
    domElement.setAttribute("tabindex", "1");
    moving = false;
    domElement.requestPointerLock = domElement.requestPointerLock || domElement.mozRequestPointerLock || domElement.webkitRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
    domElement.addEventListener("mousedown", function (e) {
      if (e.buttons === 1) {
        if(moving){
          moving = false;
          document.exitPointerLock();
          console.log(JSON.stringify("unlocked"));
        }else{
          moving = true;
          domElement.requestPointerLock();
          console.log(JSON.stringify("locked"));
        }
      }
    }, false);
  }


  function getForward( obj ) {
    var vec = new THREE.Vector3( 0, 0, -1 );
    var forward = vec.applyMatrix4( obj.matrixWorld ).sub( obj.position ).normalize();
    return forward;
  }



  function init(){
    PointerLock();

    var position = new THREE.Vector3( object.position.x, object.position.y, object.position.z );
    var rotation = new THREE.Vector3( object.rotation.x, object.rotation.y, object.rotation.z );
    object.position.set(0, 0, 0);
    object.rotation.set(0, 0, 0);

    pitchObject.add(object);
    yawObject.add(pitchObject);

    yawObject.position.set( position.x, position.y, position.z );
    yawObject.rotation.set( rotation.x, rotation.y, rotation.z );

    scene.add( yawObject );

    document.addEventListener("mousemove", function (e) {
      if (moving) {
        var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
        yawObject.rotation.y -= movementX * 0.001;
        pitchObject.rotation.x -= movementY * 0.001;
        pitchObject.rotation.x = Math.max( - Math.PI/2, Math.min( Math.PI/2, pitchObject.rotation.x));
      }
    }, false);

    // WASD,shift,spaceキーの入力を保持
    domElement.addEventListener("keydown", function (event) {
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
    domElement.addEventListener("keyup", function (event) {
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
}
