import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { Water } from 'three/addons/objects/Water2.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { 
  GodRaysDepthMaskShader, 
  GodRaysGenerateShader, 
  GodRaysCombineShader 
} from 'three/addons/shaders/GodRaysShader.js';
import { DragControls } from 'three/addons/controls/DragControls.js';
import { TDSLoader } from 'three/addons/loaders/TDSLoader.js';
import { VolumetricCloud } from './VolumetricCloud.js';  // Adjust path as needed



let water;
let frame = 0;
let draggableObjects = [];
let selectedObject = null;
let offset = new THREE.Vector3();
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let dragControls;
function main() {
  RectAreaLightUniformsLib.init();
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // Optional but improves visuals

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;


  const loader = new THREE.TextureLoader();

  const tileTexture = loader.load('public/tiles_0059_color_1k.jpg');
  tileTexture.colorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202020);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  //camera.position.set(4, 2, 10);
  camera.lookAt(0, 0, 0);
  camera.position.x = 2;
  camera.position.y = 2;
  camera.position.z = 6;

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 1, 0);
  controls.update();

  const params = {
    threshold: 0.5,
    strength: 0.2,
    radius: 0.5,
    exposure: 1
  };
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = params.threshold;
  bloomPass.strength = params.strength;
  bloomPass.radius = params.radius;
  composer.addPass(bloomPass);


  const bgLoader = new THREE.CubeTextureLoader();
    const texture = bgLoader.load( [
      '/right.jpg',
      '/left.jpg',
      '/top.jpg',
      '/bottom.jpg',
      '/front.jpg',
      '/back.jpg',
    ] );
    scene.background = texture;

    // SUN light (Directional)
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(10, 10, 10);
//scene.add(sunLight);

// MOON light (Spotlight)
const moonLight = new THREE.SpotLight(0x9999ff, 0.8);
moonLight.position.set(100, 100, 100);
moonLight.target.position.set(0, 2, 0);
scene.add(moonLight);
scene.add(moonLight.target);


sunLight.castShadow = true;
moonLight.castShadow = true;
const renderTargetOcclusion = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);


  const sunSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0xffffaa,
      emissive: 0xffff00,
      emissiveIntensity: 1
    })
  );
  sunSphere.position.copy(sunLight.position);
  scene.add(sunSphere);

  const rayMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffaa,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    depthWrite: false // prevents dark blending
  });

  //scene.fog = new THREE.Fog( 0xcccccc, 100, 150 );
  // Add this after your scene creation
const fog = {
  enabled: true,
  color: 0xcccccc,
  near: 1.5,   // Fog starts 1.5 units from camera
  far: 3.5     // Fog ends 3.5 units from camera
};


// Initialize fog
scene.fog = new THREE.Fog(fog.color, fog.near, fog.far);

// Add to GUI
const fogGUI = new GUI();
//fogGUI.domElement.style.marginTop = '900px';
fogGUI.domElement.style.marginRight = '1200px';

fogGUI.add(fog, 'enabled').name('Fog Enabled').onChange(val => {
  scene.fog = val ? new THREE.Fog(fog.color, fog.near, fog.far) : null;
});
fogGUI.addColor(fog, 'color').name('Fog Color').onChange(val => {
  if (scene.fog) scene.fog.color.setHex(val);
});
fogGUI.add(fog, 'near', 1, 100).name('Fog Start').onChange(val => {
  if (scene.fog) scene.fog.near = val;
});
fogGUI.add(fog, 'far', 10, 200).name('Fog End').onChange(val => {
  if (scene.fog) scene.fog.far = val;
});
  

/*  // lensflares
        const textureLoader = new THREE.TextureLoader();

        const textureFlare0 = textureLoader.load( 'textures/lensflare/lensflare0.png' );
        const textureFlare3 = textureLoader.load( 'textures/lensflare/lensflare3.png' );

        addLight( 0.55, 0.9, 0.5, 5000, 0, - 1000 );
        addLight( 0.08, 0.8, 0.5, 0, 0, - 1000 );
        addLight( 0.995, 0.5, 0.9, 5000, 5000, - 1000 );

        function addLight( h, s, l, x, y, z ) {

          const light = new THREE.PointLight( 0xffffff, 1.5, 2000, 0 );
          light.color.setHSL( h, s, l );
          light.position.set( x, y, z );
          scene.add( light );

          const lensflare = new Lensflare();
          lensflare.addElement( new LensflareElement( textureFlare0, 700, 0, light.color ) );
          lensflare.addElement( new LensflareElement( textureFlare3, 60, 0.6 ) );
          lensflare.addElement( new LensflareElement( textureFlare3, 70, 0.7 ) );
          lensflare.addElement( new LensflareElement( textureFlare3, 120, 0.9 ) );
          lensflare.addElement( new LensflareElement( textureFlare3, 70, 1 ) );
          light.add( lensflare ); */
  
  const moonSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0xccccff,
      emissive: 0x8888ff,
      emissiveIntensity: 0.7
    })
  );
  moonSphere.position.copy(moonLight.position);
  scene.add(moonSphere);
    
    

  const gltfLoader = new GLTFLoader();
  const url = '../asgn5/public/Grassy_mountain_002/mountain_grass.gltf';
  gltfLoader.load(url, (gltf) => {
    const root = gltf.scene;
    root.scale.set(5, 5, 5);
    scene.add(root);
  });

  /*const objLoader = new OBJLoader();
  objLoader.load('/bunny.obj', (root) => {
    root.traverse((child) => {
      if (child.isMesh && !child.material) {
        child.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
      }
      child.material = new THREE.MeshStandardMaterial({ color: 0xff00ff });

    });
    root.position.y = -3;
    scene.add(root);
  });*/


  function getRandomColor() {
    return Math.floor(Math.random() * 0xffffff);
  }

  function getRandomPosition(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createRandomPrimitive() {
    const geometries = [
      new THREE.BoxGeometry(0.2, 0.2, 0.2),               // smaller cube
      new THREE.SphereGeometry(0.12, 16, 16),             // smaller sphere
      new THREE.ConeGeometry(0.12, 0.3, 16),               // smaller cone
      new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16),    // smaller cylinder
      new THREE.TorusGeometry(0.12, 0.04, 16, 100),       // smaller torus
      new THREE.TetrahedronGeometry(0.16),                 // smaller tetrahedron
      new THREE.OctahedronGeometry(0.16),                  // smaller octahedron
      new THREE.DodecahedronGeometry(0.16),                // smaller dodecahedron
      new THREE.IcosahedronGeometry(0.16),                 // smaller icosahedron
      new THREE.TorusKnotGeometry(0.12, 0.04, 64, 8)   
    ];

    const geometry = geometries[Math.floor(Math.random() * geometries.length)];

    // Random color
    const material = new THREE.MeshStandardMaterial({ color: getRandomColor() });
  
    const mesh = new THREE.Mesh(geometry, material);
  
  
  // Random position in range (X: -10 to 10, Z: -10 to 10), fixed Y = 0.5 for visibility
  mesh.position.set(getRandomPosition(-1.3, 0), 2.2, getRandomPosition(-1.4, 0));

  // Enable shadows if you want
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

  const doorTextureLoader = new THREE.TextureLoader();
  const doorTexture = doorTextureLoader.load('doorTextures/Door_C.jpg', animate); // `animate` optional
  doorTexture.colorSpace = THREE.SRGBColorSpace;

  const cloud = new VolumetricCloud();
  cloud.position.y = 5;
  scene.add(cloud);
  
  const objLoader = new OBJLoader();
  objLoader.load('/Door_Component_BI3.obj', (root) => {
    root.traverse((child) => {
      if (child.isMesh) {
        // Apply a material with the texture
        child.material = new THREE.MeshStandardMaterial({
          map: doorTexture,
        });
  
        // Optional: Double side or other tweaks
        child.material.side = THREE.DoubleSide;
        child.material.needsUpdate = true;
  
        // Shadow support (optional)
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  
    root.position.y = 2.1;
    root.position.x = 1.5;
    root.rotation.y = -190;
    scene.add(root);
  });
  
  const wineTextureLoader = new THREE.TextureLoader();
  const wineTexture = wineTextureLoader.load('43-wine_bottle_obj/Wine_bottle.mtl', animate); // `animate` optional
  wineTexture.colorSpace = THREE.SRGBColorSpace;
  
  const bottleLoader = new OBJLoader();
  bottleLoader.load('/43-wine_bottle_obj/Wine_bottle.obj', (root) => {
    root.traverse((child) => {
      if (child.isMesh) {
        // Apply a material with the texture
        child.material = new THREE.MeshStandardMaterial({
          map: wineTexture,
        });
  
        // Optional: Double side or other tweaks
        child.material.side = THREE.DoubleSide;
        child.material.needsUpdate = true;
  
        // Shadow support (optional)
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    root.scale.set(0.01, 0.01, 0.01);
  
    root.position.y = 2.5;
    root.position.x = 0;
    //root.rotation.y = -190;
    scene.add(root);
  });



  for (let i = 0; i < 10; i++) {
    const primitive = createRandomPrimitive();
    scene.add(primitive);
    draggableObjects.push(primitive);
  }
  initDragControls();



  const tableGltfLoader = new GLTFLoader();
  const tableUrl = '/wooden_tablechair__low-poly__game-ready/scene.gltf';
  tableGltfLoader.load(tableUrl, (gltf) => {
    const root = gltf.scene;
    root.scale.set(0.7, 0.7, 0.7);
    root.position.set(0, 2, 0);
    scene.add(root);
  });


  const pomGltfLoader = new GLTFLoader();
  const pomUrl = '/pomni_from_the_amazing_digital_circus/scene.gltf';
  pomGltfLoader.load(pomUrl, (gltf) => {
      const root = gltf.scene;
      root.scale.set(0.7, 0.7, 0.7);
      root.position.set(0, 2.1, 1);
      
      // Make sure the model is interactive
      root.traverse(child => {
          if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              // Ensure each mesh has a material
              if (!child.material) {
                  child.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
              }
          }
      });
      
      scene.add(root);
      draggableObjects.push(root);
      
      // Initialize DragControls after model is loaded
      initDragControls();
  });

  function initDragControls() {
    // Remove existing drag controls if they exist
    if (dragControls) {
      dragControls.deactivate();
      dragControls.dispose();
    }
    
    // Create new DragControls
    dragControls = new DragControls(draggableObjects, camera, renderer.domElement);
    
    // Customize drag behavior
    dragControls.addEventListener('dragstart', function (event) {
        controls.enabled = false; // Disable orbit controls while dragging
        event.object.traverse(child => {
            if (child.isMesh && child.material) {
                child.material.emissive?.setHex(0x333333); // Highlight when dragging
            }
        });
    });
    
    dragControls.addEventListener('dragend', function (event) {
        controls.enabled = true; // Re-enable orbit controls
        event.object.traverse(child => {
            if (child.isMesh && child.material) {
                child.material.emissive?.setHex(0x000000); // Remove highlight
            }
        });
    });
    
    // Enable dragging
    dragControls.activate();
  }

  const gummiGltfLoader = new GLTFLoader();
  const gumUrl = '/gummigoo/scene.gltf';
  gummiGltfLoader.load(gumUrl, (gltf) => {
    const root = gltf.scene;
    root.scale.set(0.003, 0.003, 0.003);
    root.position.set(0.5, 2.1, 1);
    scene.add(root);
  });

  // const width = 3;  
  // const height = 2;  
  // const depth = 3;  
  // const geometry = new THREE.BoxGeometry( width, height, depth );
  // const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  // const wall1 = new THREE.Mesh(geometry, wallMaterial);
  // wall1.position.set(0, 3, 0); // places it just above ground if ground is at y=0
  // scene.add(wall1);
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });

  // Left wall (facing right)
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), wallMaterial);
  leftWall.position.set(-1.5, 3, 0); // adjust position
  leftWall.rotation.y = Math.PI / 2; // rotate to face in +X direction
  scene.add(leftWall);

  // Back wall (facing forward)
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), wallMaterial);
  backWall.position.set(0, 3, -1.5); // adjust position
  // no rotation needed
  scene.add(backWall);


  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const tileMaterial = new THREE.MeshStandardMaterial({ map: tileTexture });


  const textureLoader = new THREE.TextureLoader();
  const alphaMap = textureLoader.load('/textures/alpha_radial_gradient.png');
  alphaMap.wrapS = THREE.ClampToEdgeWrapping;
  alphaMap.wrapT = THREE.ClampToEdgeWrapping;
  alphaMap.colorSpace = THREE.SRGBColorSpace;  // optional depending on map type

  textureLoader.load('/Water_1_M_Flow.jpg', function(flowMap) {
//    const waterGeometry = new THREE.PlaneGeometry(20, 20, 128, 128);
const waterGeometry = new THREE.PlaneGeometry(20, 20);
    water = new Water(waterGeometry, {
      scale: 2,
      textureWidth: 1024,
      textureHeight: 1024,
      flowMap: flowMap
    });
  
    water.position.y = 1;
    water.rotation.x = Math.PI * - 0.5;
    scene.add(water);
  });


  const cube = new THREE.Mesh(boxGeometry, tileMaterial);
  cube.position.set(0, 2, 0);  // move cube above mountain
  cube.scale.set(3, 0.1, 3);
  scene.add(cube);

  class ColorGUIHelper {

    constructor( object, prop ) {

      this.object = object;
      this.prop = prop;

    }
    get value() {

      return `#${this.object[ this.prop ].getHexString()}`;

    }
    set value( hexString ) {

      this.object[ this.prop ].set( hexString );

    }

  }
  class DegRadHelper {
    constructor(obj, prop) {
      this.obj = obj;
      this.prop = prop;
    }
    get value() {
      return THREE.MathUtils.radToDeg(this.obj[this.prop]);
    }
    set value(v) {
      this.obj[this.prop] = THREE.MathUtils.degToRad(v);
    }
  }

  function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
    folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
    folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
    folder.open();
  }

  const timeSettings = {
    mode: 'Day'  // or 'Night'
  };
  
  const dayGUI = new GUI();
  dayGUI.domElement.style.marginRight = '300px';
  dayGUI.add(timeSettings, 'mode', ['Day', 'Night']).name('Time of Day').onChange((mode) => {
    const isDay = mode === 'Day';
  
    // Sun and Directional Light
    sunLight.visible = isDay;
    light.visible = isDay;
    helper.visible = isDay;
  
    // Moon light (very dim for night)
    moonLight.visible = !isDay;
    moonLight.intensity = isDay ? 0 : 0.05;
    moonSphere.visible = !isDay;
  
    // Spot Light
    spotLight.visible = isDay;
    spotHelper.visible = isDay;
  
    // RectAreaLights
    rectLight1.visible = isDay;
    rectLight2.visible = isDay;
    rectLight3.visible = isDay;
    rectHelper1.visible = isDay;
    rectHelper2.visible = isDay;
    rectHelper3.visible = isDay;
  
    // Bloom strength for lighting mood
    bloomPass.strength = isDay ? 0.2 : 0.05;
  });
  
  

  const color = 0xFFFFFF;
  const skyColor = 0xB1E1FF;  // light blue
  const groundColor = 0xB97A20; 
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 10, 0);
  light.target.position.set(-5, 0, 0);
  scene.add(light);
  scene.add(light.target);
  const helper = new THREE.DirectionalLightHelper(light);
  scene.add(helper);

  const spotIntensity = 150;
  const spotLight = new THREE.SpotLight(color, spotIntensity);
  scene.add(spotLight);
  scene.add(spotLight.target);
  const spotHelper = new THREE.SpotLightHelper(spotLight);
  scene.add(spotHelper);
  

  function updateLight() {

    light.target.updateMatrixWorld();
    helper.update();

  }
  updateLight();

  const spotGui = new GUI();
  spotGui.domElement.style.marginTop = '320px'; // move it below the previous GUI
  spotGui.domElement.style.marginRight = '-10px';
  const spotLightFolder = spotGui.addFolder('Spotlight Controls');
  const spotParams = {
    visible: true,
  };
  spotLight.visible = true;
  spotLightFolder.add(spotParams, 'visible').name('Spotlight On/Off').onChange((val) => {
    spotLight.visible = val;
    spotHelper.visible = val;
  });
  spotLightFolder.addColor(new ColorGUIHelper(spotLight, 'color'), 'value').name('Color');
  spotLightFolder.add(spotLight, 'intensity', 0, 5, 0.01).name('Intensity');
  spotLightFolder.add(spotLight.target.position, 'x', -10, 10).name('Target X');
  spotLightFolder.add(spotLight.target.position, 'y', 0, 10).name('Target Y');
  spotLightFolder.add(spotLight.target.position, 'z', -10, 10).name('Target Z');
  spotLightFolder.add(new DegRadHelper(spotLight, 'angle'), 'value', 0, 90).name('Angle').onChange(updateLight);
  spotLightFolder.add(spotLight, 'penumbra', 0, 1, 0.01).name('Penumbra');
  makeXYZGUI(spotLightFolder, spotLight.position, 'Position', updateLight);
  makeXYZGUI(spotLightFolder, spotLight.target.position, 'Target', updateLight);


  const gui = new GUI();
  gui.domElement.style.marginRight = '-10px';
  const dirFolder = gui.addFolder('Directional Light Controls');
  gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('Color');
  dirFolder.add(light, 'intensity', 0, 5, 0.01).name('Intensity');
  makeXYZGUI(dirFolder, light.position, 'Position', updateLight);
  makeXYZGUI(dirFolder, light.target.position, 'Target', updateLight);


  const rectLight1 = new THREE.RectAreaLight(0xff0000, 5, 4, 10);
  rectLight1.position.set(-5, 5, 5);
  rectLight1.lookAt(0, 2, 0);  // Aim the light at your object
  scene.add(rectLight1);

  const rectLight2 = new THREE.RectAreaLight(0x00ff00, 5, 4, 10);
  rectLight2.position.set(0, 5, 5);
  rectLight2.lookAt(0, 2, 0);
  scene.add(rectLight2);

  const rectLight3 = new THREE.RectAreaLight(0x0000ff, 5, 4, 10);
  rectLight3.position.set(5, 5, 5);
  rectLight3.lookAt(0, 2, 0);
  scene.add(rectLight3);

  // Helpers (optional)
  const rectHelper1 = new RectAreaLightHelper(rectLight1);
  const rectHelper2 = new RectAreaLightHelper(rectLight2);
  const rectHelper3 = new RectAreaLightHelper(rectLight3);
  scene.add(rectHelper1, rectHelper2, rectHelper3);

  const rectGUI = new GUI();
  rectGUI.domElement.style.marginTop = '600px'; // Position it below others
  rectGUI.domElement.style.marginRight = '1200px';

  const rectFolder = rectGUI.addFolder('RectArea Lights');

  const rectParams = {
    redVisible: true,
    greenVisible: true,
    blueVisible: true,
  };

  function updateRectHelpers() {
    rectHelper1.update();
    rectHelper2.update();
    rectHelper3.update();
  }

  // Red light controls
  rectFolder.add(rectParams, 'redVisible').name('Red Light On/Off').onChange((val) => {
    rectLight1.visible = val;
    rectHelper1.visible = val;
  });
  rectFolder.addColor(new ColorGUIHelper(rectLight1, 'color'), 'value').name('Red Light Color').onChange(updateRectHelpers);

  // Green light controls
  rectFolder.add(rectParams, 'greenVisible').name('Green Light On/Off').onChange((val) => {
    rectLight2.visible = val;
    rectHelper2.visible = val;
  });
  rectFolder.addColor(new ColorGUIHelper(rectLight2, 'color'), 'value').name('Green Light Color').onChange(updateRectHelpers);

  // Blue light controls
  rectFolder.add(rectParams, 'blueVisible').name('Blue Light On/Off').onChange((val) => {
    rectLight3.visible = val;
    rectHelper3.visible = val;
  });
  rectFolder.addColor(new ColorGUIHelper(rectLight3, 'color'), 'value').name('Blue Light Color').onChange(updateRectHelpers);

  rectFolder.open();



  //const light = new THREE.DirectionalLight(0xffffff, 3);
  //light.position.set(-1, 2, 4);
  //scene.add(light);

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const clock = new THREE.Clock(); 


  function animate() {
    frame++;
    const delta = clock.getDelta();
    if (water && water.material && water.material.uniforms && water.material.uniforms.config) {
      water.material.uniforms.config.value.x += 0.01;  // Increment flow offset, tweak speed here
    }
    
    cloud.update(camera, frame);
    //console.log(water);
    controls.update();
    composer.render();
    //renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}
main();


