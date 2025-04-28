

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let g_rainbowMode = false;
let g_rainbowHue = 0;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

// Set up canvas and gl variables
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true,
    depth: true, // Ensure depth buffer is used
    stencil: true,
    alpha: false,
    antialias: true });
    //console.log(gl);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  
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
  // Button Events (Shape Type)
  //document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0] };
  //document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0] };
  //document.getElementById('rainbowButton').onclick = function() { g_rainbowMode = true;};  
  //document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes();};

  //ocument.getElementById('animationYellowOnButton').onclick = function() { g_yellowAnimation = true;};
  //document.getElementById('animationYellowOffButton').onclick = function() { g_yellowAnimation = false;};

  //document.getElementById('animationMagentaOnButton').onclick = function() { g_magentaAnimation = true;};
  //document.getElementById('animationMagentaOffButton').onclick = function() { g_magentaAnimation = false;};

  document.getElementById('animationHeadOnButton').onclick = function() { g_headAnimation = true;};
  document.getElementById('animationHeadOffButton').onclick = function() { g_headAnimation = false;};

  document.getElementById('animationBeakOnButton').onclick = function() { g_beakAnimation = true;};
  document.getElementById('animationBeakOffButton').onclick = function() { g_beakAnimation = false;};

  document.getElementById('animationJumpOnButton').onclick = function() { g_bodyJumpAnimation = true; g_eggPopAnimation =  true;};
  document.getElementById('animationJumpOffButton').onclick = function() { g_bodyJumpAnimation = false; g_eggPopAnimation =  false;};

  //document.getElementById('pointButton').onclick = function() { g_selectedType = POINT;};
  //document.getElementById('triButton').onclick = function() { g_selectedType = TRIANGLE;};
  //document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE;};

  // Color Slider Events
  //document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; g_rainbowMode = false;});
  //document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; g_rainbowMode = false;});
  //document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; g_rainbowMode = false;});
  //document.getElementById('yellowSlide').addEventListener('mousemove', function(){g_yellowAngle = this.value; renderAllShapes();});

  //document.getElementById('magentaSlide').addEventListener('mousemove', function(){g_magentaAngle = this.value; renderAllShapes();});

  document.getElementById('headSlide').addEventListener('mousemove', function(){g_bodyAngle = this.value; renderAllShapes();});

  document.getElementById('topBeakSlide').addEventListener('mousemove', function(){g_topBeakAngle = this.value; g_topBeakPosition = -this.value/200; renderAllShapes();});

  document.getElementById('bottomBeakSlide').addEventListener('mousemove', function(){g_bottomBeakAngle = this.value; g_bottomBeakPosition = this.value/200; renderAllShapes();});


  // Size Slider Event
  //document.getElementById('angleSlide').addEventListener('mouseup', function() { g_globalAngle = this.value; renderAllShapes();});
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes();});
  // Segment Slider Event
  //document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value;});
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


function main() {
  // Set up canvas and gl variables

  // move panel to right side instead of left
  // cuz our canvas will be covered
  stats.dom.style.left = "auto";
  stats.dom.style.right = "0";
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);
  setupWebGL();

  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown = click;
  //canvas.onmousemove = click;
  //canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
  
  canvas.onclick = function(ev) {
    if (ev.shiftKey) {
      startAnimation();
    }
  };

  canvas.onmousedown = function(ev) {
    g_isDragging = true;
    g_mouseLastX = ev.clientX;
    g_mouseLastY = ev.clientY;
  };
  
  canvas.onmouseup = function(ev) {
    g_isDragging = false;
  };
  
  canvas.onmousemove = function(ev) {
    if (g_isDragging) {
      let deltaX = ev.clientX - g_mouseLastX;
      g_globalAngle += deltaX * 0.5;  // 0.5 is sensitivity, adjust as you like
      g_mouseLastX = ev.clientX;
      g_mouseLastY = ev.clientY;
  
      renderAllShapes();  // You need to redraw after updating the angle
    }
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

  updateAnimationAngles();

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
//var reusableMatrix = new Matrix4();
//Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the matrix to a u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //gl.clear(gl.COLOR_BUFFER_BIT);

  //var len = g_points.length;
  //var len = g_shapesList.length;
  //for(var i = 0; i < len; i++) {
  //  g_shapesList[i].render(); // polymorphism
  //}

  // Draw a test triangle
  //drawTriangle3D([-1.0, 0.0, 0.0,  -0.5, -1.0, 0.0,  0.0, 0.0, 0.0]);

  // Draw a cube
  var head = new Cube();
  head.color = [1.0, 1.0, 1.0, 1.0];
  //head.matrix.rotate(0, 1, 0, 0);
  head.matrix.rotate(g_bodyAngle, 1, 0, 0);
  //head.matrix.rotate(g_headAngle, 0, 0, 1);
  head.matrix.translate(-0.2, 0, 0.0);
  head.matrix.translate(0, g_bodyJumpPosition, 0);
  head.matrix.scale(0.5, .6, .3);
  var headMat = new Matrix4(head.matrix);
  //head.matrix.rotate(g_headAngle, 0, 0, 1); 
  //head.matrix.translate(0+g_headPos/200, 0-g_headPos/100, 0.0);
  head.render();
  //headMat.rotate(g_headAngle, 0, 0, 1);

  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0, 1.0);
  var topBeak = new Cube();
  topBeak.matrix = new Matrix4(headMat);
  topBeak.color = [0.6588, 0.502, 0.2157, 1];
  topBeak.matrix.translate(-0.005, 0.5, -0.3);
  topBeak.matrix.translate(0, g_topBeakPosition, -0.1);
  topBeak.matrix.rotate(0, 1, 0, 0);
  topBeak.matrix.rotate(-g_topBeakAngle, 1, 0, 0);
  //box.matrix.rotate(g_magentaAngle, 0, 0, 1);
  topBeak.matrix.scale(1.01, .17, .4);
  //topBeak.matrix.rotate(g_headAngle, 0, 0, 1); 
  //topBeak.matrix.translate(0+g_headPos/200, 0-g_headPos/100, 0.0)
  topBeak.render();
  gl.disable(gl.POLYGON_OFFSET_FILL);

  var bottomBeak = new Cube();
  bottomBeak.matrix = new Matrix4(headMat);
  bottomBeak.color = [0.522, 0.384, 0.1765, 1];
  bottomBeak.matrix.translate(0, 0.35, -0.3);
  bottomBeak.matrix.translate(0, -g_bottomBeakPosition, -0.1);
  bottomBeak.matrix.rotate(0, 1, 0, 0);
  bottomBeak.matrix.rotate(-g_bottomBeakAngle, 1, 0, 0);
  bottomBeak.matrix.scale(1, 0.16, 0.4);
  bottomBeak.render();

  var wattle = new Cube();
  wattle.matrix = new Matrix4(headMat);
  wattle.color = [0.8745, 0.0039, 0, 1];
  wattle.matrix.translate(0.3, 0, -0.2);
  wattle.matrix.rotate(0, 1, 0, 0);
  wattle.matrix.scale(0.4, 0.35, 0.2);
  wattle.render();

  var leftEye = new Cube();
  leftEye.matrix = new Matrix4(headMat);
  leftEye.color = [0, 0, 0, 1];
  leftEye.matrix.translate(0, 0.67+g_leftEyeSqueeze/10, -0.1);
  //leftEye.matrix.rotate(0, 1, 0, 0);
  leftEye.matrix.scale(0.2, 0.17-g_leftEyeSqueeze/10, 0.1);
  leftEye.render();

  var rightEye = new Cube();
  rightEye.matrix = new Matrix4(headMat);
  rightEye.color = [0, 0, 0, 1];
  rightEye.matrix.translate(0.8, 0.67+g_leftEyeSqueeze/10, -0.1);
  rightEye.matrix.rotate(0, 1, 0, 0);
  rightEye.matrix.scale(0.2, 0.17-g_leftEyeSqueeze/10, 0.1);
  rightEye.render();

  var body = new Cube();
  body.matrix = new Matrix4(headMat);
  body.color = [1.0, 1.0, 1.0, 1.0];
  body.matrix.translate(-0.2, -0.6, 0.7);
  body.matrix.scale(1.4, 1, 1.9);
  body.render();

  var leftWing = new Cube();
  leftWing.matrix = new Matrix4(headMat);
  leftWing.color = [1.0, 1.0, 1.0, 1.0];
  leftWing.matrix.translate(-0.35, -0.3, 1);
  leftWing.matrix.scale(0.15, 0.7, 1.3);
  leftWing.matrix.rotate(-g_leftWingAngle, 0, 1, 0);
  leftWing.render();

  var rightWing = new Cube();
  rightWing.matrix = new Matrix4(headMat);
  rightWing.color = [1.0, 1.0, 1.0, 1.0];
  rightWing.matrix.translate(1.2, -0.3, 1);
  rightWing.matrix.scale(0.15, 0.7, 1.3);
  rightWing.matrix.rotate(0, 1, 0, 0);
  rightWing.matrix.rotate(g_rightWingAngle, 0, 1, 0);
  rightWing.render();

  var leftLeg = new Cube();
  leftLeg.matrix = new Matrix4(headMat);
  leftLeg.color = [0.5, 0.4, 0.2, 1];
  leftLeg.matrix.scale(0.19, 0.4, 0.27);
  leftLeg.matrix.translate(1,-2.5, 5);
  leftLeg.matrix.rotate(-g_leftLegAngle, 1,0, 0);
  leftLeg.render();

  var rightLeg = new Cube();
  rightLeg.matrix = new Matrix4(headMat);
  rightLeg.color = [0.5, 0.4, 0.2, 1];
  rightLeg.matrix.scale(0.19, 0.4, 0.27);
  rightLeg.matrix.translate(3,-2.5, 5);
  rightLeg.matrix.rotate(-g_rightLegAngle, 1,0, 0);
  rightLeg.render();

  var leftFoot = new Cube();
  leftFoot.matrix = new Matrix4(headMat);
  leftFoot.color = [0.5, 0.4, 0.2, 1]
  leftFoot.matrix.scale(0.19, 0.16, 0.6);
  leftFoot.matrix.translate(1,-6.3, 1.7+g_leftFootPos);
  leftFoot.matrix.rotate(g_leftFootAngle, 1,0, 0);
  leftFoot.render();


  var rightFoot = new Cube();
  rightFoot.matrix = new Matrix4(headMat);
  rightFoot.color = [0.5, 0.4, 0.2, 1]
  rightFoot.matrix.scale(0.19, 0.16, 0.6);
  rightFoot.matrix.translate(3,-6.3, 1.7+g_rightFootPos);
  rightFoot.matrix.rotate(g_rightFootAngle, 1,0, 0);
  rightFoot.render();

  var egg = new Egg();
  egg.matrix = new Matrix4(headMat);
  egg.color = [1, 1, 1, 1];
  egg.matrix.scale(0.4, 0.4, 0.7);
  //egg.matrix.translate
  egg.matrix.translate(1.2, -g_eggPopPosition-4, 3);
  egg.render();
  

  // adding animation where chicken opens its mouth, button to feed it. 
  // seeds get thrown at the chicken. it closes and opens the mouth at decreasing
  // amounts and starts flapping its wings. 

  // super slow
  // find a way to improve efficiency. don't know if camera angle works
  var s = new Sphere()//Lily();
  s.color = [0.651, 0.518, 0.851, 1.0];
  s.matrix.translate(0, .4, 0.0);
  //s.matrix.skewX(30);
  //let theta = 30 * Math.PI / 180;
  //let shear = shearMatrix(Math.tan(theta)); // shXY = tan(30°)
  //s.matrix = s.matrix.multiply(shear);
  //s.matrix.rotate(1, 1, 0, 0);
  //s.matrix.scale(0.7, .5, 0.7);
  //s.render();

  // Draw a left arm
  var leftArm = new Cube();
  leftArm.color = [1, 1, 0, 1];
  leftArm.matrix.setTranslate(0, -.5, 0.0);
  leftArm.matrix.rotate(-5, 1, 0, 0);
  leftArm.matrix.rotate(g_yellowAngle, 0, 0, 1);
  //leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  //if(g_yellowAnimation) {
  //  leftArm.matrix.rotate(45*Math.sin(g_seconds), 0, 0, 1);
  //} else {
  //  leftArm.matrix.rotate(g_yellowAngle, 0, 0, 1);
  //}

  var yellowCoordinatesMat = new Matrix4(leftArm.matrix);
  leftArm.matrix.scale(0.25, .7, .5);
  leftArm.matrix.translate(-.5, 0, 0);
  //leftArm.render();

  // Test box
  var box = new Cube();
  box.color = [1, 0, 1, 1];
  box.matrix = yellowCoordinatesMat;
  box.matrix.translate(0, 0.65, 0);
  box.matrix.rotate(g_magentaAngle, 0, 0, 1);
  box.matrix.scale(.3,.3,.3);
  box.matrix.translate(-.5, 0, -0.001);
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

