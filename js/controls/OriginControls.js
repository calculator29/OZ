THREE.OriginControls = function ( object, domElement, scene ){
  var moving = false;
  var moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0 };
  var pitchObject = new THREE.Object3D(), yawObject = new THREE.Object3D();
  var clock;

  clock = new THREE.Clock();
  init();

  this.update = function() {
    var root = yawObject;
    var speed = 5*clock.getDelta();
    var forward = getForward(root).normalize();

    // Y軸に沿って移動
    root.position.y = getHeight( scene, yawObject.position ) + 1.5 + 0.01*Math.sin( clock.oldTime * 0.002 );
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

  function getHeight( scene, position ){
    var vec = new THREE.Vector3( 0, -1, 0 );
    var data = new THREE.Raycaster( position, vec );

    var height = 0;
    var objs = data.intersectObjects( scene.children, true );
    objs.forEach( function( obj ){
      if( height <  obj.point.y) height = obj.point.y;
    });
    return height;
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
