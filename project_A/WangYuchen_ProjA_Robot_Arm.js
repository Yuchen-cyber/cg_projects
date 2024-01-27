// JointModel.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE_B =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  // Shading calculation to make the arm look three-dimensional
  '  vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));\n' + // Light direction
  '  v_Color = a_Color;\n' +
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
var floatsPerVertex_b = 6;
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
  if (!u_MvpMatrix ) {
    console.log('Failed to get the storage location');
    return;
  }

  // Calculate the view projection matrix
  var viewProjMatrix_b = new Matrix4();
  viewProjMatrix_b.setPerspective(50.0, canvas_b.width / canvas_b.height, 1.0, 100.0);
  viewProjMatrix_b.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  var tick = function() {		    // locally (within main() only), define our 
    // self-calling animation function. 
    requestAnimationFrame(tick, gl_b); // browser callback request; wait
        // til browser is ready to re-draw canvas, then
    timerAll();  				// Update all our time-varying params, and
    draw_b(gl_b, n, viewProjMatrix_b, u_MvpMatrix);  // Draw the robot arm
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

var g_angle2now  =   0.0; 			// init Current rotation angle, in degrees > 0
var g_angle2rate =  64.0;				// init Rotation angle rate, in degrees/second.
var g_angle2brake=	 1.0;				// init Rotation start/stop. 0=stop, 1=full speed.
var g_angle2min  = -30.0;       // init min, max allowed angle, in degrees
var g_angle2max  =  60.0;
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
    g_angle2now += g_angle2rate * g_angle2brake * (elapsedMS * 0.001);
    // apply angle limits:  going above max, or below min? reverse direction!
    // (!CAUTION! if max < min, then these limits do nothing...)
    if((g_angle0now >= g_angle0max && g_angle0rate > 0) || // going over max, or
       (g_angle0now <= g_angle0min && g_angle0rate < 0)  ) // going under min ?
       g_angle0rate *= -1;	// YES: reverse direction.
    if((g_angle1now >= g_angle1max && g_angle1rate > 0) || // going over max, or
       (g_angle1now <= g_angle1min && g_angle1rate < 0) )	 // going under min ?
       g_angle1rate *= -1;	// YES: reverse direction.

    if((g_angle2now >= g_angle2max && g_angle2rate > 0) || // going over max, or
        (g_angle2now <= g_angle2min && g_angle2rate < 0) )	 // going under min ?
        g_angle2rate *= -1;	// YES: reverse direction.


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
    if(g_angle2min > g_angle2max)
    {
      if(     g_angle2now < -180.0) g_angle2now += 360.0;	// go to >= -180.0 or
      else if(g_angle2now >  180.0) g_angle2now -= 360.0;	// go to <= +180.0
    }

  }

function initVertexBuffers_b(gl_b) {
  var ctrColr = new Float32Array([0.930, 0.605, 0.843]);	// pink
	var topColr = new Float32Array([0.628, 0.910, 0.854]);	// blue
	var botColr = new Float32Array([0.940, 0.913, 0.620]); //yellow

  var vertices = new Float32Array([
    // Front face
    1.5, 10.0, 1.5,ctrColr[0], ctrColr[1], ctrColr[2], -1.5, 10.0, 1.5, topColr[0], topColr[1], topColr[2], -1.5, 0.0, 1.5,botColr[0], botColr[1], botColr[2], // Triangle 1
    1.5, 10.0, 1.5, ctrColr[0], ctrColr[1], ctrColr[2], -1.5, 0.0, 1.5,botColr[0], botColr[1], botColr[2],  1.5, 0.0, 1.5,  topColr[0], topColr[1], topColr[2], // Triangle 2

    // Right face
    1.5, 10.0, 1.5, ctrColr[0], ctrColr[1], ctrColr[2], 1.5, 0.0, 1.5, topColr[0], topColr[1], topColr[2], 1.5, 0.0, -1.5, botColr[0], botColr[1], botColr[2], // Triangle 1
    1.5, 10.0, 1.5, ctrColr[0], ctrColr[1], ctrColr[2], 1.5, 0.0, -1.5, botColr[0], botColr[1], botColr[2],  1.5, 10.0, -1.5,topColr[0], topColr[1], topColr[2], // Triangle 2

    // Up face
    1.5, 10.0, 1.5, ctrColr[0], ctrColr[1], ctrColr[2], 1.5, 10.0,-1.5, topColr[0], topColr[1], topColr[2],-1.5, 10.0, -1.5,botColr[0], botColr[1], botColr[2],// Triangle 1
    1.5, 10.0, 1.5, ctrColr[0], ctrColr[1], ctrColr[2], -1.5, 10.0, -1.5,botColr[0], botColr[1], botColr[2],-1.5, 10.0, 1.5, topColr[0], topColr[1], topColr[2],// Triangle 2

    // Left face
    -1.5, 10.0, 1.5, ctrColr[0], ctrColr[1], ctrColr[2],-1.5, 10.0,-1.5,topColr[0], topColr[1], topColr[2], -1.5,  0.0,-1.5, botColr[0], botColr[1], botColr[2], // Triangle 1
    -1.5, 10.0, 1.5, ctrColr[0], ctrColr[1], ctrColr[2],-1.5,  0.0,-1.5, botColr[0], botColr[1], botColr[2], -1.5,  0.0, 1.5, topColr[0], topColr[1], topColr[2],// Triangle 2

    // Down face
    -1.5,  0.0,-1.5, ctrColr[0], ctrColr[1], ctrColr[2], 1.5,  0.0,-1.5, topColr[0], topColr[1], topColr[2], 1.5,  0.0, 1.5,  botColr[0], botColr[1], botColr[2], // Triangle 1
    -1.5,  0.0,-1.5, ctrColr[0], ctrColr[1], ctrColr[2],1.5,  0.0, 1.5, botColr[0], botColr[1], botColr[2], -1.5,  0.0, 1.5,topColr[0], topColr[1], topColr[2],  // Triangle 2

    // Back face
    1.5, 0.0, -1.5,ctrColr[0], ctrColr[1], ctrColr[2],-1.5, 0.0, -1.5,topColr[0], topColr[1], topColr[2], -1.5, 10.0, -1.5,botColr[0], botColr[1], botColr[2], // Triangle 1
    1.5, 0.0, -1.5,ctrColr[0], ctrColr[1], ctrColr[2],  -1.5, 10.0, -1.5,botColr[0], botColr[1], botColr[2], 1.5, 10.0, -1.5,topColr[0], topColr[1], topColr[2]// Triangle 2
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
  


  var shapeBufferHandle = gl_b.createBuffer();  
	if (!shapeBufferHandle) {
	console.log('Failed to create the shape buffer object');
	return false;
	}
  // Bind the the buffer object to target:
	gl_b.bindBuffer(gl_b.ARRAY_BUFFER, shapeBufferHandle);
	// Transfer data from Javascript array colorShapes to Graphics system VBO
	// (Use sparingly--may be slow if you transfer large shapes stored in files)
	gl_b.bufferData(gl_b.ARRAY_BUFFER, vertices, gl_b.STATIC_DRAW);
  var a_Position = gl_b.getAttribLocation(gl_b.program, 'a_Position');
	if (a_Position < 0) {
	console.log('Failed to get the storage location of a_Position');
	return -1;
	}
  var FSIZE = vertices.BYTES_PER_ELEMENT; // how many bytes per stored value?

	// Use handle to specify how to retrieve **POSITION** data from our VBO:
	gl_b.vertexAttribPointer(
			a_Position, 	// choose Vertex Shader attribute to fill with data
			3, 						// how many values? 1,2,3 or 4.  (we're using x,y,z,w)
			gl_b.FLOAT, 		// data type for each value: usually gl_b.FLOAT
			false, 				// did we supply fixed-point data AND it needs normalizing?
			FSIZE * 6, // Stride -- how many bytes used to store each vertex?
										// (x,y,z,w, r,g,b) * bytes/value
			0);						// Offset -- now many bytes from START of buffer to the
										// value we will actually use?
	gl_b.enableVertexAttribArray(a_Position);  
										// Enable assignment of vertex buffer object's position data

	// Get graphics system's handle for our Vertex Shader's color-input variable;
	var a_Color = gl_b.getAttribLocation(gl_b.program, 'a_Color');
	if(a_Color < 0) {
	console.log('Failed to get the storage location of a_Color');
	return -1;
	}
	// Use handle to specify how to retrieve **COLOR** data from our VBO:
	gl_b.vertexAttribPointer(
		a_Color, 				// choose Vertex Shader attribute to fill with data
		3, 							// how many values? 1,2,3 or 4. (we're using R,G,B)
		gl_b.FLOAT, 			// data type for each value: usually gl_b.FLOAT
		false, 					// did we supply fixed-point data AND it needs normalizing?
		FSIZE * 6, 			// Stride -- how many bytes used to store each vertex?
										// (x,y,z,w, r,g,b) * bytes/value
		FSIZE * 3);			// Offset -- how many bytes from START of buffer to the
										// value we will actually use?  Need to skip over x,y,z,w
										
	gl_b.enableVertexAttribArray(a_Color);  
										// Enable assignment of vertex buffer object's position data

	//--------------------------------DONE!
	// Unbind the buffer object 
	gl_b.bindBuffer(gl_b.ARRAY_BUFFER, null);
  var n = vertices.length / 6;
  return n;
}
function initArrayBufferForLaterUse(gl_b, data, num, type){
  var buffer = gl_b.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl_b.bindBuffer(gl_b.ARRAY_BUFFER, buffer);
  gl_b.bufferData(gl_b.ARRAY_BUFFER, data, gl_b.STATIC_DRAW);

  // Store the necessary information to assign the object to the attribute variable later
  buffer.num = num;
  buffer.type = type;

  return buffer;
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

function draw_b(gl_b, n, viewProjMatrix_b, u_MvpMatrix) {
  // Clear color and depth buffer
  gl_b.clear(gl_b.COLOR_BUFFER_BIT | gl_b.DEPTH_BUFFER_BIT);
  // Draw a base
  var baseHeight = 2.0;
  g_modelMatrix_b.setTranslate(0.0, -12.0, 0.0);
  pushMatrix(g_modelMatrix_b);
  g_modelMatrix_b.scale(2.5, 0.1, 2.5); // Make it a little thicker
  drawBox(gl_b, n,viewProjMatrix_b,u_MvpMatrix);
  
  // Arm1
  var arm1Length = 10.0; // Length of arm1
  g_modelMatrix_b.setTranslate(0.0, -12.0, 0.0);
  g_modelMatrix_b.rotate(g_angle0now, 0.0, 1.0, 0.0);    // Rotate around the y-axis
  drawBox(gl_b, n, viewProjMatrix_b, u_MvpMatrix); // Draw

  // Arm2
  g_modelMatrix_b.translate(0.0, arm1Length, 0.0); 　　　// Move to joint1
  g_modelMatrix_b.rotate(g_angle1now, 0.0, 0.0, 1.0);  // Rotate around the z-axis
  g_modelMatrix_b.scale(1.3, 1.0, 1.3); // Make it a little thicker
  drawBox(gl_b, n, viewProjMatrix_b, u_MvpMatrix); // Draw

  pushMatrix(g_modelMatrix_b);
  //Tongs1
  g_modelMatrix_b.translate(0, arm1Length,1.0);
  g_modelMatrix_b.rotate(g_angle2now, 1.0, 0.0, 0.0);  // Rotate around the x-axis
  g_modelMatrix_b.scale(0.3, 0.2, 0.3); // Make it a little thicker
  drawBox(gl_b, n, viewProjMatrix_b,  u_MvpMatrix);
  g_modelMatrix_b = popMatrix();
  //Tongs1
  g_modelMatrix_b.translate(0, arm1Length,-1.0);
  g_modelMatrix_b.rotate(-g_angle2now, 1.0, 0.0, 0.0);  // Rotate around the x-axis
  g_modelMatrix_b.scale(0.3, 0.2, 0.3); // Make it a little thicker
  drawBox(gl_b, n, viewProjMatrix_b,  u_MvpMatrix);
}


// Draw the cube
function drawBox(gl_b, n, viewProjMatrix_b, u_MvpMatrix) {
  // Calculate the model view project matrix and pass it to u_MvpMatrix
  g_mvpMatrix.set(viewProjMatrix_b);
  g_mvpMatrix.multiply(g_modelMatrix_b);
  gl_b.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);

  // Draw
  gl_b.drawArrays(gl_b.TRIANGLES, 0,n);
  // gl_b.drawElements(gl_b.TRIANGLES, n, gl_b.UNSIGNED_BYTE, 0);

  // gl_b.drawArrays(gl_b.TRIANGLES, 2, 36/floatsPerVertex_b);
}

function angleSubmit() {

  var UsrTxt = document.getElementById('usrAngle').value;	
  
  var angle = parseFloat(UsrTxt);
  if (angle <= g_angle1max && angle >= g_angle1min){
    g_angle1now = parseFloat(UsrTxt);     
    document.getElementById('EditBoxOut').innerHTML ='You Typed: '+UsrTxt;
  }else{
    document.getElementById('EditBoxOut').innerHTML ='Sorry, exceed the range of this angle';
  }
  
};

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
      document.getElementById("A0button").value="Angle 0 ON";
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
      document.getElementById("A1button").value="Angle 1 ON";
    }
  }

  function A2_runStop() {
    //==============================================================================
      if(g_angle2brake > 0.5)	// if running,
      {
        g_angle2brake = 0.0;	// stop, and change button label:
        document.getElementById("A2button").value="Angle 2 OFF";
      }
      else 
      {
        g_angle2brake = 1.0;	// Otherwise, go.
        document.getElementById("A2button").value="Angle 2 ON";
      }
    }