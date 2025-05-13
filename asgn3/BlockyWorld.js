

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    //gl_Position = a_Position;
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1; 
  uniform sampler2D u_Sampler2; 
  uniform sampler2D u_Sampler3; 
  uniform sampler2D u_Sampler4; 
  uniform int u_whichTexture;
  void main() {
    if(u_whichTexture == -2) {
        gl_FragColor = u_FragColor; // Use color
    } else if(u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0, 1.0); // Use UV debug color
    } else if(u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV); // Use texture 0
    } else if(u_whichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV); // tecyure 1
    } else if(u_whichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV); // tecxture 2
    } else if(u_whichTexture == 3) {
        gl_FragColor = texture2D(u_Sampler3, v_UV); // tecxture 3
    } else if(u_whichTexture == 4) {
        gl_FragColor = texture2D(u_Sampler4, v_UV); // tecxture 4
    } else {
        gl_FragColor = vec4(1, .2, .2, 1); // Error, put reddish
    }
    
  }`;

// Global Variables
let canvas;
let gl;
let a_UV;
let a_Position;
let u_FragColor;
let u_Size;
let g_rainbowMode = false;
let g_rainbowHue = 0;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  space: false,
  shift: false
};
//let door = new Door();

// Set up canvas and gl variables
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");
  console.log("canvas:", canvas);
  if (!canvas) {
    console.log("Canvas not found!");
    return;
  }
  if (!window.WebGLRenderingContext) {
    console.log("WebGL is not supported by your browser.");
  }

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {
    preserveDrawingBuffer: false, // Don't preserve drawing buffer
    antialias: false, // Disable antialiasing for better performance
    depth: true,
    stencil: false,
    alpha: false // Disable alpha for better performance
  });
  console.log(gl);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
}

function hslToRgb(h, s, l) {
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
  else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
  else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
  else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
  else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
  else if (300 <= h && h < 360) [r, g, b] = [c, 0, x];

  return [r + m, g + m, b + m];
}


// Set up GLSL shader programs and connect GLSL variables
function connectVariablesToGLSL() {
    console.log("GL at connectVariablesToGLSL:", gl);
    console.log("Vertex Shader Source:", VSHADER_SOURCE);
    console.log("Fragment Shader Source:", FSHADER_SOURCE);
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }


  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0) {
    console.log('Failed to create the storage location of u_Sampler0');
    return false;
  }

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if(!u_Sampler1) {
    console.log('Failed to create the storage location of u_Sampler1');
    return false;
  }

  // Get the storage location of u_Sampler2
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if(!u_Sampler2) {
    console.log('Failed to create the storage location of u_Sampler2');
    return false;
  }

  // Get the storage location of u_Sampler3
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if(!u_Sampler3) {
    console.log('Failed to create the storage location of u_Sampler3');
    return false;
  }

  // Get the storage location of u_Sampler4
  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if(!u_Sampler4) {
    console.log('Failed to create the storage location of u_Sampler4');
    return false;
  }

  gl.uniform1i(u_Sampler0, 0); // Texture unit 0
  gl.uniform1i(u_Sampler1, 1); // Texture unit 1
  gl.uniform1i(u_Sampler2, 2); // Texture unit 2
  gl.uniform1i(u_Sampler3, 3); // Texture unit 3
  gl.uniform1i(u_Sampler4, 4); // Texture unit 4

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if(!u_whichTexture) {
    console.log('Failed to create the storage location of u_whichTexture');
    return false;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor=[1.0, 1.0, 1.0, 1.0];
let g_selectedSize=5;
let g_selectedType = POINT;
let g_selectedSegments = 10;
let g_globalAngle = 0;
let g_globalAngleX = 0; // pitch
let g_globalAngleY = 0; // yaw
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_bodyAngle = 0;
let g_headAngle = 0;
let g_topBeakAngle = 0;
let g_topBeakPosition = 0;
let g_bottomBeakAngle = 0;
let g_leftWingAngle = 0;
let g_rightWingAngle = 0;
let g_leftLegAngle = 0;
let g_leftFootAngle = 0;
let g_rightLegAngle = 0;
let g_rightFootAngle = 0;
let g_bottomBeakPosition = 0;
let g_bodyJumpPosition = 0;
let g_eggPopPosition = 3;
let g_leftFootPos = 0;
let g_rightFootPos = 0;
let g_headPos = 0;
let g_leftEyeSqueeze = 0;
let g_rightEyeSqueeze = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_headAnimation = false;
let g_beakAnimation = false;
let g_bodyJumpAnimation = false;
let g_eggPopAnimation = false;

let g_mouseLastX = null;
let g_mouseLastY = null;
let g_isDragging = false;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

  // Size Slider Event
  //document.getElementById('angleSlide').addEventListener('mouseup', function() { g_globalAngle = this.value; renderAllShapes();});
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes();});
  // Segment Slider Event
  //document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value;});
}
let imageName;
/*function initTextures(imageName) {                            
    var image = new Image(); // Create an image object
    if(!image) {
        console.log('Failed to create the image object');
        return false;
    }
    // Register the event handler to be called on loading an image
    image.onload = function(){ sendTextureToTEXTURE0(image); };
    // Tell the browser to load an image
    image.src = imageName;//'sky.jpg';

    // Add more texture loading
    return true;
}*/

function isPowerOfTwo(value) {
  return (value & (value - 1)) === 0 && value !== 0;
}

function isImagePowerOfTwo(image) {
  return isPowerOfTwo(image.width) && isPowerOfTwo(image.height);
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

function sendTextureToTEXTURE0(image) {
    var texture = gl.createTexture(); // Create a texture object
    if(!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);
    
    //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
    console.log('finished loadTexture');
}



var stats = new Stats();

let g_animationRunning = false;
let g_animationStartTime = 0;

function startAnimation() {
  if (!g_animationRunning) {
    g_animationRunning = true;
    g_animationStartTime = performance.now() / 1000;
    requestAnimationFrame(tick);
  }
}
const projMat = new Matrix4();
const viewMat = new Matrix4();
const modelMatrix = new Matrix4();
let generated = false;
let mouseDelta = { x: 0, y: 0 };
let mouseDown = false;
const doorPivot = new Vector3([0, 1.4, -1]);

function rayIntersectsAABB(origin, dir, min, max) {
  let tmin = (min.x - origin.x) / dir.x;
  let tmax = (max.x - origin.x) / dir.x;
  if (tmin > tmax) [tmin, tmax] = [tmax, tmin];

  let tymin = (min.y - origin.y) / dir.y;
  let tymax = (max.y - origin.y) / dir.y;
  if (tymin > tymax) [tymin, tymax] = [tymax, tymin];

  if ((tmin > tymax) || (tymin > tmax)) return false;
  if (tymin > tmin) tmin = tymin;
  if (tymax < tmax) tmax = tymax;

  let tzmin = (min.z - origin.z) / dir.z;
  let tzmax = (max.z - origin.z) / dir.z;
  if (tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];

  if ((tmin > tzmax) || (tzmin > tmax)) return false;
  return true;
}

function main() {
    // Set up canvas and gl variables

    // move panel to right side instead of left
    // cuz our canvas will be covered
    stats.dom.style.left = "auto";
    stats.dom.style.right = "0";
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);
    setupWebGL();
    if (!gl) {
        console.error("WebGL context (gl) is null after setupWebGL(). Aborting.");
        return;
    }
    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    //projMat.setPerspective(60, canvas.width/canvas.height, 1, 100); // Changed near plane to 1
    //gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
    
    // Set up view matrix (simpler camera)
    //viewMat.setLookAt(0, 0, 5,  // eye position
    //                  0, 0, 0,  // look at center
    //                  0, 1, 0); // up vector
    //gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
    
    // Initialize global rotation to identity
    
    //console.log("Model Matrix:", modelMatrix.elements);
    


    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();
    document.onkeydown = keydown;
    /*document.addEventListener('keydown', function(e) {
      if (e.key === 'w') g_camera.forward();
      else if (e.key === 's') g_camera.back();
      else if (e.key === 'a') g_camera.left();
      else if (e.key === 'd') g_camera.right();
  });*/

    initTextures("lucas-carl-PQfuavIwNGM-unsplash.jpg", 0); // sky
    initTextures("tiles_0059_color_1k.jpg", 1); // black and white tiles
    initTextures("slab_tiles_diff_4k.jpg", 2);
    initTextures("worn_patterned_pavers_diff_4k.jpg", 3);
    initTextures("wood_0048_color_1k.jpg", 4);
    
    //drawMap();

    // Register function (event handler) to be called on a mouse press
    //canvas.onmousedown = click;
    //canvas.onmousemove = click;
    //canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

    let lastMouseX, lastMouseY;
    let isFirstMouse = true;



    // 2) Click handler

        
    
    //canvas.addEventListener("click", () => {
    //  canvas.requestPointerLock();
    //});
    /*canvas.addEventListener("mousemove", (event) => {
        if (document.pointerLockElement !== canvas) return;

        if (isFirstMouse) {
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            isFirstMouse = false;
            return;
        }

        let offsetX = event.clientX - lastMouseX;
        let offsetY = event.clientY - lastMouseY;

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;

        g_camera.processMouseMovement(offsetX, offsetY);
    });*/
    
    canvas.onclick = function(ev) {
        if (ev.shiftKey) {
        startAnimation();
        }
    };

    canvas.addEventListener("mousedown", function () {
      mouseDown = true;
    });
    
    canvas.addEventListener("mouseup", function () {
      mouseDown = false;
    });
    
    canvas.addEventListener("mouseleave", function () {
      mouseDown = false; // stop rotating if cursor leaves canvas
    });

    canvas.onmousedown = function(ev) {
        g_isDragging = true;
        g_mouseLastX = ev.clientX;
        g_mouseLastY = ev.clientY;
    };

    canvas.onmousemove = function(event) {
      if (mouseDown) {
        let dx = event.movementX;
        let dy = event.movementY;
        g_globalAngleY += dx * 0.5;  // adjust sensitivity as needed
        g_globalAngleX += dy * 0.5;
    
        // Clamp X to avoid flipping over (optional)
        g_globalAngleX = Math.max(-90, Math.min(90, g_globalAngleX));
      }
    }
    
    canvas.onmouseup = function(ev) {
        g_isDragging = false;
    };
    



    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    //gl.clear(gl.COLOR_BUFFER_BIT);
    //renderAllShapes();

    requestAnimationFrame(tick);
    
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

// Called by browser repeatedly whenever it's time
function tick() {
  // Print some debug info so we know we are running
  g_seconds = performance.now()/1000.0-g_startTime;
  //console.log(g_seconds);
  stats.begin();

  if (g_headAnimation || g_beakAnimation || g_bodyJumpAnimation || g_eggPopAnimation) {
    updateAnimationAngles();
  }


  //door.update(g_seconds);

  //handleInput(g_seconds); // ← THIS is where you call it
  // Draw everything
  renderAllShapes();

  // Tell browser to update again when it has time
  stats.end();
  requestAnimationFrame(tick);
}


var g_eggs = []; 
var g_eggStartTime = 0; // Time when egg popping starts
var g_lastEggTime = 0;
function updateAnimationAngles() {
  /*if (g_yellowAnimation) {
    g_yellowAngle = (45*Math.sin(g_seconds));
  }

  if(g_magentaAnimation) {
    g_magentaAngle = (45*Math.sin(3*g_seconds));
  }*/

  if(g_headAnimation) {
    g_bodyAngle = (45*Math.sin(3*g_seconds));
  }
  if(g_beakAnimation) {
    //g_topBeakAngle = (45*Math.sin(2*g_seconds));
    g_topBeakAngle = Math.min(0, 45*Math.sin(3*g_seconds));
    //g_topBeakPosition = -Math.sin(2*g_seconds)/3;
    g_topBeakPosition = Math.max(0, -Math.sin(3*g_seconds)/4);

    //g_bottomBeakAngle = -(45*Math.sin(2*g_seconds));
    g_bottomBeakAngle = Math.max(0, -(45 * Math.sin(3 * g_seconds)));
    //g_bottomBeakPosition = -Math.sin(2*g_seconds)/10;
    g_bottomBeakPosition = Math.max(0, -Math.sin(3*g_seconds)/5);
  }
  if(g_bodyJumpAnimation) {
    let damping = 1; // Lower damping for slower decay
    let frequency = 20.0; // Lower frequency for slower jumps
    let amplitude = 0.3;  // Jump height
    
    // Use modulo to create a repeating cycle every 4 seconds
    let cycleTime = g_seconds % 4.0;
    
    // Calculate decaying amplitude for each cycle
    let decayingAmplitude = amplitude * Math.exp(-damping * cycleTime);

    /*let eggDamping = 1.5;
    let eggFreq = 8.0;
    let eggAmp = 0.5;
    if(g_eggStartTime === 0) {
      g_eggStartTime = g_seconds;
    }
    if(g_seconds - g_lastEggTime > 1.5) {
      g_lastEggTime = g_seconds;
      
      // Add new egg with its own start time
      g_eggs.push({
        startTime: g_seconds,
        baseX: Math.random() * 0.4 - 0.2, // Random x offset (-0.2 to 0.2)
        baseZ: Math.random() * 0.2 - 0.1  // Random z offset (-0.1 to 0.1)
      });
    }
    
    // Update all existing eggs
    for(let i = 0; i < g_eggs.length; i++) {
      let egg = g_eggs[i];
      let eggLifeTime = g_seconds - egg.startTime;
      console.log("Egg Life Time", eggLifeTime);
      
      // Calculate decaying amplitude for this egg
      let eDecayingAmplitude = eggAmp * Math.exp(-eggDamping * eggLifeTime);
      
      // Store the pop position for rendering
      egg.popPosition = eDecayingAmplitude * Math.sin(eggFreq * eggLifeTime);
    }*/
    //let eDecayingAmplitude = amplitude * Math.exp(damping * cycleTime);
    
    g_leftWingAngle = /*Math.max(0,-45 * Math.sin(5* cycleTime));*/Math.max(0, 5*decayingAmplitude * 45*Math.sin(frequency * cycleTime));
    g_rightWingAngle = /*-g_leftWingAngle/100;*/-Math.min(0, -5*decayingAmplitude * 45*Math.sin(frequency * cycleTime));
    // Calculate jump position with damping
    g_bodyJumpPosition = decayingAmplitude * Math.sin(frequency * cycleTime);

    //g_eggPopPosition = eDecayingAmplitude * Math.sin(frequency * cycleTime);
    //g_leftWingAngle = 5*decayingAmplitude * 45*Math.sin(frequency * cycleTime);
    
    //let damping = 5.0; // Increase for faster damping
    //let frequency = 20.0; 
    //let amplitude = 20.0;  // Adjust this if you want more/less intensity in the jump motion
    //let decayingAmplitude = amplitude * Math.exp(-damping * g_seconds);
    
    // Smooth out the oscillation with a more controlled damping factor and frequencyg_bodyJumpPosition = amplitude * /*Math.max(0, */Math.exp(-damping * g_seconds) * Math.sin(frequency * g_seconds);//);
    
    //g_bodyJumpPosition = decayingAmplitude * Math.sin(frequency * g_seconds);//);
    
    //g_bodyJumpPosition = Math.max(0, (Math.E^g_seconds/100)*-Math.sin(3*g_seconds)/4);
    //console.log(g_bodyJumpPosition)
    //if (Math.abs(g_bodyJumpPosition) < 0.01) {
    //  g_seconds = 0;  // Reset the time to restart the oscillation
    //}
    
    //if (Math.abs(g_bodyJumpPosition) < 0.01 && decayingAmplitude < 0.1) {
      // Keep `g_seconds` counting without resetting it completely. Slowly reintroduce the jump
    //  g_seconds += 0.05; // Increase this increment if you want a faster restart, or slow it down
    //} else {
    //  g_seconds += 0.01; // Normal increment to continue the oscillation
    //}
    //g_bodyJumpPosition = amplitude * /*Math.max(0, */Math.exp(-damping * g_seconds) * Math.sin(frequency * g_seconds);//);
    //g_bodyJumpPosition = amplitude * /*Math.max(0, */Math.exp(damping * g_seconds)/100 * Math.sin(frequency * g_seconds);//);
    //console.log(`Position: ${g_bodyJumpPosition}, Time: ${g_seconds}`);
    //renderAll
  /*} else {
    // Reset when animation is turned off
    g_eggStartTime = 0;
    g_lastEggTime = 0;
  }*/
  } 
  if (g_eggPopAnimation) {
    let damping = 0.8; // Slower damping
    let frequency = 4.0; // Slower oscillation
    let popDistance = -3.0; // Distance to pop down (to y = -3)
    
    // Spawn new egg every 2 seconds
    if(g_seconds - g_lastEggTime > 2.0) {
      g_lastEggTime = g_seconds;
      g_eggs.push({
        startTime: g_seconds,
        startY: -3, // Start at chicken position
        targetY: 0.0 // Pop down to this position
      });
    }

    // Update all eggs
    for(let i = 0; i < g_eggs.length; i++) {
      let egg = g_eggs[i];
      let elapsed = g_seconds - egg.startTime;
      
      // Damped oscillation from startY to targetY
      let progress = 1 - Math.exp(-damping * elapsed);
      let oscillation = Math.sin(frequency * elapsed) * Math.exp(-damping * elapsed);
      
      g_eggPopPosition = egg.startY + (egg.targetY - egg.startY) * progress + oscillation * 0.5;
    }
  } 
  if(g_animationRunning) {
    let elapsed = (performance.now() / 1000) - g_animationStartTime;
    g_leftLegAngle = Math.max(0, 45*Math.sin(5*elapsed));
    g_rightLegAngle = Math.max(0, 45*Math.cos(5*elapsed));
    g_leftFootAngle = -Math.max(0, 45*Math.sin(5*elapsed));
    g_rightFootAngle = -Math.max(0, 45*Math.cos(5*elapsed));
    g_leftFootPos = Math.max(0, Math.sin(5*elapsed));
    g_rightFootPos = Math.max(0, Math.cos(5*elapsed));
    g_leftEyeSqueeze = Math.max(0, Math.sin(5*elapsed));
    g_rightEyeSqueeze = Math.max(0, Math.cos(5*elapsed));
    g_headAngle = Math.max(0, 45*Math.sin(5*elapsed));
    g_headPos = Math.max(0, 45*Math.sin(5*elapsed));
    if(elapsed > 0.9) {
      g_animationRunning = false;
    }
  }
}

var g_eye=[0,0,3];
var g_at=[0,0,-100];
var g_up=[0,1,0]

var g_camera=new Camera();
console.log("G-camera x: " + g_camera.eye.elements[2]);

var g_map = [
[1,1,1,1,1,1,1,1],
[1,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,1],
[1,0,0,1,1,0,0,1],
[1,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,1],
[1,0,0,0,1,0,0,1],
[1,0,0,0,0,0,0,1]
];
// add collision detection

function handleInput(deltaTime) {
  let moveSpeed = g_camera.speed * deltaTime;

  if (keys.w) g_camera.forward(moveSpeed);
  if (keys.s) g_camera.back(moveSpeed);
  if (keys.a) g_camera.left(moveSpeed);
  if (keys.d) g_camera.right(moveSpeed);
}


function keydown(ev) {
  if(ev.keyCode == 68) { // The right arrow key was pressed
      //g_camera.eye.elements[0] += 0.2;
      g_camera.right();
      //g_camera.moveRight();
  } else
  if (ev.keyCode == 65) { // The left arrow key was pressed
    //g_camera.eye.elements[0] -= 0.2;
    g_camera.left();
    //g_camera.moveLeft();
  } else // w
  if (ev.keyCode == 87) {
    g_camera.forward();
  } else // s
  if (ev.keyCode == 83) {
    g_camera.back();
  } else // q
  if (ev.keyCode == 81) {
    g_camera.panLeft(10);
  } else // e
  if (ev.keyCode == 69) {
    g_camera.panRight(10);
  }
  renderAllShapes();
  console.log(ev.keyCode);
}

function drawMap() {
    for(x=0;x<32;++x) {
        for(y=0;y<32;++y) {
            if(x <1 || x == 31 || y == 0 || y == 31) {
            //if(g_map[x][y] == 1) {
                var t = new Cube();
                t.textureNum = -5;
                t.color = [0.8, 1.0, 1.0, 1.0];
                t.matrix.translate(0, -.75, 0);
                t.matrix.scale(0.3,0.3,0.3);
                t.matrix.translate(x-16, 0, y-16);
                //console.log("in drawmap()");
                //t.render();
                t.renderfaster();
            }
        }
    }
}
let randomCubes = [];
function generateRandomMap() {
  randomCubes = []; // clear before generating new ones
  for (let x = 0; x < 12; ++x) {
      for (let y = 0; y < 12; ++y) {
          if (x < 1 || x === 31 || y === 0 || y === 31) continue;
          if (Math.random() < 0.3) {
              const cube = new Cube();
              cube.textureNum = Math.floor(Math.random() * 3) + 2;;//2 + Math.floor(Math.random() * 3);
              console.log("texture num: " + cube.textureNum);
              cube.color = [0.5 + 0.5 * Math.random(), 0.5 + 0.5 * Math.random(), 0.5 + 0.5 * Math.random(), 1.0];
              cube.matrix.translate(0, -0.75, 0);
              cube.matrix.scale(0.3, 0.3, 0.3);
              cube.matrix.translate(x - 16, 0, y - 16);
              randomCubes.push(cube); // store it
          }
      }
  }
}

//var reusableMatrix = new Matrix4();
//Draw every shape that is supposed to be in the canvas
function renderAllShapes() {
  // Check the time at the start of this function
    var startTime = performance.now();

    // Pass the projection matrix
    var projMat = new Matrix4();
    projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    // Pass the view matrix
    var viewMat = new Matrix4();
    //console.log(g_camera.eye.x);
    //viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]); //  eye, at, up
    viewMat.setLookAt(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2], g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2], g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]); //  eye, at, up
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // Pass the matrix to a u_ModelMatrix attribute
    var globalRotMat = new Matrix4()
    .rotate(g_globalAngleX, 1, 0, 0)  // pitch (up/down)
    .rotate(g_globalAngleY, 0, 1, 0); // yaw (left/right)
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var floor = new Cube();
    floor.color = [1, 0, 0, 1];
    floor.textureNum = 1;
    floor.matrix.translate(0, -.75, 0);
    floor.matrix.scale(10, 0, 10);
    floor.matrix.translate(-.5, 0, -0.5);
    floor.render();

    gl.depthMask(false);            // Don't write to depth buffer
    gl.disable(gl.CULL_FACE);  

    var sky = new Cube();
    sky.color = [1.0, 0, 0, 1];
    sky.textureNum = 0;
    //sky.matrix.scale(50,50,50);
    sky.matrix.setIdentity();
    sky.matrix.translate(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);  // move to camera
    sky.matrix.scale(50, 50, 50);
    sky.matrix.translate(-.5, -.5, -.5);
    //sky.matrix.translate(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
    sky.render();

    //gl.enable(gl.CULL_FACE);
    gl.depthMask(true);            // Re-enable depth writes

    var testCube = new Cube();
    testCube.color = [1, 0, 0, 1];
    testCube.textureNum = 0;
    testCube.matrix.translate(-.25, -.75, 0);
    testCube.matrix.rotate(-5, 1, 0, 0);
    testCube.matrix.scale(0.5, .3, .5);
    //testCube.matrix.translate(-.5, 0, -2);
    testCube.render();

    var body = new Cube();
    var bodyMat = new Matrix4(body.matrix);
    body.color = [1.0, 1.0, 0.0, 1.0];
    body.matrix.setTranslate(0, -0.5, 0);
    body.matrix.rotate(-5, 1, 0, 0);
    body.matrix.rotate(-g_yellowAngle, 0, 0, 1);
    body.matrix.scale(0.25, 0.7, 0.5);
    body.matrix.translate(-.5, 0, 0);
    body.render();
    // Draw a left arm

    var magenta = new Cube();
    magenta.color = [1, 0, 1, 1];
    magenta.textureNum = 2;
    magenta.matrix = bodyMat;
    magenta.matrix.translate(0, 0.21, 0.0);
    magenta.matrix.rotate(g_magentaAngle, 0, 0, 1);
    magenta.matrix.scale(0.3, .3, .3);
    magenta.matrix.translate(-.5, 0, -0.001);
    magenta.render();

    //randomCubes.push(door);
    // Test box
    var doorT = new Cube();
    doorT.color = [1, 0, 1, 1];
    doorT.textureNum = 4;
    doorT.matrix.translate(0, 1.4, -1);
    doorT.matrix.rotate(-90, 0, 0);
    doorT.matrix.scale(2,.1,1);
    doorT.render();
    randomCubes.push(doorT);

    drawMap();
    for (const cube of randomCubes) {
      cube.renderfaster();
    }
    if (!generated) {
      generateRandomMap();
      generated = true;
    }
    //generateRandomMap();
    //box.matrix.translate(-.1, .1, 0, 0);
    //box.matrix.rotate(-30, 1, 0, 0);
    //box.matrix.scale(.2, .4, .2);
    //box.render();

    // Check the time at the end of the function, and show on web page
    var duration = performance.now() - startTime;
    //sendTextToHTML("numdot:" + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10 + " numdot");
}


var g_shapesList = [];

/* var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = [];  // The array to store the size of a point */
function click(ev) {
  /* var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2); */

  // Extract the event click and return it in WebGL coordinates
  let [x, y] = convertCoordinatesEventToGL(ev);

  // Create and store the new point
  let point;
  if(g_selectedType==POINT) {
    point = new Point();
  } else if(g_selectedType==TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position = [x, y];
  //point.color = g_selectedColor.slice();
  if (g_rainbowMode) { // awesomeness!
    // Convert HSL to RGB with varying hue
    const hue = g_rainbowHue % 360;
    const rgb = hslToRgb(hue, 1.0, 0.5);
    point.color = [...rgb, 1.0]; // Add alpha
    g_rainbowHue += 20; // Next shape gets a different hue
  } else {
    point.color = g_selectedColor.slice();
  }
  
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // Store the coordinates to g_points array
  //g_points.push([x, y]);

  // Store the color to g_colors array
  //g_colors.push(g_selectedColor.slice());
//  g_colors.push([g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]]);

  // Store the coordinates to g_points array
  /* if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  } */

  // Store the size to the g_sizes array
  //g_sizes.push(g_selectedSize);

  //Draw every shape that is supposed to be in the canvas
  renderAllShapes();

}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return -1;
  }
  htmlElm.innerHTML = text;
}