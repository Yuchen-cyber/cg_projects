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
var floatsPerVertex = 6;
var canvas_c = document.getElementById('dog');
var gl_c
var n
var u_MvpMatrix
var viewProjMatrix_c = new Matrix4();
function main() {
  // Retrieve <canvas> element
  
  console.log("success");

  // Get the rendering context for WebGL
  gl_c = getWebGLContext(canvas_c);
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
  n = initVertexBuffers_c(gl_c);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl_c.clearColor(0.0, 0.0, 0.0, 1.0);
  gl_c.enable(gl_c.DEPTH_TEST);

  // Get the storage locations of uniform variables
  u_MvpMatrix = gl_c.getUniformLocation(gl_c.program, 'u_MvpMatrix');
  if (!u_MvpMatrix ) {
    console.log('Failed to get the storage location');
    return;
  }
  document.onkeydown = function(ev){ keydown(ev, gl_c, n, g_modelMatrix_b, u_MvpMatrix ); };
  canvas_c.onmousedown	=	function(ev){myMouseDown( ev, gl_c, canvas_c) }; 
  					// when user's mouse button goes down, call mouseDown() function
  canvas_c.onmousemove = 	function(ev){myMouseMove( ev, gl_c, canvas_c) };
											// when the mouse moves, call mouseMove() function					
  canvas_c.onmouseup = 		function(ev){myMouseUp(   ev, gl_c, canvas_c)};
    
  drawResize();
  
}
var isDrag=false;		// mouse-drag: true when user holds down mouse button
var xMclik=0.0;			// last mouse button-down position (in CVV coords)
var yMclik=0.0;   
var xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0; 

var qNew = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
var qTot = new Quaternion(0,0,0,1);	// 'current' orientation (made from qNew)
var quatMatrix = new Matrix4();	
function myMouseDown(ev, gl, canvas) {
  
  // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
    var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
    var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
    var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
  //  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);
    
    // Convert to Canonical View Volume (CVV) coordinates too:
    var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
                 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
    var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
                 (canvas.height/2);
  //	console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);
    
    isDrag = true;											// set our mouse-dragging flag
    xMclik = x;													// record where mouse-dragging began
    yMclik = y;
  };

  function myMouseMove(ev, gl, canvas) {    
      if(isDrag==false) return;				// IGNORE all mouse-moves except 'dragging'
    
      // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
      var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
      var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
      var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
    //  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);
      
      // Convert to Canonical View Volume (CVV) coordinates too:
      var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
                   (canvas.width/2);			// normalize canvas to -1 <= x < +1,
      var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
                   (canvas.height/2);
    
      // find how far we dragged the mouse:
      xMdragTot += (x - xMclik);					// Accumulate change-in-mouse-position,&
      yMdragTot += (y - yMclik);
      // AND use any mouse-dragging we found to update quaternions qNew and qTot.
      dragQuat(x - xMclik, y - yMclik);
      
      xMclik = x;													// Make NEXT drag-measurement from here.
      yMclik = y;
      
      // Show it on our webpage, in the <div> element named 'MouseText':
      document.getElementById('MouseText').innerHTML=
          'Mouse Drag totals (CVV x,y coords):\t'+
           xMdragTot.toFixed(5)+', \t'+
           yMdragTot.toFixed(5);	
    };
  function myMouseUp(ev, gl, canvas) {
    // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
      var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
      var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
      var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
    //  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);
      
      // Convert to Canonical View Volume (CVV) coordinates too:
      var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
                    (canvas.width/2);			// normalize canvas to -1 <= x < +1,
      var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
                    (canvas.height/2);
    //	console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
      
      isDrag = false;											// CLEAR our mouse-dragging flag, and
      // accumulate any final bit of mouse-dragging we did:
      xMdragTot += (x - xMclik);
      yMdragTot += (y - yMclik);
    //	console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
    
      // AND use any mouse-dragging we found to update quaternions qNew and qTot;
      dragQuat(x - xMclik, y - yMclik);
    
      // Show it on our webpage, in the <div> element named 'MouseText':
      document.getElementById('MouseText').innerHTML=
          'Mouse Drag totals (CVV x,y coords):\t'+
            xMdragTot.toFixed(5)+', \t'+
            yMdragTot.toFixed(5);	
    };

  function dragQuat(xdrag, ydrag) {

      var res = 5;
      var qTmp = new Quaternion(0,0,0,1);
      
      var dist = Math.sqrt(xdrag*xdrag + ydrag*ydrag);
      
      qNew.setFromAxisAngle(-ydrag + 0.0001, xdrag + 0.0001, 0.0, dist*150.0);

                  
      qTmp.multiply(qNew,qTot);			// apply new rotation to current rotation. 

      qTot.copy(qTmp);
      // show the new quaternion qTot on our webpage in the <div> element 'QuatValue'
      document.getElementById('QuatValue').innerHTML= 
                                  '\t X=' +qTot.x.toFixed(res)+
                                'i\t Y=' +qTot.y.toFixed(res)+
                                'j\t Z=' +qTot.z.toFixed(res)+
                                'k\t W=' +qTot.w.toFixed(res)+
                                '<br>length='+qTot.length().toFixed(res);
    };

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

//angle for robot arm
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


    // for robot arm
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


function initVertexBuffers_c(gl_c) {
  var ctrColr = new Float32Array([0.930, 0.605, 0.843]);	// pink
	var topColr = new Float32Array([0.628, 0.910, 0.854]);	// blue
	var botColr = new Float32Array([0.940, 0.913, 0.620]); //yellow
  makeGroundGrid();	
  drawAxes();
  makeDiamond(); 
  
  vertices = new Float32Array([
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

// get the start of the vertices
var mySiz = ( vertices.length + gndVerts.length + axesVertices.length + diaVerts.length);	

var colorShapes = new Float32Array(mySiz);
vertices_start = 0
for(i=0,j=0; j< vertices.length; i++,j++) {
  colorShapes[i] = vertices[j];
  }
  gnd_start = i;
  for(j=0; j< gndVerts.length; i++, j++) {
		colorShapes[i] = gndVerts[j];
		}
    axes_start = i;
  for(j=0; j< axesVertices.length; i++, j++) {
		colorShapes[i] = axesVertices[j];
		}
  dia_start = i;
  for(j=0; j< diaVerts.length; i++, j++) {
    colorShapes[i] = diaVerts[j];
    }
  var shapeBufferHandle = gl_c.createBuffer();  
	if (!shapeBufferHandle) {
	console.log('Failed to create the shape buffer object');
	return false;
	}

  // Bind the the buffer object to target:
	gl_c.bindBuffer(gl_c.ARRAY_BUFFER, shapeBufferHandle);
	// Transfer data from Javascript array colorShapes to Graphics system VBO
	// (Use sparingly--may be slow if you transfer large shapes stored in files)
	// gl_c.bufferData(gl_c.ARRAY_BUFFER, vertices, gl_c.STATIC_DRAW);
  gl_c.bufferData(gl_c.ARRAY_BUFFER, colorShapes, gl_c.STATIC_DRAW);
  var a_Position = gl_c.getAttribLocation(gl_c.program, 'a_Position');
	if (a_Position < 0) {
	console.log('Failed to get the storage location of a_Position');
	return -1;
	}
  var FSIZE = colorShapes.BYTES_PER_ELEMENT; // how many bytes per stored value?

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
  var n = mySiz / 6;
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
var g_modelMatrix_b = new Matrix4(), g_mvpMatrix = new Matrix4();

function draw_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix) {
  // Clear color and depth buffer
  drawline(gl_c, n, viewProjMatrix_c, u_MvpMatrix, axes_start/floatsPerVertex, axesVertices.length/floatsPerVertex);// world coordinates
  pushMatrix();
  g_modelMatrix_b = popMatrix(); 

  //draw robot arm
  // Draw a base
  var baseHeight = 2.0;
  // g_modelMatrix_b.setTranslate(0.0, -1.0, 0.0);
  drawline(gl_c, n, viewProjMatrix_c, u_MvpMatrix, axes_start/floatsPerVertex, axesVertices.length/floatsPerVertex);// world coordinates
  //draw robot arm
  g_modelMatrix_b.scale(0.8, 0.8, 0.8);
  // pushMatrix(g_modelMatrix_b);  // SAVE world drawing coords.
  pushMatrix(g_modelMatrix_b);
  	//---------Draw Ground Plane, without spinning.
  	// position it.
  	g_modelMatrix_b.translate( 0.4, -0.4, 0.0);	
  	// g_modelMatrix_b.scale(0.1, 0.1, 0.1);				// shrink by 10X:
    g_modelMatrix_b.rotate(90, 1.0, 0.0, 0.0);

  	// // Drawing:
  	// // Pass our current matrix to the vertex shaders:
    // gl_c.uniformMatrix4fv(u_MvpMatrix, false, g_modelMatrix_b.elements);
    drawline(gl_c, n, viewProjMatrix_c, u_MvpMatrix, gnd_start/floatsPerVertex, gndVerts.length/floatsPerVertex)
    
    //draw robot arm
    
      g_modelMatrix_b.setTranslate(30.0, 12.0, 20.0);
      pushMatrix(g_modelMatrix_b);
      drawline(gl_c, n, viewProjMatrix_c, u_MvpMatrix, axes_start/floatsPerVertex, axesVertices.length/floatsPerVertex);// world coordinates
      g_modelMatrix_b.scale(1.25, 0.05, 1.25); // Make it a little thicker
      drawBox_c(gl_c, n,viewProjMatrix_c,u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex);
      g_modelMatrix_b = popMatrix(); 
      // Arm1
      var arm1Length = 10.0; // Length of arm1
      // g_modelMatrix_b.setTranslate(9.0, -12.0, 0.0);
      g_modelMatrix_b.rotate(g_angle0now, 0.0, 1.0, 0.0);    // Rotate around the y-axis
      drawline(gl_c, n, viewProjMatrix_c, u_MvpMatrix, axes_start/floatsPerVertex, axesVertices.length/floatsPerVertex);
      g_modelMatrix_b.scale(0.5, 0.5, 0.5);
      drawBox_c(gl_c, n,viewProjMatrix_c,u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex); // Draw
    
      // Arm2
      g_modelMatrix_b.translate(0.0, arm1Length, 0.0); 　　　// Move to joint1
      g_modelMatrix_b.rotate(g_angle1now, 0.0, 0.0, 1.0);  // Rotate around the z-axis
      drawline(gl_c, n, viewProjMatrix_c, u_MvpMatrix, axes_start/floatsPerVertex, axesVertices.length/floatsPerVertex);
      g_modelMatrix_b.scale(1.3, 1.0, 1.3); // Make it a little thicker
      drawBox_c(gl_c, n,viewProjMatrix_c,u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex); // Draw
    
      pushMatrix(g_modelMatrix_b);

      // Arm3
      g_modelMatrix_b.translate(0.0, arm1Length, 0.0);
      // g_modelMatrix_b.rotate(180, 0.0, 1.0, 0.0);   　　　
      g_modelMatrix_b.rotate(g_angle1now, 0.0, 1.0, 0.0);  
      drawline(gl_c, n, viewProjMatrix_c, u_MvpMatrix, axes_start/floatsPerVertex, axesVertices.length/floatsPerVertex);
      pushMatrix(g_modelMatrix_b);
      g_modelMatrix_b.scale(0.8, 0.08, 1.2); 
      drawBox_c(gl_c, n,viewProjMatrix_c,u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex); // Draw

      g_modelMatrix_b = popMatrix();
      pushMatrix(g_modelMatrix_b);
      
      //Tongs1
      g_modelMatrix_b.translate(0, 0,1.0);
      g_modelMatrix_b.rotate(g_angle2now, 1.0, 0.0, 0.0);  // Rotate around the x-axis
      drawline(gl_c, n, viewProjMatrix_c, u_MvpMatrix, axes_start/floatsPerVertex, axesVertices.length/floatsPerVertex);
      g_modelMatrix_b.scale(0.3, 0.2, 0.3); // Make it a little thicker
      drawBox_c(gl_c, n,viewProjMatrix_c,u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex);
      g_modelMatrix_b = popMatrix();
      //Tongs1
      g_modelMatrix_b.translate(0, 0,-1.0);
      g_modelMatrix_b.rotate(-g_angle2now, 1.0, 0.0, 0.0);  // Rotate around the x-axis
      drawline(gl_c, n, viewProjMatrix_c, u_MvpMatrix, axes_start/floatsPerVertex, axesVertices.length/floatsPerVertex);
      g_modelMatrix_b.scale(0.3, 0.2, 0.3); // Make it a little thicker
      drawBox_c(gl_c, n,viewProjMatrix_c,u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex);

  //draw robot
  g_modelMatrix_b = popMatrix();  
  pushMatrix();

  g_modelMatrix_b.setTranslate(0,12,0);
  g_modelMatrix_b.translate(transX_c, transY_c,transZ_c);	 
  pushMatrix(g_modelMatrix_b);
  g_modelMatrix_b.scale(1, 1.0, 1);
  g_modelMatrix_b.rotate(body_rotate, 0.0, 1.0, 0.0);
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex);
  var arm1Length = 10.0; 
  g_modelMatrix_b.translate(0,arm1Length, 0,0);	
  pushMatrix(g_modelMatrix_b);
  g_modelMatrix_b = popMatrix();
  pushMatrix(g_modelMatrix_b);
  //Arm1
  g_modelMatrix_b.translate(-2.2, 0, 0.0); 
  g_modelMatrix_b.rotate(g_angle1now_c, 1.0, 0.0, 0.0);  
  pushMatrix(g_modelMatrix_b);
  g_modelMatrix_b.scale(0.5, -0.5, 0.5); 
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex); // Draw
  
  g_modelMatrix_b = popMatrix();
  g_modelMatrix_b.translate(0, -5, 0.0); 
  g_modelMatrix_b.rotate(-g_angle4now_c, 1.0, 0.0, 0.0);  
  g_modelMatrix_b.scale(0.5, -0.5, 0.5); 
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex); // Draw

  g_modelMatrix_b = popMatrix();
  pushMatrix(g_modelMatrix_b);
  // Arm2
  g_modelMatrix_b.translate(2.2, 0, 0.0);
  g_modelMatrix_b.rotate(-g_angle1now_c, 1.0, 0.0, 0.0);    
  pushMatrix(g_modelMatrix_b);
  g_modelMatrix_b.scale(0.5, -0.5, 0.5); 
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex); // Draw
  g_modelMatrix_b = popMatrix();
  g_modelMatrix_b.translate(0, -5, 0.0); 
  g_modelMatrix_b.rotate(-g_angle4now_c, 1.0, 0.0, 0.0);  
  g_modelMatrix_b.scale(0.5, -0.5, 0.5); 
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex); // Draw

  g_modelMatrix_b = popMatrix();

  g_modelMatrix_b.translate(0, -arm1Length, 0.0); 
  pushMatrix(g_modelMatrix_b);
  g_modelMatrix_b = popMatrix();
  pushMatrix(g_modelMatrix_b);
  // Leg1
  
  g_modelMatrix_b.translate(-2, 0, 0.0); 
  g_modelMatrix_b.rotate(-g_angle1now_c, 1.0, 0.0, 0.0);  
  pushMatrix(g_modelMatrix_b);
  g_modelMatrix_b.scale(0.5, -0.5, 0.5); 
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex); // Draw
  //lowleg1
  g_modelMatrix_b = popMatrix();
  g_modelMatrix_b.translate(0, -5, 0.0); 
  g_modelMatrix_b.rotate(g_angle3now_c, 1.0, 0.0, 0.0);  
  g_modelMatrix_b.scale(0.5, -0.5, 0.5); 
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex); // Draw
  

  g_modelMatrix_b = popMatrix();
  pushMatrix(g_modelMatrix_b);
  // Leg2
  g_modelMatrix_b.translate(2, 0, 0.0);
  g_modelMatrix_b.rotate(g_angle1now_c, 1.0, 0.0, 0.0);    
  pushMatrix(g_modelMatrix_b);
  g_modelMatrix_b.scale(0.5, -0.5, 0.5); 
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex);// Draw
  //lowerLeg2
  g_modelMatrix_b = popMatrix();
  g_modelMatrix_b.translate(0, -5, 0.0); 
  g_modelMatrix_b.rotate(-g_angle3now_c, 1.0, 0.0, 0.0);  
  g_modelMatrix_b.scale(0.5, -0.5, 0.5); 
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex); // Draw
  //neck
  g_modelMatrix_b = popMatrix();
  g_modelMatrix_b.translate(0, arm1Length, 0.0);
  g_modelMatrix_b.scale(0.2, 0.1, 0.2); 
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex); // Draw
  //head
  g_modelMatrix_b.translate(0, arm1Length, 0.0);
  g_modelMatrix_b.rotate(g_angle0now_c, 0.0, 1.0, 0.0); 
  g_modelMatrix_b.scale(4, 2, 4); 
  drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex); // Draw

  //3d objects
  
  g_modelMatrix_b = popMatrix();
  g_modelMatrix_b = popMatrix();
  g_modelMatrix_b = popMatrix();
  
  pushMatrix(g_modelMatrix_b);
    g_modelMatrix_b.translate(20, 0, 0.0);
    quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w);	// Quaternion-->Matrix
	  g_modelMatrix_b.concat(quatMatrix);	
    drawline(gl_c, n, viewProjMatrix_c, u_MvpMatrix, axes_start/floatsPerVertex, axesVertices.length/floatsPerVertex);
    drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix, vertices_start/floatsPerVertex, vertices.length/floatsPerVertex);
                
  
  
}
var ctrColr = new Float32Array([0.930, 0.605, 0.843]);	// pink
var topColr = new Float32Array([0.628, 0.910, 0.854]);	// blue
var botColr = new Float32Array([0.940, 0.913, 0.620]); //yellow
function makeDiamond() {
	//==============================================================================
	// Make a diamond-like shape from two adjacent tetrahedra, aligned with Z axis.
	var baseVerts = 6; // number of vertices for the base square
	diaVerts = new Float32Array(  ((baseVerts*8)) * floatsPerVertex);
	var topRadius = 0.8;
	var botRadius = 1;
	var wallHei = 0.2

	for(v=1,j=0; v<2*baseVerts; v++,j+=floatsPerVertex) {	
		// skip the first vertex--not needed.
		if(v%2==0)
		{				// put even# vertices at center of cylinder's top cap:
			diaVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			diaVerts[j+1] = 0.0;	
			diaVerts[j+2] = 1.0; 
			diaVerts[j+3] = 1.0;			// r,g,b = topColr[]
		}
		else { 	
						diaVerts[j  ] = topRadius* Math.cos(Math.PI*(v-1)/baseVerts);			// x
						diaVerts[j+1] = topRadius * Math.sin(Math.PI*(v-1)/baseVerts);			// y

			diaVerts[j+2] = 1.0;	// z
			diaVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
		
		}
		if(v%3 == 0){
			diaVerts[j+4]=botColr[0]; 
			diaVerts[j+5]=botColr[1]; 
			diaVerts[j+6]=botColr[2];
		}
		if(v%3 ==1){
			diaVerts[j+4]=ctrColr[0]; 
			diaVerts[j+5]=ctrColr[1]; 
			diaVerts[j+6]=ctrColr[2];
		}
		if(v%3 ==2){
			diaVerts[j+4]=topColr[0]; 
			diaVerts[j+5]=topColr[1]; 
			diaVerts[j+6]=topColr[2];
		}
	}

	for(v=0; v< 2*baseVerts; v++, j+=floatsPerVertex) {
		if(v%2==0)	// position all even# vertices along top cap:
		{		
			diaVerts[j  ] = topRadius * Math.cos(Math.PI*(v)/baseVerts);		// x
			diaVerts[j+1] = topRadius * Math.sin(Math.PI*(v)/baseVerts);		// y
			diaVerts[j+2] = 1.0;	// z
			diaVerts[j+3] = 1.0;	// w.
		
		}
		else		// position all odd# vertices along the bottom cap:
		{
			diaVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/baseVerts);		// x
			diaVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/baseVerts);		// y
			diaVerts[j+2] =-wallHei;	// z
			diaVerts[j+3] = 1.0;	// w.
		
		}
		if(v%3 == 0){
			diaVerts[j+4]=botColr[0]; 
			diaVerts[j+5]=botColr[1]; 
			diaVerts[j+6]=botColr[2];
		}
		if(v%3 ==1){
			diaVerts[j+4]=ctrColr[0]; 
			diaVerts[j+5]=ctrColr[1]; 
			diaVerts[j+6]=ctrColr[2];
		}
		if(v%3 ==2){
			diaVerts[j+4]=topColr[0]; 
			diaVerts[j+5]=topColr[1]; 
			diaVerts[j+6]=topColr[2];
		}
	}

	for(v=0; v < (2*baseVerts -1); v++, j+= floatsPerVertex) {
		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
			diaVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/baseVerts);		// x
			diaVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/baseVerts);		// y
			diaVerts[j+2] =-wallHei;	// z
			diaVerts[j+3] = 1.0;	// w.
		
		}
		else {				// position odd#'d vertices at center of the bottom cap:
			diaVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			diaVerts[j+1] = 0.0;	
			diaVerts[j+2] =-wallHei - 1; 
			diaVerts[j+3] = 1.0;			// r,g,b = botColr[]

		}
		if(v%3 == 0){
			diaVerts[j+4]=botColr[0]; 
			diaVerts[j+5]=botColr[1]; 
			diaVerts[j+6]=botColr[2];
		}
		if(v%3 ==1){
			diaVerts[j+4]=ctrColr[0]; 
			diaVerts[j+5]=ctrColr[1]; 
			diaVerts[j+6]=ctrColr[2];
		}
		if(v%3 ==2){
			diaVerts[j+4]=topColr[0]; 
			diaVerts[j+5]=topColr[1]; 
			diaVerts[j+6]=topColr[2];
		}
	}
	
}

function drawAxes(){

  axesVertices = new Float32Array([
    // X axis in red
    0, 0, 0, 1, 0, 0,
    3, 0, 0, 1, 0, 0,
    // Y axis in green
    0, 0, 0, 0, 1, 0,
    0, 3, 0, 0, 1, 0,
    // Z axis in blue
    0, 0, 0, 0, 0, 1,
    0, 0, 3, 0, 0, 1,
  ]);
}

function makeGroundGrid() {
  //==============================================================================
  // Create a list of vertices that create a large grid of lines in the x,y plane
  // centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.
  
    var xcount = 100;			// # of lines to draw in x,y to make the grid.
    var ycount = 100;		
    var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
     var xColr = new Float32Array([1.0, 1.0, 0.3]);	// bright yellow
     var yColr = new Float32Array([0.5, 1.0, 0.5]);	// bright green.
     
    // Create an (global) array to hold this ground-plane's vertices:
    gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
              // draw a grid made of xcount+ycount lines; 2 vertices per line.
              
    var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
    var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))
    
    // First, step thru x values as we make vertical lines of constant-x:
    for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
      if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
        gndVerts[j  ] = -xymax + (v  )*xgap;	// x
        gndVerts[j+1] = -xymax;								// y
        gndVerts[j+2] = 0.0;									// z
        gndVerts[j+3] = 1.0;									// w.
      }
      else {				// put odd-numbered vertices at (xnow, +xymax, 0).
        gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
        gndVerts[j+1] = xymax;								// y
        gndVerts[j+2] = 0.0;									// z
        gndVerts[j+3] = 1.0;									// w.
      }
      gndVerts[j+4] = xColr[0];			// red
      gndVerts[j+5] = xColr[1];			// grn
      gndVerts[j+6] = xColr[2];			// blu
    }
    // Second, step thru y values as wqe make horizontal lines of constant-y:
    // (don't re-initialize j--we're adding more vertices to the array)
    for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
      if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
        gndVerts[j  ] = -xymax;								// x
        gndVerts[j+1] = -xymax + (v  )*ygap;	// y
        gndVerts[j+2] = 0.0;									// z
        gndVerts[j+3] = 1.0;									// w.
      }
      else {					// put odd-numbered vertices at (+xymax, ynow, 0).
        gndVerts[j  ] = xymax;								// x
        gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
        gndVerts[j+2] = 0.0;									// z
        gndVerts[j+3] = 1.0;									// w.
      }
      gndVerts[j+4] = yColr[0];			// red
      gndVerts[j+5] = yColr[1];			// grn
      gndVerts[j+6] = yColr[2];			// blu
    }
  }
// Draw the cube
function drawBox_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix, start, end) {
  // Calculate the model view project matrix and pass it to u_MvpMatrix
  g_mvpMatrix.set(viewProjMatrix_c);
  g_mvpMatrix.multiply(g_modelMatrix_b);
  gl_c.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);

  // Draw
  gl_c.drawArrays(gl_c.TRIANGLES, start,end);
  // gl_c.drawElements(gl_c.TRIANGLES, n, gl_c.UNSIGNED_CYTE, 0);

  // gl_c.drawArrays(gl_c.TRIANGLES, 2, 36/floatsPerVertex_c);
}

function drawline(gl_c, n, viewProjMatrix_c, u_MvpMatrix, start, end) {
  // Calculate the model view project matrix and pass it to u_MvpMatrix
  g_mvpMatrix.set(viewProjMatrix_c);
  g_mvpMatrix.multiply(g_modelMatrix_b);
  gl_c.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);

  // Draw
  gl_c.drawArrays(gl_c.LINES, start,end);
  // gl_c.drawElements(gl_c.TRIANGLES, n, gl_c.UNSIGNED_CYTE, 0);

  // gl_c.drawArrays(gl_c.TRIANGLES, 2, 36/floatsPerVertex_c);
}
//for perspective view
var camPos = new Vector3([50.0, 30.0, 30.0]);  // Camera position
var camLookAt = new Vector3([0, 0, 0]); // Look-at point
var camUp = new Vector3([0, 1, 0]);  // 'up' vector
//for ortho view

function draw(){
  gl_c.clear(gl_c.COLOR_BUFFER_BIT | gl_c.DEPTH_BUFFER_BIT);

  // Perspective view on the left half
  gl_c.viewport(0, 0, canvas_c.width / 2, canvas_c.height); 
  viewProjMatrix_c.setPerspective(50.0, (canvas_c.width/2) / canvas_c.height, 1.0, 100.0); 
  viewProjMatrix_c.lookAt(camPos.elements[0], camPos.elements[1], camPos.elements[2],
  camLookAt.elements[0], camLookAt.elements[1], camLookAt.elements[2],
  camUp.elements[0], camUp.elements[1], camUp.elements[2]); 
  draw_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix); 

  gl_c.clear(gl_c.DEPTH_BUFFER_BIT);
  
  //another viewpoint
  gl_c.viewport(canvas_c.width / 2,											 	
  0, 											
  canvas_c.width/2, 					
  canvas_c.height);			  

  vpAspect = (canvas_c.width/2) /					 
    (canvas_c.height);		
      
  viewProjMatrix_c.setOrtho(-vpAspect * 20, vpAspect * 20, -20, 20, 1.0, 100.0);
  viewProjMatrix_c.lookAt(camPos.elements[0], camPos.elements[1], camPos.elements[2],
    camLookAt.elements[0], camLookAt.elements[1], camLookAt.elements[2],
    camUp.elements[0], camUp.elements[1], camUp.elements[2]); 

  gl_c.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
  draw_c(gl_c, n, viewProjMatrix_c, u_MvpMatrix);
}
function drawResize() {
  //==============================================================================
  // Called when user re-sizes their browser window , because our HTML file
  // contains:  <body onload="main()" onresize="winResize()">
  
    //Report our current browser-window contents:
  
  console.log('canvas_c width,height=', canvas_c.width, canvas_c.height);		
  console.log('Browser window: innerWidth,innerHeight=', 
                                  innerWidth, innerHeight);	
                                  // http://www.w3schools.com/jsref/obj_window.asp
  
    
    //Make canvas fill the top 3/4 of our browser window:
    var xtraMargin = 16;    // keep a margin (otherwise, browser adds scroll-bars)
    canvas_c.width = innerWidth - xtraMargin;
    canvas_c.height = (innerHeight*3/4) - xtraMargin;
    
    var tick_c = function() {		    
      
      requestAnimationFrame(tick_c, gl_c); 
         
      timerAll_c();  				
      draw();  
    };
  
    //------------------------------------
    tick_c(); 		
  }
  function moveCamera(dx, dy, dz) {
    camPos.elements[0] += dx;
    camPos.elements[1] += dy;
    camPos.elements[2] += dz;
  
    camLookAt.elements[0] += dx;
    camLookAt.elements[1] += dy;
    camLookAt.elements[2] += dz;
  }

  function rotateCamera(axis, angleDeg) {
    var rad = Math.PI / 180 * angleDeg;
    var rotMatrix = new Matrix4();
  
    rotMatrix.setRotate(rad, axis.elements[0], axis.elements[1], axis.elements[2]);
    var lookAtDirection = new Vector3([
      camLookAt.elements[0] - camPos.elements[0],
      camLookAt.elements[1] - camPos.elements[1],
      camLookAt.elements[2] - camPos.elements[2]
    ]);

    lookAtDirection = rotMatrix.multiplyVector3(lookAtDirection);

    camLookAt = new Vector3([
      lookAtDirection.elements[0] + camPos.elements[0],
      lookAtDirection.elements[1] + camPos.elements[1],
      lookAtDirection.elements[2] + camPos.elements[2]
    ]);

    camUp = rotMatrix.multiplyVector3(camUp);
  }

  function rotateCameraUpDown(angleDeg) {
    // Compute the camera's right axis
    var lookDirection = new Vector3([
      camLookAt.elements[0] - camPos.elements[0],
      camLookAt.elements[1] - camPos.elements[1],
      camLookAt.elements[2] - camPos.elements[2]
    ]);
    lookDirection.normalize(); 
  
    var camRight = lookDirection.cross(camUp);
    camRight.normalize(); 
  
    var rad = Math.PI / 180 * angleDeg;
    var rotMatrix = new Matrix4();
  
    // Rotate around the camera's right axis
    rotMatrix.setRotate(rad, camRight.elements[0], camRight.elements[1], camRight.elements[2]);
    
    // Rotate the lookAtDirection
    var lookAtDirection = new Vector3([
      camLookAt.elements[0] - camPos.elements[0],
      camLookAt.elements[1] - camPos.elements[1],
      camLookAt.elements[2] - camPos.elements[2]
    ]);
  
    lookAtDirection = rotMatrix.multiplyVector3(lookAtDirection);
  
    camLookAt = new Vector3([
      lookAtDirection.elements[0] + camPos.elements[0],
      lookAtDirection.elements[1] + camPos.elements[1],
      lookAtDirection.elements[2] + camPos.elements[2]
    ]);
  
    // Also rotate the camera's up vector
    camUp = rotMatrix.multiplyVector3(camUp);
  }
  

  function keydown(ev, gl, n, modelMatrix, u_ModelMatrix) {
		switch (ev.keyCode) {
			case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
			rotateCamera(new Vector3([0, 1, 0]),  -20);
			break;
			case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
      rotateCamera(new Vector3([0, 1, 0]), 20);
			break;
      case 38: // Up key
      rotateCameraUpDown(20); 
      break;
      case 40: // Down key
      rotateCameraUpDown(-20); 
      break;
      case 83://s
        moveCamera(1, 0, 0);
        break;

      case 87: //w
        moveCamera(-1, 0, 0);
        break;
      case 65: //a
        moveCamera(0, 0, 1);
        break;

      case 68: //d
        moveCamera(0, 0, -1);
        break;
			default: return; 
		}

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