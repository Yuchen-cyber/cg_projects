//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// TABS set to 2.
//
// ORIGINAL SOURCE:
// RotatingTranslatedTriangle.js (c) 2012 matsuda
// HIGHLY MODIFIED to make:
//
// JT_MultiShader.js  for EECS 351-1, 
//									Northwestern Univ. Jack Tumblin

// Jack Tumblin's Project C -- step by step.

/* Show how to use 3 separate VBOs with different verts, attributes & uniforms. 
-------------------------------------------------------------------------------
	Create a 'VBObox' object/class/prototype & library to collect, hold & use all 
	data and functions we need to render a set of vertices kept in one Vertex 
	Buffer Object (VBO) on-screen, including:
	--All source code for all Vertex Shader(s) and Fragment shader(s) we may use 
		to render the vertices stored in this VBO;
	--all variables needed to select and access this object's VBO, shaders, 
		uniforms, attributes, samplers, texture buffers, and any misc. items. 
	--all variables that hold values (uniforms, vertex arrays, element arrays) we 
	  will transfer to the GPU to enable it to render the vertices in our VBO.
	--all user functions: init(), draw(), adjust(), reload(), empty(), restore().
	Put all of it into 'JT_VBObox-Lib.js', a separate library file.

USAGE:
------
1) If your program needs another shader program, make another VBObox object:
 (e.g. an easy vertex & fragment shader program for drawing a ground-plane grid; 
 a fancier shader program for drawing Gouraud-shaded, Phong-lit surfaces, 
 another shader program for drawing Phong-shaded, Phong-lit surfaces, and
 a shader program for multi-textured bump-mapped Phong-shaded & lit surfaces...)
 
 HOW:
 a) COPY CODE: create a new VBObox object by renaming a copy of an existing 
 VBObox object already given to you in the VBObox-Lib.js file. 
 (e.g. copy VBObox1 code to make a VBObox3 object).

 b) CREATE YOUR NEW, GLOBAL VBObox object.  
 For simplicity, make it a global variable. As you only have ONE of these 
 objects, its global scope is unlikely to cause confusions/errors, and you can
 avoid its too-frequent use as a function argument.
 (e.g. above main(), write:    var phongBox = new VBObox3();  )

 c) INITIALIZE: in your JS progam's main() function, initialize your new VBObox;
 (e.g. inside main(), write:  phongBox.init(); )

 d) DRAW: in the JS function that performs all your webGL-drawing tasks, draw
 your new VBObox's contents on-screen. 
 (NOTE: as it's a COPY of an earlier VBObox, your new VBObox's on-screen results
  should duplicate the initial drawing made by the VBObox you copied.  
  If that earlier drawing begins with the exact same initial position and makes 
  the exact same animated moves, then it will hide your new VBObox's drawings!
  --THUS-- be sure to comment out the earlier VBObox's draw() function call  
  to see the draw() result of your new VBObox on-screen).
  (e.g. inside drawAll(), add this:  
      phongBox.switchToMe();
      phongBox.draw();            )

 e) ADJUST: Inside the JS function that animates your webGL drawing by adjusting
 uniforms (updates to ModelMatrix, etc) call the 'adjust' function for each of your
VBOboxes.  Move all the uniform-adjusting operations from that JS function into the
'adjust()' functions for each VBObox. 

2) Customize the VBObox contents; add vertices, add attributes, add uniforms.
 ==============================================================================*/


// Global Variables  
//   (These are almost always a BAD IDEA, but here they eliminate lots of
//    tedious function arguments. 
//    Later, collect them into just a few global, well-organized objects!)
// ============================================================================
// for WebGL usage:--------------------
var gl;													// WebGL rendering context -- the 'webGL' object
																// in JavaScript with all its member fcns & data
var g_canvasID;									// HTML-5 'canvas' element ID#

// For multiple VBOs & Shaders:-----------------
worldBox = new VBObox0();		  // Holds VBO & shaders for 3D 'world' ground-plane grid, etc;
gouraudBox = new VBObox1();		  // "  "  for first set of custom-shaded 3D parts
// phongBox = new VBObox2();     // "  "  for second set of custom-shaded 3D parts
objectBox = new VBObox3();
robotBox = new VBObox4();
triBox = new VBObox5();
object1Box  = new VBObox6();
objectGBox = new VBObox7();
object1GBox = new VBObox8();
sphereGBox = new VBObox9();

var phongLightValue = 0;
var phongShadeValue = 0;
var ambientR = 0;
var ambientG = 0;
var ambientB = 0;
var shiness = 0.0;
var diffuseR = 0.0;
var diffuseG = 0.0;
var diffuseB = 0.0;
var specularR = 0.0;
var specularG = 0.0;
var specularB = 0.0;
var matlSel= MATL_RED_PLASTIC;	
var matl0 = new Material(matlSel);



// For animation:---------------------
var g_lastMS = Date.now();			// Timestamp (in milliseconds) for our 
                                // most-recently-drawn WebGL screen contents.  
                                // Set & used by moveAll() fcn to update all
                                // time-varying params for our webGL drawings.
  // All time-dependent params (you can add more!)
// var g_angleNow0  =  0.0; 			  // Current rotation angle, in degrees.
// var g_angle0rate = 45.0;				// Rotation angle rate, in degrees/second.
//                                 //---------------
// var g_angleNow1  = 100.0;       // current angle, in degrees
// var g_angle1rate =  95.0;        // rotation angle rate, degrees/sec
// var g_angleMax1  = 150.0;       // max, min allowed angle, in degrees
// var g_angleMin1  =  60.0;
//                                 //---------------
// var g_angleNow2  =  0.0; 			  // Current rotation angle, in degrees.
// var g_angle2rate = -62.0;				// Rotation angle rate, in degrees/second.

//                                 //---------------
// var g_posNow0 =  0.0;           // current position
// var g_posRate0 = 0.6;           // position change rate, in distance/second.
// var g_posMax0 =  0.5;           // max, min allowed for g_posNow;
// var g_posMin0 = -0.5;           
//                                 // ------------------
// var g_posNow1 =  0.0;           // current position
// var g_posRate1 = 0.5;           // position change rate, in distance/second.
// var g_posMax1 =  1.0;           // max, min allowed positions
// var g_posMin1 = -1.0;
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
var g_angle1min  = -30.0;       // init min, max allowed angle, in degrees
var g_angle1max  =  30.0;

var g_angle2now  =   0.0; 			// init Current rotation angle, in degrees > 0
var g_angle2rate =  64.0;				// init Rotation angle rate, in degrees/second.
var g_angle2brake=	 1.0;				// init Rotation start/stop. 0=stop, 1=full speed.
var g_angle2min  = -30.0;       // init min, max allowed angle, in degrees
var g_angle2max  =  60.0;

var g_angle3now  =   0.0; 			// init Current rotation angle, in degrees > 0
var g_angle3rate =  64.0;				// init Rotation angle rate, in degrees/second.
var g_angle3brake=	 1.0;				// init Rotation start/stop. 0=stop, 1=full speed.
var g_angle3min  = -180.0;       // init min, max allowed angle, in degrees
var g_angle3max  =  180.0;

var g_angle4now  =   0.0; 			// init Current rotation angle, in degrees > 0
var g_angle4rate =  64.0;				// init Rotation angle rate, in degrees/second.
var g_angle4brake=	 1.0;				// init Rotation start/stop. 0=stop, 1=full speed.
var g_angle4min  = -90.0;       // init min, max allowed angle, in degrees
var g_angle4max  =  90.0;

var g_angle5now  =   0.0; 			// init Current rotation angle, in degrees > 0
var g_angle5rate =  64.0;				// init Rotation angle rate, in degrees/second.
var g_angle5brake=	 1.0;				// init Rotation start/stop. 0=stop, 1=full speed.
var g_angle5min  = -360.0;       // init min, max allowed angle, in degrees
var g_angle5max  =  360.0;
var lightPos = new Vector3([6,2,10]); 
                                //---------------

// For mouse/keyboard:------------------------
var g_show0 = 1;								// 0==Show, 1==Hide VBO0 contents on-screen.
var g_show1 = 1;								// 	"					"			VBO1		"				"				" 
var g_show2 = 1;                //  "         "     VBO2    "       "       "

// GLOBAL CAMERA CONTROL:					// 
g_worldMat = new Matrix4();				// Changes CVV drawing axes to 'world' axes.
// (equivalently: transforms 'world' coord. numbers (x,y,z,w) to CVV coord. numbers)
// WHY?
// Lets mouse/keyboard functions set just one global matrix for 'view' and 
// 'projection' transforms; then VBObox objects use it in their 'adjust()'
// member functions to ensure every VBObox draws its 3D parts and assemblies
// using the same 3D camera at the same 3D position in the same 3D world).

function main() {
//=============================================================================
  // Retrieve the HTML-5 <canvas> element where webGL will draw our pictures:
  g_canvasID = document.getElementById('webgl');	
  // Create the the WebGL rendering context: one giant JavaScript object that
  // contains the WebGL state machine adjusted by large sets of WebGL functions,
  // built-in variables & parameters, and member data. Every WebGL function call
  // will follow this format:  gl.WebGLfunctionName(args);

  // Create the the WebGL rendering context: one giant JavaScript object that
  // contains the WebGL state machine, adjusted by big sets of WebGL functions,
  // built-in variables & parameters, and member data. Every WebGL func. call
  // will follow this format:  gl.WebGLfunctionName(args);
  //SIMPLE VERSION:  gl = getWebGLContext(g_canvasID); 
  // Here's a BETTER version:
  gl = g_canvasID.getContext("webgl", { preserveDrawingBuffer: true});
	// This fancier-looking version disables HTML-5's default screen-clearing, so 
	// that our drawMain() 
	// function will over-write previous on-screen results until we call the 
	// gl.clear(COLOR_BUFFER_BIT); function. )
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.clearColor(0.2, 0.2, 0.2, 1);	  // RGBA color for clearing <canvas>

  gl.enable(gl.DEPTH_TEST);

  /*
//----------------SOLVE THE 'REVERSED DEPTH' PROBLEM:------------------------
  // IF the GPU doesn't transform our vertices by a 3D Camera Projection Matrix
  // (and it doesn't -- not until Project B) then the GPU will compute reversed 
  // depth values:  depth==0 for vertex z == -1;   (but depth = 0 means 'near') 
  //		    depth==1 for vertex z == +1.   (and depth = 1 means 'far').
  //
  // To correct the 'REVERSED DEPTH' problem, we could:
  //  a) reverse the sign of z before we render it (e.g. scale(1,1,-1); ugh.)
  //  b) reverse the usage of the depth-buffer's stored values, like this:
  gl.enable(gl.DEPTH_TEST); // enabled by default, but let's be SURE.

  gl.clearDepth(0.0);       // each time we 'clear' our depth buffer, set all
                            // pixel depths to 0.0  (1.0 is DEFAULT)
  gl.depthFunc(gl.GREATER); // draw a pixel only if its depth value is GREATER
                            // than the depth buffer's stored value.
                            // (gl.LESS is DEFAULT; reverse it!)
  //------------------end 'REVERSED DEPTH' fix---------------------------------
*/

  // Initialize each of our 'vboBox' objects: 
  worldBox.init(gl);		// VBO + shaders + uniforms + attribs for our 3D world,
                        // including ground-plane,                       
  gouraudBox.init(gl);		//  "		"		"  for 1st kind of shading & lighting
	// phongBox.init(gl);    //  "   "   "  for 2nd kind of shading & lighting
  objectBox.init(gl);
  robotBox.init(gl);
  triBox.init(gl);
  object1Box.init(gl);
  objectGBox.init(gl);
  object1GBox.init(gl);
  sphereGBox.init(gl);
	
setCamera();				// TEMPORARY: set a global camera used by ALL VBObox objects...
	
  gl.clearColor(0.3, 0.3, 0.3, 1);	  // RGBA color for clearing <canvas>
  
  // ==============ANIMATION=============
  // Quick tutorials on synchronous, real-time animation in JavaScript/HTML-5: 
  //    https://webglfundamentals.org/webgl/lessons/webgl-animation.html
  //  or
  //  	http://creativejs.com/resources/requestanimationframe/
  //		--------------------------------------------------------
  // Why use 'requestAnimationFrame()' instead of the simpler-to-use
  //	fixed-time setInterval() or setTimeout() functions?  Because:
  //		1) it draws the next animation frame 'at the next opportunity' instead 
  //			of a fixed time interval. It allows your browser and operating system
  //			to manage its own processes, power, & computing loads, and to respond 
  //			to on-screen window placement (to skip battery-draining animation in 
  //			any window that was hidden behind others, or was scrolled off-screen)
  //		2) it helps your program avoid 'stuttering' or 'jittery' animation
  //			due to delayed or 'missed' frames.  Your program can read and respond 
  //			to the ACTUAL time interval between displayed frames instead of fixed
  //		 	fixed-time 'setInterval()' calls that may take longer than expected.
  //------------------------------------
  // var tick = function() {		    // locally (within main() only), define our 
  //                               // self-calling animation function. 
  //   requestAnimationFrame(tick, g_canvasID); // browser callback request; wait
  //                               // til browser is ready to re-draw canvas, then
  //   timerAll();  // Update all time-varying params, and
  //   drawAll();                // Draw all the VBObox contents
  //   };
  // //------------------------------------
  // tick();                       // do it again!
  document.onkeydown = function(ev){ keydown(ev ); };
  g_canvasID.onmousedown	=	function(ev){myMouseDown( ev, gl, g_canvasID) }; 
  
  					// when user's mouse button goes down call mouseDown() function
  g_canvasID.onmousemove = 	function(ev){myMouseMove( ev, gl, g_canvasID) };
  
											// call mouseMove() function					
  g_canvasID.onmouseup = 		function(ev){myMouseUp(   ev, gl, g_canvasID)};
  document.getElementById('phongLightingSelect').addEventListener('change', function(event) {
    phongLightValue = parseInt(event.target.value, 10);
  });
  document.getElementById('phongShadingSelect').addEventListener('change', function(event) {
    phongShadeValue = parseInt(event.target.value, 10);
  });
  window.addEventListener("keypress", myKeyPress, false);
  var tick = function() {		
    
    drawResize();
    timerAll();
    requestAnimationFrame(tick, gl);  
  };

  tick();
}
//variable for translation
var x_diff_c = 0.5;
var transX_c = 0.0;
var transY_c = 0.0;
var transZ_c = 0.0;
var bodyRot = 180.0;
var state_c = "moving"; // Possible states: "moving", "rotating", "resuming"
var hasRotated_c = false;
var body_rotate = 0.0;

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
var g_angle1min_c  = -30.0;       // init min, max allowed angle, in degrees
var g_angle1max_c  =  30.0;

var g_angle2now_c  =   0.0; 			// init Current rotation angle, in degrees > 0
var g_angle2rate_c =  64.0;				// init Rotation angle rate, in degrees/second.
var g_angle2brake_c=	 1.0;				// init Rotation start/stop. 0=stop, 1=full speed.
var g_angle2min_c  = -360.0;       // init min, max allowed angle, in degrees
var g_angle2max_c  =  360.0;

var g_angle3now_c  =   0.0; 			// init Current rotation angle, in degrees > 0
var g_angle3rate_c =  30.0;				// init Rotation angle rate, in degrees/second.
var g_angle3brake_c=	 1.0;				// init Rotation start/stop. 0=stop, 1=full speed.
var g_angle3min_c  = -10.0;       // init min, max allowed angle, in degrees
var g_angle3max_c  =  10.0;

var g_angle4now_c  =   0.0; 			// init Current rotation angle, in degrees > 0
var g_angle4rate_c =  64.0;				// init Rotation angle rate, in degrees/second.
var g_angle4brake_c=	 1.0;				// init Rotation start/stop. 0=stop, 1=full speed.
var g_angle4min_c  = 30.0;       // init min, max allowed angle, in degrees
var g_angle4max_c  =  90.0;
function timerAll() {
//=============================================================================
// Find new values for all time-varying parameters used for on-screen drawing
  // use local variables to find the elapsed time.
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

    g_angle0now_c += g_angle0rate_c * g_angle0brake * (elapsedMS * 0.001);	// update.
    g_angle1now_c += g_angle1rate_c * g_angle1brake_c * (elapsedMS * 0.001);
    g_angle2now_c += g_angle2rate_c * g_angle2brake_c * (elapsedMS * 0.001);
    g_angle3now_c += g_angle3rate_c * g_angle3brake_c * (elapsedMS * 0.001);
    g_angle4now_c += g_angle4rate_c * g_angle4brake_c * (elapsedMS * 0.001);
    g_angle3now += g_angle3rate * g_angle3brake * (elapsedMS * 0.001);
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

    if((g_angle3now >= g_angle3max && g_angle3rate > 0) || // going over max, or
    (g_angle3now <= g_angle3min && g_angle3rate < 0) )	 // going under min ?
    g_angle3rate *= -1;	// YES: reverse direction.


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
  // for robot arm
  g_angle0now += g_angle0rate * g_angle0brake * (elapsedMS * 0.001);	// update.
  g_angle1now += g_angle1rate * g_angle1brake * (elapsedMS * 0.001);
  g_angle2now += g_angle2rate * g_angle2brake * (elapsedMS * 0.001);
  g_angle4now += g_angle4rate * g_angle4brake * (elapsedMS * 0.001);
  g_angle5now += g_angle5rate * g_angle5brake * (elapsedMS * 0.001);
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

  if((g_angle4now >= g_angle4max && g_angle4rate > 0) || // going over max, or
  (g_angle4now <= g_angle4min && g_angle4rate < 0) )	 // going under min ?
  g_angle4rate *= -1;	// YES: reverse direction.

  if((g_angle5now >= g_angle5max && g_angle5rate > 0) || // going over max, or
  (g_angle5now <= g_angle5min && g_angle5rate < 0) )	 // going under min ?
  // g_angle5rate *= -1;	// YES: reverse direction.


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
  if(g_angle4min > g_angle4max)
  {
    if(     g_angle4now < -180.0) g_angle4now += 360.0;	// go to >= -180.0 or
    else if(g_angle4now >  180.0) g_angle4now -= 360.0;	// go to <= +180.0
  }

  if(g_angle5min > g_angle5max)
  {
    if(     g_angle5now < -180.0) g_angle5now += 360.0;	// go to >= -180.0 or
    else if(g_angle5now >  180.0) g_angle5now -= 360.0;	// go to <= +180.0
  }

}
function drawResize() {
  


  
  setCamera();
  
   		
}
var diffuseOff = false;
var ambientOff = false;
var specOff = false;
function drawAll() {
//=============================================================================
  // Clear on-screen HTML-5 <canvas> object:
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  ambientR = parseFloat(document.getElementById('ambientR').value);
  shiness = parseFloat(document.getElementById('shiness').value);
  ambientG = parseFloat(document.getElementById('ambientG').value);
  ambientB = parseFloat(document.getElementById('ambientB').value);
  
  diffuseR = parseFloat(document.getElementById('diffuseR').value);
  diffuseG = parseFloat(document.getElementById('diffuseG').value);
  diffuseB = parseFloat(document.getElementById('diffuseB').value);

  specularR = parseFloat(document.getElementById('specularR').value);
  specularG = parseFloat(document.getElementById('specularG').value);
  specularB = parseFloat(document.getElementById('specularB').value);

var b4Draw = Date.now();
var b4Wait = b4Draw - g_lastMS;

	if(g_show0 == 1) {	// IF user didn't press HTML button to 'hide' VBO0:
	  worldBox.switchToMe();  // Set WebGL to render from this VBObox.
		worldBox.adjust();		  // Send new values for uniforms to the GPU, and
		worldBox.draw();			  // draw our VBO's contents using our shaders.
  }
  if (phongShadeValue ==0){
    gouraudBox.switchToMe();  // Set WebGL to render from this VBObox.
  	gouraudBox.adjust();		  // Send new values for uniforms to the GPU, and
  	gouraudBox.draw();		
  }else{
    sphereGBox.switchToMe();
    sphereGBox.adjust();		  // Send new values for uniforms to the GPU, and
  	sphereGBox.draw();	
  }

	// if(g_show2 == 1) { // IF user didn't press HTML button to 'hide' VBO2:
	//   phongBox.switchToMe();  // Set WebGL to render from this VBObox.
  // 	phongBox.adjust();		  // Send new values for uniforms to the GPU, and
  // 	phongBox.draw();			  // draw our VBO's contents using our shaders.
  // 	}
  //phongShadeValue = 0;
  if (phongShadeValue == 0){
    objectBox.switchToMe();  // Set WebGL to render from this VBObox.
    objectBox.adjust(diffuseOff, ambientOff, specOff);	
  }else{
    objectGBox.switchToMe();
    objectGBox.adjust();
  }

  
  //objectBox.draw();
  // robotBox.switchToMe();  // Set WebGL to render from this VBObox.
  // robotBox.adjust();	

  // triBox.switchToMe();  // Set WebGL to render from this VBObox.
  // triBox.adjust();	
  if (phongShadeValue ==0){
    object1Box.switchToMe();  // Set WebGL to render from this VBObox.
    object1Box.adjust();
  }else{
    object1GBox.switchToMe();  // Set WebGL to render from this VBObox.
    object1GBox.adjust();
  }
  
/* // ?How slow is our own code?  	
var aftrDraw = Date.now();
var drawWait = aftrDraw - b4Draw;
console.log("wait b4 draw: ", b4Wait, "drawWait: ", drawWait, "mSec");

*/
}

function VBO0toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO0'.
  if(g_show0 != 1) g_show0 = 1;				// show,
  else g_show0 = 0;										// hide.
  console.log('g_show0: '+g_show0);
}

function VBO1toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO1'.
  if(g_show1 != 1) g_show1 = 1;			// show,
  else g_show1 = 0;									// hide.
  console.log('g_show1: '+g_show1);
}

function VBO2toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO2'.
  if(g_show2 != 1) g_show2 = 1;			// show,
  else g_show2 = 0;									// hide.
  console.log('g_show2: '+g_show2);
}
// for cameras
//for perspective view
var camPos = new Vector3([5.0, 5.0, 3.0]);  // Camera position
var camLookAt = new Vector3([0, 0, 0]); // Look-at point
var camUp = new Vector3([0, 0, 1]);  // 'up' vector
function setCamera() {
//============================================================================
// PLACEHOLDER:  sets a fixed camera at a fixed position for use by
// ALL VBObox objects.  REPLACE This with your own camera-control code.
  var xtraMargin = 16;   
  g_canvasID.width = (innerWidth-xtraMargin) 
  g_canvasID.height = (innerHeight*0.7);
  var vpAspect = g_canvasID.width /			// On-screen aspect ratio for
								(g_canvasID.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0,											// Viewport lower-left corner
  0, 			// location(in pixels)
  g_canvasID.width, 				// viewport width,
  g_canvasID.height);	
  // gl.viewport(0, 0, g_canvasID.width, g_canvasID.height); 
	g_worldMat.setIdentity();
	g_worldMat.perspective(40.0,   // FOVY: top-to-bottom vertical image angle, in degrees
  vpAspect,   // Image Aspect Ratio: camera lens width/height
                      1.0,   // camera z-near distance (always positive; frustum begins at z = -znear)
                      200.0);  // camera z-far distance (always positive; frustum ends at z = -zfar)

  g_worldMat.lookAt(camPos.elements[0], camPos.elements[1], camPos.elements[2],
    camLookAt.elements[0], camLookAt.elements[1], camLookAt.elements[2],
    camUp.elements[0], camUp.elements[1], camUp.elements[2]);	// View UP vector.
	// READY to draw in the 'world' coordinate system.
//------------END COPY
drawAll();

}

//cameras movements
function moveCamera(direction, amount) {
  // Calculate the forward direction vector based on camPos and camLookAt
  var forward = new Vector3([
      camLookAt.elements[0] - camPos.elements[0],
      camLookAt.elements[1] - camPos.elements[1],
      camLookAt.elements[2] - camPos.elements[2]
  ]);
  forward.normalize();

  // Calculate the right vector as a cross product of forward direction and up vector
  var right = forward.cross(camUp);
  right.normalize();

  // Adjust camPos and camLookAt based on the input direction
  switch(direction) {
      case 'forward':
          camPos.elements[0] += forward.elements[0] * amount;
          camPos.elements[1] += forward.elements[1] * amount;
          camPos.elements[2] += forward.elements[2] * amount;
          camLookAt.elements[0] += forward.elements[0] * amount;
          camLookAt.elements[1] += forward.elements[1] * amount;
          camLookAt.elements[2] += forward.elements[2] * amount;
          break;
      case 'backward':
          camPos.elements[0] -= forward.elements[0] * amount;
          camPos.elements[1] -= forward.elements[1] * amount;
          camPos.elements[2] -= forward.elements[2] * amount;
          camLookAt.elements[0] -= forward.elements[0] * amount;
          camLookAt.elements[1] -= forward.elements[1] * amount;
          camLookAt.elements[2] -= forward.elements[2] * amount;
          break;
      case 'right':
          camPos.elements[0] += right.elements[0] * amount;
          camPos.elements[1] += right.elements[1] * amount;
          camPos.elements[2] += right.elements[2] * amount;
          camLookAt.elements[0] += right.elements[0] * amount;
          camLookAt.elements[1] += right.elements[1] * amount;
          camLookAt.elements[2] += right.elements[2] * amount;
          break;
      case 'left':
          camPos.elements[0] -= right.elements[0] * amount;
          camPos.elements[1] -= right.elements[1] * amount;
          camPos.elements[2] -= right.elements[2] * amount;
          camLookAt.elements[0] -= right.elements[0] * amount;
          camLookAt.elements[1] -= right.elements[1] * amount;
          camLookAt.elements[2] -= right.elements[2] * amount;
          break;
      // Add more directions if needed
  }



}


function rotateCamera(axis, angleDeg) {
  var rad = Math.PI / 180 * angleDeg;
  var rotMatrix = new Matrix4();

  rotMatrix.setRotate(rad, 0, 0, 1);
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
function extractPositionFromMatrix(matrix) {
  return [matrix.elements[12], matrix.elements[13], matrix.elements[14]];
}


function keydown(ev) {
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
      moveCamera('backward', 1);
      break;

    case 87: //w
      moveCamera('forward', 1);
      break;
    case 65: //a
      moveCamera('left', 1);
      break;

    case 68: //d
      moveCamera('right', 1);
      break;
    default: return; 
  }

  }
  
  function DiffuseOff(){
    diffuseOff = !diffuseOff;
    if (diffuseOff){
      document.getElementById('diffuseclick').textContent = 'Diffuse Off';
    }else{
      document.getElementById('diffuseclick').textContent = 'Diffuse On';
    }
    
  }

  function AmbientOff(){
    ambientOff = !ambientOff;
    if (ambientOff){
      document.getElementById('ambinetclick').textContent = 'Ambient Off';
    }else{
      document.getElementById('ambinetclick').textContent = 'Ambient On';
    }
    
    
  }

  function SpecOff(){
    specOff = !specOff;
    if (specOff){
      document.getElementById('specularclick').textContent = 'Specular Off';
    }else{
      document.getElementById('specularclick').textContent = 'Specular On';
    }
  }
// Global vars for mouse click-and-drag for rotation.
var isDrag=false;		// mouse-drag: true when user holds down mouse button
var xMclik=0.0;			// last mouse button-down position (in CVV coords)
var yMclik=0.0;   
var xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0; 
  function clearDrag() {
    // Called when user presses 'Clear' button in our webpage
      xMdragTot = 0.0;
      yMdragTot = 0.0;
          // REPORT updated mouse position on-screen
      document.getElementById('Mouse').innerHTML=
          'Mouse Drag totals (CVV coords):\t'+xMdragTot+', \t'+yMdragTot;	
    
      lightPos = new Vector3([6,2,10])
      drawAll();		// update GPU uniforms &  draw the newly-updated image.
    }


function myMouseDown(ev, gl, canvas) {
  //==============================================================================
  // Called when user PRESSES down any mouse button;
  // 									(Which button?    console.log('ev.button='+ev.button);   )
  // 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
  //		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  
  
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
//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

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
//	console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

//Mouse-Drag Moves Lamp0 ========================================================
  // Use accumulated mouse-dragging to change the global var 'lightPos';
  // (note how accumulated mouse-dragging sets xmDragTot, ymDragTot below:
  //  use the same method to change the y,z coords of lamp0Pos)

  console.log('lightPos.elements[0] = ', lightPos.elements[0], '\n');
  lightPos.elements.set([	
          lightPos.elements[0],
          lightPos.elements[1] + 4.0*(x-xMclik),	// Horiz drag: change world Y
          lightPos.elements[2] + 4.0*(y-yMclik) 	// Vert. drag: change world Z
                          ]);
  /* OLD
  lamp0Pos.set([lamp0Pos[0],										// don't change world x;
                lamp0Pos[1] + 4.0*(x - xMclik),		// Horiz drag*4 changes world y
                lamp0Pos[2] + 4.0*(y - yMclik)]);	// Vert drag*4 changes world z
*/ 
drawAll();				// re-draw the image using this updated uniform's value
// REPORT new lamp0 position on-screen
    document.getElementById('Mouse').innerHTML=
      'Lamp0 position(x,y,z):\t('+ lightPos.elements[0].toFixed(5) +
                            '\t' + lightPos.elements[1].toFixed(5) +
                            '\t' + lightPos.elements[2].toFixed(5) + ')';	
  
//END=====================================================================

  // find how far we dragged the mouse:
  xMdragTot += (x - xMclik);					// Accumulate change-in-mouse-position,&
  yMdragTot += (y - yMclik);
  xMclik = x;													// Make next drag-measurement from here.
  yMclik = y;
  
/*	  // REPORT updated mouse position on-screen
    document.getElementById('Mouse').innerHTML=
      'Mouse Drag totals (CVV coords):\t'+xMdragTot+', \t'+yMdragTot;	
*/
};
      
function myMouseUp(ev, gl, canvas) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

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
  console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
  
  isDrag = false;											// CLEAR our mouse-dragging flag, and
  // accumulate any final bit of mouse-dragging we did:
  xMdragTot += (x - xMclik);
  yMdragTot += (y - yMclik);
  console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
};
function myKeyPress(ev) {
  //===============================================================================
  // Best for capturing alphanumeric keys and key-combinations such as 
  // CTRL-C, alt-F, SHIFT-4, etc.
    switch(ev.keyCode)
    {
      case 77:	// UPPER-case 'M' key:
      case 109:	// LOWER-case 'm' key:
        matlSel = (matlSel +1)%MATL_DEFAULT;	// see materials_Ayerdi.js for list
        matl0.setMatl(matlSel);								// set new material reflectances,
															// re-draw on-screen image.
        break;
      case 83: // UPPER-case 's' key:
        matl0.K_shiny += 1.0;								// INCREASE shinyness, but with a
        if(matl0.K_shiny > 128.0) matl0.K_shiny = 128.0;	// upper limit.
        console.log('UPPERcase S: ++K_shiny ==', matl0.K_shiny,'\n');	
													// re-draw on-screen image.
        break;
      case 115:	// LOWER-case 's' key:
        matl0.K_shiny += -1.0;								// DECREASE shinyness, but with a
        if(matl0.K_shiny < 1.0) matl0.K_shiny = 1.0;		// lower limit.
        console.log('lowercase s: --K_shiny ==', matl0.K_shiny, '\n');
											// re-draw on-screen image.
        break;
      default:
  /* SILENCE!
      console.log('myKeyPress():keyCode=' +ev.keyCode  +', charCode=' +ev.charCode+
                            ', shift='    +ev.shiftKey + ', ctrl='    +ev.ctrlKey +
                            ', altKey='   +ev.altKey   +
                            ', metaKey(Command key or Windows key)='+ev.metaKey);
  */
      break;
    }
  }