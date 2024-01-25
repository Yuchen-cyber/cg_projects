// JointModel.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE_C =
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
var FSHADER_SOURCE_C =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

var g_lastMS_c = Date.now();	
var floatsPerVertex_c = 6;

function main_c() {
  // Retrieve <canvas> element
  var canvas_c = document.getElementById('dog');
  console.log("success");

  // Get the rendering context for WebGL
  var gl_c = getWebGLContext(canvas_c);
  if (!gl_c) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl_c, VSHADER_SOURCE_C, FSHADER_SOURCE_C)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex information
  var n = initVertexBuffers_c(gl_c);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl_c.clearColor(0.0, 0.0, 0.0, 1.0);
  gl_c.enable(gl_c.DEPTH_TEST);

  // Get the storage locations of uniform variables
  var u_MvpMatrix = gl_c.getUniformLocation(gl_c.program, 'u_MvpMatrix');
  if (!u_MvpMatrix ) {
    console.log('Failed to get the storage location');
    return;
  }

  // Calculate the view projection matrix
  var viewProjMatrix_c = new Matrix4();
  viewProjMatrix_c.setPerspective(50.0, canvas_c.width / canvas_c.height, 1.0, 100.0);
  viewProjMatrix_c.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  // Register the event handler to be called when keys are pressed
  document.onkeydown_c = function(ev){ keydown_c(ev, gl_c, n, viewProjMatrix_c, u_MvpMatrix ); };
  var tick_c = function() {		    // locally (within main() only), define our 
    // self-calling animation function. 
    requestAnimationFrame(tick_c, gl_c); // browser callback request; wait
        // til browser is ready to re-draw canvas, then
    timerAll_c();  				// Update all our time-varying params, and
    draw_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix);  // Draw the robot arm
  };

  //------------------------------------
  tick_c(); 
  
}

var ANGLE_STEP_C = 3.0;    // The increments of rotation angle (degrees)
var body_rotate = 0.0;
var g_angle0now_c  =   0.0;       // init Current rotation angle, in degrees
var g_angle0rate_c = -64.0;       // init Rotation angle rate, in degrees/second.
var g_angle0brake=	 1.0;				// init Speed control; 0=stop, 1=full speed.
var g_angle0min_c  =-35.0;       // init min, max allowed angle, in degrees.
var g_angle0max_c  =  35.0;
                                //---------------
var g_angle1now_c  =   0.0; 			// init Current rotation angle, in degrees > 0
var g_angle1rate_c =  64.0;				// init Rotation angle rate, in degrees/second.
var g_angle1brake_c=	 1.0;				// init Rotation start/stop. 0=stop, 1=full speed.
var g_angle1min_c  = -50.0;       // init min, max allowed angle, in degrees
var g_angle1max_c  =  50.0;

var g_angle2now_c  =   0.0; 			// init Current rotation angle, in degrees > 0
var g_angle2rate_c =  64.0;				// init Rotation angle rate, in degrees/second.
var g_angle2brake_c=	 1.0;				// init Rotation start/stop. 0=stop, 1=full speed.
var g_angle2min_c  = -360.0;       // init min, max allowed angle, in degrees
var g_angle2max_c  =  360.0;

var g_angle3now_c  =   0.0; 			// init Current rotation angle, in degrees > 0
var g_angle3rate_c =  64.0;				// init Rotation angle rate, in degrees/second.
var g_angle3brake_c=	 1.0;				// init Rotation start/stop. 0=stop, 1=full speed.
var g_angle3min_c  = -30.0;       // init min, max allowed angle, in degrees
var g_angle3max_c  =  30.0;

var g_angle4now_c  =   0.0; 			// init Current rotation angle, in degrees > 0
var g_angle4rate_c =  64.0;				// init Rotation angle rate, in degrees/second.
var g_angle4brake_c=	 1.0;				// init Rotation start/stop. 0=stop, 1=full speed.
var g_angle4min_c  = 0.0;       // init min, max allowed angle, in degrees
var g_angle4max_c  =  90.0;
//variable for translation
var x_diff_c = 0.5;
var transX_c = 0.0;
var transY_c = 0.0;
var transZ_c = 0.0;
var bodyRot = 180.0;
var state_c = "moving"; // Possible states: "moving", "rotating", "resuming"
var hasRotated_c = false;
function timerAll_c() {
  //=============================================================================
  // Find new values for all time-varying parameters used for on-screen drawing.
  // HINT: this is ugly, repetive code!  Could you write a better version?
  // 			 would it make sense to create a 'timer' or 'animator' class? Hmmmm...
  //
    // use local variables to find the elapsed time:
    var nowMS = Date.now();             // current time (in milliseconds)
    var elapsedMS = nowMS - g_lastMS_c;   // 
    g_lastMS_c = nowMS;                   // update for next webGL drawing.
    if(elapsedMS > 1000.0) {            
      // Browsers won't re-draw 'canvas' element that isn't visible on-screen 
      // (user chose a different browser tab, etc.); when users make the browser
      // window visible again our resulting 'elapsedMS' value has gotten HUGE.
      // Instead of allowing a HUGE change in all our time-dependent parameters,
      // let's pretend that only a nominal 1/30th second passed:
      elapsedMS = 1000.0/30.0;
      }
    // Find new time-dependent parameters using the current or elapsed time:
    g_angle0now_c += g_angle0rate_c * g_angle0brake * (elapsedMS * 0.001);	// update.
    g_angle1now_c += g_angle1rate_c * g_angle1brake_c * (elapsedMS * 0.001);
    g_angle2now_c += g_angle2rate_c * g_angle2brake_c * (elapsedMS * 0.001);
    g_angle3now_c += g_angle3rate_c * g_angle3brake_c * (elapsedMS * 0.001);
    g_angle4now_c += g_angle4rate_c * g_angle4brake_c * (elapsedMS * 0.001);
    // apply angle limits:  going above max, or below min? reverse direction!
    // (!CAUTION! if max < min, then these limits do nothing...)
    if((g_angle0now_c >= g_angle0max_c && g_angle0rate_c > 0) || // going over max, or
       (g_angle0now_c <= g_angle0min_c && g_angle0rate_c < 0)  ) // going under min ?
       g_angle0rate_c *= -1;	// YES: reverse direction.
    if((g_angle1now_c >= g_angle1max_c && g_angle1rate_c > 0) || // going over max, or
       (g_angle1now_c <= g_angle1min_c && g_angle1rate_c < 0) )	 // going under min ?
       g_angle1rate_c *= -1;	// YES: reverse direction.

    if((g_angle2now_c >= g_angle2max_c && g_angle2rate_c > 0) || // going over max, or
        (g_angle2now_c <= g_angle2min_c && g_angle2rate_c < 0) )	 // going under min ?
        g_angle2rate_c *= -1;	// YES: reverse direction.

    if((g_angle3now_c >= g_angle3max_c && g_angle3rate_c > 0) || // going over max, or
    (g_angle3now_c <= g_angle3min_c && g_angle3rate_c < 0) )	 // going under min ?
    g_angle3rate_c *= -1;	// YES: reverse direction.

    if((g_angle4now_c >= g_angle4max_c && g_angle4rate_c > 0) || // going over max, or
    (g_angle4now_c <= g_angle4min_c && g_angle4rate_c < 0) )	 // going under min ?
    g_angle4rate_c *= -1;	// YES: reverse direction.


    // *NO* limits? Don't let angles go to infinity! cycle within -180 to +180.
    if(g_angle0min_c > g_angle0max_c)	
    {// if min and max don't limit the angle, then
      if(     g_angle0now_c < -180.0) g_angle0now_c += 360.0;	// go to >= -180.0 or
      else if(g_angle0now_c >  180.0) g_angle0now_c -= 360.0;	// go to <= +180.0
    }
    if(g_angle1min_c > g_angle1max_c)
    {
      if(     g_angle1now_c < -180.0) g_angle1now_c += 360.0;	// go to >= -180.0 or
      else if(g_angle1now_c >  180.0) g_angle1now_c -= 360.0;	// go to <= +180.0
    }
    if(g_angle2min_c > g_angle2max_c)
    {
      if(     g_angle2now_c < -180.0) g_angle2now_c += 360.0;	// go to >= -180.0 or
      else if(g_angle2now_c >  180.0) g_angle2now_c -= 360.0;	// go to <= +180.0
    }
    if(g_angle3min_c > g_angle3max_c)
    {
      if(     g_angle3now_c < -180.0) g_angle3now_c += 360.0;	// go to >= -180.0 or
      else if(g_angle3now_c >  180.0) g_angle3now_c -= 360.0;	// go to <= +180.0
    }

    //translate
    if (state_c === "moving") {
      x_diff_c=0.5;
      // Continue moving
      transZ_c += x_diff_c;
      if (transZ_c >= 10) {
        // Stop and start rotating
        body_rotate=0;
        hasRotated_c = false;
        state_c = "rotating";
      }
    } else if (state_c === "rotating" && !hasRotated_c) {
      // Rotate
      x_diff_c = 0;
      body_rotate += bodyRot * (elapsedMS * 0.001);
      if(body_rotate >= 360){
        hasRotated_c = true;

        state_c = "moving";

      }
      else if (body_rotate >= 180 && transZ_c >=10) {
        // Finish rotating
        hasRotated_c = true;
        state_c = "resuming";

        
      }

    } else if (state_c === "resuming") {
      // Resume moving in the opposite direction
      x_diff_c = 0.5;
      transZ_c -= x_diff_c;
      if (transZ_c <= -10.5) {
        // Reset for next cycle
        state_c = "rotating";
        hasRotated_c = false;
        // body_rotate = 0;
      }
    }

  }
function keydown_c(ev, gl_c, n, viewProjMatrix_c, u_MvpMatrix) {
  switch (ev.keyCode) {
    case 38: // Up arrow key -> the positive rotation of joint1 around the z-axis
      if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP_C;
      break;
    case 40: // Down arrow key -> the negative rotation of joint1 around the z-axis
      if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP_C;
      break;
    case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
      g_arm1Angle = (g_arm1Angle + ANGLE_STEP_C) % 360;
      break;
    case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
      g_arm1Angle = (g_arm1Angle - ANGLE_STEP_C) % 360;
      break;
    default: return; // Skip drawing at no effective action
  }
  // Draw the robot arm
  draw_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix);
}

function initVertexBuffers_c(gl_c) {
  var ctrColr = new Float32Array([0.930, 0.605, 0.843]);	// pink
	var topColr = new Float32Array([0.628, 0.910, 0.854]);	// blue
	var botColr = new Float32Array([0.940, 0.913, 0.620]); //yellow
  // var vertices = new Float32Array([
  //   1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5,  0.0, 1.5,  1.5,  0.0, 1.5, // v0-v1-v2-v3 front
  //   1.5, 10.0, 1.5,  1.5,  0.0, 1.5,  1.5,  0.0,-1.5,  1.5, 10.0,-1.5, // v0-v3-v4-v5 right
  //   1.5, 10.0, 1.5,  1.5, 10.0,-1.5, -1.5, 10.0,-1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
  //  -1.5, 10.0, 1.5, -1.5, 10.0,-1.5, -1.5,  0.0,-1.5, -1.5,  0.0, 1.5, // v1-v6-v7-v2 left
  //  -1.5,  0.0,-1.5,  1.5,  0.0,-1.5,  1.5,  0.0, 1.5, -1.5,  0.0, 1.5, // v7-v4-v3-v2 down
  //   1.5,  0.0,-1.5, -1.5,  0.0,-1.5, -1.5, 10.0,-1.5,  1.5, 10.0,-1.5  // v4-v7-v6-v5 back
  // ]);
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
  
  var shapeBufferHandle = gl_c.createBuffer();  
	if (!shapeBufferHandle) {
	console.log('Failed to create the shape buffer object');
	return false;
	}
  // Bind the the buffer object to target:
	gl_c.bindBuffer(gl_c.ARRAY_BUFFER, shapeBufferHandle);
	// Transfer data from Javascript array colorShapes to Graphics system VBO
	// (Use sparingly--may be slow if you transfer large shapes stored in files)
	gl_c.bufferData(gl_c.ARRAY_BUFFER, vertices, gl_c.STATIC_DRAW);
  var a_Position = gl_c.getAttribLocation(gl_c.program, 'a_Position');
	if (a_Position < 0) {
	console.log('Failed to get the storage location of a_Position');
	return -1;
	}
  var FSIZE = vertices.BYTES_PER_ELEMENT; // how many bytes per stored value?

	// Use handle to specify how to retrieve **POSITION** data from our VBO:
	gl_c.vertexAttribPointer(
			a_Position, 	// choose Vertex Shader attribute to fill with data
			3, 						// how many values? 1,2,3 or 4.  (we're using x,y,z,w)
			gl_c.FLOAT, 		// data type for each value: usually gl_c.FLOAT
			false, 				// did we supply fixed-point data AND it needs normalizing?
			FSIZE * 6, // Stride -- how many bytes used to store each vertex?
										// (x,y,z,w, r,g,b) * bytes/value
			0);						// Offset -- now many bytes from START of buffer to the
										// value we will actually use?
	gl_c.enableVertexAttribArray(a_Position);  
										// Enable assignment of vertex buffer object's position data

	// Get graphics system's handle for our Vertex Shader's color-input variable;
	var a_Color = gl_c.getAttribLocation(gl_c.program, 'a_Color');
	if(a_Color < 0) {
	console.log('Failed to get the storage location of a_Color');
	return -1;
	}
	// Use handle to specify how to retrieve **COLOR** data from our VBO:
	gl_c.vertexAttribPointer(
		a_Color, 				// choose Vertex Shader attribute to fill with data
		3, 							// how many values? 1,2,3 or 4. (we're using R,G,B)
		gl_c.FLOAT, 			// data type for each value: usually gl_c.FLOAT
		false, 					// did we supply fixed-point data AND it needs normalizing?
		FSIZE * 6, 			// Stride -- how many bytes used to store each vertex?
										// (x,y,z,w, r,g,b) * bytes/value
		FSIZE * 3);			// Offset -- how many bytes from START of buffer to the
										// value we will actually use?  Need to skip over x,y,z,w
										
	gl_c.enableVertexAttribArray(a_Color);  
										// Enable assignment of vertex buffer object's position data

	//--------------------------------DONE!
	// Unbind the buffer object 
	gl_c.bindBuffer(gl_c.ARRAY_BUFFER, null);
  var n = vertices.length / 6;
  return n;
}
function initArrayBufferForLaterUse_c(gl_c, data, num, type){
  var buffer = gl_c.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl_c.bindBuffer(gl_c.ARRAY_BUFFER, buffer);
  gl_c.bufferData(gl_c.ARRAY_BUFFER, data, gl_c.STATIC_DRAW);

  // Store the necessary information to assign the object to the attribute variable later
  buffer.num = num;
  buffer.type = type;

  return buffer;
}
function initArrayBuffer_c(gl_c, attribute, data, type, num) {
  // Create a buffer object
  var buffer = gl_c.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl_c.bindBuffer(gl_c.ARRAY_BUFFER, buffer);
  gl_c.bufferData(gl_c.ARRAY_BUFFER, data, gl_c.STATIC_DRAW);

  // Assign the buffer object to the attribute variable
  var a_attribute = gl_c.getAttribLocation(gl_c.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl_c.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl_c.enableVertexAttribArray(a_attribute);

  return true;
}

// Coordinate transformation matrix
var g_modelMatrix_c = new Matrix4(), g_mvpMatrix = new Matrix4();

function draw_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix) {
  // Clear color and depth buffer
  gl_c.clear(gl_c.COLOR_BUFFER_BIT | gl_c.DEPTH_BUFFER_BIT);
  // Draw a base
  var baseHeight = 2.0;
  g_modelMatrix_c.setTranslate(0.0, -1.0, 0.0);
  g_modelMatrix_c.translate(transX_c, transY_c,transZ_c);	
  g_modelMatrix_c.scale(0.8, 0.8, 0.8);
  pushMatrix(g_modelMatrix_c);
  g_modelMatrix_c.scale(1, 1.0, 1); // Make it a little thicker
  g_modelMatrix_c.rotate(body_rotate, 0.0, 1.0, 0.0);
  drawBox_c(gl_c, n,viewProjMatrix_c,u_MvpMatrix);
  var arm1Length = 10.0; // Length of arm1
  g_modelMatrix_c.translate(0,arm1Length, 0,0);	
  pushMatrix(g_modelMatrix_c);
  g_modelMatrix_c = popMatrix();
  pushMatrix(g_modelMatrix_c);
  //Arm1
  g_modelMatrix_c.translate(-2.2, 0, 0.0); 　　　// Move to joint1
  g_modelMatrix_c.rotate(g_angle1now_c, 1.0, 0.0, 0.0);  
  pushMatrix(g_modelMatrix_c);
  g_modelMatrix_c.scale(0.5, -0.5, 0.5); // Make it a little thicker
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix); // Draw
  
  g_modelMatrix_c = popMatrix();
  g_modelMatrix_c.translate(0, -5, 0.0); 　　　// Move to joint1
  g_modelMatrix_c.rotate(-g_angle4now_c, 1.0, 0.0, 0.0);  
  g_modelMatrix_c.scale(0.5, -0.5, 0.5); // Make it a little thicker
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix); // Draw

  g_modelMatrix_c = popMatrix();
  pushMatrix(g_modelMatrix_c);
  // Arm2
  g_modelMatrix_c.translate(2.2, 0, 0.0);
  g_modelMatrix_c.rotate(-g_angle1now_c, 1.0, 0.0, 0.0);    // Rotate around the y-axis
  pushMatrix(g_modelMatrix_c);
  g_modelMatrix_c.scale(0.5, -0.5, 0.5); // Make it a little thicker
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix); // Draw
  g_modelMatrix_c = popMatrix();
  g_modelMatrix_c.translate(0, -5, 0.0); 　　　// Move to joint1
  g_modelMatrix_c.rotate(-g_angle4now_c, 1.0, 0.0, 0.0);  
  g_modelMatrix_c.scale(0.5, -0.5, 0.5); // Make it a little thicker
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix); // Draw

  g_modelMatrix_c = popMatrix();

  g_modelMatrix_c.translate(0, -arm1Length, 0.0); 
  pushMatrix(g_modelMatrix_c);
  g_modelMatrix_c = popMatrix();
  pushMatrix(g_modelMatrix_c);
  // Leg1
  
  g_modelMatrix_c.translate(-2, 0, 0.0); 　　　// Move to joint1
  g_modelMatrix_c.rotate(-g_angle1now_c, 1.0, 0.0, 0.0);  
  pushMatrix(g_modelMatrix_c);
  g_modelMatrix_c.scale(0.5, -0.5, 0.5); // Make it a little thicker
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix); // Draw
  //lowleg1
  g_modelMatrix_c = popMatrix();
  g_modelMatrix_c.translate(0, -5, 0.0); 　　　// Move to joint1
  g_modelMatrix_c.rotate(g_angle3now_c, 1.0, 0.0, 0.0);  
  g_modelMatrix_c.scale(0.5, -0.5, 0.5); // Make it a little thicker
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix); // Draw
  

  g_modelMatrix_c = popMatrix();
  pushMatrix(g_modelMatrix_c);
  // Leg2
  g_modelMatrix_c.translate(2, 0, 0.0);
  g_modelMatrix_c.rotate(g_angle1now_c, 1.0, 0.0, 0.0);    // Rotate around the y-axis
  pushMatrix(g_modelMatrix_c);
  g_modelMatrix_c.scale(0.5, -0.5, 0.5); // Make it a little thicker
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix); // Draw
  //lowerLeg2
  g_modelMatrix_c = popMatrix();
  g_modelMatrix_c.translate(0, -5, 0.0); 　　　// Move to joint1
  g_modelMatrix_c.rotate(-g_angle3now_c, 1.0, 0.0, 0.0);  
  g_modelMatrix_c.scale(0.5, -0.5, 0.5); // Make it a little thicker
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix); // Draw
  //neck
  g_modelMatrix_c = popMatrix();
  g_modelMatrix_c.translate(0, arm1Length, 0.0);
  g_modelMatrix_c.scale(0.2, 0.1, 0.2); // Make it a little thicker
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix); // Draw
  //head
  g_modelMatrix_c.translate(0, arm1Length, 0.0);
  g_modelMatrix_c.rotate(g_angle0now_c, 0.0, 1.0, 0.0); 
  g_modelMatrix_c.scale(4, 2, 4); // Make it a little thicker
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix); // Draw
}


// Draw the cube
function drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix) {
  // Calculate the model view project matrix and pass it to u_MvpMatrix
  g_mvpMatrix.set(viewProjMatrix_c);
  g_mvpMatrix.multiply(g_modelMatrix_c);
  gl_c.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);

  // Draw
  gl_c.drawArrays(gl_c.TRIANGLES, 0,n);
  // gl_c.drawElements(gl_c.TRIANGLES, n, gl_c.UNSIGNED_CYTE, 0);

  // gl_c.drawArrays(gl_c.TRIANGLES, 2, 36/floatsPerVertex_c);
}

function A0_runStop_c() {
  //==============================================================================
    if(g_angle0brake > 0.5)	// if running,
    {
      g_angle0brake_c = 0.0;	// stop, and change button label:
      document.getElementById("A0button_c").value="Angle 0 OFF";
    }
    else 
    {
      g_angle0brake_c= 1.0;	// Otherwise, go.
      document.getElementById("A0button_c").value="Angle 0 ON";
    }
  }
  
  function A1_runStop_c() {
  //==============================================================================
    if(g_angle1brake_c > 0.5)	// if running,
    {
      g_angle1brake_c = 0.0;	// stop, and change button label:
      document.getElementById("A1button_c").value="Angle 1 OFF";
    }
    else 
    {
      g_angle1brake_c = 1.0;	// Otherwise, go.
      document.getElementById("A1button_c").value="Angle 1 ON";
    }
  }

  function A2_runStop_c() {
    //==============================================================================
      if(g_angle2brake_c > 0.5)	// if running,
      {
        g_angle2brake_c = 0.0;	// stop, and change button label:
        document.getElementById("A2button_c").value="Angle 2 OFF";
      }
      else 
      {
        g_angle2brake_c = 1.0;	// Otherwise, go.
        document.getElementById("A2button_c").value="Angle 2 ON";
      }
    }
