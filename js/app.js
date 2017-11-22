OZ( document.getElementById("world"), document.getElementById("credit") );

function OZ( domElement, credit ){
  document.body.style.margin  = "0px";
  document.body.style.padding = "0px";
  domElement.style.margin     = "0px";
  domElement.style.padding    = "0px";

  domElement.style.width  = window.innerWidth + "px";
  domElement.style.height = window.innerHeight - credit.clientHeight + "px"


  var cssScene, cssRenderer;
  var glScene, glRenderer;
  var camera;
  var controls;
  var stats;

  var spFlag = PhoneCheck();
  function PhoneCheck(){
    var userAgent = navigator.userAgent;
    var flag = false;
    if (userAgent.indexOf('iPhone') > 0 || userAgent.indexOf('iPod') > 0 || userAgent.indexOf('Android') > 0)
      flag = true;
    else if(userAgent.indexOf('iPad') > 0 || userAgent.indexOf('Android') > 0){
      flag = true;
      return flag;
    }
  }





  init();
  animate();


  function init() {
    InitCSS();
    InitGL();
    InitStats();

    InitLight();
    InitCamera();

    createDisplay();
    loadOBJ( './cube/' , 'CubeRoom', undefined, undefined, new THREE.Vector3(1, 1, 1));
    createRandomBox();

    InitControls();

    createBlocker();
    window.addEventListener('resize', onResize, false);
  }


  function animate() {
    requestAnimationFrame(animate);
    stats.update();

    glRenderer.render(glScene, camera);
    cssRenderer.render(cssScene, camera);

    controls.update();
  }



  function InitCSS(){
    cssScene = new THREE.Scene();
    cssRenderer = new THREE.CSS3DRenderer({ antialias:true });
    cssRenderer.setSize(domElement.clientWidth, domElement.clientHeight);
    domElement.appendChild(cssRenderer.domElement);
    cssRenderer.domElement.style.zIndex = 0;
    cssRenderer.domElement.style.position = 'absolute';
  }

  function InitGL(){
    glScene = new THREE.Scene();
    glScene.fog = new THREE.FogExp2(0xbb9977, 0.02);
    glRenderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    glRenderer.setClearColor(0x997755,1);
    glRenderer.setSize(domElement.clientWidth, domElement.clientHeight);
    domElement.appendChild(glRenderer.domElement);
    glRenderer.domElement.style.zIndex = 1;
    glRenderer.domElement.style.position = 'absolute';
    glRenderer.shadowMap.enabled = true;
  }




  function InitCamera(){
    camera = new THREE.PerspectiveCamera(75, domElement.clientWidth / domElement.clientHeight, 0.01, 500);
    camera.position.set(0,1,1);
    camera.rotation.set(0,0,0);
  }

  function InitLight(){
    var ambientLight = new THREE.AmbientLight(0x333333);
    glScene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xff9966);
    directionalLight.position.set( 5, 25, 5 );
    directionalLight.castShadow            = true;
    directionalLight.shadow.camera.left    = -50;
    directionalLight.shadow.camera.right   =  50;
    directionalLight.shadow.camera.bottom  = -50;
    directionalLight.shadow.camera.top     =  50;
    directionalLight.shadow.camera.far     = 150;
    directionalLight.shadow.mapSize.width  = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    glScene.add(directionalLight);
  }



  var tapCount = 0;
  function InitControls(){
    if(spFlag) {
      // glRenderer.domElement.addEventListener( 'touchstart', function OnTouch(event){
      //   var x = event.pageX / domElement.clientHeight;
      //   var y = event.pageY / domElement.clientWidth;
      //   if(y<0.5) camera_move = 1;
      //   else      camera_move = -1;
      // }, false );
      // glRenderer.domElement.addEventListener( 'touchend', function(){camera_move = 0;}, false );
      // domElement.addEventListener('touchmove', function(event) {event.preventDefault();}, false );

      controls = new THREE.TrackballControls( camera, glRenderer.domElement );
      // domElement.addEventListener('touchstart', function(event) {
      //   if( tapCount < 2 ) {
      //     tapCount++;
      //     setTimeout( function() { tapCount = 0; }, 300 );
      //   } else {
      //     alert("3Touch");
      //     event.preventDefault() ;
      //     tapCount = 0 ;
      //     glRenderer.domElement.style.pointerEvents = "none";
      //     domElement.style.pointerEvents = "none";
      //   }
      // }, false );
    } else {
      controls = new THREE.OriginControls( camera, glRenderer.domElement, glScene );
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
    glScene.add( plane );

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

    cssScene.add(cssObject);
  }

  function createDisplay(){
    var position = new THREE.Vector3(3,0,0);
    var box = new THREE.Mesh(
      new THREE.BoxGeometry(1,2,1.1),
      new THREE.MeshPhongMaterial({color: 0x999999})
    );

    box.position.x = position.x;
    box.position.y = position.y+1;
    box.position.z = position.z;
    box.castShadow = true;
    box.receiveShadow = true;
    glScene.add(box);

    create3dPage(
      1.0, 1.9,
      new THREE.Vector3(position.x-0.51, position.y+1, position.z),
      new THREE.Vector3(0, -0.5*Math.PI, 0),
      'https://www.calculator29.com'
    );
  }

  function loadOBJ( path, name, position = new THREE.Vector3(0,0,0), rotation = new THREE.Vector3(0,0,0), scale = new THREE.Vector3(1,1,1) ){
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
              object.material.alphaTest = 0.9;
              object.material.blending = THREE.NormalBlending;
              object.material.transparent = true;
              object.material.side = THREE.DoubleSide;
            }
          }
        });
        objects.position.set( position.x, position.y, position.z );
        objects.rotation.set( rotation.x, rotation.y, rotation.z );
        objects.scale.set( scale.x, scale.y, scale.z );
        glScene.add( objects );
      });
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

        glScene.add(box);
      }
    }
  }






  function onResize() {
    domElement.style.width = window.innerWidth + "px";
    domElement.style.height = window.innerHeight - credit.clientHeight + "px"

    camera.aspect = domElement.clientWidth / domElement.clientHeight;
    camera.updateProjectionMatrix();

    cssRenderer.setSize(domElement.clientWidth, domElement.clientHeight);
    glRenderer.setSize(domElement.clientWidth, domElement.clientHeight);
  }

  function createBlocker(){
    var blocker = document.createElement( 'blocker' );
    blocker.style.display = 'none';
    domElement.addEventListener( 'mousedown', function () { blocker.style.display = ''; } );
    domElement.addEventListener( 'mouseup', function () { blocker.style.display = 'none'; } );
  }

  function InitStats(){
    stats = new Stats();
    domElement.appendChild( stats.dom );
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






  function fullscreen(){
    if ( domElement.webkitRequestFullScreen ) {
      domElement.webkitRequestFullScreen();
    } else if ( domElement.mozRequestFullScreen ) {
      domElement.mozRequestFullScreen();
    } else {
      alert("not found")
    }
  }


}
