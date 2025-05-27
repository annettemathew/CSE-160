// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos; 
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_NormalMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    //v_Normal = a_Normal;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));
    v_VertPos = u_ModelMatrix * a_Position; // transforming a_Position from object space to world space. 
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1; 
  uniform sampler2D u_Sampler2; 
  uniform sampler2D u_Sampler3; 
  uniform sampler2D u_Sampler4; 
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  uniform vec3 u_spotDirection; // spotlight direction (should be normalized)
  uniform float u_spotCutoff;   // cosine of cutoff angle, e.g., cos(radians(20.0))
  uniform float u_spotExponent; // controls beam concentration (e.g. 15.0)

  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  uniform bool u_spotLightOn;
  
  void main() {
    if(u_whichTexture == -3) {
      //gl_FragColor = vec4(normalize(v_Normal) * 0.5 + 0.5, 1.0);  // visualize normals
      //gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0);
      vec3 normalizedNormal = normalize(v_Normal);
      gl_FragColor = vec4((normalizedNormal + 1.0)/2.0, 1.0);
      
    } else if(u_whichTexture == -2) {
        gl_FragColor = u_FragColor;
    } else if(u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if(u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if(u_whichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if(u_whichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if(u_whichTexture == 3) {
        gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else if(u_whichTexture == 4) {
        gl_FragColor = texture2D(u_Sampler4, v_UV);
    } else {
        gl_FragColor = vec4(1, .2, .2, 1);
    }
    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    
    float spotEffect = 1.0;
    float spotCos = dot(normalize(-L), normalize(u_spotDirection));
    if (spotCos < u_spotCutoff) {
      spotEffect = 0.0;  // outside spotlight cone
    } else {
      spotEffect = pow(spotCos, 10.0); // concentration, tweak exponent as needed
    }
    vec3 k_d = vec3(0.0, 0.0, 1.0);

    // Basic diffuse lighting
    float nDotL = max(dot(N, L), 0.0);
    vec3 diffuse = vec3(gl_FragColor) * nDotL;
    
    // Ambient lighting
    vec3 ambient = vec3(gl_FragColor) * 0.3;
    
    // Specular lighting (only if not normal visualization)
    float specular = 0.0;
    if(nDotL > 0.0) {
        vec3 R = reflect(-L, N);
        vec3 E = normalize(u_cameraPos - vec3(v_VertPos));
        specular = pow(max(dot(E, R), 0.0), 32.0) * 0.3;
    }
    
    // Combine lighting
    // if(u_lightOn) {
    //     gl_FragColor = vec4(ambient + diffuse + vec3(specular), gl_FragColor.a);
    // }
    if (u_lightOn) {
      vec3 totalLighting;

      if (u_spotLightOn) {
        // Spotlight: apply spotlight falloff to diffuse
        totalLighting = ambient + diffuse * spotEffect + vec3(specular) * spotEffect;
      } else {
        // Normal point light (no spotlight effect)
        totalLighting = ambient + diffuse + vec3(specular);
      }

      gl_FragColor = vec4(totalLighting, gl_FragColor.a);
    }
  }`;

var SPOTLIGHT_FSHADER_SOURCE = `
  // precision mediump float;
  // varying vec3 v_Normal;
  // uniform vec3 uLightPosition;
  // uniform vec3 uLightDirection;
  // uniform float uLightInnerCutoff;
  // uniform float uLightOuterCutoff;

  // void main() {
  //   vec3 offset = uLightPosition - vPosition;
  //   vec3 surfToLight = normalize(offset);
  //   vec3 lightToSurf = -surfToLight;

  //   float diffuse = max(0.0, dot(surfToLight, normalize(vNormal)));
  //   float anghortcutleToSurface = dot(uLightDirection, lightToSurf);
  //   float spot = smoothstep(uLightOuterCutoff, uLightInnerCutoff, angleToSurface);

  //   float brightness = diffuse * spot;
  //   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0)* brightness;
  //   gl_FragColor.a = 1.0;
  // }
  precision mediump float;

  varying vec3 v_Normal;
  varying vec3 v_Position;

  uniform vec3 uLightPosition;        // position of spotlight in world space
  uniform vec3 uLightDirection;       // direction spotlight is pointing (normalized)
  uniform float uLightInnerCutoff;    // cos(inner angle)
  uniform float uLightOuterCutoff;    // cos(outer angle)
  uniform bool u_spotLightOn;

  void main() {
    vec3 N = normalize(v_Normal);
    vec3 lightToFrag = v_Position - uLightPosition;
    vec3 L = normalize(-lightToFrag);  // vector from fragment to light
    float diff = max(dot(N, L), 0.0);

    float angleToCenter = dot(normalize(lightToFrag), normalize(uLightDirection));
    float spotFactor = smoothstep(uLightOuterCutoff, uLightInnerCutoff, angleToCenter);

    float brightness = diff * spotFactor;

    // Optional: change base color
    vec3 color = vec3(1.0, 0.8, 0.3);  // warm light color
    if (!u_spotLightOn) {
      brightness = 1.0;
      color = vec3(0.2, 0.2, 0.2);  // fallback base color if spotlight off
    }

    gl_FragColor = vec4(color * brightness, 1.0);
  }


`
//import Model from './Model.js';
// Skybox vertex shader
var SKYBOX_VSHADER_SOURCE = `
  attribute vec4 a_position;
  varying vec4 v_position;
  uniform mat4 u_viewDirectionProjectionInverse;
  
  void main() {
    v_position = u_viewDirectionProjectionInverse * a_position;
    gl_Position = a_position;
  }`;

// Skybox fragment shader
var SKYBOX_FSHADER_SOURCE = `
  precision mediump float;
  uniform samplerCube u_skybox;
  varying vec4 v_position;
  
  void main() {
    vec3 direction = normalize(v_position.xyz / v_position.w);
    gl_FragColor = textureCube(u_skybox, direction);
  }`;

// Global Variables
let canvas;
let gl;
let a_Position, a_UV, a_Normal;
let u_FragColor, u_ModelMatrix, u_GlobalRotateMatrix, u_ViewMatrix, u_ProjectionMatrix, u_NormalMatrix;
let u_Sampler0, u_Sampler1, u_Sampler2, u_Sampler3, u_Sampler4, u_whichTexture, u_lightPos, u_cameraPos, u_lightOn, u_spotLightOn;
let u_spotDirection, u_spotCutoff, u_spotExponent;

// Skybox variables
let skyboxProgram;
let skyboxPositionLocation, skyboxTextureLocation, skyboxViewDirectionProjectionInverseLocation;
let skyboxPositionBuffer;
let cubeMapTexture;

let g_camera = new Camera();
let g_normalOn = false;
let g_lightOn = true;
let g_spotLightOn = 1;
let g_lightPos = [0, 1, -2];
let yaw = 0;
let pitch = 0;
const sensitivity = 0.002;

let randomCubes = [];
let generated = false;

function setupWebGL() {
  canvas = document.getElementById("webgl");
  if (!canvas) {
    console.log("Canvas not found!");
    return;
  }

  gl = canvas.getContext("webgl", {
    preserveDrawingBuffer: false,
    antialias: false,
    depth: true,
    stencil: false,
    alpha: false
  });
  
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
}

function isPowerOfTwo(value) {
  return (value & (value - 1)) === 0;
}

function initSkyboxProgram() {
  skyboxProgram = gl.createProgram();
  
  // Create and compile shaders
  const vs = gl.createShader(gl.VERTEX_SHADER);
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  
  gl.shaderSource(vs, SKYBOX_VSHADER_SOURCE);
  gl.shaderSource(fs, SKYBOX_FSHADER_SOURCE);
  gl.compileShader(vs);
  gl.compileShader(fs);
  
  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    console.error('VS error:', gl.getShaderInfoLog(vs));
  }
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    console.error('FS error:', gl.getShaderInfoLog(fs));
  }
  
  gl.attachShader(skyboxProgram, vs);
  gl.attachShader(skyboxProgram, fs);
  gl.linkProgram(skyboxProgram);
  
  if (!gl.getProgramParameter(skyboxProgram, gl.LINK_STATUS)) {
    console.error('Link error:', gl.getProgramInfoLog(skyboxProgram));
  }
  
  // Get attribute and uniform locations
  skyboxPositionLocation = gl.getAttribLocation(skyboxProgram, "a_position");
  skyboxTextureLocation = gl.getUniformLocation(skyboxProgram, "u_skybox");
  skyboxViewDirectionProjectionInverseLocation = 
    gl.getUniformLocation(skyboxProgram, "u_viewDirectionProjectionInverse");
  
  // Create position buffer (fullscreen quad)
  skyboxPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, skyboxPositionBuffer);
  const positions = new Float32Array([
    -1, -1, 1, 1, -1, 1, -1, 1, 1,
    -1, 1, 1, 1, -1, 1, 1, 1, 1
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}




function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  // Get attribute locations
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.error('Failed to get the storage location of a_Normal');
  }

  // Get uniform locations
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  u_spotLightOn = gl.getUniformLocation(gl.program, 'u_spotLightOn');
  u_spotDirection = gl.getUniformLocation(gl.program, 'u_spotDirection');
  u_spotCutoff = gl.getUniformLocation(gl.program, 'u_spotCutoff');
  u_spotExponent = gl.getUniformLocation(gl.program, 'u_spotExponent');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');

  // Set texture units
  gl.uniform1i(u_Sampler0, 0);
  gl.uniform1i(u_Sampler1, 1);
  gl.uniform1i(u_Sampler2, 2);
  gl.uniform1i(u_Sampler3, 3);
  gl.uniform1i(u_Sampler4, 4);

  // Initialize skybox program
  initSkyboxProgram();
}

function addActionsForHtmlUI() {

  // Size Slider Event
  //document.getElementById('angleSlide').addEventListener('mouseup', function() { g_globalAngle = this.value; renderAllShapes();});
  document.getElementById('normalOn').onclick = function() { g_normalOn = true;console.log(g_normalOn); };
  document.getElementById('normalOff').onclick = function() { g_normalOn = false; };

  document.getElementById('lightOn').onclick = function() { g_lightOn = true; };
  document.getElementById('lightOff').onclick = function() { g_lightOn = false; };

  document.getElementById('spotLightOn').onclick = function() { g_spotLightOn = true; };
  document.getElementById('spotLightOff').onclick = function() { g_spotLightOn = false; };

  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) {g_lightPos[0] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) {g_lightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) {g_lightPos[2] = this.value/100; renderAllShapes();}});
}

function initTextures(imageName, textureUnit, callback) {
  const image = new Image();
  image.onload = function () {
    const texture = sendTextureToTextureUnit(image, textureUnit);

    gl.bindTexture(gl.TEXTURE_2D, texture); // Bind before setting parameters

    if (isPowerOfTwo(image.width) && isPowerOfTwo(image.height)) {
      console.log("✅ Image is power of two");
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      console.log("❌ Image is NOT power of two");
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    if (callback) callback(texture); // Optional callback
  };

  image.src = imageName;
  return true;
}
function sendTextureToTextureUnit(image, textureUnit) {
  const texture = gl.createTexture();
  if (!texture) {
      console.log('Failed to create the texture object');
      return null;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  return texture;
}

function initCubeMapTexture(callback) {
  const faces = [
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: 'right.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: 'left.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: 'top.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: 'bottom.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: 'front.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: 'back.jpg' }
  ];

  const texture = gl.createTexture();
  let loaded = 0;

  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  faces.forEach(({ target, url }) => {
    const image = new Image();
    image.onload = function() {
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); // Changed to false to fix upside-down skybox
      gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      loaded++;
      if (loaded === 6 && callback) {
        callback(texture);
      }
    };
    image.src = url;
  });

  return texture;
}

function generateRandomMap() {
  randomCubes = [];
  for (let x = 0; x < 12; ++x) {
    for (let y = 0; y < 12; ++y) {
      if (x < 1 || x === 11 || y === 0 || y === 11) continue;
      if (Math.random() < 0.3) {
        const cube = new Cube();
        cube.textureNum = Math.floor(Math.random() * 3) + 2;
        cube.color = [0.5 + 0.5 * Math.random(), 0.5 + 0.5 * Math.random(), 0.5 + 0.5 * Math.random(), 1.0];
        cube.matrix.translate(0, -0.75, 0);
        cube.matrix.scale(0.3, 0.3, 0.3);
        cube.matrix.translate(x - 6, 0, y - 6);
        randomCubes.push(cube);
      }
    }
  }
}
//let bunny = null;
function main() {
  setupWebGL();
  if (!gl) {
    console.error("WebGL context (gl) is null after setupWebGL(). Aborting.");
    return;
  }
  
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  const dx = g_camera.at.elements[0] - g_camera.eye.elements[0];
  const dy = g_camera.at.elements[1] - g_camera.eye.elements[1];
  const dz = g_camera.at.elements[2] - g_camera.eye.elements[2];


  // bunny = new Model(gl, "bunny.obj", (model) => {
  //   console.log("🐇 Bunny ready");
  
  //   // Now safe to render in the animation loop
  //   bunny = model;
  // });

  yaw = Math.atan2(dx, dz);
  pitch = Math.asin(dy / Math.sqrt(dx*dx + dy*dy + dz*dz));

  
  // Set up mouse controls
  canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
  });

// In the main() function, replace the mousemove event listener with this:
document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement === canvas) {
    // Reduce sensitivity significantly
    const adjustedSensitivity = sensitivity * 0.2;
    
    // Update yaw and pitch with reduced sensitivity
    yaw += e.movementX * adjustedSensitivity;
    pitch -= e.movementY * adjustedSensitivity;
    
    // Keep pitch within reasonable bounds (-89 to 89 degrees)
    pitch = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, pitch));
    
    // Calculate new camera direction
    const newAtX = Math.cos(pitch) * Math.sin(yaw);
    const newAtY = Math.sin(pitch);
    const newAtZ = Math.cos(pitch) * Math.cos(yaw);
    
    // Update camera target
    g_camera.at.elements[0] = g_camera.eye.elements[0] + newAtX;
    g_camera.at.elements[1] = g_camera.eye.elements[1] + newAtY;
    g_camera.at.elements[2] = g_camera.eye.elements[2] + newAtZ;
    
    // Calculate right vector
    const rightX = Math.sin(yaw - Math.PI/2);
    const rightZ = Math.cos(yaw - Math.PI/2);
    
    // Update up vector to prevent rolling
    g_camera.up.elements[0] = 0;
    g_camera.up.elements[1] = 1;
    g_camera.up.elements[2] = 0;
    

    renderAllShapes();
  }
});

// Also adjust the sensitivity constant at the top of the file to:
const sensitivity = 0.01; // Reduced from 0.002

  document.onkeydown = keydown;
  
  // Load textures
  initTextures("vecteezy_panoramic-sky-with-cloud-on-a-sunny-day_3155086.jpg", 0);
  initTextures("tiles_0059_color_1k.jpg", 1);
  initTextures("slab_tiles_diff_4k.jpg", 2);
  initTextures("worn_patterned_pavers_diff_4k.jpg", 3);
  initTextures("wood_0048_color_1k.jpg", 4);

  // Load cubemap
  initCubeMapTexture(function(tex) {
    cubeMapTexture = tex;
    renderAllShapes();
  });

  requestAnimationFrame(tick);
}
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;
function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  g_lightPos[0] = Math.cos(g_seconds);
}

function keydown(ev) {
  if(ev.keyCode == 68) { // D
    g_camera.right();
  } else if (ev.keyCode == 65) { // A
    g_camera.left();
  } else if (ev.keyCode == 87) { // W
    g_camera.forward();
  } else if (ev.keyCode == 83) { // S
    g_camera.back();
  } else if (ev.keyCode == 81) { // Q
    g_camera.panLeft(10);
  } else if (ev.keyCode == 69) { // E
    g_camera.panRight(10);
  }
  renderAllShapes();
}

function renderAllShapes() {
  // Set up projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(50, canvas.width/canvas.height, 0.1, 100);
  
  // Set up view matrix for regular objects
  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]
  );
  
  // Clear buffers
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // ====== SKYBOX RENDERING ======
  gl.useProgram(skyboxProgram);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);
  
  // Set up skybox view matrix (remove translation)
  var skyboxViewMat = new Matrix4(viewMat);
  skyboxViewMat.elements[12] = 0;
  skyboxViewMat.elements[13] = 0;
  skyboxViewMat.elements[14] = 0;
  
  // Calculate viewDirectionProjectionInverse matrix
  var viewDirectionProjectionMatrix = new Matrix4(projMat).multiply(skyboxViewMat);
  var viewDirectionProjectionInverseMatrix = new Matrix4().setInverseOf(viewDirectionProjectionMatrix);
  
  // Set uniforms
  gl.uniformMatrix4fv(
    skyboxViewDirectionProjectionInverseLocation, 
    false, 
    viewDirectionProjectionInverseMatrix.elements
  );
  
  // Set up attributes
  gl.enableVertexAttribArray(skyboxPositionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, skyboxPositionBuffer);
  gl.vertexAttribPointer(skyboxPositionLocation, 3, gl.FLOAT, false, 0, 0);
  
  // Bind texture
  gl.activeTexture(gl.TEXTURE5);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMapTexture);
  gl.uniform1i(skyboxTextureLocation, 5);
  
  // Draw skybox
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  
  
  
    // ====== REGULAR OBJECT RENDERING ======
  gl.useProgram(gl.program);

  // Configure rendering state based on normal mode
  if (g_normalOn) {
    gl.disable(gl.DEPTH_TEST);  // Disable depth test for normals
    gl.disable(gl.CULL_FACE);   // Must disable face culling for normals!
    gl.uniform1i(u_whichTexture, -3); // Force normal visualization for all
  } else {
    gl.enable(gl.DEPTH_TEST);   // Re-enable depth test
    gl.enable(gl.CULL_FACE);    // Re-enable face culling
    gl.cullFace(gl.BACK);       // Cull back faces
  }

  // Set common uniforms
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, new Matrix4().setIdentity().elements);

  // Render all objects (they'll automatically use normal visualization if g_normalOn is true)
  var floor = new Cube();
  floor.textureNum = 1;//floor.textureNum = g_normalOn ? -3 : 1; // Use texture 1 or normal visualization
  floor.matrix.setIdentity();
  floor.matrix.translate(0, -.75, 0);
  floor.matrix.scale(10, 0, 10);
  floor.matrix.translate(-.5, 0, -0.5);
  floor.render1(); // Use renderNormal for all objects

  if (!generated) {
    generateRandomMap();
    generated = true;
  }
  // Render random cubes
  for (const cube of randomCubes) {
      cube.textureNum = g_normalOn ? -3 : cube.textureNum;
      //cube.render(); // Use renderNormal for all objects
  }

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_spotDirection, 0.0, -1.0, 0.0);
  gl.uniform1f(u_spotCutoff, Math.cos(Math.PI/6));    // 30 degrees
  gl.uniform1f(u_spotExponent, 2.0);



  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]); 

  gl.uniform1i(u_lightOn, g_lightOn);
  
  gl.uniform1i(u_spotLightOn, g_spotLightOn);

  var light = new Cube();
  light.color = [2, 2, 0, 1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.1, -.1, -.1);
  light.matrix.translate(-.5, -.5, -.5);
  light.renderNormal();

  var sphere = new Sphere();
  if (g_normalOn) {
    gl.disable(gl.CULL_FACE);  // Disable culling for normals
    sphere.textureNum = -3;
  } else {
    sphere.normalMatrix.setInverseOf(sphere.matrix).transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, sphere.normalMatrix.elements);
    sphere.textureNum = 4;
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK); 

  }
  sphere.matrix.translate(0.3, 0, 0);
  sphere.matrix.scale(0.5, 0.5, 0.5);
  sphere.render();

  var room = new Cube();
  if (g_normalOn) {
    gl.disable(gl.CULL_FACE);
    room.textureNum = -3;  // Visualize normals
  } else {
    room.textureNum = -2;  // Regular shading
    gl.enable(gl.CULL_FACE);
  }
  room.color = [1, 0.5, 0.5, 1];
  // DO NOT override textureNum here again
  room.matrix.setIdentity();
  room.matrix.translate(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  room.matrix.scale(50, 50, 50);
  room.matrix.translate(-.5, -.5, -.5);

  gl.disable(gl.DEPTH_TEST);
  //room.renderNormal();
  gl.enable(gl.DEPTH_TEST);


// Render character body
  var body = new Cube();
  if (g_normalOn) {
      gl.disable(gl.CULL_FACE);  // Disable culling for normals
      body.textureNum = -3;
  } else {
    body.normalMatrix.setInverseOf(body.matrix).transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, body.normalMatrix.elements);
    body.textureNum = -2;
    gl.enable(gl.CULL_FACE);   // Re-enable culling for regular rendering
  }
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.setIdentity();
  body.matrix.translate(-0.5, -0.5, 0);
  body.matrix.rotate(-5, 1, 0, 0);
  body.matrix.scale(0.25, 0.7, 0.5);
  body.matrix.translate(-.5, 0, 0);
  body.renderNormal();

  // Render character head
  var head = new Cube();
  if (g_normalOn) {
      gl.disable(gl.CULL_FACE);  // Disable culling for normals
      head.textureNum = -3;
  } else {
      head.textureNum = 2;
      gl.enable(gl.CULL_FACE);   // Re-enable culling for regular rendering
  }
  head.matrix.setIdentity();
  head.matrix.translate(-0.5, -0.5, 0);
  head.matrix.rotate(-5, 1, 0, 0);
  head.matrix.scale(0.25, 0.7, 0.5);
  head.matrix.translate(-.5, 0, 0);
  head.matrix.translate(0, 0.21, 0.0);
  head.matrix.scale(0.3/0.25, 0.3/0.7, 0.3/0.5);
  head.matrix.translate(-.5, 0, -0.001);
  head.renderNormal();
  console.log(gl.program.a_Position);
  // In your main() or initialization code:
  let bunny = new Model(gl, "bunny.obj", (model) => {
    console.log("Bunny model ready to render!");
  });

  // In your render loop:
  if (bunny && bunny.initialized) {
    bunny.color = [0.5, 0.8, 1, 1];  // Light blue color
    bunny.matrix.setIdentity();
    bunny.matrix.translate(2, -0.75, 0);  // Position on the floor
    bunny.matrix.rotate(g_seconds * 50, 0, 1, 0); // Rotate over time
    bunny.matrix.scale(0.5, 0.5, 0.5); // Scale down if needed
    //bunny.render(gl.program);
  }
  
  
  // bunny.color = [0.5, 0.8, 1, 1];  // Light blue color
  // bunny.matrix.setIdentity();       // Reset matrix
  // bunny.matrix.translate(2, 0, 0);  // Move to the right of the teapot
  // bunny.matrix.scale(0.5, 0.5, 0.5); // Scale down
  // //bunny.matrix.rotate(time/1000, 0, 1, 0); // Optional: add rotation over time
  // bunny.render(gl, gl.program);
}