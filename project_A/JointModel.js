// JointModel.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE_B =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  // Shading calculation to make the arm look three-dimensional
  '  vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));\n' + // Light direction
  '  vec4 color = vec4(1.0, 0.4, 0.0, 1.0);\n' +
  '  vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
  '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
  '  v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE_B =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

var g_lastMS = Date.now();	
function main_b() {
  // Retrieve <canvas> element
  var canvas_b = document.getElementById('assemblies');
  console.log("success");

  // Get the rendering context for WebGL
  var gl_b = getWebGLContext(canvas_b);
  if (!gl_b) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl_b, VSHADER_SOURCE_B, FSHADER_SOURCE_B)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex information
  var n = initVertexBuffers_b(gl_b);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl_b.clearColor(0.0, 0.0, 0.0, 1.0);
  gl_b.enable(gl_b.DEPTH_TEST);

  // Get the storage locations of uniform variables
  var u_MvpMatrix = gl_b.getUniformLocation(gl_b.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl_b.getUniformLocation(gl_b.program, 'u_NormalMatrix');
  if (!u_MvpMatrix || !u_NormalMatrix) {
    console.log('Failed to get the storage location');
    return;
  }

  // Calculate the view projection matrix
  var viewProjMatrix_b = new Matrix4();
  viewProjMatrix_b.setPerspective(50.0, canvas_b.width / canvas_b.height, 1.0, 100.0);
  viewProjMatrix_b.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  // Register the event handler to be called when keys are pressed
  document.onkeydown = function(ev){ keydown(ev, gl_b, n, viewProjMatrix_b, u_MvpMatrix, u_NormalMatrix); };
  var tick = function() {		    // locally (within main() only), define our 
    // self-calling animation function. 
    requestAnimationFrame(tick, gl_b); // browser callback request; wait
        // til browser is ready to re-draw canvas, then
    timerAll();  				// Update all our time-varying params, and
    draw_b(gl_b, n, viewProjMatrix_b, u_MvpMatrix, u_NormalMatrix);  // Draw the robot arm
  };
  //------------------------------------
  tick(); 
  
}

var ANGLE_STEP_B = 3.0;    // The increments of rotation angle (degrees)
var g_angle0now  =   0.0;       // init Current rotation angle, in degrees
var g_angle0rate = -22.0;       // init Rotation angle rate, in degrees/second.
var g_angle0brake=	 1.0;				// init Speed control; 0=stop, 1=full speed.
var g_angle0min  =-140.0;       // init min, max allowed angle, in degrees.
var g_angle0max  =  40.0;
                                //---------------
var g_angle1now  =   0.0; 			// init Current rotation angle, in degrees > 0
var g_angle1rate =  64.0;				// init Rotation angle rate, in degrees/second.
var g_angle1brake=	 1.0;				// init Rotation start/stop. 0=stop, 1=full speed.
var g_angle1min  = -80.0;       // init min, max allowed angle, in degrees
var g_angle1max  =  80.0;
function timerAll() {
  //=============================================================================
  // Find new values for all time-varying parameters used for on-screen drawing.
  // HINT: this is ugly, repetive code!  Could you write a better version?
  // 			 would it make sense to create a 'timer' or 'animator' class? Hmmmm...
  //
    // use local variables to find the elapsed time:
    var nowMS = Date.now();             // current time (in milliseconds)
    var elapsedMS = nowMS - g_lastMS;   // 
    g_lastMS = nowMS;                   // update for next webGL drawing.
    if(elapsedMS > 1000.0) {            
      // Browsers won't re-draw 'canvas' element that isn't visible on-screen 
      // (user chose a different browser tab, etc.); when users make the browser
      // window visible again our resulting 'elapsedMS' value has gotten HUGE.
      // Instead of allowing a HUGE change in all our time-dependent parameters,
      // let's pretend that only a nominal 1/30th second passed:
      elapsedMS = 1000.0/30.0;
      }
    // Find new time-dependent parameters using the current or elapsed time:
    g_angle0now += g_angle0rate * g_angle0brake * (elapsedMS * 0.001);	// update.
    g_angle1now += g_angle1rate * g_angle1brake * (elapsedMS * 0.001);
    // apply angle limits:  going above max, or below min? reverse direction!
    // (!CAUTION! if max < min, then these limits do nothing...)
    if((g_angle0now >= g_angle0max && g_angle0rate > 0) || // going over max, or
       (g_angle0now <= g_angle0min && g_angle0rate < 0)  ) // going under min ?
       g_angle0rate *= -1;	// YES: reverse direction.
    if((g_angle1now >= g_angle1max && g_angle1rate > 0) || // going over max, or
       (g_angle1now <= g_angle1min && g_angle1rate < 0) )	 // going under min ?
       g_angle1rate *= -1;	// YES: reverse direction.


    // *NO* limits? Don't let angles go to infinity! cycle within -180 to +180.
    if(g_angle0min > g_angle0max)	
    {// if min and max don't limit the angle, then
      if(     g_angle0now < -180.0) g_angle0now += 360.0;	// go to >= -180.0 or
      else if(g_angle0now >  180.0) g_angle0now -= 360.0;	// go to <= +180.0
    }
    if(g_angle1min > g_angle1max)
    {
      if(     g_angle1now < -180.0) g_angle1now += 360.0;	// go to >= -180.0 or
      else if(g_angle1now >  180.0) g_angle1now -= 360.0;	// go to <= +180.0
    }

  }
function keydown(ev, gl_b, n, viewProjMatrix_b, u_MvpMatrix, u_NormalMatrix) {
  switch (ev.keyCode) {
    case 38: // Up arrow key -> the positive rotation of joint1 around the z-axis
      if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP_B;
      break;
    case 40: // Down arrow key -> the negative rotation of joint1 around the z-axis
      if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP_B;
      break;
    case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
      g_arm1Angle = (g_arm1Angle + ANGLE_STEP_B) % 360;
      break;
    case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
      g_arm1Angle = (g_arm1Angle - ANGLE_STEP_B) % 360;
      break;
    default: return; // Skip drawing at no effective action
  }
  // Draw the robot arm
  draw_b(gl_b, n, viewProjMatrix_b, u_MvpMatrix, u_NormalMatrix);
}

function initVertexBuffers_b(gl_b) {
  // Vertex coordinates（a cuboid 3.0 in width, 10.0 in height, and 3.0 in length with its origin at the center of its bottom)
  var vertices = new Float32Array([
    1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5,  0.0, 1.5,  1.5,  0.0, 1.5, // v0-v1-v2-v3 front
    1.5, 10.0, 1.5,  1.5,  0.0, 1.5,  1.5,  0.0,-1.5,  1.5, 10.0,-1.5, // v0-v3-v4-v5 right
    1.5, 10.0, 1.5,  1.5, 10.0,-1.5, -1.5, 10.0,-1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
   -1.5, 10.0, 1.5, -1.5, 10.0,-1.5, -1.5,  0.0,-1.5, -1.5,  0.0, 1.5, // v1-v6-v7-v2 left
   -1.5,  0.0,-1.5,  1.5,  0.0,-1.5,  1.5,  0.0, 1.5, -1.5,  0.0, 1.5, // v7-v4-v3-v2 down
    1.5,  0.0,-1.5, -1.5,  0.0,-1.5, -1.5, 10.0,-1.5,  1.5, 10.0,-1.5  // v4-v7-v6-v5 back
  ]);

  // Normal
  var normals = new Float32Array([
    0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
  ]);

  // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

  // Write the vertex property to buffers (coordinates and normals)
  if (!initArrayBuffer_b(gl_b, 'a_Position', vertices, gl_b.FLOAT, 3)) return -1;
  if (!initArrayBuffer_b(gl_b, 'a_Normal', normals, gl_b.FLOAT, 3)) return -1;

  // Unbind the buffer object
  gl_b.bindBuffer(gl_b.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  var indexBuffer = gl_b.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl_b.bindBuffer(gl_b.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl_b.bufferData(gl_b.ELEMENT_ARRAY_BUFFER, indices, gl_b.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer_b(gl_b, attribute, data, type, num) {
  // Create a buffer object
  var buffer = gl_b.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl_b.bindBuffer(gl_b.ARRAY_BUFFER, buffer);
  gl_b.bufferData(gl_b.ARRAY_BUFFER, data, gl_b.STATIC_DRAW);

  // Assign the buffer object to the attribute variable
  var a_attribute = gl_b.getAttribLocation(gl_b.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl_b.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl_b.enableVertexAttribArray(a_attribute);

  return true;
}

// Coordinate transformation matrix
var g_modelMatrix_b = new Matrix4(), g_mvpMatrix = new Matrix4();

function draw_b(gl_b, n, viewProjMatrix_b, u_MvpMatrix, u_NormalMatrix) {
  // Clear color and depth buffer
  gl_b.clear(gl_b.COLOR_BUFFER_BIT | gl_b.DEPTH_BUFFER_BIT);

  // Arm1
  var arm1Length = 10.0; // Length of arm1
  g_modelMatrix_b.setTranslate(0.0, -12.0, 0.0);
  g_modelMatrix_b.rotate(g_angle0now, 0.0, 1.0, 0.0);    // Rotate around the y-axis
  drawBox(gl_b, n, viewProjMatrix_b, u_MvpMatrix, u_NormalMatrix); // Draw

  // Arm2
  g_modelMatrix_b.translate(0.0, arm1Length, 0.0); 　　　// Move to joint1
  g_modelMatrix_b.rotate(g_angle1now, 0.0, 0.0, 1.0);  // Rotate around the z-axis
  g_modelMatrix_b.scale(1.3, 1.0, 1.3); // Make it a little thicker
  drawBox(gl_b, n, viewProjMatrix_b, u_MvpMatrix, u_NormalMatrix); // Draw
}

var g_normalMatrix = new Matrix4(); // Coordinate transformation matrix for normals

// Draw the cube
function drawBox(gl_b, n, viewProjMatrix_b, u_MvpMatrix, u_NormalMatrix) {
  // Calculate the model view project matrix and pass it to u_MvpMatrix
  g_mvpMatrix.set(viewProjMatrix_b);
  g_mvpMatrix.multiply(g_modelMatrix_b);
  gl_b.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
  // Calculate the normal transformation matrix and pass it to u_NormalMatrix
  g_normalMatrix.setInverseOf(g_modelMatrix_b);
  g_normalMatrix.transpose();
  gl_b.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
  // Draw
  gl_b.drawElements(gl_b.TRIANGLES, n, gl_b.UNSIGNED_BYTE, 0);
}

function A0_runStop() {
  //==============================================================================
    if(g_angle0brake > 0.5)	// if running,
    {
      g_angle0brake = 0.0;	// stop, and change button label:
      document.getElementById("A0button").value="Angle 0 OFF";
    }
    else 
    {
      g_angle0brake = 1.0;	// Otherwise, go.
      document.getElementById("A0button").value="Angle 0 ON-";
    }
  }
  
  function A1_runStop() {
  //==============================================================================
    if(g_angle1brake > 0.5)	// if running,
    {
      g_angle1brake = 0.0;	// stop, and change button label:
      document.getElementById("A1button").value="Angle 1 OFF";
    }
    else 
    {
      g_angle1brake = 1.0;	// Otherwise, go.
      document.getElementById("A1button").value="Angle 1 ON-";
    }
  }
