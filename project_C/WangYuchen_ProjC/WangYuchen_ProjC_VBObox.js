//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)

// Tabs set to 2

/*=====================
  VBObox-Lib.js library: 
  ===================== 
Note that you don't really need 'VBObox' objects for any simple, 
    beginner-level WebGL/OpenGL programs: if all vertices contain exactly 
		the same attributes (e.g. position, color, surface normal), and use 
		the same shader program (e.g. same Vertex Shader and Fragment Shader), 
		then our textbook's simple 'example code' will suffice.
		  
***BUT*** that's rare -- most genuinely useful WebGL/OpenGL programs need 
		different sets of vertices with  different sets of attributes rendered 
		by different shader programs.  THUS a customized VBObox object for each 
		VBO/shader-program pair will help you remember and correctly implement ALL 
		the WebGL/GLSL steps required for a working multi-shader, multi-VBO program.
		
One 'VBObox' object contains all we need for WebGL/OpenGL to render on-screen a 
		set of shapes made from vertices stored in one Vertex Buffer Object (VBO), 
		as drawn by calls to one 'shader program' that runs on your computer's 
		Graphical Processing Unit(GPU), along with changes to values of that shader 
		program's one set of 'uniform' varibles.  
The 'shader program' consists of a Vertex Shader and a Fragment Shader written 
		in GLSL, compiled and linked and ready to execute as a Single-Instruction, 
		Multiple-Data (SIMD) parallel program executed simultaneously by multiple 
		'shader units' on the GPU.  The GPU runs one 'instance' of the Vertex 
		Shader for each vertex in every shape, and one 'instance' of the Fragment 
		Shader for every on-screen pixel covered by any part of any drawing 
		primitive defined by those vertices.
The 'VBO' consists of a 'buffer object' (a memory block reserved in the GPU),
		accessed by the shader program through its 'attribute' variables. Shader's
		'uniform' variable values also get retrieved from GPU memory, but their 
		values can't be changed while the shader program runs.  
		Each VBObox object stores its own 'uniform' values as vars in JavaScript; 
		its 'adjust()'	function computes newly-updated values for these uniform 
		vars and then transfers them to the GPU memory for use by shader program.
EVENTUALLY you should replace 'cuon-matrix-quat03.js' with the free, open-source
   'glmatrix.js' library for vectors, matrices & quaternions: Google it!
		This vector/matrix library is more complete, more widely-used, and runs
		faster than our textbook's 'cuon-matrix-quat03.js' library.  
		--------------------------------------------------------------
		I recommend you use glMatrix.js instead of cuon-matrix-quat03.js
		--------------------------------------------------------------
		for all future WebGL programs. 
You can CONVERT existing cuon-matrix-based programs to glmatrix.js in a very 
    gradual, sensible, testable way:
		--add the glmatrix.js library to an existing cuon-matrix-based program;
			(but don't call any of its functions yet).
		--comment out the glmatrix.js parts (if any) that cause conflicts or in	
			any way disrupt the operation of your program.
		--make just one small local change in your program; find a small, simple,
			easy-to-test portion of your program where you can replace a 
			cuon-matrix object or function call with a glmatrix function call.
			Test; make sure it works. Don't make too large a change: it's hard to fix!
		--Save a copy of this new program as your latest numbered version. Repeat
			the previous step: go on to the next small local change in your program
			and make another replacement of cuon-matrix use with glmatrix use. 
			Test it; make sure it works; save this as your next numbered version.
		--Continue this process until your program no longer uses any cuon-matrix
			library features at all, and no part of glmatrix is commented out.
			Remove cuon-matrix from your library, and now use only glmatrix.

	------------------------------------------------------------------
	VBObox -- A MESSY SET OF CUSTOMIZED OBJECTS--NOT REALLY A 'CLASS'
	------------------------------------------------------------------
As each 'VBObox' object can contain:
  -- a DIFFERENT GLSL shader program, 
  -- a DIFFERENT set of attributes that define a vertex for that shader program, 
  -- a DIFFERENT number of vertices to used to fill the VBOs in GPU memory, and 
  -- a DIFFERENT set of uniforms transferred to GPU memory for shader use.  
  THUS:
		I don't see any easy way to use the exact same object constructors and 
		prototypes for all VBObox objects.  Every additional VBObox objects may vary 
		substantially, so I recommend that you copy and re-name an existing VBObox 
		prototype object, and modify as needed, as shown here. 
		(e.g. to make the VBObox3 object, copy the VBObox2 constructor and 
		all its prototype functions, then modify their contents for VBObox3 
		activities.)

*/

// Written for EECS 351-2,	Intermediate Computer Graphics,
//							Northwestern Univ. EECS Dept., Jack Tumblin
// 2016.05.26 J. Tumblin-- Created; tested on 'TwoVBOs.html' starter code.
// 2017.02.20 J. Tumblin-- updated for EECS 351-1 use for Project C.
// 2018.04.11 J. Tumblin-- minor corrections/renaming for particle systems.
//    --11e: global 'gl' replaced redundant 'myGL' fcn args; 
//    --12: added 'SwitchToMe()' fcn to simplify 'init()' function and to fix 
//      weird subtle errors that sometimes appear when we alternate 'adjust()'
//      and 'draw()' functions of different VBObox objects. CAUSE: found that
//      only the 'draw()' function (and not the 'adjust()' function) made a full
//      changeover from one VBObox to another; thus calls to 'adjust()' for one
//      VBObox could corrupt GPU contents for another.
//      --Created vboStride, vboOffset members to centralize VBO layout in the 
//      constructor function.
//    -- 13 (abandoned) tried to make a 'core' or 'resuable' VBObox object to
//      which we would add on new properties for shaders, uniforms, etc., but
//      I decided there was too little 'common' code that wasn't customized.
//=============================================================================


//=============================================================================
//=============================================================================
function VBObox0() {
//=============================================================================
//=============================================================================
// CONSTRUCTOR for one re-usable 'VBObox0' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WITHOUT disrupting any other code, ever!
  
	this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
 `precision highp float;				// req'd in OpenGL ES if we use 'float'
  //
  uniform mat4 u_ModelMat0;
  attribute vec4 a_Pos0;
  attribute vec3 a_Colr0;
  varying vec3 v_Colr0;
  //
  void main() {
    gl_Position = u_ModelMat0 * a_Pos0;
  	 v_Colr0 = a_Colr0;
   }`;

	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
 `precision mediump float;
  varying vec3 v_Colr0;
  void main() {
    gl_FragColor = vec4(v_Colr0, 1.0);
  }`;
  const gridLines = [];
  const gridSize = 100;
  const gridStep = 1;
  const y = 0; // Ground plane Y coordinate
  const color = [0.6, 0.6, 0.6]; // Grey color for grid lines
  
  function makeGround() {
    var gridSize = 100; // Size of the grid
    var gridStep = 0.3; // Distance between lines
    var vertices = [];
    vertices.push(0.0,	 0.0,	0.0, 1.0,		1.0, 1.0, 1.0);
    vertices.push(2.0,  0.0, 0.0, 1.0,		1.0, 0.0, 0.0);
    vertices.push(0.0,	 0.0,	0.0, 1.0,		1.0, 1.0, 1.0);
    vertices.push(0.0,  2.0, 0.0, 1.0,		0.0, 1.0, 0.0);
    vertices.push(0.0,	 0.0,	0.0, 1.0,		1.0, 1.0, 1.0);
    vertices.push(0.0,  0.0, 2.0, 1.0,		0.0, 0.2, 1.0);


    for (var x = -gridSize; x <= gridSize; x += gridStep) {
        for (var y = -gridSize; y <= gridSize; y += gridStep) {
            // Line in x direction
            vertices.push(-x+ gridStep,   y,	0.0, 1.0,		0.6, 0.6, 0.6);
            vertices.push(x + gridStep,   y, 0.0, 1.0,		0.6, 0.6, 0.6);
            // Line in z direction
            vertices.push(x,	y,	0.0, 1.0,		0.6, 0.6, 0.6);
            vertices.push(x,   y+gridStep, 0.0 , 1.0,		0.6, 0.6, 0.6);
        }
    }
    return vertices;
}
  
	this.vboContents = //---------------------------------------------------------
	new Float32Array (					// Array of vertex attribute values we will
  makeGround()

  

    
    
		 );
  

  this.vboVerts = (this.vboContents.length)/7;	
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
	                              // bytes req'd by 1 vboContents array element;
																// (why? used to compute stride and offset 
																// in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;               
                                // total number of bytes stored in vboContents
                                // (#  of floats in vboContents array) * 
                                // (# of bytes/float).
	this.vboStride = this.vboBytes / this.vboVerts; 
	                              // (== # of bytes to store one complete vertex).
	                              // From any attrib in a given vertex in the VBO, 
	                              // move forward by 'vboStride' bytes to arrive 
	                              // at the same attrib for the next vertex. 

	            //----------------------Attribute sizes
  this.vboFcount_a_Pos0 =  4;    // # of floats in the VBO needed to store the
                                // attribute named a_Pos0. (4: x,y,z,w values)
  this.vboFcount_a_Colr0 = 3;   // # of floats for this attrib (r,g,b values) 
  console.assert((this.vboFcount_a_Pos0 +     // check the size of each and
                  this.vboFcount_a_Colr0) *   // every attribute in our VBO
                  this.FSIZE == this.vboStride, // for agreeement with'stride'
                  "Uh oh! VBObox0.vboStride disagrees with attribute-size values!");

              //----------------------Attribute offsets  
	this.vboOffset_a_Pos0 = 0;    // # of bytes from START of vbo to the START
	                              // of 1st a_Pos0 attrib value in vboContents[]
  this.vboOffset_a_Colr0 = this.vboFcount_a_Pos0 * this.FSIZE;    
                                // (4 floats * bytes/float) 
                                // # of bytes from START of vbo to the START
                                // of 1st a_Colr0 attrib value in vboContents[]
	            //-----------------------GPU memory locations:
	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
	                              // returned by gl.createBuffer() function call
	this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
								          //------Attribute locations in our shaders:
	this.a_PosLoc;								// GPU location for 'a_Pos0' attribute
	this.a_ColrLoc;								// GPU location for 'a_Colr0' attribute

	            //---------------------- Uniform locations &values in our shaders
	this.ModelMat = new Matrix4();	// Transforms CVV axes to model axes.
	this.u_ModelMatLoc;							// GPU location for u_ModelMat uniform
}


VBObox0.prototype.init = function() {
//=============================================================================
// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
// kept in this VBObox. (This function usually called only once, within main()).
// Specifically:
// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
//  executable 'program' stored and ready to use inside the GPU.  
// b) create a new VBO object in GPU memory and fill it by transferring in all
//  the vertex data held in our Float32array member 'VBOcontents'. 
// c) Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
// -------------------
// CAREFUL!  before you can draw pictures using this VBObox contents, 
//  you must call this VBObox object's switchToMe() function too!
//--------------------
// a) Compile,link,upload shaders-----------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
// CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
//  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

// b) Create VBO on GPU, fill it------------------------------------------------
	this.vboLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				  // the ID# the GPU uses for this buffer.

  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
  //    use gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.
  //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
  //	(see OpenGL ES specification for more info).  Your choices are:
  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents rarely or never change.
  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents may change often as our program runs.
  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
  // 			times and then discarded; for rapidly supplied & consumed VBOs.

  // c1) Find All Attributes:---------------------------------------------------
  //  Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (for switchToMe(), adjust(), draw(), reload(),etc.)
  this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, 'a_Pos0');
  if(this.a_PosLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() Failed to get GPU location of attribute a_Pos0');
    return -1;	// error exit.
  }
 	this.a_ColrLoc = gl.getAttribLocation(this.shaderLoc, 'a_Colr0');
  if(this.a_ColrLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() failed to get the GPU location of attribute a_Colr0');
    return -1;	// error exit.
  }
  
  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
	this.u_ModelMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMat0');
  if (!this.u_ModelMatLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_ModelMat1 uniform');
    return;
  }  
}

VBObox0.prototype.switchToMe = function() {
//==============================================================================
// Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
//
// We only do this AFTER we called the init() function, which does the one-time-
// only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
// even then, you are STILL not ready to draw our VBObox's contents onscreen!
// We must also first complete these steps:
//  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
//  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
//  c) tell the GPU to connect the shader program's attributes to that VBO.

// a) select our shader program:
  gl.useProgram(this.shaderLoc);	
//		Each call to useProgram() selects a shader program from the GPU memory,
// but that's all -- it does nothing else!  Any previously used shader program's 
// connections to attributes and uniforms are now invalid, and thus we must now
// establish new connections between our shader program's attributes and the VBO
// we wish to use.  
  
// b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
//  instead connect to our own already-created-&-filled VBO.  This new VBO can 
//    supply values to use as attributes in our newly-selected shader program:
	gl.bindBuffer(gl.ARRAY_BUFFER,	        // GLenum 'target' for this GPU buffer 
										this.vboLoc);			    // the ID# the GPU uses for our VBO.

// c) connect our newly-bound VBO to supply attribute variable values for each
// vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
// this sets up data paths from VBO to our shader units:
  // 	Here's how to use the almost-identical OpenGL version of this function:
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
		this.a_PosLoc,//index == ID# for the attribute var in your GLSL shader pgm;
		this.vboFcount_a_Pos0,// # of floats used by this attribute: 1,2,3 or 4?
		gl.FLOAT,			// type == what data type did we use for those numbers?
		false,				// isNormalized == are these fixed-point values that we need
									//									normalize before use? true or false
		this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
		              // stored attrib for this vertex to the same stored attrib
		              //  for the next vertex in our VBO.  This is usually the 
									// number of bytes used to store one complete vertex.  If set 
									// to zero, the GPU gets attribute values sequentially from 
									// VBO, starting at 'Offset'.	
									// (Our vertex size in bytes: 4 floats for pos + 3 for color)
		this.vboOffset_a_Pos0);						
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (We start with position).
  gl.vertexAttribPointer(this.a_ColrLoc, this.vboFcount_a_Colr0, 
                        gl.FLOAT, false, 
                        this.vboStride, this.vboOffset_a_Colr0);
  							
// --Enable this assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_PosLoc);
  gl.enableVertexAttribArray(this.a_ColrLoc);
}

VBObox0.prototype.isReady = function() {
//==============================================================================
// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
// this objects VBO and shader program; else return false.
// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

var isOK = true;

  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox0.prototype.adjust = function() {
//==============================================================================
// Update the GPU to newer, current values we now store for 'uniform' vars on 
// the GPU; and (if needed) update each attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }  
	// Adjust values for our uniforms,

		this.ModelMat.setIdentity();
// THIS DOESN'T WORK!!  this.ModelMatrix = g_worldMat;
  this.ModelMat.set(g_worldMat);	// use our global, shared camera.
// READY to draw in 'world' coord axes.
	
//  this.ModelMat.rotate(g_angleNow0, 0, 0, 1);	  // rotate drawing axes,
//  this.ModelMat.translate(0.35, 0, 0);							// then translate them.
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatLoc,	// GPU location of the uniform
  										false, 				// use matrix transpose instead?
  										this.ModelMat.elements);	// send data from Javascript.
  // Adjust the attributes' stride and offset (if necessary)
  // (use gl.vertexAttribPointer() calls and gl.enableVertexAttribArray() calls)
}

VBObox0.prototype.draw = function() {
//=============================================================================
// Render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }  
  // ----------------------------Draw the contents of the currently-bound VBO:
  gl.drawArrays(gl.LINES, 	    // select the drawing primitive to draw,
                  // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
                  //          gl.TRIANGLES, gl.TRIANGLE_STRIP, ...
  								0, 								// location of 1st vertex to draw;
  								this.vboVerts);		// number of vertices to draw on-screen.
}

VBObox0.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU inside our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// contents to our VBO without changing any GPU memory allocations.

 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO

}
/*
VBObox0.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox0.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/

//=============================================================================
//=============================================================================
function VBObox1() {
//=============================================================================
//=============================================================================
// CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WITHOUT disrupting any other code, ever!
  
this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
`precision highp float;				// req'd in OpenGL ES if we use 'float'
 //
 struct MatlT {		// Describes one Phong material by its reflectances:
   vec3 emit;			// Ke: emissive -- surface 'glow' amount (r,g,b);
   vec3 ambi;			// Ka: ambient reflectance (r,g,b)
   vec3 diff;			// Kd: diffuse reflectance (r,g,b)
   vec3 spec; 		// Ks: specular reflectance (r,g,b)
   int shiny;			// Kshiny: specular exponent (integer >= 1; typ. <200)
   };
 uniform mat4 u_ModelMatrix;
 attribute vec4 a_Pos1;
 attribute vec4 a_Normal;
 uniform vec3 u_Kd; 

 uniform mat4 u_MvpMatrix; 

 varying vec3 v_Kd; 
 varying vec4 v_Position;	
 varying vec3 v_Normal;
 uniform mat4 u_NormalMatrix; 
 


 //
 void main() {
   gl_Position = u_MvpMatrix * a_Pos1;
   v_Position = u_ModelMatrix * a_Pos1;
   v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
   v_Kd = u_Kd;
   
  }`;
//========YOUR CHOICE OF 3 Fragment shader programs=======
//				(use /* and */ to uncomment ONLY ONE)
// Each is an example of how to use the built-in vars for gl.POINTS to
// improve their on-screen appearance.
// a)'SQUARE points' -- DEFAULT; simple fixed-color square set by point-size.
// b) 'ROUND FLAT' -- uses 'gl_PointCoord' to make solid-color dot instead;
// c) 'SHADED Sphere' -- radial distance sets color to 'fake' a lit 3D sphere.
//   You too can be a 'shader writer'! What other fragment shaders would help?

// a) SQUARE points:
this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
`#ifdef GL_ES
precision mediump float;
#endif
 uniform vec3 u_DiffuseLight;   // Diffuse light color
uniform vec3 u_AmbientLight;   // Color of an ambient light
uniform vec3 u_Ka; // Ambient reflectance
uniform vec3 u_Ks; // Specular reflectance
uniform vec3 u_Lamp0Spec;			// Phong Illum: specular
uniform vec3 u_Ke;						// Phong Reflectance: emissive
uniform vec4 u_Lamp0Pos; 
uniform vec4 u_eyePosWorld;
uniform float shininess;
uniform float u_PhongLight;

varying vec3 v_Normal;				// Find 3D surface normal at each pix
varying vec4 v_Position;			// pixel's 3D pos too -- in 'world' coords
varying vec3 v_Kd;


 void main() {
   vec3 normal = normalize(v_Normal); 
   vec3 lightDirection = normalize(u_Lamp0Pos.xyz - v_Position.xyz);
   vec3 eyeDirection = normalize(u_eyePosWorld.xyz- v_Position.xyz); 
   vec3 H = normalize(lightDirection + eyeDirection); 
   float nDotH = max(dot(H, normal), 0.0); 
   float e02 = pow(nDotH, shininess); 
 float e04 = e02*e02; 
 float e08 = e04*e04; 
 float e16 = e08*e08; 
 float e32 = e16*e16;  
 float e64 = pow(nDotH, shininess);
 vec3 emissive = u_Ke;
   float nDotL = max(dot(lightDirection, normal), 0.0);
   // Calculate the color due to diffuse reflection
  vec3 diffuse = u_DiffuseLight * nDotL * v_Kd;
   // Calculate the color due to ambient reflection
  vec3 ambient = u_AmbientLight * u_Ka;

  if (u_PhongLight == 1.0){
    vec3 reflectDir = reflect(-lightDirection, normal);
    float specAngle = max(dot(reflectDir, eyeDirection), 0.0);
    vec3 speculr = u_Lamp0Spec * u_Ks * pow(specAngle, shininess);
   gl_FragColor = vec4(diffuse + ambient +speculr + emissive, 1);
  }else{
    float spec = pow(nDotL, shininess) ;
    vec3 speculr = u_Lamp0Spec * u_Ks * e64;
   gl_FragColor = vec4(diffuse + ambient + speculr + emissive, 1);
  }




 }`;



/*
 // b) ROUND FLAT dots:
	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
 `precision mediump float;
  varying vec3 v_Colr1;
  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5, 0.5)); 
    if(dist < 0.5) {
      gl_FragColor = vec4(v_Colr1, 1.0);
      } else {discard;};
  }`;
*/
// /*
 // c) SHADED, sphere-like dots:
// 	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
//  `precision mediump float;
//   varying vec3 v_Colr1;
//   void main() {
//     float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
//     if(dist < 0.5) {
//  	  	gl_FragColor = vec4((1.0-2.0*dist)*v_Colr1.rgb, 1.0);
//       } else {discard;};
//   }`;
//*/
	this.vboContents = //---------------------------------------------------------
		new Float32Array ([					// Array of vertex attribute values we will
  															// transfer to GPU's vertex buffer object (VBO)
			// 1 vertex per line: pos1 x,y,z,w;   colr1; r,g,b;   ptSiz1; 
  	// -0.3,  0.7,	0.0, 1.0,		0.0, 1.0, 1.0,  17.0,
    // -0.3, -0.3, 0.0, 1.0,		1.0, 0.0, 1.0,  20.0,
    //  0.3, -0.3, 0.0, 1.0,		1.0, 1.0, 0.0,  33.0,
    0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
-0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
-0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
-0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
-0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
-0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
-0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
-0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
-0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
-0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
-0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
-0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
-0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
-0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
-0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
-0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
-1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
-0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
-0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
-0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
-0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
-0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
-0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
-0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
-0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
-0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
-0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
-0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
-0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
-0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
-0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
-0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
-0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
-0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
-0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
-0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
-0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
-0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
-0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
-0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
-0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
-0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
-0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
-0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
-0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
-0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
-0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
-0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
-0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
-0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
-0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
-0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
-0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
-0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
-0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
-0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
-0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
-0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
-0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
-0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
-0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
-1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
-0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
-0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
-0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
-0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
-0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
-0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
-0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
-0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
-0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
-0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
-0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
-0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
-0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
-0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
-0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
-0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
-0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
-0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
-0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
-0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
-0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
-0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
-0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
-0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
-0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
-0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
-0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
-0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
-0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
-0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
-0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
-0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
-0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
-0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
-0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
-0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
-0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
-0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
-0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
-0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
-0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
-0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
-0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
-0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
-0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
-0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
-0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
-0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
-0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
-0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
-0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
-0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
-0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
-0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
-0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
-0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
-0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
-0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
-0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
-0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
-0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
-0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
-0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
-0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
-0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
-0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
-0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
-0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
-0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
-0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
-0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
-0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
-0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
-0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
-0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
-0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
-0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
-0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
-0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
-0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
-0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
-0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
-0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
-0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
-0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
-0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
-0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
-0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
-0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
-0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
-0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
-0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
-0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
-0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
-0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
-0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
-0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
-0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
-0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
-0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
-0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
-0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
-0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
-0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
-0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
-0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
-0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
-0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
-0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
-0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
-0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
-0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
-0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
-0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
-0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
-0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
-0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
-0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
-0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
-0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
-0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
-0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
-0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
-0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
-0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
-0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
-0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
-0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
-0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
-0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
-0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
-0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
-0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
-0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
-0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
-0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
-0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
-0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
-0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
-0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
-0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
-0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
-0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
-0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
-0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
-0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
-0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
-0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
-0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
-0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
-0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
-0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
-0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
-0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
-0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
-0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
-0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
-0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
-0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
-0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
-0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
-0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
-0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
-0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
-0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
-0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
-0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
-0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
-0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
-0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
-0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
-0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
-0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
-0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
-0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
-0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
-0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
-0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
-0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
-0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
-0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
-0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
-0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
-0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
-0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
-0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
-0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
-0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
-0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
-0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
-0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
-0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
-0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
-0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
-0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
-0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
-0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
-0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
-0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
-0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
-0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
-0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
-0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
-0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
-0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
-0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
-0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
-0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
-0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
-0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
-0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
-0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
-0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
-0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
-0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
-0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
-0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
-0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
-0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
-0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
-0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
-0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
-0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
-0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
-0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
-0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
-0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
-0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
-0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
-0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
-0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
-0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
-0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
-1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
-0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
-1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
-0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
-0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
-0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
-0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
-0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
-0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
-0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
-0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
-0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
-0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
-0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
-0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
-0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
-0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
-0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
-0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
-0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
-0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
-0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
-0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
-0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
-0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
-0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
-0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
-0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
-0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
-0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
-0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
-0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
-0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
-0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
-0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
-0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
-0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
-0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
-0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
-0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
-0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
-0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
-0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
-0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
-0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
-0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
-0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
-0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
-0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
-0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
-0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
-0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
-0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
-0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
-0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
-0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
-0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
-0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
-0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
-0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
-0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
-0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
-0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
-0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
-0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
-0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
-0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
-0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
-0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
-0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
-0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
-0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
-0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
-0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
-0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
-0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
-0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
-0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
-0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
-0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
-0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
-0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
-0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
-0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
-0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
-0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
-0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
-0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
-0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
-0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
-0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
-0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
-0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
-0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
-0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
-0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
-0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
-0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
-0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
-0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
-0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
-0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
-0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
-0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
-0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
-0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
-0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
-0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
-0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
-0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
-0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
-0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
-0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
-0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
-0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
-0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
-0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
-0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
-0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
-0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
-0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
-1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
-0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
-0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
-0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
-0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
-0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
-0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
-1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
-0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
-0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
-0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
-0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
-0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
-0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
-0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
-0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
-0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
-0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
-0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
-0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
-0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
-0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
-0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
-0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
-0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
-0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
-0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
-0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
-0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
-0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
-0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
-0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
-0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
-0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
-0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
-0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
-0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
-0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
-0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
-0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
-0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
-0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
-0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
-0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
-0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
-0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
-0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
-0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
-0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
-0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
-0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
-0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
-0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
-0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 

  ]);	
  
	this.vboVerts =this.vboContents.length/7;							// # of vertices held in 'vboContents' array;
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
	                              // bytes req'd by 1 vboContents array element;
																// (why? used to compute stride and offset 
																// in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;               
                                // (#  of floats in vboContents array) * 
                                // (# of bytes/float).
	this.vboStride = this.vboBytes / this.vboVerts;     
	                              // (== # of bytes to store one complete vertex).
	                              // From any attrib in a given vertex in the VBO, 
	                              // move forward by 'vboStride' bytes to arrive 
	                              // at the same attrib for the next vertex.
	                               
	            //----------------------Attribute sizes
  this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
                                // attribute named a_Pos1. (4: x,y,z,w values)
  this.vboFcount_a_Colr1 = 3;   // # of floats for this attrib (r,g,b values))   
  console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
                  this.vboFcount_a_Colr1 ) *   // every attribute in our VBO
                  this.FSIZE == this.vboStride, // for agreeement with'stride'
                  "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
                  
              //----------------------Attribute offsets
	this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
	                              // of 1st a_Pos1 attrib value in vboContents[]
  this.vboOffset_a_Colr1 = (this.vboFcount_a_Pos1) * this.FSIZE;  
                                // == 4 floats * bytes/float
                                //# of bytes from START of vbo to the START
                                // of 1st a_Colr1 attrib value in vboContents[]

                                // == 7 floats * bytes/float
                                // # of bytes from START of vbo to the START
                                // of 1st a_PtSize attrib value in vboContents[]

	            //-----------------------GPU memory locations:                                
	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
	                              // returned by gl.createBuffer() function call
	this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
								          //------Attribute locations in our shaders:
	this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
    this.a_Colr1Loc;							// GPU location: shader 'a_Colr1' attribute
    this.a_normalLoc;
    this.u_NormalMatrix;
    this.u_MvpMatrixLoc;

    
                //---------------------- Uniform locations &values in our shaders
    this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
    this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform
    this.u_AmbientLight;
    this.u_Lamp0Pos;
    this.u_DiffuseLight;
    this.u_Ka;
    this.u_Kd;
    this.u_Ks;
    this.u_Lamp0Spec;
    this.u_Ke;
    this.u_eyePosWorld;
    this.shininess;						// GPU location for u_ModelMat uniform
    this.u_PhongLight;
};


VBObox1.prototype.init = function() {
//==============================================================================
// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
// kept in this VBObox. (This function usually called only once, within main()).
// Specifically:
// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
//  executable 'program' stored and ready to use inside the GPU.  
// b) create a new VBO object in GPU memory and fill it by transferring in all
//  the vertex data held in our Float32array member 'VBOcontents'. 
// c) Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
// -------------------
// CAREFUL!  before you can draw pictures using this VBObox contents, 
//  you must call this VBObox object's switchToMe() function too!
//--------------------
// a) Compile,link,upload shaders-----------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
// CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
//  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

// b) Create VBO on GPU, fill it------------------------------------------------
	this.vboLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				  // the ID# the GPU uses for this buffer.
  											
  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
  //	 use gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.  
  //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
  //	(see OpenGL ES specification for more info).  Your choices are:
  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents rarely or never change.
  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents may change often as our program runs.
  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
  // 			times and then discarded; for rapidly supplied & consumed VBOs.

// c1) Find All Attributes:-----------------------------------------------------
//  Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (for switchToMe(), adjust(), draw(), reload(), etc.)
this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Pos1');
if(this.a_Pos1Loc < 0) {
  console.log(this.constructor.name + 
              '.init() Failed to get GPU location of attribute a_Pos1');
  return -1;	// error exit.
}
//  this.a_Colr1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Colr1');
// if(this.a_Colr1Loc < 0) {
//   console.log(this.constructor.name + 
//               '.init() failed to get the GPU location of attribute a_Colr1');
//   return -1;	// error exit.
// }
this.a_normalLoc = gl.getAttribLocation(this.shaderLoc, 'a_Normal');
if(this.a_normalLoc < 0) {
  console.log(this.constructor.name + 
              '.init() failed to get the GPU location of attribute a_Normal');
  return -1;	// error exit.
}

this.u_DiffuseLight = gl.getUniformLocation(this.shaderLoc, 'u_DiffuseLight');
this.u_AmbientLight = gl.getUniformLocation(this.shaderLoc, 'u_AmbientLight');
this.u_Lamp0Spec = gl.getUniformLocation(this.shaderLoc, 'u_Lamp0Spec');
this.u_Lamp0Pos = gl.getUniformLocation(this.shaderLoc, 'u_Lamp0Pos');
this.u_eyePosWorld = gl.getUniformLocation(this.shaderLoc, 'u_eyePosWorld');
this.u_NormalMatrix = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix')
this.u_MvpMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');

//material
this.u_Ka = gl.getUniformLocation(this.shaderLoc, 'u_Ka');
this.u_Kd = gl.getUniformLocation(this.shaderLoc, 'u_Kd');
this.u_Ks = gl.getUniformLocation(this.shaderLoc, 'u_Ks');
this.u_Ke = gl.getUniformLocation(this.shaderLoc, 'u_Ke');
this.shininess = gl.getUniformLocation(this.shaderLoc, 'shininess');
this.u_PhongLight = gl.getUniformLocation(this.shaderLoc, 'u_PhongLight');

if(!this.u_Ke || !this.u_Ka || !this.u_Kd 
  //		 || !u_Ks || !u_Kshiny
       ) {
      console.log('Failed to get the Phong Reflectance storage locations');
      return;
    }



// c2) Find All Uniforms:-----------------------------------------------------
//Get GPU storage location for each uniform var used in our shader programs: 

this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');

if (!this.u_ModelMatrixLoc || !this.u_DiffuseLight || !this.u_AmbientLight) { 
 console.log('Failed to get the storage location');
 return;
}
}

VBObox1.prototype.switchToMe = function () {
//==============================================================================
// Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
//
// We only do this AFTER we called the init() function, which does the one-time-
// only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
// even then, you are STILL not ready to draw our VBObox's contents onscreen!
// We must also first complete these steps:
//  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
//  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
//  c) tell the GPU to connect the shader program's attributes to that VBO.

// a) select our shader program:
  gl.useProgram(this.shaderLoc);	
//		Each call to useProgram() selects a shader program from the GPU memory,
// but that's all -- it does nothing else!  Any previously used shader program's 
// connections to attributes and uniforms are now invalid, and thus we must now
// establish new connections between our shader program's attributes and the VBO
// we wish to use.  
  
// b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
//  instead connect to our own already-created-&-filled VBO.  This new VBO can 
//    supply values to use as attributes in our newly-selected shader program:
	gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
										this.vboLoc);			// the ID# the GPU uses for our VBO.

// c) connect our newly-bound VBO to supply attribute variable values for each
// vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
// this sets up data paths from VBO to our shader units:
  // 	Here's how to use the almost-identical OpenGL version of this function:
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
		this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
		this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
		gl.FLOAT,		  // type == what data type did we use for those numbers?
		false,				// isNormalized == are these fixed-point values that we need
									//									normalize before use? true or false
		this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
		              // stored attrib for this vertex to the same stored attrib
		              //  for the next vertex in our VBO.  This is usually the 
									// number of bytes used to store one complete vertex.  If set 
									// to zero, the GPU gets attribute values sequentially from 
									// VBO, starting at 'Offset'.	
									// (Our vertex size in bytes: 4 floats for pos + 3 for color)
		this.vboOffset_a_Pos1);						
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (we start with position).

        gl.vertexAttribPointer(this.a_normalLoc, this.vboFcount_a_Pos1,
        gl.FLOAT, false, 
        this.vboStride,  this.vboOffset_a_Pos1);
      
        
      
        //-- Enable this assignment of the attribute to its' VBO source:
        gl.enableVertexAttribArray(this.a_Pos1Loc);
        // gl.enableVertexAttribArray(this.a_Colr1Loc);
        gl.enableVertexAttribArray(this.a_normalLoc);

}

VBObox1.prototype.isReady = function() {
//==============================================================================
// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
// this objects VBO and shader program; else return false.
// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

var isOK = true;

  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox1.prototype.adjust = function() {
  //=============================================================================
  // Update the GPU to newer, current values we now store for 'uniform' vars on 
  // the GPU; and (if needed) update the VBO's contents, and (if needed) each 
  // attribute's stride and offset in VBO.
  
    // check: was WebGL context set to use our VBO & shader program?
    if(this.isReady()==false) {
          console.log('ERROR! before' + this.constructor.name + 
                '.adjust() call you needed to call this.switchToMe()!!');
    }
    gl.uniform4f(this.u_Lamp0Pos, lightPos.elements[0],lightPos.elements[1],lightPos.elements[2], 1.0);
    if (specOff){
      gl.uniform3f(this.u_Lamp0Spec, 0,0,0);
    }else{
      gl.uniform3f(this.u_Lamp0Spec, 1,1,1);
    }
    
    gl.uniform4f(this.u_eyePosWorld, camPos.elements[0],camPos.elements[1],camPos.elements[2], 1);
    // Set the ambient light
    if (ambientOff){
      gl.uniform3f(this.u_AmbientLight, 0, 0, 0);
    }else{
      gl.uniform3f(this.u_AmbientLight, 0.25,     0.20725,  0.20725);
    }
    
  
    if(diffuseOff){
      gl.uniform3f(this.u_DiffuseLight, 0.0, 0.0, 0.0);
    }else{
      gl.uniform3f(this.u_DiffuseLight, 1.0,      0.829,    0.829);
    }
    
    gl.uniform3f(this.u_Ka, ambientR, ambientG, ambientB);
    gl.uniform3f(this.u_Kd,diffuseR, diffuseG, diffuseB);
    gl.uniform3f(this.u_Ks, specularR, specularG, specularB);
    gl.uniform3f(this.u_Ke, 0.0, 0.0, 0.0);
    gl.uniform1f(this.shininess, shiness);
    gl.uniform1f(this.u_PhongLight, phongLightValue);
	// Adjust values for our uniforms,
	this.ModelMatrix.setIdentity();


  //this.ModelMatrix.rotate(g_angle1now, 0, 0, 1);	// -spin drawing axes,
  //this.ModelMatrix.translate(0, 0.0, 0);	
  this.ModelMatrix.rotate(g_angle5now, 0,0, 1);					// then translate them.
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 

var mvpMatrix = new Matrix4();
mvpMatrix.setIdentity();
mvpMatrix.set(g_worldMat);
mvpMatrix.multiply(this.ModelMatrix);
// console.log(mvpMatrix)
// Pass the model view projection matrix to u_mvpMatrix
gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
false, 										// use matrix transpose instead?
this.ModelMatrix.elements);	// send data from Javascript.
var normalMatrix = new Matrix4();
normalMatrix.setInverseOf(this.ModelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
  
}

VBObox1.prototype.draw = function() {
//=============================================================================
// Send commands to GPU to select and render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }
  
  // ----------------------------Draw the contents of the currently-bound VBO:
  // gl.drawArrays(gl.TRIANGLE_STRIP,		    // select the drawing primitive to draw:
  //                 // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
  //                 //          gl.TRIANGLES, gl.TRIANGLE_STRIP,
  // 							0, 								// location of 1st vertex to draw;
  // 							this.vboVerts);		// number of vertices to draw on-screen.
  gl.drawArrays(gl.TRIANGLE_STRIP,0, this.vboVerts);	
}


VBObox1.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU for our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// contents to our VBO without changing any GPU memory allocations.

 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO
}

/*
VBObox1.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox1.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/

//=============================================================================
//=============================================================================
function VBObox2() {
//=============================================================================
//=============================================================================
// CONSTRUCTOR for one re-usable 'VBObox2' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WITHOUT disrupting any other code, ever!
  
this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
`precision highp float;				// req'd in OpenGL ES if we use 'float'
 //
 struct MatlT {		// Describes one Phong material by its reflectances:
   vec3 emit;			// Ke: emissive -- surface 'glow' amount (r,g,b);
   vec3 ambi;			// Ka: ambient reflectance (r,g,b)
   vec3 diff;			// Kd: diffuse reflectance (r,g,b)
   vec3 spec; 		// Ks: specular reflectance (r,g,b)
   int shiny;			// Kshiny: specular exponent (integer >= 1; typ. <200)
   };
 uniform mat4 u_ModelMatrix;
 attribute vec4 a_Pos1;
 attribute vec4 a_Normal;
 uniform vec3 u_Kd; 

 uniform mat4 u_MvpMatrix; 

 varying vec3 v_Kd; 
 varying vec4 v_Position;	
 varying vec3 v_Normal;
 uniform mat4 u_NormalMatrix; 
 


 //
 void main() {
   gl_Position = u_MvpMatrix * a_Pos1;
   v_Position = u_ModelMatrix * a_Pos1;
   v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
   v_Kd = u_Kd;
   
  }`;
//========YOUR CHOICE OF 3 Fragment shader programs=======
//				(use /* and */ to uncomment ONLY ONE)
// Each is an example of how to use the built-in vars for gl.POINTS to
// improve their on-screen appearance.
// a)'SQUARE points' -- DEFAULT; simple fixed-color square set by point-size.
// b) 'ROUND FLAT' -- uses 'gl_PointCoord' to make solid-color dot instead;
// c) 'SHADED Sphere' -- radial distance sets color to 'fake' a lit 3D sphere.
//   You too can be a 'shader writer'! What other fragment shaders would help?

// a) SQUARE points:
this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
`#ifdef GL_ES
precision mediump float;
#endif
 uniform vec3 u_DiffuseLight;   // Diffuse light color
uniform vec3 u_AmbientLight;   // Color of an ambient light
uniform vec3 u_Ka; // Ambient reflectance
uniform vec3 u_Ks; // Specular reflectance
uniform vec3 u_Lamp0Spec;			// Phong Illum: specular
uniform vec3 u_Ke;						// Phong Reflectance: emissive
uniform vec4 u_Lamp0Pos; 
uniform vec4 u_eyePosWorld;
uniform float shininess;



varying vec3 v_Normal;				// Find 3D surface normal at each pix
varying vec4 v_Position;			// pixel's 3D pos too -- in 'world' coords
varying vec3 v_Kd;

 void main() {
   vec3 normal = normalize(v_Normal); 
   vec3 lightDirection = normalize(u_Lamp0Pos.xyz - v_Position.xyz);
   vec3 eyeDirection = normalize(u_eyePosWorld.xyz- v_Position.xyz); 
   vec3 H = normalize(lightDirection + eyeDirection); 
   float nDotH = max(dot(H, normal), 0.0); 
   float e02 = pow(nDotH, shininess); 
 float e04 = e02*e02; 
 float e08 = e04*e04; 
 float e16 = e08*e08; 
 float e32 = e16*e16;  
 float e64 = pow(nDotH, shininess);
 vec3 emissive = u_Ke;
   float nDotL = max(dot(lightDirection, normal), 0.0);
   // Calculate the color due to diffuse reflection
  vec3 diffuse = u_DiffuseLight * nDotL * v_Kd;
   // Calculate the color due to ambient reflection
  vec3 ambient = u_AmbientLight * u_Ka;

    float spec = pow(nDotL, shininess);
    vec3 speculr = u_Lamp0Spec * u_Ks * e64;
   gl_FragColor = vec4(diffuse + ambient + speculr + emissive, 1);

 
 
  
 }`;

	this.vboContents = //---------------------------------------------------------
		new Float32Array ([					// Array of vertex attribute values we will
  															// transfer to GPU's vertex buffer object (VBO)
			// 1 vertex per line: pos x,y,z,w;   color; r,g,b;   point-size; 
  	-0.3,  0.5,	0.0, 1.0,		1.0, 0.3, 0.3,   7.0,   // (bright red)
    -0.3, -0.3, 0.0, 1.0,		0.3, 1.0, 0.3,  14.0,   // (bright green)
     0.3, -0.3, 0.0, 1.0,		0.3, 0.3, 1.0,  21.0,   // (bright blue)
     0.3,  0.3, 0.0, 1.0,   0.5, 0.5, 0.5,  18.0,   // (gray)
  ]);
	
	this.vboVerts = 4;							// # of vertices held in 'vboContents' array;
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
	                              // bytes req'd by 1 vboContents array element;
																// (why? used to compute stride and offset 
																// in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;               
                                // (#  of floats in vboContents array) * 
                                // (# of bytes/float).
	this.vboStride = this.vboBytes / this.vboVerts;     
	                              // From any attrib in a given vertex, 
	                              // move forward by 'vboStride' bytes to arrive 
	                              // at the same attrib for the next vertex. 
	                              // (== # of bytes used to store one vertex) 
	                              
	            //----------------------Attribute sizes
  this.vboFcount_a_Position = 4;  // # of floats in the VBO needed to store the
                                // attribute named a_Position (4: x,y,z,w values)
  this.vboFcount_a_Color = 3;   // # of floats for this attrib (r,g,b values)
  this.vboFcount_a_PtSize = 1;  // # of floats for this attrib (just one!)
               //----------------------Attribute offsets
	this.vboOffset_a_Position = 0;   
	                              //# of bytes from START of vbo to the START
	                              // of 1st a_Position attrib value in vboContents[]
  this.vboOffset_a_Color = (this.vboFcount_a_Position) * this.FSIZE;  
                                // == 4 floats * bytes/float
                                //# of bytes from START of vbo to the START
                                // of 1st a_Color attrib value in vboContents[]
  this.vboOffset_a_PtSize = (this.vboFcount_a_Position +
                             this.vboFcount_a_Color) * this.FSIZE; 
                                // == 7 floats * bytes/float
                                // # of bytes from START of vbo to the START
                                // of 1st a_PtSize attrib value in vboContents[]
                                
	            //-----------------------GPU memory locations:
	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
	                              // returned by gl.createBuffer() function call
	this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
								          //------Attribute locations in our shaders:
	this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
    this.a_Colr1Loc;							// GPU location: shader 'a_Colr1' attribute
    this.a_normalLoc;
    this.u_NormalMatrix;
    this.u_MvpMatrixLoc;

    
                //---------------------- Uniform locations &values in our shaders
    this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
    this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform
    this.u_AmbientLight;
    this.u_Lamp0Pos;
    this.u_DiffuseLight;
    this.u_Ka;
    this.u_Kd;
    this.u_Ks;
    this.u_Lamp0Spec;
    this.u_Ke;
    this.u_eyePosWorld;
    this.shininess;				// GPU location for u_ModelMat uniform

};


VBObox2.prototype.init = function() {
//=============================================================================
// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
// kept in this VBObox. (This function usually called only once, within main()).
// Specifically:
// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
//  executable 'program' stored and ready to use inside the GPU.  
// b) create a new VBO object in GPU memory and fill it by transferring in all
//  the vertex data held in our Float32array member 'VBOcontents'. 
// c) Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
// 
// CAREFUL!  before you can draw pictures using this VBObox contents, 
//  you must call this VBObox object's switchToMe() function too!

  // a) Compile,link,upload shaders---------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
  // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
  //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

  // b) Create VBO on GPU, fill it----------------------------------------------
	this.vboLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  // Specify the purpose of our newly-created VBO.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				// the ID# the GPU uses for this buffer.

  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & managemt: use 
  //		gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.
  //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
  //	(see OpenGL ES specification for more info).  Your choices are:
  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents rarely or never change.
  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents may change often as our program runs.
  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
  // 			times and then discarded; for rapidly supplied & consumed VBOs.

  // c1) Find All Attributes:---------------------------------------------------
  //  Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (for switchToMe(), adjust(), draw(), reload(),etc.)
  this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Pos1');
  if(this.a_Pos1Loc < 0) {
    console.log(this.constructor.name + 
                '.init() Failed to get GPU location of attribute a_Pos1');
    return -1;	// error exit.
  }
  //  this.a_Colr1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Colr1');
  // if(this.a_Colr1Loc < 0) {
  //   console.log(this.constructor.name + 
  //               '.init() failed to get the GPU location of attribute a_Colr1');
  //   return -1;	// error exit.
  // }
  this.a_normalLoc = gl.getAttribLocation(this.shaderLoc, 'a_Normal');
  if(this.a_normalLoc < 0) {
    console.log(this.constructor.name + 
                '.init() failed to get the GPU location of attribute a_Normal');
    return -1;	// error exit.
  }
  
  this.u_DiffuseLight = gl.getUniformLocation(this.shaderLoc, 'u_DiffuseLight');
  this.u_AmbientLight = gl.getUniformLocation(this.shaderLoc, 'u_AmbientLight');
  this.u_Lamp0Spec = gl.getUniformLocation(this.shaderLoc, 'u_Lamp0Spec');
  this.u_Lamp0Pos = gl.getUniformLocation(this.shaderLoc, 'u_Lamp0Pos');
  this.u_eyePosWorld = gl.getUniformLocation(this.shaderLoc, 'u_eyePosWorld');
  this.u_NormalMatrix = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix')
  this.u_MvpMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');

  //material
  this.u_Ka = gl.getUniformLocation(this.shaderLoc, 'u_Ka');
  this.u_Kd = gl.getUniformLocation(this.shaderLoc, 'u_Kd');
  this.u_Ks = gl.getUniformLocation(this.shaderLoc, 'u_Ks');
  this.u_Ke = gl.getUniformLocation(this.shaderLoc, 'u_Ke');
  this.shininess = gl.getUniformLocation(this.shaderLoc, 'shininess');


  if(!this.u_Ke || !this.u_Ka || !this.u_Kd 
    //		 || !u_Ks || !u_Kshiny
         ) {
        console.log('Failed to get the Phong Reflectance storage locations');
        return;
      }
  
 

  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
  
 this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');

 if (!this.u_ModelMatrixLoc || !this.u_DiffuseLight || !this.u_AmbientLight) { 
   console.log('Failed to get the storage location');
   return;
 }
  this.a_PtSizeLoc = gl.getAttribLocation(this.shaderLoc, 'a_PtSize');
  if(this.a_PtSizeLoc < 0) {
    console.log(this.constructor.name + 
	    					'.init() failed to get the GPU location of attribute a_PtSize');
	  return -1;	// error exit.
  }

}

VBObox2.prototype.switchToMe = function() {
//==============================================================================
// Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
//
// We only do this AFTER we called the init() function, which does the one-time-
// only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
// even then, you are STILL not ready to draw our VBObox's contents onscreen!
// We must also first complete these steps:
//  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
//  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
//  c) tell the GPU to connect the shader program's attributes to that VBO.

// a) select our shader program:
  gl.useProgram(this.shaderLoc);
//		Each call to useProgram() selects a shader program from the GPU memory,
// but that's all -- it does nothing else!  Any previously used shader program's 
// connections to attributes and uniforms are now invalid, and thus we must now
// establish new connections between our shader program's attributes and the VBO
// we wish to use.  
  
// b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
//  instead connect to our own already-created-&-filled VBO.  This new VBO can 
//    supply values to use as attributes in our newly-selected shader program:
	gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
										this.vboLoc);			// the ID# the GPU uses for our VBO.

// c) connect our newly-bound VBO to supply attribute variable values for each
// vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
// this sets up data paths from VBO to our shader units:
  // 	Here's how to use the almost-identical OpenGL version of this function:
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )

		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (We start with a_Position).
 
  gl.vertexAttribPointer(this.a_PtSizeLoc, this.vboFcount_a_PtSize, 
              gl.FLOAT, false, 
							this.vboStride, this.vboOffset_a_PtSize);
  gl.vertexAttribPointer(this.a_Pos1Loc, this.vboFcount_a_Pos1,
  gl.FLOAT, false, 
  this.vboStride,  this.vboOffset_a_Pos1);

  

  //-- Enable this assignment of the attribute to its' VBO source:
  gl.enableVertexAttribArray(this.a_Pos1Loc);
  // gl.enableVertexAttribArray(this.a_Colr1Loc);
  gl.enableVertexAttribArray(this.a_normalLoc);
// --Enable this assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_PtSizeLoc);
}

VBObox2.prototype.isReady = function() {
//==============================================================================
// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
// this objects VBO and shader program; else return false.
// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

var isOK = true;
  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox2.prototype.adjust = function(specOff,ambientOff,diffuseOff ) {
//=============================================================================
// Update the GPU to newer, current values we now store for 'uniform' vars on 
// the GPU; and (if needed) update the VBO's contents, and (if needed) each 
// attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }
  gl.uniform4f(this.u_Lamp0Pos, lightPos.elements[0],lightPos.elements[1],lightPos.elements[2], 1.0);
  if (specOff){
    gl.uniform3f(this.u_Lamp0Spec, 0,0,0);
  }else{
    gl.uniform3f(this.u_Lamp0Spec, 1,1,1);
  }
  
  gl.uniform4f(this.u_eyePosWorld, camPos.elements[0],camPos.elements[1],camPos.elements[2], 1);
  // Set the ambient light
  if (ambientOff){
    gl.uniform3f(this.u_AmbientLight, 0, 0, 0);
  }else{
    gl.uniform3f(this.u_AmbientLight, 0.135,    0.2225,   0.1575,   0.95);
  }
  

  if(diffuseOff){
    gl.uniform3f(this.u_DiffuseLight, 0.0, 0.0, 0.0);
  }else{
    gl.uniform3f(this.u_DiffuseLight, 0.54,     0.89,     0.63);
  }
  
  gl.uniform3f(this.u_Ka, 1, 0, 0);
  gl.uniform3f(this.u_Kd,1, 1, 0.0);
  gl.uniform3f(this.u_Ks, 0.316228, 0.316228, 0.316228);
  gl.uniform3f(this.u_Ke, 0.0, 0.0, 0.0);
  gl.uniform1f(this.shininess, 2.0);


	// Adjust values for our uniforms;-------------------------------------------
// THIS DOESN'T WORK!!  this.ModelMatrix = g_worldMat;

	// Ready to draw in World coord axes.

  this.ModelMatrix.translate(-0.3, 0.0, 0.0); //Shift origin leftwards,
  this.ModelMatrix.rotate(g_angleNow2, 0, 0, 1);	// -spin drawing axes,
  //  Transfer new uniforms' values to the GPU:--------------------------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  false, 										// use matrix transpose instead?
  this.ModelMatrix.elements);	
var mvpMatrix = new Matrix4();
mvpMatrix.setIdentity();
mvpMatrix.set(g_worldMat);
mvpMatrix.multiply(this.ModelMatrix);
// console.log(mvpMatrix)
// Pass the model view projection matrix to u_mvpMatrix
gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
false, 										// use matrix transpose instead?
this.ModelMatrix.elements);	// send data from Javascript.
var normalMatrix = new Matrix4();
normalMatrix.setInverseOf(this.ModelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
  // Adjust values in VBOcontents array-----------------------------------------
  // Make one dot-size grow/shrink;
  this.vboContents[15] = 15.0*(1.0 + Math.cos(Math.PI * 3.0 * g_angle1now/ 180.0)); // radians
  // change y-axis value of 1st vertex
  this.vboContents[1] = g_posNow0;
  // Transfer new VBOcontents to GPU-------------------------------------------- 
  this.reload();
}

VBObox2.prototype.draw = function() {
//=============================================================================
// Render current VBObox contents.
  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }
	
  // ----------------------------Draw the contents of the currently-bound VBO:
  gl.drawArrays(gl.POINTS, 		    // select the drawing primitive to draw,
                  // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
                  //          gl.TRIANGLES, gl.TRIANGLE_STRIP, ...
  							0, 								// location of 1st vertex to draw;
  							this.vboVerts);		// number of vertices to draw on-screen.

  gl.drawArrays(gl.LINE_LOOP,     // draw lines between verts too!
                0,
                this.vboVerts);
}

VBObox2.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU for our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// 'vboContents' to our VBO, but without changing any GPU memory allocations.
  											
 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO
}
/*
VBObox2.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox2.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/
function VBObox3() {
  //=============================================================================
  //=============================================================================
  // CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
  // needed to render vertices from one Vertex Buffer Object (VBO) using one 
  // separate shader program (a vertex-shader & fragment-shader pair) and one
  // set of 'uniform' variables.
  
  // Constructor goal: 
  // Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
  // written into code) in all other VBObox functions. Keeping all these (initial)
  // values here, in this one coonstrutor function, ensures we can change them 
  // easily WITHOUT disrupting any other code, ever!
    
    this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
   `precision highp float;				// req'd in OpenGL ES if we use 'float'
    //
    struct MatlT {		// Describes one Phong material by its reflectances:
			vec3 emit;			// Ke: emissive -- surface 'glow' amount (r,g,b);
			vec3 ambi;			// Ka: ambient reflectance (r,g,b)
			vec3 diff;			// Kd: diffuse reflectance (r,g,b)
			vec3 spec; 		// Ks: specular reflectance (r,g,b)
			int shiny;			// Kshiny: specular exponent (integer >= 1; typ. <200)
  		};
    uniform mat4 u_ModelMatrix;
    attribute vec4 a_Pos1;
    attribute vec4 a_Normal;
    uniform vec3 u_Kd; 

    uniform mat4 u_MvpMatrix; 

    varying vec3 v_Kd; 
    varying vec4 v_Position;	
    varying vec3 v_Normal;
    uniform mat4 u_NormalMatrix; 
    
  

    //
    void main() {
      gl_Position = u_MvpMatrix * a_Pos1;
      v_Position = u_ModelMatrix * a_Pos1;
      v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
      v_Kd = u_Kd;
      
     }`;
  //========YOUR CHOICE OF 3 Fragment shader programs=======
  //				(use /* and */ to uncomment ONLY ONE)
  // Each is an example of how to use the built-in vars for gl.POINTS to
  // improve their on-screen appearance.
  // a)'SQUARE points' -- DEFAULT; simple fixed-color square set by point-size.
  // b) 'ROUND FLAT' -- uses 'gl_PointCoord' to make solid-color dot instead;
  // c) 'SHADED Sphere' -- radial distance sets color to 'fake' a lit 3D sphere.
  //   You too can be a 'shader writer'! What other fragment shaders would help?

   // a) SQUARE points:
   this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
   `#ifdef GL_ES
   precision mediump float;
   #endif
    uniform vec3 u_DiffuseLight;   // Diffuse light color
  uniform vec3 u_AmbientLight;   // Color of an ambient light
  uniform vec3 u_Ka; // Ambient reflectance
  uniform vec3 u_Ks; // Specular reflectance
  uniform vec3 u_Lamp0Spec;			// Phong Illum: specular
  uniform vec3 u_Ke;						// Phong Reflectance: emissive
  uniform vec4 u_Lamp0Pos; 
  uniform vec4 u_eyePosWorld;
  uniform float shininess;
  uniform float u_PhongLight;

  varying vec3 v_Normal;				// Find 3D surface normal at each pix
  varying vec4 v_Position;			// pixel's 3D pos too -- in 'world' coords
  varying vec3 v_Kd;
  struct MatlT {		// Describes one Phong material by its reflectances:
    vec3 emit;			// Ke: emissive -- surface 'glow' amount (r,g,b);
    vec3 ambi;			// Ka: ambient reflectance (r,g,b)
    vec3 diff;			// Kd: diffuse reflectance (r,g,b)
    vec3 spec; 			// Ks: specular reflectance (r,g,b)
    int shiny;			// Kshiny: specular exponent (integer >= 1; typ. <200)
    };
    uniform MatlT u_MatlSet[1];

    void main() {
      vec3 normal = normalize(v_Normal); 
      vec3 lightDirection = normalize(u_Lamp0Pos.xyz - v_Position.xyz);
      vec3 eyeDirection = normalize(u_eyePosWorld.xyz- v_Position.xyz); 
      vec3 H = normalize(lightDirection + eyeDirection); 
      float nDotH = max(dot(H, normal), 0.0); 
      float e02 = pow(nDotH, float(u_MatlSet[0].shiny)); 
    float e04 = e02*e02; 
    float e08 = e04*e04; 
    float e16 = e08*e08; 
    float e32 = e16*e16;  
    float e64 = pow(nDotH, float(u_MatlSet[0].shiny));
    vec3 emissive = u_MatlSet[0].emit;
      float nDotL = max(dot(lightDirection, normal), 0.0);
      // Calculate the color due to diffuse reflection
     vec3 diffuse = u_DiffuseLight * nDotL * u_MatlSet[0].diff;
      // Calculate the color due to ambient reflection
     vec3 ambient = u_AmbientLight * u_MatlSet[0].ambi;

     if (u_PhongLight == 1.0){
      vec3 reflectDir = reflect(-lightDirection, normal);
      float specAngle = max(dot(reflectDir, eyeDirection), 0.0);
      vec3 speculr = u_Lamp0Spec * u_MatlSet[0].spec * pow(specAngle, float(u_MatlSet[0].shiny));
     gl_FragColor = vec4(diffuse + ambient +speculr + emissive, 1);
    }else{
      float spec = pow(nDotL, float(u_MatlSet[0].shiny)) ;
      vec3 speculr = u_Lamp0Spec * u_MatlSet[0].spec * e64;
     gl_FragColor = vec4(diffuse + ambient + speculr + emissive, 1);
    }
    }`;
  

  /*
   // b) ROUND FLAT dots:
    this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
   `precision mediump float;
    varying vec3 v_Colr1;
    void main() {
      float dist = distance(gl_PointCoord, vec2(0.5, 0.5)); 
      if(dist < 0.5) {
        gl_FragColor = vec4(v_Colr1, 1.0);
        } else {discard;};
    }`;
  */
  // /*
   // c) SHADED, sphere-like dots:
  //   this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  //  `precision mediump float;
  //   varying vec3 v_Colr1;
  //   void main() {
  //     float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
  //     if(dist < 0.5) {
  //        gl_FragColor = vec4((1.0-2.0*dist)*v_Colr1.rgb, 1.0);
  //       } else {discard;};
  //   }`;
  //     this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  //  `precision mediump float;
  //   varying vec3 v_Colr1;
  //   void main() {
  //     gl_FragColor = v_Colr1;
  //   }`;
 
  // this.FRAG_SRC =
  // '#ifdef GL_ES\n' +
  // 'precision mediump float;\n' +
  // '#endif\n' +
  // 'varying vec4 v_Color;\n' +
  // 'void main() {\n' +
  // '  gl_FragColor = v_Color;\n' +
  // '}\n';
  var ctrColr = new Float32Array([0.930, 1, 0.843]);	// pink
	var topColr = new Float32Array([0.628, 0.910, 0.854]);	// blue
	var botColr = new Float32Array([0.940, 0.913, 0.620]); //yellow
    this.vboContents = //---------------------------------------------------------
      new Float32Array ([					// Array of vertex attribute values we will
                                  // transfer to GPU's vertex buffer object (VBO)

        // Front face
    1.5, 2, 1.5, 1, ctrColr[0], ctrColr[1], ctrColr[2], -1.5, 2, 1.5, 1, topColr[0], topColr[1], topColr[2], -1.5, 0.0, 1.5,1, botColr[0], botColr[1], botColr[2], // Triangle 1
    1.5, 2, 1.5, 1, ctrColr[0], ctrColr[1], ctrColr[2], -1.5, 0.0, 1.5,1, botColr[0], botColr[1], botColr[2],  1.5, 0.0, 1.5,  1,topColr[0], topColr[1], topColr[2], // Triangle 2

    // Right face
    1.5, 2, 1.5, 1,ctrColr[0], ctrColr[1], ctrColr[2], 1.5, 0.0, 1.5, 1,topColr[0], topColr[1], topColr[2], 1.5, 0.0, -1.5, 1,botColr[0], botColr[1], botColr[2], // Triangle 1
    1.5, 2, 1.5, 1,ctrColr[0], ctrColr[1], ctrColr[2], 1.5, 0.0, -1.5, 1,botColr[0], botColr[1], botColr[2],  1.5, 2, -1.5,1,topColr[0], topColr[1], topColr[2], // Triangle 2

    // Up face
    1.5, 2, 1.5,1, ctrColr[0], ctrColr[1], ctrColr[2], 1.5, 2,-1.5, 1,topColr[0], topColr[1], topColr[2],-1.5, 2, -1.5,1,botColr[0], botColr[1], botColr[2],// Triangle 1
    1.5, 2, 1.5, 1,ctrColr[0], ctrColr[1], ctrColr[2], -1.5, 2, -1.5,1,botColr[0], botColr[1], botColr[2],-1.5, 2, 1.5, 1,topColr[0], topColr[1], topColr[2],// Triangle 2

    // Left face
    -1.5, 2, 1.5,1, ctrColr[0], ctrColr[1], ctrColr[2],-1.5, 2,-1.5,1,topColr[0], topColr[1], topColr[2], -1.5,  0.0,-1.5, 1,botColr[0], botColr[1], botColr[2], // Triangle 1
    -1.5, 2, 1.5,1, ctrColr[0], ctrColr[1], ctrColr[2],-1.5,  0.0,-1.5,1, botColr[0], botColr[1], botColr[2], -1.5,  0.0, 1.5, 1,topColr[0], topColr[1], topColr[2],// Triangle 2

    // Down face
    -1.5,  0.0,-1.5,1, ctrColr[0], ctrColr[1], ctrColr[2], 1.5,  0.0,-1.5, 1,topColr[0], topColr[1], topColr[2], 1.5,  0.0, 1.5, 1, botColr[0], botColr[1], botColr[2], // Triangle 1
    -1.5,  0.0,-1.5,1, ctrColr[0], ctrColr[1], ctrColr[2],1.5,  0.0, 1.5, 1,botColr[0], botColr[1], botColr[2], -1.5,  0.0, 1.5,1,topColr[0], topColr[1], topColr[2],  // Triangle 2

    // Back face
    1.5, 0.0, -1.5,1,ctrColr[0], ctrColr[1], ctrColr[2],-1.5, 0.0, -1.5,1,topColr[0], topColr[1], topColr[2], -1.5, 2, -1.5,1,botColr[0], botColr[1], botColr[2], // Triangle 1
    1.5, 0.0, -1.5,1,ctrColr[0], ctrColr[1], ctrColr[2],  -1.5, 2, -1.5,1,botColr[0], botColr[1], botColr[2], 1.5, 2, -1.5,1,topColr[0], topColr[1], topColr[2]// Triangle 2
    ]);	
    
    this.vboVerts =this.vboContents.length/7;							// # of vertices held in 'vboContents' array;
    this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
                                  // bytes req'd by 1 vboContents array element;
                                  // (why? used to compute stride and offset 
                                  // in bytes for vertexAttribPointer() calls)
    this.vboBytes = this.vboContents.length * this.FSIZE;               
                                  // (#  of floats in vboContents array) * 
                                  // (# of bytes/float).
    this.vboStride = this.vboBytes / this.vboVerts;     
                                  // (== # of bytes to store one complete vertex).
                                  // From any attrib in a given vertex in the VBO, 
                                  // move forward by 'vboStride' bytes to arrive 
                                  // at the same attrib for the next vertex.
                                   
                //----------------------Attribute sizes
    this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
                                  // attribute named a_Pos1. (4: x,y,z,w values)
    this.vboFcount_a_Colr1 = 3;   // # of floats for this attrib (r,g,b values) 
    this.vbFcount_a_Normal = 3;
    console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
                    this.vboFcount_a_Colr1) *   // every attribute in our VBO
                    this.FSIZE == this.vboStride, // for agreeement with'stride'
                    "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
                    
                //----------------------Attribute offsets
    this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
                                  // of 1st a_Pos1 attrib value in vboContents[]
    this.vboOffset_a_Colr1 = (this.vboFcount_a_Pos1) * this.FSIZE;  
                                  // == 4 floats * bytes/float
                                  //# of bytes from START of vbo to the START
                                  // of 1st a_Colr1 attrib value in vboContents[]
    this.vboOffset_a_PtSiz1 =(this.vboFcount_a_Pos1 +
                              this.vboFcount_a_Colr1) * this.FSIZE; 
                                  // == 7 floats * bytes/float
                                  // # of bytes from START of vbo to the START
                                  // of 1st a_PtSize attrib value in vboContents[]
  
                //-----------------------GPU memory locations:                                
    this.vboLoc;									// GPU Location for Vertex Buffer Object, 
                                  // returned by gl.createBuffer() function call
    this.shaderLoc;								// GPU Location for compiled Shader-program  
                                  // set by compile/link of VERT_SRC and FRAG_SRC.
                            //------Attribute locations in our shaders:
    this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
    this.a_Colr1Loc;							// GPU location: shader 'a_Colr1' attribute
    this.a_normalLoc;
    this.u_NormalMatrix;
    this.u_MvpMatrixLoc;

    
                //---------------------- Uniform locations &values in our shaders
    this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
    this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform
    this.u_AmbientLight;
    this.u_Lamp0Pos;
    this.u_DiffuseLight;
    this.u_Ka;
    this.u_Kd;
    this.u_Ks;
    this.u_Lamp0Spec;
    this.u_Ke;
    this.u_eyePosWorld;
    this.shininess;
    this.u_PhongLight;

    this.matl0 = new Material(matlSel);


  };
  
  
  VBObox3.prototype.init = function() {
  //==============================================================================
  // Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
  // kept in this VBObox. (This function usually called only once, within main()).
  // Specifically:
  // a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
  //  executable 'program' stored and ready to use inside the GPU.  
  // b) create a new VBO object in GPU memory and fill it by transferring in all
  //  the vertex data held in our Float32array member 'VBOcontents'. 
  // c) Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
  // -------------------
  // CAREFUL!  before you can draw pictures using this VBObox contents, 
  //  you must call this VBObox object's switchToMe() function too!
  //--------------------
  // a) Compile,link,upload shaders-----------------------------------------------
    this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
    if (!this.shaderLoc) {
      console.log(this.constructor.name + 
                  '.init() failed to create executable Shaders on the GPU. Bye!');
      return;
    }
  // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
  //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}
  
    gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())
    
  // b) Create VBO on GPU, fill it------------------------------------------------
    this.vboLoc = gl.createBuffer();	
    if (!this.vboLoc) {
      console.log(this.constructor.name + 
                  '.init() failed to create VBO in GPU. Bye!'); 
      return;
    }
    
    // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
    //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
    // (positions, colors, normals, etc), or 
    //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
    // that each select one vertex from a vertex array stored in another VBO.
    gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
                    this.vboLoc);				  // the ID# the GPU uses for this buffer.
                          
    // Fill the GPU's newly-created VBO object with the vertex data we stored in
    //  our 'vboContents' member (JavaScript Float32Array object).
    //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
    //	 use gl.bufferSubData() to modify VBO contents without changing VBO size)
    gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
                      this.vboContents, 		// JavaScript Float32Array
                     gl.STATIC_DRAW);			// Usage hint.  
    //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
    //	(see OpenGL ES specification for more info).  Your choices are:
    //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
    //				contents rarely or never change.
    //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
    //				contents may change often as our program runs.
    //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
    // 			times and then discarded; for rapidly supplied & consumed VBOs.
    
    
      
  
  // c1) Find All Attributes:-----------------------------------------------------
  //  Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (for switchToMe(), adjust(), draw(), reload(), etc.)
    this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Pos1');
    if(this.a_Pos1Loc < 0) {
      console.log(this.constructor.name + 
                  '.init() Failed to get GPU location of attribute a_Pos1');
      return -1;	// error exit.
    }
    //  this.a_Colr1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Colr1');
    // if(this.a_Colr1Loc < 0) {
    //   console.log(this.constructor.name + 
    //               '.init() failed to get the GPU location of attribute a_Colr1');
    //   return -1;	// error exit.
    // }
    this.a_normalLoc = gl.getAttribLocation(this.shaderLoc, 'a_Normal');
    if(this.a_normalLoc < 0) {
      console.log(this.constructor.name + 
                  '.init() failed to get the GPU location of attribute a_Normal');
      return -1;	// error exit.
    }
    
    this.u_DiffuseLight = gl.getUniformLocation(this.shaderLoc, 'u_DiffuseLight');
    this.u_AmbientLight = gl.getUniformLocation(this.shaderLoc, 'u_AmbientLight');
    this.u_Lamp0Spec = gl.getUniformLocation(this.shaderLoc, 'u_Lamp0Spec');
    this.u_Lamp0Pos = gl.getUniformLocation(this.shaderLoc, 'u_Lamp0Pos');
    this.u_eyePosWorld = gl.getUniformLocation(this.shaderLoc, 'u_eyePosWorld');
    this.u_NormalMatrix = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix')
    this.u_MvpMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');

    //material
    // this.u_Ka = gl.getUniformLocation(this.shaderLoc, 'u_Ka');
    // this.u_Kd = gl.getUniformLocation(this.shaderLoc, 'u_Kd');
    // this.u_Ks = gl.getUniformLocation(this.shaderLoc, 'u_Ks');
    // this.u_Ke = gl.getUniformLocation(this.shaderLoc, 'u_Ke');
    // this.shininess = gl.getUniformLocation(this.shaderLoc, 'shininess');
    this.matl0.uLoc_Ke = gl.getUniformLocation(gl.program, 'u_MatlSet[0].emit');
    this.matl0.uLoc_Ka = gl.getUniformLocation(gl.program, 'u_MatlSet[0].ambi');
    this.matl0.uLoc_Kd = gl.getUniformLocation(gl.program, 'u_MatlSet[0].diff');
    this.matl0.uLoc_Ks = gl.getUniformLocation(gl.program, 'u_MatlSet[0].spec');
    this.matl0.uLoc_Kshiny = gl.getUniformLocation(gl.program, 'u_MatlSet[0].shiny');
    this.u_PhongLight = gl.getUniformLocation(this.shaderLoc, 'u_PhongLight')

    // if(!this.u_Ke || !this.u_Ka || !this.u_Kd 
    //   //		 || !u_Ks || !u_Kshiny
    //        ) {
    //       console.log('Failed to get the Phong Reflectance storage locations');
    //       return;
    //     }
    if(!matl0.uLoc_Ke || !matl0.uLoc_Ka || !matl0.uLoc_Kd 
      || !matl0.uLoc_Ks || !matl0.uLoc_Kshiny
) {
console.log('Failed to get GPUs Reflectance storage locations');
return;
}
    
   

    // c2) Find All Uniforms:-----------------------------------------------------
    //Get GPU storage location for each uniform var used in our shader programs: 
    
   this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
  
   if (!this.u_ModelMatrixLoc || !this.u_DiffuseLight || !this.u_AmbientLight) { 
     console.log('Failed to get the storage location');
     return;
   }
    
    
  }
  
  VBObox3.prototype.switchToMe = function () {
  //==============================================================================
  // Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
  //
  // We only do this AFTER we called the init() function, which does the one-time-
  // only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
  // even then, you are STILL not ready to draw our VBObox's contents onscreen!
  // We must also first complete these steps:
  //  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
  //  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
  //  c) tell the GPU to connect the shader program's attributes to that VBO.
  
  // a) select our shader program:
    gl.useProgram(this.shaderLoc);	
  //		Each call to useProgram() selects a shader program from the GPU memory,
  // but that's all -- it does nothing else!  Any previously used shader program's 
  // connections to attributes and uniforms are now invalid, and thus we must now
  // establish new connections between our shader program's attributes and the VBO
  // we wish to use.  
    
  // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
  //  instead connect to our own already-created-&-filled VBO.  This new VBO can 
  //    supply values to use as attributes in our newly-selected shader program:
    gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
                      this.vboLoc);			// the ID# the GPU uses for our VBO.
  
  // c) connect our newly-bound VBO to supply attribute variable values for each
  // vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
  // this sets up data paths from VBO to our shader units:
    // 	Here's how to use the almost-identical OpenGL version of this function:
    //		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
    gl.vertexAttribPointer(
      this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
      this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
      gl.FLOAT,		  // type == what data type did we use for those numbers?
      false,				// isNormalized == are these fixed-point values that we need
                    //									normalize before use? true or false
      this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
                    // stored attrib for this vertex to the same stored attrib
                    //  for the next vertex in our VBO.  This is usually the 
                    // number of bytes used to store one complete vertex.  If set 
                    // to zero, the GPU gets attribute values sequentially from 
                    // VBO, starting at 'Offset'.	
                    // (Our vertex size in bytes: 4 floats for pos + 3 for color)
      this.vboOffset_a_Pos1);						
                    // Offset == how many bytes from START of buffer to the first
                    // value we will actually use?  (we start with position).
    // gl.vertexAttribPointer(this.a_Colr1Loc, this.vboFcount_a_Colr1,
    //                        gl.FLOAT, false, 
    //                        this.vboStride,  this.vboOffset_a_Colr1);
                           
    // var normals = [];
    // var colors = []
    // for (let i = 0; i < this.vboContents.length; i += 7) {
    //   let normal = [this.vboContents[i+4], this.vboContents[i+5], this.vboContents[i+6] ];
    //   normals = normals + normal;
    //   let color = [Math.max(normal.x, 0), Math.max(normal.y, 0), Math.max(normal.z, 0), 1.0];
    // }
    
    
    gl.vertexAttribPointer(this.a_normalLoc, this.vboFcount_a_Pos1,
      gl.FLOAT, false, 
      this.vboStride,  this.vboOffset_a_Pos1);

    

    //-- Enable this assignment of the attribute to its' VBO source:
    gl.enableVertexAttribArray(this.a_Pos1Loc);
    // gl.enableVertexAttribArray(this.a_Colr1Loc);
    gl.enableVertexAttribArray(this.a_normalLoc);
  }

  function initArrayBuffer(gl, attribute, data, num) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.shaderLoc, attribute);
    if (a_attribute < 0) {
      console.log('Failed to get the storage location of ' + attribute);
      return false;
    }
    gl.vertexAttribPointer(a_attribute, num, gl.FLOAT, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);
  
    return true;
  }
  
  VBObox3.prototype.isReady = function() {
  //==============================================================================
  // Returns 'true' if our WebGL rendering context ('gl') is ready to render using
  // this objects VBO and shader program; else return false.
  // see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter
  
  var isOK = true;
  
    if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
      console.log(this.constructor.name + 
                  '.isReady() false: shader program at this.shaderLoc not in use!');
      isOK = false;
    }
    if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
        console.log(this.constructor.name + 
                '.isReady() false: vbo at this.vboLoc not in use!');
      isOK = false;
    }
    return isOK;
  }
  
  VBObox3.prototype.adjust = function(diffuseOff, ambientOff, specOff) {
  //==============================================================================
  // Update the GPU to newer, current values we now store for 'uniform' vars on 
  // the GPU; and (if needed) update each attribute's stride and offset in VBO.
  
    // check: was WebGL context set to use our VBO & shader program?
    if(this.isReady()==false) {
          console.log('ERROR! before' + this.constructor.name + 
                '.adjust() call you needed to call this.switchToMe()!!');
    }
    // Set the light color (white)
  
  // Set the light direction (in the world coordinate)

  gl.uniform4f(this.u_Lamp0Pos, lightPos.elements[0],lightPos.elements[1],lightPos.elements[2], 1.0);
  if (specOff){
    gl.uniform3f(this.u_Lamp0Spec, 0,0,0);
  }else{
    gl.uniform3f(this.u_Lamp0Spec, 1,0,0);
  }
  
  gl.uniform4f(this.u_eyePosWorld, camPos.elements[0],camPos.elements[1],camPos.elements[2], 1);
  // Set the ambient light
  if (ambientOff){
    gl.uniform3f(this.u_AmbientLight, 0, 0, 0);
  }else{
    gl.uniform3f(this.u_AmbientLight, 0.25,     0.20725,  0.20725);
  }
  

  if(diffuseOff){
    gl.uniform3f(this.u_DiffuseLight, 0.0, 0.0, 0.0);
  }else{
    gl.uniform3f(this.u_DiffuseLight, 0.6,     0.0,    0.0);
  }
  
  // gl.uniform3f(this.u_Ka, 1, 0, 0);
  // gl.uniform3f(this.u_Kd,1, 1, 0.0);
  // gl.uniform3f(this.u_Ks, 0.6,     0.6,    0.6);
  // gl.uniform3f(this.u_Ke, 0.0, 0.0, 0.0);
  // gl.uniform1f(this.shininess, 100.0);
  gl.uniform3fv(this.matl0.uLoc_Ke, matl0.K_emit.slice(0,3));				// Ke emissive
	gl.uniform3fv(this.matl0.uLoc_Ka, matl0.K_ambi.slice(0,3));				// Ka ambient
  gl.uniform3fv(this.matl0.uLoc_Kd, matl0.K_diff.slice(0,3));				// Kd	diffuse
	gl.uniform3fv(this.matl0.uLoc_Ks, matl0.K_spec.slice(0,3));				// Ks specular
	gl.uniform1i(this.matl0.uLoc_Kshiny, parseInt(matl0.K_shiny, 10)); 
  gl.uniform1f(this.u_PhongLight, phongLightValue);
  
    // Adjust values for our uniforms,
    this.ModelMatrix.setIdentity();
 
    //this.ModelMatrix.scale(0.8, 0.8, 0.8);
    // pushMatrix(this.ModelMatrix);  // SAVE world drawing coords.
    pushMatrix(this.ModelMatrix);
      //---------Draw Ground Plane, without spinning.
      // position it.
      this.ModelMatrix.translate( 0.4, -0.4, 0.0);	
      // this.ModelMatrix.scale(0.1, 0.1, 0.1);				// shrink by 10X:
      this.ModelMatrix.rotate(90, 1.0, 0.0, 0.0);
  
      
      //draw robot arm
      
      this.ModelMatrix.setTranslate(3.0, -6, 0.1);
        pushMatrix(this.ModelMatrix);
        
      
        // this.ModelMatrix.scale(0.05,  0.05,0.005); // Make it a little thicker
      
        this.ModelMatrix = popMatrix(); 
        this.ModelMatrix.scale(0.6,  1,0.05);
        //this.ModelMatrix.scale(0.05, 0.05, 1.25);
        gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                        false, 										// use matrix transpose instead?
                        this.ModelMatrix.elements);	
      var mvpMatrix = new Matrix4();
      mvpMatrix.setIdentity();
      mvpMatrix.set(g_worldMat);
      mvpMatrix.multiply(this.ModelMatrix);
      // console.log(mvpMatrix)
      // Pass the model view projection matrix to u_mvpMatrix
      gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
      false, 										// use matrix transpose instead?
      this.ModelMatrix.elements);	// send data from Javascript.
      var normalMatrix = new Matrix4();
      normalMatrix.setInverseOf(this.ModelMatrix);
                        normalMatrix.transpose();
                        gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
              drawBox(gl, 0, this.vboVerts);
    this.ModelMatrix = popMatrix(); 
    pushMatrix(this.ModelMatrix);
    
    // Arm1
    var arm1Length = 10.0; // Length of arm1
    this.ModelMatrix.translate(3, -4.5, 1);
    this.ModelMatrix.rotate(g_angle0now, 0.0, 0.0, 1.0);    // Rotate around the y-axis
    pushMatrix(this.ModelMatrix);

    this.ModelMatrix.scale(0.25, 0.25, 0.5);
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ModelMatrix.elements);	
    
    mvpMatrix.set(g_worldMat);
    mvpMatrix.multiply(this.ModelMatrix);
    // console.log(mvpMatrix)
    // Pass the model view projection matrix to u_mvpMatrix
    gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ModelMatrix.elements);	// send data from Javascript.
    normalMatrix.setInverseOf(this.ModelMatrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
    drawBox(gl, 0, this.vboVerts);

    this.ModelMatrix = popMatrix();
    pushMatrix(this.ModelMatrix);

    // Arm2
    this.ModelMatrix.translate(-0.5, 0, 1);
    this.ModelMatrix.rotate(g_angle1now, 0.0, 1.0, 0.0);  // Rotate around the z-axis
    pushMatrix(this.ModelMatrix);
    this.ModelMatrix.scale(0.5, 0.257, 0.25); 　　　// Move to joint1
   
    //this.ModelMatrix.scale(2, 2.0, 2); // Make it a little thicker
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ModelMatrix.elements);	
  
    mvpMatrix.set(g_worldMat);
    mvpMatrix.multiply(this.ModelMatrix);
    // console.log(mvpMatrix)
    // Pass the model view projection matrix to u_mvpMatrix
    gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ModelMatrix.elements);	// send data from Javascript.
    normalMatrix.setInverseOf(this.ModelMatrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
    drawBox(gl, 0, this.vboVerts);
  

    // Arm3
    this.ModelMatrix = popMatrix();
    //pushMatrix(this.ModelMatrix);
    this.ModelMatrix.translate(-0.7, 0.2, 0);
    
    // this.ModelMatrix.rotate(180, 0.0, 1.0, 0.0);  
    this.ModelMatrix.rotate(90, 0.0, 0.0, 1.0);   　　　
    this.ModelMatrix.rotate(g_angle4now, 0.0, 1.0, 0.0);  
    this.ModelMatrix.scale(0.25, 0.5, 0.25); 
    this.ModelMatrix.scale(0.8, 0.08, 1.2); 
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ModelMatrix.elements);	

    mvpMatrix.set(g_worldMat);
    mvpMatrix.multiply(this.ModelMatrix);
    // console.log(mvpMatrix)
    // Pass the model view projection matrix to u_mvpMatrix
    gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ModelMatrix.elements);	// send data from Javascript.
    normalMatrix.setInverseOf(this.ModelMatrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
    drawBox(gl, 0, this.vboVerts);
  

    this.ModelMatrix = popMatrix();


     //Tongs1
     this.ModelMatrix.translate(0, 0,1.0);
     //this.ModelMatrix.rotate(g_angle2now, 1.0, 0.0, 0.0);  // Rotate around the x-axis

     this.ModelMatrix.scale(0.3, 0.2, 0.3); // Make it a little thicker
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ModelMatrix.elements);	

    mvpMatrix.set(g_worldMat);
    mvpMatrix.multiply(this.ModelMatrix);
    // console.log(mvpMatrix)
    // Pass the model view projection matrix to u_mvpMatrix
    gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ModelMatrix.elements);	// send data from Javascript.
    normalMatrix.setInverseOf(this.ModelMatrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
    //drawBox(gl, 0, this.vboVerts);
     this.ModelMatrix = popMatrix();

//Tongs2
this.ModelMatrix.translate(0, 0,-1.0);
//this.ModelMatrix.rotate(-g_angle2now, 1.0, 0.0, 0.0);  // Rotate around the x-axis
    
     this.ModelMatrix.scale(0.3, 0.2, 0.3); // Make it a little thicker
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	
 
     mvpMatrix.set(g_worldMat);
     mvpMatrix.multiply(this.ModelMatrix);
     // console.log(mvpMatrix)
     // Pass the model view projection matrix to u_mvpMatrix
     gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	// send data from Javascript.
     normalMatrix.setInverseOf(this.ModelMatrix);
         normalMatrix.transpose();
         gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
     //drawBox(gl, 0, this.vboVerts);

     //this.ModelMatrix = popMatrix();  
     //this.ModelMatrix = popMatrix();


  this.ModelMatrix.translate(-10,0,10.5);
  //this.ModelMatrix.translate(transX_c, transY_c,transZ_c);	 
  pushMatrix(this.ModelMatrix);
  this.ModelMatrix.scale(1, 1.0, 1);
  this.ModelMatrix.rotate(body_rotate, 0.0, 0.0, 1.0);
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	
 
     mvpMatrix.set(g_worldMat);
     mvpMatrix.multiply(this.ModelMatrix);
     // console.log(mvpMatrix)
     // Pass the model view projection matrix to u_mvpMatrix
     gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	// send data from Javascript.
     normalMatrix.setInverseOf(this.ModelMatrix);
         normalMatrix.transpose();
         gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
  drawBox(gl, 0, this.vboVerts);
  var arm1Length = 10.0; 
  this.ModelMatrix.translate(0,arm1Length, 0,0);	
  pushMatrix(this.ModelMatrix);
  this.ModelMatrix = popMatrix();
  pushMatrix(this.ModelMatrix);

  //Arm1
  this.ModelMatrix.translate(2.2, -8.5, 1.0); 
  this.ModelMatrix.rotate(90, 1, 0, 0);
  this.ModelMatrix.rotate(g_angle1now_c, 1.0, 0.0, 0.0);  
  pushMatrix(this.ModelMatrix);
  this.ModelMatrix.scale(0.5, -1.3, 0.5); 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	
 
     mvpMatrix.set(g_worldMat);
     mvpMatrix.multiply(this.ModelMatrix);
     // console.log(mvpMatrix)
     // Pass the model view projection matrix to u_mvpMatrix
     gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	// send data from Javascript.
     normalMatrix.setInverseOf(this.ModelMatrix);
         normalMatrix.transpose();
         gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
  drawBox(gl, 0, this.vboVerts);
  
  
  this.ModelMatrix = popMatrix();
  this.ModelMatrix.translate(0, -3, 0.0); 
  this.ModelMatrix.rotate(-g_angle4now_c, 1.0, 0.0, 0.0);  
  this.ModelMatrix.scale(0.5, 1.5, 0.5); 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	
 
     mvpMatrix.set(g_worldMat);
     mvpMatrix.multiply(this.ModelMatrix);
     // console.log(mvpMatrix)
     // Pass the model view projection matrix to u_mvpMatrix
     gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	// send data from Javascript.
     normalMatrix.setInverseOf(this.ModelMatrix);
         normalMatrix.transpose();
         gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
  drawBox(gl, 0, this.vboVerts);
  

  this.ModelMatrix = popMatrix();
  pushMatrix(this.ModelMatrix);

  //Arm2
  this.ModelMatrix.translate(-2.2, -9, 1.0); 
  this.ModelMatrix.rotate(90, 1, 0, 0);
  this.ModelMatrix.rotate(-g_angle1now_c, 1.0, 0.0, 0.0);  
  pushMatrix(this.ModelMatrix);
  this.ModelMatrix.scale(0.5, -1.3, 0.5); 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	
 
     mvpMatrix.set(g_worldMat);
     mvpMatrix.multiply(this.ModelMatrix);
     // console.log(mvpMatrix)
     // Pass the model view projection matrix to u_mvpMatrix
     gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	// send data from Javascript.
     normalMatrix.setInverseOf(this.ModelMatrix);
         normalMatrix.transpose();
         gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
  drawBox(gl, 0, this.vboVerts);
  
  
  this.ModelMatrix = popMatrix();
  this.ModelMatrix.translate(0, -3, 0.0); 
  this.ModelMatrix.rotate(-g_angle4now_c, 1.0, 0.0, 0.0);  
  this.ModelMatrix.scale(0.5, 1.5, 0.5); 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	
 
     mvpMatrix.set(g_worldMat);
     mvpMatrix.multiply(this.ModelMatrix);
     // console.log(mvpMatrix)
     // Pass the model view projection matrix to u_mvpMatrix
     gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	// send data from Javascript.
     normalMatrix.setInverseOf(this.ModelMatrix);
         normalMatrix.transpose();
         gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
  drawBox(gl, 0, this.vboVerts);
  

  this.ModelMatrix = popMatrix();
  pushMatrix(this.ModelMatrix);
  
   // Leg1
  
   this.ModelMatrix.translate(1.8, -8.5, -3); 
   this.ModelMatrix.rotate(-g_angle1now_c, 1.0, 0.0, 0.0);  
   pushMatrix(this.ModelMatrix);
   this.ModelMatrix.scale(0.5, -0.5, 1); 
   gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	
 
     mvpMatrix.set(g_worldMat);
     mvpMatrix.multiply(this.ModelMatrix);
     // console.log(mvpMatrix)
     // Pass the model view projection matrix to u_mvpMatrix
     gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	// send data from Javascript.
     normalMatrix.setInverseOf(this.ModelMatrix);
         normalMatrix.transpose();
         gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
   drawBox(gl, 0, this.vboVerts);
   
   //lowleg1
   this.ModelMatrix = popMatrix();
   //this.ModelMatrix = popMatrix();
   
   this.ModelMatrix.translate(0, 0, -2.8); 
   this.ModelMatrix.rotate(g_angle3now_c, 1.0, 0.0, 0.0); 
   this.ModelMatrix.translate(0, 0, 3.5); 
   this.ModelMatrix.translate(0, 0, -3.5); 

   this.ModelMatrix.scale(0.5, -0.5, -1); 
   gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	
 
     mvpMatrix.set(g_worldMat);
     mvpMatrix.multiply(this.ModelMatrix);
     // console.log(mvpMatrix)
     // Pass the model view projection matrix to u_mvpMatrix
     gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	// send data from Javascript.
     normalMatrix.setInverseOf(this.ModelMatrix);
         normalMatrix.transpose();
         gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
   drawBox(gl, 0, this.vboVerts);
   
   
 
   this.ModelMatrix = popMatrix();
   pushMatrix(this.ModelMatrix);


    // Leg2
  
    this.ModelMatrix.translate(-1.8, -8.5, -3); 
    this.ModelMatrix.rotate(g_angle1now_c, 1.0, 0.0, 0.0);  
    pushMatrix(this.ModelMatrix);
    this.ModelMatrix.scale(0.5, -0.5, 1); 
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
      false, 										// use matrix transpose instead?
      this.ModelMatrix.elements);	
  
      mvpMatrix.set(g_worldMat);
      mvpMatrix.multiply(this.ModelMatrix);
      // console.log(mvpMatrix)
      // Pass the model view projection matrix to u_mvpMatrix
      gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
      false, 										// use matrix transpose instead?
      this.ModelMatrix.elements);	// send data from Javascript.
      normalMatrix.setInverseOf(this.ModelMatrix);
          normalMatrix.transpose();
          gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
    drawBox(gl, 0, this.vboVerts);
    
    //lowleg2
    this.ModelMatrix = popMatrix();
    //this.ModelMatrix = popMatrix();
    
    this.ModelMatrix.translate(0, 0, -2.8); 
    this.ModelMatrix.rotate(g_angle3now_c, 1.0, 0.0, 0.0); 
    this.ModelMatrix.translate(0, 0, 3.5); 
    this.ModelMatrix.translate(0, 0, -3.5); 
 
    this.ModelMatrix.scale(0.5, -0.5, -1); 
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
      false, 										// use matrix transpose instead?
      this.ModelMatrix.elements);	
  
      mvpMatrix.set(g_worldMat);
      mvpMatrix.multiply(this.ModelMatrix);
      // console.log(mvpMatrix)
      // Pass the model view projection matrix to u_mvpMatrix
      gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
      false, 										// use matrix transpose instead?
      this.ModelMatrix.elements);	// send data from Javascript.
      normalMatrix.setInverseOf(this.ModelMatrix);
          normalMatrix.transpose();
          gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
    drawBox(gl, 0, this.vboVerts);
    
    
  
    this.ModelMatrix = popMatrix();
    pushMatrix(this.ModelMatrix);
        
    

  }


  
  VBObox3.prototype.draw = function() {
  //=============================================================================
  // Send commands to GPU to select and render current VBObox contents.
    g_mvpMatrix = new Matrix4();
    // check: was WebGL context set to use our VBO & shader program?
    if(this.isReady()==false) {
          console.log('ERROR! before' + this.constructor.name + 
                '.draw() call you needed to call this.switchToMe()!!');
    }
  
  this.adjust();

   

    
    
    // ----------------------------Draw the contents of the currently-bound VBO:
    // gl.drawArrays(gl.TRIANGLES,		    // select the drawing primitive to draw:
    //                 // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
    //                 //          gl.TRIANGLES, gl.TRIANGLE_STRIP,
    //               0, 								// location of 1st vertex to draw;
    //               this.vboVerts);		// number of vertices to draw on-screen.


      
    //   //draw robot arm
      
        this.ModelMatrix.setTranslate(10.0, 0, 20.0);
        pushMatrix(this.ModelMatrix);
        this.ModelMatrix.scale(1.25, 0.05, 1.25); // Make it a little thicker
        this.adjust();
         gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                  false, 										// use matrix transpose instead?
                  this.ModelMatrix.elements);	
        drawBox(gl, 0, this.vboVerts);

  }

  function drawBox(gl, start, end) {
    // Calculate the model view project matrix and pass it to u_MvpMatrix
    // g_mvpMatrix= g_worldMat;
    // g_mvpMatrix.multiply(this.ModelMatrix);
    // gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, g_mvpMatrix);
    // this.ModelMatrix.set(g_worldMat);
    // ModelMatrix.multiply(this.g_mvpMatrix);
    // gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, g_mvpMatrix.elements);
    //gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, g_mvpMatrix.elements)
  
    // Draw
    
  
    gl.drawArrays(gl.TRIANGLES, start,end);
  
  }
  
  VBObox3.prototype.reload = function() {
  //=============================================================================
  // Over-write current values in the GPU for our already-created VBO: use 
  // gl.bufferSubData() call to re-transfer some or all of our Float32Array 
  // contents to our VBO without changing any GPU memory allocations.
  
   gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                    0,                  // byte offset to where data replacement
                                        // begins in the VBO.
                      this.vboContents);   // the JS source-data array used to fill VBO
  }
  

  function VBObox4() {
    //=============================================================================
    //=============================================================================
    // CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
    // needed to render vertices from one Vertex Buffer Object (VBO) using one 
    // separate shader program (a vertex-shader & fragment-shader pair) and one
    // set of 'uniform' variables.
    
    // Constructor goal: 
    // Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
    // written into code) in all other VBObox functions. Keeping all these (initial)
    // values here, in this one coonstrutor function, ensures we can change them 
    // easily WITHOUT disrupting any other code, ever!
      
      this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
     `precision highp float;				// req'd in OpenGL ES if we use 'float'
      //
      uniform mat4 u_ModelMatrix;
      attribute vec4 a_Pos1;
      attribute vec3 a_Colr1;
      varying vec3 v_Colr1;
      //
      void main() {
        gl_Position = u_ModelMatrix * a_Pos1;
         v_Colr1 = a_Colr1;
       }`;
    //========YOUR CHOICE OF 3 Fragment shader programs=======
    //				(use /* and */ to uncomment ONLY ONE)
    // Each is an example of how to use the built-in vars for gl.POINTS to
    // improve their on-screen appearance.
    // a)'SQUARE points' -- DEFAULT; simple fixed-color square set by point-size.
    // b) 'ROUND FLAT' -- uses 'gl_PointCoord' to make solid-color dot instead;
    // c) 'SHADED Sphere' -- radial distance sets color to 'fake' a lit 3D sphere.
    //   You too can be a 'shader writer'! What other fragment shaders would help?
  
     // a) SQUARE points:
      this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
     `precision mediump float;
      varying vec3 v_Colr1;
      void main() {
        gl_FragColor = vec4(v_Colr1, 1.0);
      }`;
    
  
    /*
     // b) ROUND FLAT dots:
      this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
     `precision mediump float;
      varying vec3 v_Colr1;
      void main() {
        float dist = distance(gl_PointCoord, vec2(0.5, 0.5)); 
        if(dist < 0.5) {
          gl_FragColor = vec4(v_Colr1, 1.0);
          } else {discard;};
      }`;
    */
    // /*
     // c) SHADED, sphere-like dots:
    //   this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
    //  `precision mediump float;
    //   varying vec3 v_Colr1;
    //   void main() {
    //     float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
    //     if(dist < 0.5) {
    //        gl_FragColor = vec4((1.0-2.0*dist)*v_Colr1.rgb, 1.0);
    //       } else {discard;};
    //   }`;
    //     this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
    //  `precision mediump float;
    //   varying vec3 v_Colr1;
    //   void main() {
    //     gl_FragColor = v_Colr1;
    //   }`;
   
    // this.FRAG_SRC =
    // '#ifdef GL_ES\n' +
    // 'precision mediump float;\n' +
    // '#endif\n' +
    // 'varying vec4 v_Color;\n' +
    // 'void main() {\n' +
    // '  gl_FragColor = v_Color;\n' +
    // '}\n';
    var ctrColr = new Float32Array([0.930, 1, 0.843]);	// pink
    var topColr = new Float32Array([0.628, 0.910, 0.854]);	// blue
    var botColr = new Float32Array([0.940, 0.913, 0.620]); //yellow
      this.vboContents = //---------------------------------------------------------
        new Float32Array ([					// Array of vertex attribute values we will
                                    // transfer to GPU's vertex buffer object (VBO)
  
          // Front face
      1.5, 2, 1.5, 1, ctrColr[0], ctrColr[1], ctrColr[2], -1.5, 2, 1.5, 1, topColr[0], topColr[1], topColr[2], -1.5, 0.0, 1.5,1, botColr[0], botColr[1], botColr[2], // Triangle 1
      1.5, 2, 1.5, 1, ctrColr[0], ctrColr[1], ctrColr[2], -1.5, 0.0, 1.5,1, botColr[0], botColr[1], botColr[2],  1.5, 0.0, 1.5,  1,topColr[0], topColr[1], topColr[2], // Triangle 2
  
      // Right face
      1.5, 2, 1.5, 1,ctrColr[0], ctrColr[1], ctrColr[2], 1.5, 0.0, 1.5, 1,topColr[0], topColr[1], topColr[2], 1.5, 0.0, -1.5, 1,botColr[0], botColr[1], botColr[2], // Triangle 1
      1.5, 2, 1.5, 1,ctrColr[0], ctrColr[1], ctrColr[2], 1.5, 0.0, -1.5, 1,botColr[0], botColr[1], botColr[2],  1.5, 2, -1.5,1,topColr[0], topColr[1], topColr[2], // Triangle 2
  
      // Up face
      1.5, 2, 1.5,1, ctrColr[0], ctrColr[1], ctrColr[2], 1.5, 2,-1.5, 1,topColr[0], topColr[1], topColr[2],-1.5, 2, -1.5,1,botColr[0], botColr[1], botColr[2],// Triangle 1
      1.5, 2, 1.5, 1,ctrColr[0], ctrColr[1], ctrColr[2], -1.5, 2, -1.5,1,botColr[0], botColr[1], botColr[2],-1.5, 2, 1.5, 1,topColr[0], topColr[1], topColr[2],// Triangle 2
  
      // Left face
      -1.5, 2, 1.5,1, ctrColr[0], ctrColr[1], ctrColr[2],-1.5, 2,-1.5,1,topColr[0], topColr[1], topColr[2], -1.5,  0.0,-1.5, 1,botColr[0], botColr[1], botColr[2], // Triangle 1
      -1.5, 2, 1.5,1, ctrColr[0], ctrColr[1], ctrColr[2],-1.5,  0.0,-1.5,1, botColr[0], botColr[1], botColr[2], -1.5,  0.0, 1.5, 1,topColr[0], topColr[1], topColr[2],// Triangle 2
  
      // Down face
      -1.5,  0.0,-1.5,1, ctrColr[0], ctrColr[1], ctrColr[2], 1.5,  0.0,-1.5, 1,topColr[0], topColr[1], topColr[2], 1.5,  0.0, 1.5, 1, botColr[0], botColr[1], botColr[2], // Triangle 1
      -1.5,  0.0,-1.5,1, ctrColr[0], ctrColr[1], ctrColr[2],1.5,  0.0, 1.5, 1,botColr[0], botColr[1], botColr[2], -1.5,  0.0, 1.5,1,topColr[0], topColr[1], topColr[2],  // Triangle 2
  
      // Back face
      1.5, 0.0, -1.5,1,ctrColr[0], ctrColr[1], ctrColr[2],-1.5, 0.0, -1.5,1,topColr[0], topColr[1], topColr[2], -1.5, 2, -1.5,1,botColr[0], botColr[1], botColr[2], // Triangle 1
      1.5, 0.0, -1.5,1,ctrColr[0], ctrColr[1], ctrColr[2],  -1.5, 2, -1.5,1,botColr[0], botColr[1], botColr[2], 1.5, 2, -1.5,1,topColr[0], topColr[1], topColr[2]// Triangle 2
      ]);	
      
      this.vboVerts =this.vboContents.length/7;							// # of vertices held in 'vboContents' array;
      this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
                                    // bytes req'd by 1 vboContents array element;
                                    // (why? used to compute stride and offset 
                                    // in bytes for vertexAttribPointer() calls)
      this.vboBytes = this.vboContents.length * this.FSIZE;               
                                    // (#  of floats in vboContents array) * 
                                    // (# of bytes/float).
      this.vboStride = this.vboBytes / this.vboVerts;     
                                    // (== # of bytes to store one complete vertex).
                                    // From any attrib in a given vertex in the VBO, 
                                    // move forward by 'vboStride' bytes to arrive 
                                    // at the same attrib for the next vertex.
                                     
                  //----------------------Attribute sizes
      this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
                                    // attribute named a_Pos1. (4: x,y,z,w values)
      this.vboFcount_a_Colr1 = 3;   // # of floats for this attrib (r,g,b values) 
      console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
                      this.vboFcount_a_Colr1) *   // every attribute in our VBO
                      this.FSIZE == this.vboStride, // for agreeement with'stride'
                      "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
                      
                  //----------------------Attribute offsets
      this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
                                    // of 1st a_Pos1 attrib value in vboContents[]
      this.vboOffset_a_Colr1 = (this.vboFcount_a_Pos1) * this.FSIZE;  
                                    // == 4 floats * bytes/float
                                    //# of bytes from START of vbo to the START
                                    // of 1st a_Colr1 attrib value in vboContents[]
      this.vboOffset_a_PtSiz1 =(this.vboFcount_a_Pos1 +
                                this.vboFcount_a_Colr1) * this.FSIZE; 
                                    // == 7 floats * bytes/float
                                    // # of bytes from START of vbo to the START
                                    // of 1st a_PtSize attrib value in vboContents[]
    
                  //-----------------------GPU memory locations:                                
      this.vboLoc;									// GPU Location for Vertex Buffer Object, 
                                    // returned by gl.createBuffer() function call
      this.shaderLoc;								// GPU Location for compiled Shader-program  
                                    // set by compile/link of VERT_SRC and FRAG_SRC.
                              //------Attribute locations in our shaders:
      this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
      this.a_Colr1Loc;							// GPU location: shader 'a_Colr1' attribute
      
                  //---------------------- Uniform locations &values in our shaders
      this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
      this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform
    };
    
    
    VBObox4.prototype.init = function() {
    //==============================================================================
    // Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
    // kept in this VBObox. (This function usually called only once, within main()).
    // Specifically:
    // a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
    //  executable 'program' stored and ready to use inside the GPU.  
    // b) create a new VBO object in GPU memory and fill it by transferring in all
    //  the vertex data held in our Float32array member 'VBOcontents'. 
    // c) Find & save the GPU location of all our shaders' attribute-variables and 
    //  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
    // -------------------
    // CAREFUL!  before you can draw pictures using this VBObox contents, 
    //  you must call this VBObox object's switchToMe() function too!
    //--------------------
    // a) Compile,link,upload shaders-----------------------------------------------
      this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
      if (!this.shaderLoc) {
        console.log(this.constructor.name + 
                    '.init() failed to create executable Shaders on the GPU. Bye!');
        return;
      }
    // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
    //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}
    
      gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())
    
    // b) Create VBO on GPU, fill it------------------------------------------------
      this.vboLoc = gl.createBuffer();	
      if (!this.vboLoc) {
        console.log(this.constructor.name + 
                    '.init() failed to create VBO in GPU. Bye!'); 
        return;
      }
      
      // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
      //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
      // (positions, colors, normals, etc), or 
      //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
      // that each select one vertex from a vertex array stored in another VBO.
      gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
                      this.vboLoc);				  // the ID# the GPU uses for this buffer.
                            
      // Fill the GPU's newly-created VBO object with the vertex data we stored in
      //  our 'vboContents' member (JavaScript Float32Array object).
      //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
      //	 use gl.bufferSubData() to modify VBO contents without changing VBO size)
      gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
                        this.vboContents, 		// JavaScript Float32Array
                       gl.STATIC_DRAW);			// Usage hint.  
      //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
      //	(see OpenGL ES specification for more info).  Your choices are:
      //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
      //				contents rarely or never change.
      //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
      //				contents may change often as our program runs.
      //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
      // 			times and then discarded; for rapidly supplied & consumed VBOs.
    
    // c1) Find All Attributes:-----------------------------------------------------
    //  Find & save the GPU location of all our shaders' attribute-variables and 
    //  uniform-variables (for switchToMe(), adjust(), draw(), reload(), etc.)
      this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Pos1');
      if(this.a_Pos1Loc < 0) {
        console.log(this.constructor.name + 
                    '.init() Failed to get GPU location of attribute a_Pos1');
        return -1;	// error exit.
      }
       this.a_Colr1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Colr1');
      if(this.a_Colr1Loc < 0) {
        console.log(this.constructor.name + 
                    '.init() failed to get the GPU location of attribute a_Colr1');
        return -1;	// error exit.
      }
  
      // c2) Find All Uniforms:-----------------------------------------------------
      //Get GPU storage location for each uniform var used in our shader programs: 
     this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
      if (!this.u_ModelMatrixLoc) { 
        console.log(this.constructor.name + 
                    '.init() failed to get GPU location for u_ModelMatrix uniform');
        return;
      }
      
      
    }
    
    VBObox4.prototype.switchToMe = function () {
    //==============================================================================
    // Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
    //
    // We only do this AFTER we called the init() function, which does the one-time-
    // only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
    // even then, you are STILL not ready to draw our VBObox's contents onscreen!
    // We must also first complete these steps:
    //  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
    //  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
    //  c) tell the GPU to connect the shader program's attributes to that VBO.
    
    // a) select our shader program:
      gl.useProgram(this.shaderLoc);	
    //		Each call to useProgram() selects a shader program from the GPU memory,
    // but that's all -- it does nothing else!  Any previously used shader program's 
    // connections to attributes and uniforms are now invalid, and thus we must now
    // establish new connections between our shader program's attributes and the VBO
    // we wish to use.  
      
    // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
    //  instead connect to our own already-created-&-filled VBO.  This new VBO can 
    //    supply values to use as attributes in our newly-selected shader program:
      gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
                        this.vboLoc);			// the ID# the GPU uses for our VBO.
      
    // c) connect our newly-bound VBO to supply attribute variable values for each
    // vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
    // this sets up data paths from VBO to our shader units:
      // 	Here's how to use the almost-identical OpenGL version of this function:
      //		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
      gl.vertexAttribPointer(
        this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
        this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
        gl.FLOAT,		  // type == what data type did we use for those numbers?
        false,				// isNormalized == are these fixed-point values that we need
                      //									normalize before use? true or false
        this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
                      // stored attrib for this vertex to the same stored attrib
                      //  for the next vertex in our VBO.  This is usually the 
                      // number of bytes used to store one complete vertex.  If set 
                      // to zero, the GPU gets attribute values sequentially from 
                      // VBO, starting at 'Offset'.	
                      // (Our vertex size in bytes: 4 floats for pos + 3 for color)
        this.vboOffset_a_Pos1);						
                      // Offset == how many bytes from START of buffer to the first
                      // value we will actually use?  (we start with position).
      gl.vertexAttribPointer(this.a_Colr1Loc, this.vboFcount_a_Colr1,
                             gl.FLOAT, false, 
                             this.vboStride,  this.vboOffset_a_Colr1);
  
      //-- Enable this assignment of the attribute to its' VBO source:
      gl.enableVertexAttribArray(this.a_Pos1Loc);
      gl.enableVertexAttribArray(this.a_Colr1Loc);
    }
    
    VBObox4.prototype.isReady = function() {
    //==============================================================================
    // Returns 'true' if our WebGL rendering context ('gl') is ready to render using
    // this objects VBO and shader program; else return false.
    // see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter
    
    var isOK = true;
    
      if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
        console.log(this.constructor.name + 
                    '.isReady() false: shader program at this.shaderLoc not in use!');
        isOK = false;
      }
      if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
          console.log(this.constructor.name + 
                  '.isReady() false: vbo at this.vboLoc not in use!');
        isOK = false;
      }
      return isOK;
    }
    
    VBObox4.prototype.adjust = function() {
    //==============================================================================
    // Update the GPU to newer, current values we now store for 'uniform' vars on 
    // the GPU; and (if needed) update each attribute's stride and offset in VBO.
    
      // check: was WebGL context set to use our VBO & shader program?
      if(this.isReady()==false) {
            console.log('ERROR! before' + this.constructor.name + 
                  '.adjust() call you needed to call this.switchToMe()!!');
      }
      // Adjust values for our uniforms,
      this.ModelMatrix.setIdentity();
    // THIS DOESN'T WORK!!  this.ModelMatrix = g_worldMat;
      this.ModelMatrix.set(g_worldMat);
      this.ModelMatrix.rotate(90, 1, 0, 0);
      // //this.ModelMatrix.rotate(g_angle1now, 0, 1, 0);	// -spin drawing axes,
      this.ModelMatrix.translate(-2.0, 2.0,-3);	
      this.ModelMatrix.scale(0.3, 0.3, 0.3);
    //this.ModelMatrix.translate(transX_c, transY_c,transZ_c);	
    //this.ModelMatrix.rotate(body_rotate, 0.0, 1.0, 0.0); 
    pushMatrix(this.ModelMatrix);
    this.ModelMatrix.scale(0.3, 1.2, 0.3);
    
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	
          drawBox(gl, 0, this.vboVerts);
    
    var arm1Length = 2.0; 
    this.ModelMatrix.translate(0,0, 0,0);	
    this.ModelMatrix = popMatrix();
    pushMatrix(this.ModelMatrix);
    this.ModelMatrix = popMatrix();
    pushMatrix(this.ModelMatrix);
    //Arm1
    this.ModelMatrix.translate(0.7, 2, 0.0); 
    //this.ModelMatrix.rotate(90, 1.0, 0.0, 0.0);  
    this.ModelMatrix.rotate(g_angle1now_c, 1.0, 0.0, 0.0);  
    pushMatrix(this.ModelMatrix);
    this.ModelMatrix.scale(0.2, -0.8, 0.2); 
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	
          drawBox(gl, 0, this.vboVerts); // Draw
    // 
    
    this.ModelMatrix = popMatrix();
    this.ModelMatrix.translate(0, -1.5, 0.0); 
    //this.ModelMatrix.rotate(90, 1.0, 0.0, 0.0); 
    this.ModelMatrix.rotate(g_angle4now_c, 1.0, 0.0, 0.0);  
    this.ModelMatrix.scale(0.2, -0.8, 0.2); 
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	
          drawBox(gl, 0, this.vboVerts); // Draw
    // 
  
    this.ModelMatrix = popMatrix();
    pushMatrix(this.ModelMatrix);
    // Arm2
    this.ModelMatrix.translate(-0.7, 2, 0.0);
    this.ModelMatrix.rotate(-g_angle1now_c, 1.0, 0.0, 0.0);    
    pushMatrix(this.ModelMatrix);
    this.ModelMatrix.scale(0.2, -0.8, 0.2); 
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	
          drawBox(gl, 0, this.vboVerts); // Draw
    // 
    this.ModelMatrix = popMatrix();
    this.ModelMatrix.translate(0, -1.5, 0.0); 
    this.ModelMatrix.rotate(-g_angle4now_c, 1.0, 0.0, 0.0);  
    this.ModelMatrix.scale(0.2, 0.8, 0.2); 
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	
          drawBox(gl, 0, this.vboVerts); // Draw
    // 
   
    this.ModelMatrix = popMatrix();
  
    this.ModelMatrix.translate(0, 0, 0.0); 
    pushMatrix(this.ModelMatrix);
    this.ModelMatrix = popMatrix();
    pushMatrix(this.ModelMatrix);
    // // Leg1
    
    this.ModelMatrix.translate(-0.5, 0, 0.0); 
    this.ModelMatrix.rotate(-g_angle1now_c, 1.0, 0.0, 0.0);  
    pushMatrix(this.ModelMatrix);
    this.ModelMatrix.scale(0.2, -0.8, 0.2); 
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	
          drawBox(gl, 0, this.vboVerts); // Draw
    // 
    //lowleg1
    this.ModelMatrix = popMatrix();
    this.ModelMatrix.translate(0, -1.5, 0.0); 
    this.ModelMatrix.rotate(g_angle3now_c, 1.0, 0.0, 0.0);  
    this.ModelMatrix.scale(0.2, -0.8, 0.2); 
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	
          drawBox(gl, 0, this.vboVerts); // Draw
    // 
    
  
    this.ModelMatrix = popMatrix();
    pushMatrix(this.ModelMatrix);
    this.ModelMatrix = popMatrix();
    // Leg2
    this.ModelMatrix.translate(0.5, 0, 0.0);
    this.ModelMatrix.rotate(g_angle1now_c, 1.0, 0.0, 0.0);    
    pushMatrix(this.ModelMatrix);
    this.ModelMatrix.scale(0.2, -0.8, 0.2); 
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	
          drawBox(gl, 0, this.vboVerts);// Draw
    // 
    // //lowerLeg2
    this.ModelMatrix = popMatrix();
    this.ModelMatrix.translate(0,  -1.5, 0.0); 
    this.ModelMatrix.rotate(-g_angle3now_c, 1.0, 0.0, 0.0);  
    this.ModelMatrix.scale(0.2, -0.8, 0.2); 
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	
          drawBox(gl, 0, this.vboVerts); // Draw
    // 
    // //neck
    //this.ModelMatrix = popMatrix();
    this.ModelMatrix.translate(0, 1.5, 0.0);
    this.ModelMatrix.scale(0.2, 0.1, 0.2); 
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	
          drawBox(gl, 0, this.vboVerts); // Draw
    
    //head
    this.ModelMatrix.translate(0, 1.5, 0.0);
    this.ModelMatrix.rotate(g_angle0now_c, 0.0, 1.0, 0.0); 
    this.ModelMatrix.scale(4, 2, 4); 
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	
          drawBox(gl, 0, this.vboVerts); // Draw
    
    
    }
    
    VBObox4.prototype.draw = function() {
    //=============================================================================
    // Send commands to GPU to select and render current VBObox contents.
      g_mvpMatrix = new Matrix4();
      // check: was WebGL context set to use our VBO & shader program?
      if(this.isReady()==false) {
            console.log('ERROR! before' + this.constructor.name + 
                  '.draw() call you needed to call this.switchToMe()!!');
      }
    
    this.adjust();
  
     
  
      
      
      // ----------------------------Draw the contents of the currently-bound VBO:
      // gl.drawArrays(gl.TRIANGLES,		    // select the drawing primitive to draw:
      //                 // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
      //                 //          gl.TRIANGLES, gl.TRIANGLE_STRIP,
      //               0, 								// location of 1st vertex to draw;
      //               this.vboVerts);		// number of vertices to draw on-screen.
  
  
        
      //   //draw robot arm
        
          this.ModelMatrix.setTranslate(10.0, 0, 20.0);
          pushMatrix(this.ModelMatrix);
          this.ModelMatrix.scale(1.25, 0.05, 1.25); // Make it a little thicker
          this.adjust();
           gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	
          drawBox(gl, 0, this.vboVerts);
  
    }
  
 
    
    VBObox4.prototype.reload = function() {
    //=============================================================================
    // Over-write current values in the GPU for our already-created VBO: use 
    // gl.bufferSubData() call to re-transfer some or all of our Float32Array 
    // contents to our VBO without changing any GPU memory allocations.
    
     gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                      0,                  // byte offset to where data replacement
                                          // begins in the VBO.
                        this.vboContents);   // the JS source-data array used to fill VBO
    }
    function VBObox5() {
      //=============================================================================
      //=============================================================================
      // CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
      // needed to render vertices from one Vertex Buffer Object (VBO) using one 
      // separate shader program (a vertex-shader & fragment-shader pair) and one
      // set of 'uniform' variables.
      
      // Constructor goal: 
      // Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
      // written into code) in all other VBObox functions. Keeping all these (initial)
      // values here, in this one coonstrutor function, ensures we can change them 
      // easily WITHOUT disrupting any other code, ever!
        
        this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
       `precision highp float;				// req'd in OpenGL ES if we use 'float'
        //
        uniform mat4 u_ModelMatrix;
        attribute vec4 a_Pos1;
        attribute vec3 a_Colr1;
        varying vec3 v_Colr1;
        //
        void main() {
          gl_Position = u_ModelMatrix * a_Pos1;
           v_Colr1 = a_Colr1;
         }`;
      //========YOUR CHOICE OF 3 Fragment shader programs=======
      //				(use /* and */ to uncomment ONLY ONE)
      // Each is an example of how to use the built-in vars for gl.POINTS to
      // improve their on-screen appearance.
      // a)'SQUARE points' -- DEFAULT; simple fixed-color square set by point-size.
      // b) 'ROUND FLAT' -- uses 'gl_PointCoord' to make solid-color dot instead;
      // c) 'SHADED Sphere' -- radial distance sets color to 'fake' a lit 3D sphere.
      //   You too can be a 'shader writer'! What other fragment shaders would help?
    
       // a) SQUARE points:
        this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
       `precision mediump float;
        varying vec3 v_Colr1;
        void main() {
          gl_FragColor = vec4(v_Colr1, 1.0);
        }`;
      
    
      /*
       // b) ROUND FLAT dots:
        this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
       `precision mediump float;
        varying vec3 v_Colr1;
        void main() {
          float dist = distance(gl_PointCoord, vec2(0.5, 0.5)); 
          if(dist < 0.5) {
            gl_FragColor = vec4(v_Colr1, 1.0);
            } else {discard;};
        }`;
      */
      // /*
       // c) SHADED, sphere-like dots:
      //   this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
      //  `precision mediump float;
      //   varying vec3 v_Colr1;
      //   void main() {
      //     float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
      //     if(dist < 0.5) {
      //        gl_FragColor = vec4((1.0-2.0*dist)*v_Colr1.rgb, 1.0);
      //       } else {discard;};
      //   }`;
      //     this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
      //  `precision mediump float;
      //   varying vec3 v_Colr1;
      //   void main() {
      //     gl_FragColor = v_Colr1;
      //   }`;
     
      // this.FRAG_SRC =
      // '#ifdef GL_ES\n' +
      // 'precision mediump float;\n' +
      // '#endif\n' +
      // 'varying vec4 v_Color;\n' +
      // 'void main() {\n' +
      // '  gl_FragColor = v_Color;\n' +
      // '}\n';

      var c30 = Math.sqrt(0.75);					
	  var sq2	= Math.sqrt(2.0);		
        this.vboContents = //---------------------------------------------------------
          new Float32Array ([					// Array of vertex attribute values we will
                                      // transfer to GPU's vertex buffer object (VBO)
    
            // Front face
            0.0,	 0.0, sq2, 1,		1.0, 	1.0,	1.0,	
            c30, -0.5, 0.0, 1,		0.0,  0.0,  1.0, 	
            0.0,  1.0, 0.0,  1,	1.0,  0.0,  0.0,	
             
            0.0,	 0.0, sq2, 	1	,	1.0, 	1.0,	1.0,	
            0.0,  1.0, 0.0,  1	,		1.0,  0.0,  0.0,	
           -c30, -0.5, 0.0,  	1	,	0.0,  1.0,  0.0, 	
             
            0.0,	 0.0, sq2,	1	,	1.0, 	1.0,	1.0,	
           -c30, -0.5, 0.0, 	1	,	0.0,  1.0,  0.0, 	
            c30, -0.5, 0.0, 	1	,	0.0,  0.0,  1.0, 
               
           -c30, -0.5,  0.0, 	1	,	0.0,  1.0,  0.0, 	
            0.0,  1.0,  0.0,  1	, 	1.0,  0.0,  0.0,	
            c30, -0.5,  0.0, 	1	,	0.0,  0.0,  1.0, 
        ]);	
        
        this.vboVerts =this.vboContents.length/7;							// # of vertices held in 'vboContents' array;
        this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
                                      // bytes req'd by 1 vboContents array element;
                                      // (why? used to compute stride and offset 
                                      // in bytes for vertexAttribPointer() calls)
        this.vboBytes = this.vboContents.length * this.FSIZE;               
                                      // (#  of floats in vboContents array) * 
                                      // (# of bytes/float).
        this.vboStride = this.vboBytes / this.vboVerts;     
                                      // (== # of bytes to store one complete vertex).
                                      // From any attrib in a given vertex in the VBO, 
                                      // move forward by 'vboStride' bytes to arrive 
                                      // at the same attrib for the next vertex.
                                       
                    //----------------------Attribute sizes
        this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
                                      // attribute named a_Pos1. (4: x,y,z,w values)
        this.vboFcount_a_Colr1 = 3;   // # of floats for this attrib (r,g,b values) 
        console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
                        this.vboFcount_a_Colr1) *   // every attribute in our VBO
                        this.FSIZE == this.vboStride, // for agreeement with'stride'
                        "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
                        
                    //----------------------Attribute offsets
        this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
                                      // of 1st a_Pos1 attrib value in vboContents[]
        this.vboOffset_a_Colr1 = (this.vboFcount_a_Pos1) * this.FSIZE;  
                                      // == 4 floats * bytes/float
                                      //# of bytes from START of vbo to the START
                                      // of 1st a_Colr1 attrib value in vboContents[]
        this.vboOffset_a_PtSiz1 =(this.vboFcount_a_Pos1 +
                                  this.vboFcount_a_Colr1) * this.FSIZE; 
                                      // == 7 floats * bytes/float
                                      // # of bytes from START of vbo to the START
                                      // of 1st a_PtSize attrib value in vboContents[]
      
                    //-----------------------GPU memory locations:                                
        this.vboLoc;									// GPU Location for Vertex Buffer Object, 
                                      // returned by gl.createBuffer() function call
        this.shaderLoc;								// GPU Location for compiled Shader-program  
                                      // set by compile/link of VERT_SRC and FRAG_SRC.
                                //------Attribute locations in our shaders:
        this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
        this.a_Colr1Loc;							// GPU location: shader 'a_Colr1' attribute
        
                    //---------------------- Uniform locations &values in our shaders
        this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
        this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform
      };
      
      
      VBObox5.prototype.init = function() {
      //==============================================================================
      // Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
      // kept in this VBObox. (This function usually called only once, within main()).
      // Specifically:
      // a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
      //  executable 'program' stored and ready to use inside the GPU.  
      // b) create a new VBO object in GPU memory and fill it by transferring in all
      //  the vertex data held in our Float32array member 'VBOcontents'. 
      // c) Find & save the GPU location of all our shaders' attribute-variables and 
      //  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
      // -------------------
      // CAREFUL!  before you can draw pictures using this VBObox contents, 
      //  you must call this VBObox object's switchToMe() function too!
      //--------------------
      // a) Compile,link,upload shaders-----------------------------------------------
        this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
        if (!this.shaderLoc) {
          console.log(this.constructor.name + 
                      '.init() failed to create executable Shaders on the GPU. Bye!');
          return;
        }
      // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
      //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}
      
        gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())
      
      // b) Create VBO on GPU, fill it------------------------------------------------
        this.vboLoc = gl.createBuffer();	
        if (!this.vboLoc) {
          console.log(this.constructor.name + 
                      '.init() failed to create VBO in GPU. Bye!'); 
          return;
        }
        
        // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
        //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
        // (positions, colors, normals, etc), or 
        //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
        // that each select one vertex from a vertex array stored in another VBO.
        gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
                        this.vboLoc);				  // the ID# the GPU uses for this buffer.
                              
        // Fill the GPU's newly-created VBO object with the vertex data we stored in
        //  our 'vboContents' member (JavaScript Float32Array object).
        //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
        //	 use gl.bufferSubData() to modify VBO contents without changing VBO size)
        gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
                          this.vboContents, 		// JavaScript Float32Array
                         gl.STATIC_DRAW);			// Usage hint.  
        //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
        //	(see OpenGL ES specification for more info).  Your choices are:
        //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
        //				contents rarely or never change.
        //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
        //				contents may change often as our program runs.
        //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
        // 			times and then discarded; for rapidly supplied & consumed VBOs.
      
      // c1) Find All Attributes:-----------------------------------------------------
      //  Find & save the GPU location of all our shaders' attribute-variables and 
      //  uniform-variables (for switchToMe(), adjust(), draw(), reload(), etc.)
        this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Pos1');
        if(this.a_Pos1Loc < 0) {
          console.log(this.constructor.name + 
                      '.init() Failed to get GPU location of attribute a_Pos1');
          return -1;	// error exit.
        }
         this.a_Colr1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Colr1');
        if(this.a_Colr1Loc < 0) {
          console.log(this.constructor.name + 
                      '.init() failed to get the GPU location of attribute a_Colr1');
          return -1;	// error exit.
        }
    
        // c2) Find All Uniforms:-----------------------------------------------------
        //Get GPU storage location for each uniform var used in our shader programs: 
       this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
        if (!this.u_ModelMatrixLoc) { 
          console.log(this.constructor.name + 
                      '.init() failed to get GPU location for u_ModelMatrix uniform');
          return;
        }
        
        
      }
      
      VBObox5.prototype.switchToMe = function () {
      //==============================================================================
      // Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
      //
      // We only do this AFTER we called the init() function, which does the one-time-
      // only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
      // even then, you are STILL not ready to draw our VBObox's contents onscreen!
      // We must also first complete these steps:
      //  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
      //  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
      //  c) tell the GPU to connect the shader program's attributes to that VBO.
      
      // a) select our shader program:
        gl.useProgram(this.shaderLoc);	
      //		Each call to useProgram() selects a shader program from the GPU memory,
      // but that's all -- it does nothing else!  Any previously used shader program's 
      // connections to attributes and uniforms are now invalid, and thus we must now
      // establish new connections between our shader program's attributes and the VBO
      // we wish to use.  
        
      // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
      //  instead connect to our own already-created-&-filled VBO.  This new VBO can 
      //    supply values to use as attributes in our newly-selected shader program:
        gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
                          this.vboLoc);			// the ID# the GPU uses for our VBO.
      
      // c) connect our newly-bound VBO to supply attribute variable values for each
      // vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
      // this sets up data paths from VBO to our shader units:
        // 	Here's how to use the almost-identical OpenGL version of this function:
        //		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
        gl.vertexAttribPointer(
          this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
          this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
          gl.FLOAT,		  // type == what data type did we use for those numbers?
          false,				// isNormalized == are these fixed-point values that we need
                        //									normalize before use? true or false
          this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
                        // stored attrib for this vertex to the same stored attrib
                        //  for the next vertex in our VBO.  This is usually the 
                        // number of bytes used to store one complete vertex.  If set 
                        // to zero, the GPU gets attribute values sequentially from 
                        // VBO, starting at 'Offset'.	
                        // (Our vertex size in bytes: 4 floats for pos + 3 for color)
          this.vboOffset_a_Pos1);						
                        // Offset == how many bytes from START of buffer to the first
                        // value we will actually use?  (we start with position).
        gl.vertexAttribPointer(this.a_Colr1Loc, this.vboFcount_a_Colr1,
                               gl.FLOAT, false, 
                               this.vboStride,  this.vboOffset_a_Colr1);
    
        //-- Enable this assignment of the attribute to its' VBO source:
        gl.enableVertexAttribArray(this.a_Pos1Loc);
        gl.enableVertexAttribArray(this.a_Colr1Loc);
      }
      
      VBObox5.prototype.isReady = function() {
      //==============================================================================
      // Returns 'true' if our WebGL rendering context ('gl') is ready to render using
      // this objects VBO and shader program; else return false.
      // see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter
      
      var isOK = true;
      
        if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
          console.log(this.constructor.name + 
                      '.isReady() false: shader program at this.shaderLoc not in use!');
          isOK = false;
        }
        if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
            console.log(this.constructor.name + 
                    '.isReady() false: vbo at this.vboLoc not in use!');
          isOK = false;
        }
        return isOK;
      }
      
      VBObox5.prototype.adjust = function() {
      //==============================================================================
      // Update the GPU to newer, current values we now store for 'uniform' vars on 
      // the GPU; and (if needed) update each attribute's stride and offset in VBO.
      
        // check: was WebGL context set to use our VBO & shader program?
        if(this.isReady()==false) {
              console.log('ERROR! before' + this.constructor.name + 
                    '.adjust() call you needed to call this.switchToMe()!!');
        }
        // Adjust values for our uniforms,
        this.ModelMatrix.setIdentity();
      // THIS DOESN'T WORK!!  this.ModelMatrix = g_worldMat;
        this.ModelMatrix.set(g_worldMat);
       // this.ModelMatrix.rotate(90, 1, 0, 0);
        // //this.ModelMatrix.rotate(g_angle1now, 0, 1, 0);	// -spin drawing axes,
        this.ModelMatrix.translate(-2.5, -2,0);	
        pushMatrix(this.ModelMatrix);
        this.ModelMatrix.scale(0.5, 0.5, 0.5);
      //this.ModelMatrix.translate(transX_c, transY_c,transZ_c);	
      //this.ModelMatrix.rotate(body_rotate, 0.0, 1.0, 0.0); 
      pushMatrix(this.ModelMatrix);
      //this.ModelMatrix.scale(0.3, 1.2, 0.3);
      
       gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                      false, 										// use matrix transpose instead?
                      this.ModelMatrix.elements);	
            drawBox(gl, 0, this.vboVerts);

    this.ModelMatrix = popMatrix();
    this.ModelMatrix.translate(0, 0, 2.2);
    this.ModelMatrix.rotate(90, 1, 0, 0);
    this.ModelMatrix.scale(-1,-1, -1);
    this.ModelMatrix.rotate(g_angle2now_c, 0.0, 1, 0);
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                      false, 										// use matrix transpose instead?
                      this.ModelMatrix.elements);	
            drawBox(gl, 0, this.vboVerts);
      
      }
      
      VBObox5.prototype.draw = function() {
      //=============================================================================
      // Send commands to GPU to select and render current VBObox contents.
        g_mvpMatrix = new Matrix4();
        // check: was WebGL context set to use our VBO & shader program?
        if(this.isReady()==false) {
              console.log('ERROR! before' + this.constructor.name + 
                    '.draw() call you needed to call this.switchToMe()!!');
        }
      
      this.adjust();
    
       
    
        
        
        // ----------------------------Draw the contents of the currently-bound VBO:
        // gl.drawArrays(gl.TRIANGLES,		    // select the drawing primitive to draw:
        //                 // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
        //                 //          gl.TRIANGLES, gl.TRIANGLE_STRIP,
        //               0, 								// location of 1st vertex to draw;
        //               this.vboVerts);		// number of vertices to draw on-screen.
    
    
          
        //   //draw robot arm
          
            this.ModelMatrix.setTranslate(10.0, 0, 20.0);
            pushMatrix(this.ModelMatrix);
            this.ModelMatrix.scale(1.25, 0.05, 1.25); // Make it a little thicker
            this.adjust();
             gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                      false, 										// use matrix transpose instead?
                      this.ModelMatrix.elements);	
            drawBox(gl, 0, this.vboVerts);
    
      }
    

      
      VBObox5.prototype.reload = function() {
      //=============================================================================
      // Over-write current values in the GPU for our already-created VBO: use 
      // gl.bufferSubData() call to re-transfer some or all of our Float32Array 
      // contents to our VBO without changing any GPU memory allocations.
      
       gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                        0,                  // byte offset to where data replacement
                                            // begins in the VBO.
                          this.vboContents);   // the JS source-data array used to fill VBO
      }
      function VBObox6() {
        //=============================================================================
        //=============================================================================
        // CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
        // needed to render vertices from one Vertex Buffer Object (VBO) using one 
        // separate shader program (a vertex-shader & fragment-shader pair) and one
        // set of 'uniform' variables.
        
        // Constructor goal: 
        // Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
        // written into code) in all other VBObox functions. Keeping all these (initial)
        // values here, in this one coonstrutor function, ensures we can change them 
        // easily WITHOUT disrupting any other code, ever!
          
        this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
        `precision highp float;				// req'd in OpenGL ES if we use 'float'
         //
         uniform mat4 u_ModelMatrix;
         uniform mat4 u_MvpMatrix;
         attribute vec4 a_Pos1;
         attribute vec4 a_Normal;
         uniform vec3 u_Kd; 
     
     
         varying vec3 v_Kd; 
         varying vec4 v_Position;	
         varying vec3 v_Normal;
         uniform mat4 u_NormalMatrix; 
          
         
       
     
         //
         void main() {
           gl_Position = u_MvpMatrix * a_Pos1;
           v_Position = u_ModelMatrix * a_Pos1;
           v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
           v_Kd = u_Kd;
           
          }`;
        //========YOUR CHOICE OF 3 Fragment shader programs=======
        //				(use /* and */ to uncomment ONLY ONE)
        // Each is an example of how to use the built-in vars for gl.POINTS to
        // improve their on-screen appearance.
        // a)'SQUARE points' -- DEFAULT; simple fixed-color square set by point-size.
        // b) 'ROUND FLAT' -- uses 'gl_PointCoord' to make solid-color dot instead;
        // c) 'SHADED Sphere' -- radial distance sets color to 'fake' a lit 3D sphere.
        //   You too can be a 'shader writer'! What other fragment shaders would help?
      
         // a) SQUARE points:
         this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
         `#ifdef GL_ES
         precision mediump float;
         #endif
          uniform vec3 u_DiffuseLight;   // Diffuse light color
        uniform vec3 u_AmbientLight;   // Color of an ambient light
        uniform vec3 u_Ka; // Ambient reflectance
        uniform vec3 u_Ks; // Specular reflectance
        uniform vec3 u_Lamp0Spec;			// Phong Illum: specular
        uniform vec3 u_Ke;						// Phong Reflectance: emissive
        uniform vec4 u_Lamp0Pos; 
        uniform vec4 u_eyePosWorld;
        uniform float shininess;
        uniform float u_PhongLight;
      
        varying vec3 v_Normal;				// Find 3D surface normal at each pix
        varying vec4 v_Position;			// pixel's 3D pos too -- in 'world' coords
        varying vec3 v_Kd;
      
          void main() {
            vec3 normal = normalize(v_Normal); 
            vec3 lightDirection = normalize(u_Lamp0Pos.xyz - v_Position.xyz);
            vec3 eyeDirection = normalize(u_eyePosWorld.xyz- v_Position.xyz); 
            vec3 H = normalize(lightDirection + eyeDirection); 
            float nDotH = max(dot(H, normal), 0.0); 
            float e02 = pow(nDotH, shininess); 
          float e04 = e02*e02; 
          float e08 = e04*e04; 
          float e16 = e08*e08; 
          float e32 = e16*e16;  
          float e64 = pow(nDotH, shininess);
          vec3 emissive = u_Ke;
            float nDotL = max(dot(lightDirection, normal), 0.0);
            // Calculate the color due to diffuse reflection
           vec3 diffuse = u_DiffuseLight * nDotL * v_Kd;
            // Calculate the color due to ambient reflection
           vec3 ambient = u_AmbientLight * u_Ka;

           if (u_PhongLight == 1.0){
            vec3 reflectDir = reflect(-lightDirection, normal);
            float specAngle = max(dot(reflectDir, eyeDirection), 0.0);
            vec3 speculr = u_Lamp0Spec * u_Ks * pow(specAngle, shininess);
           gl_FragColor = vec4(diffuse + ambient +speculr + emissive, 1);
          }else{
            float spec = pow(nDotL, shininess) ;
            vec3 speculr = u_Lamp0Spec * u_Ks * e64;
           gl_FragColor = vec4(diffuse + ambient + speculr + emissive, 1);
          }
          }`;
        
        
      
        /*
         // b) ROUND FLAT dots:
          this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
         `precision mediump float;
          varying vec3 v_Colr1;
          void main() {
            float dist = distance(gl_PointCoord, vec2(0.5, 0.5)); 
            if(dist < 0.5) {
              gl_FragColor = vec4(v_Colr1, 1.0);
              } else {discard;};
          }`;
        */
        // /*
         // c) SHADED, sphere-like dots:
        //   this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
        //  `precision mediump float;
        //   varying vec3 v_Colr1;
        //   void main() {
        //     float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
        //     if(dist < 0.5) {
        //        gl_FragColor = vec4((1.0-2.0*dist)*v_Colr1.rgb, 1.0);
        //       } else {discard;};
        //   }`;
        //     this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
        //  `precision mediump float;
        //   varying vec3 v_Colr1;
        //   void main() {
        //     gl_FragColor = v_Colr1;
        //   }`;
       
        // this.FRAG_SRC =
        // '#ifdef GL_ES\n' +
        // 'precision mediump float;\n' +
        // '#endif\n' +
        // 'varying vec4 v_Color;\n' +
        // 'void main() {\n' +
        // '  gl_FragColor = v_Color;\n' +
        // '}\n';
  
        var c30 = Math.sqrt(0.75);					
      var sq2	= Math.sqrt(2.0);		
          this.vboContents = //---------------------------------------------------------
            new Float32Array ([					// Array of vertex attribute values we will
                                        // transfer to GPU's vertex buffer object (VBO)
      
              // Front face
              0.0,	 0.0, sq2, 1,		1.0, 	1.0,	1.0,	
              c30, -0.5, 0.0, 1,		0.0,  0.0,  1.0, 	
              0.0,  1.0, 0.0,  1,	1.0,  0.0,  0.0,	
               
              0.0,	 0.0, sq2, 	1	,	1.0, 	1.0,	1.0,	
              0.0,  1.0, 0.0,  1	,		1.0,  0.0,  0.0,	
             -c30, -0.5, 0.0,  	1	,	0.0,  1.0,  0.0, 	
               
              0.0,	 0.0, sq2,	1	,	1.0, 	1.0,	1.0,	
             -c30, -0.5, 0.0, 	1	,	0.0,  1.0,  0.0, 	
              c30, -0.5, 0.0, 	1	,	0.0,  0.0,  1.0, 
                 
             -c30, -0.5,  0.0, 	1	,	0.0,  1.0,  0.0, 	
              0.0,  1.0,  0.0,  1	, 	1.0,  0.0,  0.0,	
              c30, -0.5,  0.0, 	1	,	0.0,  0.0,  1.0, 
          ]);	
          
          this.vboVerts =this.vboContents.length/7;							// # of vertices held in 'vboContents' array;
          this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
                                        // bytes req'd by 1 vboContents array element;
                                        // (why? used to compute stride and offset 
                                        // in bytes for vertexAttribPointer() calls)
          this.vboBytes = this.vboContents.length * this.FSIZE;               
                                        // (#  of floats in vboContents array) * 
                                        // (# of bytes/float).
          this.vboStride = this.vboBytes / this.vboVerts;     
                                        // (== # of bytes to store one complete vertex).
                                        // From any attrib in a given vertex in the VBO, 
                                        // move forward by 'vboStride' bytes to arrive 
                                        // at the same attrib for the next vertex.
                                         
                      //----------------------Attribute sizes
          this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
                                        // attribute named a_Pos1. (4: x,y,z,w values)
          this.vboFcount_a_Colr1 = 3;   // # of floats for this attrib (r,g,b values) 
          console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
                          this.vboFcount_a_Colr1) *   // every attribute in our VBO
                          this.FSIZE == this.vboStride, // for agreeement with'stride'
                          "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
                          
                      //----------------------Attribute offsets
          this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
                                        // of 1st a_Pos1 attrib value in vboContents[]
          this.vboOffset_a_Colr1 = (this.vboFcount_a_Pos1) * this.FSIZE;  
                                        // == 4 floats * bytes/float
                                        //# of bytes from START of vbo to the START
                                        // of 1st a_Colr1 attrib value in vboContents[]
          this.vboOffset_a_PtSiz1 =(this.vboFcount_a_Pos1 +
                                    this.vboFcount_a_Colr1) * this.FSIZE; 
                                        // == 7 floats * bytes/float
                                        // # of bytes from START of vbo to the START
                                        // of 1st a_PtSize attrib value in vboContents[]
        
                      //-----------------------GPU memory locations:                                
          this.vboLoc;									// GPU Location for Vertex Buffer Object, 
                                        // returned by gl.createBuffer() function call
          this.shaderLoc;								// GPU Location for compiled Shader-program  
                                        // set by compile/link of VERT_SRC and FRAG_SRC.
                                  //------Attribute locations in our shaders:
          this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
          this.u_NormalMatrix;
    
                //---------------------- Uniform locations &values in our shaders
          this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
          this.u_MvpMatrixLoc;
          this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform
          this.u_AmbientLight;
          this.u_Lamp0Pos;
          this.u_DiffuseLight;
          this.u_Ka;
          this.u_Kd;
          this.u_Ks;
          this.u_Lamp0Spec;
          this.u_Ke;
          this.u_eyePosWorld;					// GPU location for u_ModelMat uniform
          this.shininess;
          this.u_PhongLight;
        };
        
        
        VBObox6.prototype.init = function() {
        //==============================================================================
        // Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
        // kept in this VBObox. (This function usually called only once, within main()).
        // Specifically:
        // a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
        //  executable 'program' stored and ready to use inside the GPU.  
        // b) create a new VBO object in GPU memory and fill it by transferring in all
        //  the vertex data held in our Float32array member 'VBOcontents'. 
        // c) Find & save the GPU location of all our shaders' attribute-variables and 
        //  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
        // -------------------
        // CAREFUL!  before you can draw pictures using this VBObox contents, 
        //  you must call this VBObox object's switchToMe() function too!
        //--------------------
        // a) Compile,link,upload shaders-----------------------------------------------
          this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
          if (!this.shaderLoc) {
            console.log(this.constructor.name + 
                        '.init() failed to create executable Shaders on the GPU. Bye!');
            return;
          }
        // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
        //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}
        
          gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())
        
        // b) Create VBO on GPU, fill it------------------------------------------------
          this.vboLoc = gl.createBuffer();	
          if (!this.vboLoc) {
            console.log(this.constructor.name + 
                        '.init() failed to create VBO in GPU. Bye!'); 
            return;
          }
          
          // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
          //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
          // (positions, colors, normals, etc), or 
          //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
          // that each select one vertex from a vertex array stored in another VBO.
          gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
                          this.vboLoc);				  // the ID# the GPU uses for this buffer.
                                
          // Fill the GPU's newly-created VBO object with the vertex data we stored in
          //  our 'vboContents' member (JavaScript Float32Array object).
          //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
          //	 use gl.bufferSubData() to modify VBO contents without changing VBO size)
          gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
                            this.vboContents, 		// JavaScript Float32Array
                           gl.STATIC_DRAW);			// Usage hint.  
          //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
          //	(see OpenGL ES specification for more info).  Your choices are:
          //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
          //				contents rarely or never change.
          //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
          //				contents may change often as our program runs.
          //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
          // 			times and then discarded; for rapidly supplied & consumed VBOs.
        
        // c1) Find All Attributes:-----------------------------------------------------
        //  Find & save the GPU location of all our shaders' attribute-variables and 
        //  uniform-variables (for switchToMe(), adjust(), draw(), reload(), etc.)
          this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Pos1');
          if(this.a_Pos1Loc < 0) {
            console.log(this.constructor.name + 
                        '.init() Failed to get GPU location of attribute a_Pos1');
            return -1;	// error exit.
          }
          this.a_normalLoc = gl.getAttribLocation(this.shaderLoc, 'a_Normal')
      
          // c2) Find All Uniforms:-----------------------------------------------------
          //Get GPU storage location for each uniform var used in our shader programs: 
         this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
          if (!this.u_ModelMatrixLoc) { 
            console.log(this.constructor.name + 
                        '.init() failed to get GPU location for u_ModelMatrix uniform');
            return;
          }
          this.u_MvpMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');
          this.u_DiffuseLight = gl.getUniformLocation(this.shaderLoc, 'u_DiffuseLight');
          this.u_AmbientLight = gl.getUniformLocation(this.shaderLoc, 'u_AmbientLight');
          this.u_Lamp0Spec = gl.getUniformLocation(this.shaderLoc, 'u_Lamp0Spec');
          this.u_Lamp0Pos = gl.getUniformLocation(this.shaderLoc, 'u_Lamp0Pos');
          this.u_eyePosWorld = gl.getUniformLocation(this.shaderLoc, 'u_eyePosWorld');
          this.u_NormalMatrix = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix')


          //material
          this.u_Ka = gl.getUniformLocation(this.shaderLoc, 'u_Ka');
          this.u_Kd = gl.getUniformLocation(this.shaderLoc, 'u_Kd');
          this.u_Ks = gl.getUniformLocation(this.shaderLoc, 'u_Ks');
          this.u_Ke = gl.getUniformLocation(this.shaderLoc, 'u_Ke');
          this.shininess = gl.getUniformLocation(this.shaderLoc, 'shininess');
          this.u_PhongLight = gl.getUniformLocation(this.shaderLoc, 'u_PhongLight');
          
          
        }
        
        VBObox6.prototype.switchToMe = function () {
        //==============================================================================
        // Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
        //
        // We only do this AFTER we called the init() function, which does the one-time-
        // only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
        // even then, you are STILL not ready to draw our VBObox's contents onscreen!
        // We must also first complete these steps:
        //  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
        //  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
        //  c) tell the GPU to connect the shader program's attributes to that VBO.
        
        // a) select our shader program:
          gl.useProgram(this.shaderLoc);	
        //		Each call to useProgram() selects a shader program from the GPU memory,
        // but that's all -- it does nothing else!  Any previously used shader program's 
        // connections to attributes and uniforms are now invalid, and thus we must now
        // establish new connections between our shader program's attributes and the VBO
        // we wish to use.  
          
        // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
        //  instead connect to our own already-created-&-filled VBO.  This new VBO can 
        //    supply values to use as attributes in our newly-selected shader program:
          gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
                            this.vboLoc);			// the ID# the GPU uses for our VBO.
        
        // c) connect our newly-bound VBO to supply attribute variable values for each
        // vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
        // this sets up data paths from VBO to our shader units:
          // 	Here's how to use the almost-identical OpenGL version of this function:
          //		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
          gl.vertexAttribPointer(
            this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
            this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
            gl.FLOAT,		  // type == what data type did we use for those numbers?
            false,				// isNormalized == are these fixed-point values that we need
                          //									normalize before use? true or false
            this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
                          // stored attrib for this vertex to the same stored attrib
                          //  for the next vertex in our VBO.  This is usually the 
                          // number of bytes used to store one complete vertex.  If set 
                          // to zero, the GPU gets attribute values sequentially from 
                          // VBO, starting at 'Offset'.	
                          // (Our vertex size in bytes: 4 floats for pos + 3 for color)
            this.vboOffset_a_Pos1);						
                          // Offset == how many bytes from START of buffer to the first
                          // value we will actually use?  (we start with position).

      
          gl.vertexAttribPointer(this.a_normalLoc, this.vboFcount_a_Pos1,
            gl.FLOAT, false, 
            this.vboStride,  this.vboOffset_a_Pos1);
      
          
      
          //-- Enable this assignment of the attribute to its' VBO source:
          gl.enableVertexAttribArray(this.a_Pos1Loc);
          // gl.enableVertexAttribArray(this.a_Colr1Loc);
          gl.enableVertexAttribArray(this.a_normalLoc);
        }
        
        VBObox6.prototype.isReady = function() {
        //==============================================================================
        // Returns 'true' if our WebGL rendering context ('gl') is ready to render using
        // this objects VBO and shader program; else return false.
        // see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter
        
        var isOK = true;
        
          if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
            console.log(this.constructor.name + 
                        '.isReady() false: shader program at this.shaderLoc not in use!');
            isOK = false;
          }
          if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
              console.log(this.constructor.name + 
                      '.isReady() false: vbo at this.vboLoc not in use!');
            isOK = false;
          }
          return isOK;
        }
        
        VBObox6.prototype.adjust = function() {
        //==============================================================================
        // Update the GPU to newer, current values we now store for 'uniform' vars on 
        // the GPU; and (if needed) update each attribute's stride and offset in VBO.
        
          // check: was WebGL context set to use our VBO & shader program?
          if(this.isReady()==false) {
                console.log('ERROR! before' + this.constructor.name + 
                      '.adjust() call you needed to call this.switchToMe()!!');
          }
          gl.uniform4f(this.u_Lamp0Pos, lightPos.elements[0],lightPos.elements[1],lightPos.elements[2], 1.0);
          if (specOff){
            gl.uniform3f(this.u_Lamp0Spec, 0,0,0);
          }else{
            gl.uniform3f(this.u_Lamp0Spec, 1,1,1);
          }
          
          gl.uniform4f(this.u_eyePosWorld, 0,0,0, 1);
          // Set the ambient light
          if(ambientOff){
            gl.uniform3f(this.u_AmbientLight, 0, 0, 0);
          }
          else{
            gl.uniform3f(this.u_AmbientLight, 0.05,    0.05,   0.05);
          }

          if(diffuseOff){
            gl.uniform3f(this.u_DiffuseLight, 0, 0, 0);
          }else{
            gl.uniform3f(this.u_DiffuseLight, 0.0,     0.2,    0.6);
          }
          
          
          gl.uniform3f(this.u_Ka, 0.24725, 0.1995, 0.0745);
          gl.uniform3f(this.u_Kd,1,     1,    0);
          gl.uniform3f(this.u_Ks, 0.1,     0.2,    0.3);
          gl.uniform3f(this.u_Ke, 0.0, 0.0, 0.0);
          gl.uniform1f(this.shininess, 5.0);
          gl.uniform1f(this.u_PhongLight, phongLightValue);
          
          
          // Adjust values for our uniforms,
          this.ModelMatrix.setIdentity();
        // THIS DOESN'T WORK!!  this.ModelMatrix = g_worldMat;
          //this.ModelMatrix.set(g_worldMat);
         //this.ModelMatrix.rotate(90, 1, 0, 0);
          // //this.ModelMatrix.rotate(g_angle1now, 0, 1, 0);	// -spin drawing axes,
          
          this.ModelMatrix.translate(4, 1,0);	
          //this.ModelMatrix.rotate(180, 0, 0, 1);
          pushMatrix(this.ModelMatrix);
          this.ModelMatrix.translate(-5, -4,0);	
          this.ModelMatrix.scale(0.5, 0.5,0.5);	
          
        //this.ModelMatrix.translate(transX_c, transY_c,transZ_c);	
        //this.ModelMatrix.rotate(body_rotate, 0.0, 1.0, 0.0); 
        pushMatrix(this.ModelMatrix);
         gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                        false, 										// use matrix transpose instead?
                        this.ModelMatrix.elements);	
      var mvpMatrix = new Matrix4();
      mvpMatrix.setIdentity();
      mvpMatrix.set(g_worldMat);
      mvpMatrix.multiply(this.ModelMatrix);
      // console.log(mvpMatrix)
      // Pass the model view projection matrix to u_mvpMatrix
      gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
      false, 										// use matrix transpose instead?
      this.ModelMatrix.elements);	// send data from Javascript.
      var normalMatrix = new Matrix4();
      normalMatrix.setInverseOf(this.ModelMatrix);
                        normalMatrix.transpose();
                        gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
        drawBox(gl, 0, this.vboVerts);

    this.ModelMatrix = popMatrix();
    this.ModelMatrix.translate(0, 0, 2.2);
    this.ModelMatrix.rotate(90, 1, 0, 0);
    this.ModelMatrix.scale(-1,-1, -1);
    this.ModelMatrix.rotate(g_angle2now_c, 0.0, 1, 0);
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                        false, 										// use matrix transpose instead?
                        this.ModelMatrix.elements);	

      mvpMatrix.set(g_worldMat);
      mvpMatrix.multiply(this.ModelMatrix);
      // console.log(mvpMatrix)
      // Pass the model view projection matrix to u_mvpMatrix
      gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
      false, 										// use matrix transpose instead?
      this.ModelMatrix.elements);	// send data from Javascript.
      normalMatrix.setInverseOf(this.ModelMatrix);
                        normalMatrix.transpose();
                        gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
            drawBox(gl, 0, this.vboVerts);
        //this.ModelMatrix.scale(0.3, 1.2, 0.3);
        
         gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                        false, 										// use matrix transpose instead?
                        this.ModelMatrix.elements);
                        var normalMatrix = new Matrix4(); 

  
      this.ModelMatrix = popMatrix();
      this.ModelMatrix.translate(0, -2, 1);
      this.ModelMatrix.rotate(90, 1, 0, 0);
      this.ModelMatrix.scale(-1,-1, -1);
      // this.ModelMatrix.rotate(10, 0.0, 1, 0);
      this.ModelMatrix.rotate(60, 0.0, 1, 0);
      this.ModelMatrix.scale(0.5, 0.5, 0.5);
      pushMatrix(this.ModelMatrix);
      this.ModelMatrix.rotate(g_angle2now_c, 0.0, 1, 0);
      //console.log(g_angle2now_c)
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                        false, 										// use matrix transpose instead?
                        this.ModelMatrix.elements);	

      mvpMatrix.set(g_worldMat);
      mvpMatrix.multiply(this.ModelMatrix);
      // console.log(mvpMatrix)
      // Pass the model view projection matrix to u_mvpMatrix
      gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
      false, 										// use matrix transpose instead?
      this.ModelMatrix.elements);	// send data from Javascript.
      normalMatrix.setInverseOf(this.ModelMatrix);
                        normalMatrix.transpose();
                        gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
              drawBox(gl, 0, this.vboVerts);

      //second triangle   
      this.ModelMatrix = popMatrix();
      pushMatrix(this.ModelMatrix);
      
      // Set the ambient light

      if(ambientOff){
        gl.uniform3f(this.u_AmbientLight, 0, 0, 0);
      }
      else{
        gl.uniform3f(this.u_AmbientLight, 0.329412, 0.223529, 0.027451);
      }

      if(diffuseOff){
        gl.uniform3f(this.u_DiffuseLight, 0, 0, 0);
      }else{
        gl.uniform3f(this.u_DiffuseLight, 0.780392, 0.568627, 0.113725);
      }
      gl.uniform3f(this.u_Ka, 0.1, 0.1, 0.1);
      gl.uniform3f(this.u_Kd,1, 1, 0);
      gl.uniform3f(this.u_Ks, 0.992157, 0.941176, 0.807843);
      gl.uniform3f(this.u_Ke, 0, 0.0, 0.0);// send data from Javascript.
      gl.uniform1f(this.shininess, 27.8974);
      this.ModelMatrix.translate(-1.5, 1, 0);
      this.ModelMatrix.rotate(g_angle2now_c, 0.0, 1, 0);
      //this.ModelMatrix.scale(0.5, 0.5, 0.5);
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                        false, 										// use matrix transpose instead?
                        this.ModelMatrix.elements);	
      mvpMatrix.setIdentity();
      mvpMatrix.set(g_worldMat);
      mvpMatrix.multiply(this.ModelMatrix);
      // console.log(mvpMatrix)
      // Pass the model view projection matrix to u_mvpMatrix
      gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
      false, 										// use matrix transpose instead?
      this.ModelMatrix.elements);	// send data from Javascript.
      normalMatrix.setInverseOf(this.ModelMatrix);
                        normalMatrix.transpose();
                        gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
              drawBox(gl, 0, this.vboVerts);
// third triangle
this.ModelMatrix = popMatrix();

// Set the ambient light
if(ambientOff){
  gl.uniform3f(this.u_AmbientLight, 0, 0, 0);
}
else{
  gl.uniform3f(this.u_AmbientLight, 0.19225,  0.19225,  0.19225);
}

if(diffuseOff){
  gl.uniform3f(this.u_DiffuseLight, 0, 0, 0);
}else{
  gl.uniform3f(this.u_DiffuseLight, 0.50754,  0.50754,  0.50754);
}
gl.uniform3f(this.u_Ka, 0.1, 0, 0);
gl.uniform3f(this.u_Kd,1, 1, 0);
gl.uniform3f(this.u_Ks, 0.508273, 0.508273, 0.508273);
gl.uniform3f(this.u_Ke, 0, 0.0, 0.0);// send data from Javascript.
gl.uniform1f(this.shininess, 51.2);
this.ModelMatrix.translate(-1, 1, 2);
this.ModelMatrix.rotate(g_angle2now_c, 0.0, 1, 0);
//this.ModelMatrix.scale(0.5, 0.5, 0.5);
gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                  false, 										// use matrix transpose instead?
                  this.ModelMatrix.elements);	
mvpMatrix.setIdentity();
mvpMatrix.set(g_worldMat);
mvpMatrix.multiply(this.ModelMatrix);
// console.log(mvpMatrix)
// Pass the model view projection matrix to u_mvpMatrix
gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
false, 										// use matrix transpose instead?
this.ModelMatrix.elements);	// send data from Javascript.
normalMatrix.setInverseOf(this.ModelMatrix);
                  normalMatrix.transpose();
                  gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
        drawBox(gl, 0, this.vboVerts);
        }
        
        VBObox6.prototype.draw = function() {
        //=============================================================================
        // Send commands to GPU to select and render current VBObox contents.
          g_mvpMatrix = new Matrix4();
          // check: was WebGL context set to use our VBO & shader program?
          if(this.isReady()==false) {
                console.log('ERROR! before' + this.constructor.name + 
                      '.draw() call you needed to call this.switchToMe()!!');
          }
        
        this.adjust();
      
         
      
          

              this.ModelMatrix.setTranslate(10.0, 0, 20.0);
              pushMatrix(this.ModelMatrix);
              this.ModelMatrix.scale(1.25, 0.05, 1.25); // Make it a little thicker
              this.adjust();
               gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                        false, 										// use matrix transpose instead?
                        this.ModelMatrix.elements);	
              drawBox(gl, 0, this.vboVerts);
      
        }
      
  
        
        VBObox6.prototype.reload = function() {
        //=============================================================================
        // Over-write current values in the GPU for our already-created VBO: use 
        // gl.bufferSubData() call to re-transfer some or all of our Float32Array 
        // contents to our VBO without changing any GPU memory allocations.
        
         gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                          0,                  // byte offset to where data replacement
                                              // begins in the VBO.
                            this.vboContents);   // the JS source-data array used to fill VBO
        }


function VBObox7() {
  //=============================================================================
  //=============================================================================
  // CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
  // needed to render vertices from one Vertex Buffer Object (VBO) using one 
  // separate shader program (a vertex-shader & fragment-shader pair) and one
  // set of 'uniform' variables.
  
  // Constructor goal: 
  // Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
  // written into code) in all other VBObox functions. Keeping all these (initial)
  // values here, in this one coonstrutor function, ensures we can change them 
  // easily WITHOUT disrupting any other code, ever!
    
    this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
   `precision highp float;				// req'd in OpenGL ES if we use 'float'
    //

    uniform mat4 u_ModelMatrix;
    attribute vec4 a_Pos1;
    attribute vec4 a_Normal;
    uniform vec3 u_Kd; 

    uniform mat4 u_MvpMatrix; 


    uniform mat4 u_NormalMatrix; 

    uniform vec3 u_DiffuseLight;   // Diffuse light color
    uniform vec3 u_AmbientLight;   // Color of an ambient light
    uniform vec3 u_Ka; // Ambient reflectance
    uniform vec3 u_Ks; // Specular reflectance
    uniform vec3 u_Lamp0Spec;			// Phong Illum: specular
    uniform vec3 u_Ke;						// Phong Reflectance: emissive
    uniform vec4 u_Lamp0Pos; 
    uniform vec4 u_eyePosWorld;
    uniform float shininess;
    uniform float u_PhongLight;

    varying vec4 v_Color;
    struct MatlT {		// Describes one Phong material by its reflectances:
      vec3 emit;			// Ke: emissive -- surface 'glow' amount (r,g,b);
      vec3 ambi;			// Ka: ambient reflectance (r,g,b)
      vec3 diff;			// Kd: diffuse reflectance (r,g,b)
      vec3 spec; 			// Ks: specular reflectance (r,g,b)
      int shiny;			// Kshiny: specular exponent (integer >= 1; typ. <200)
      };
      uniform MatlT u_MatlSet[1];
  
    //
    void main() {
      gl_Position = u_MvpMatrix * a_Pos1;

      vec3 normal = normalize(normalize(vec3(u_NormalMatrix * a_Normal))); 
      vec3 lightDirection = normalize(u_Lamp0Pos.xyz - (u_ModelMatrix * a_Pos1).xyz);
      vec3 eyeDirection = normalize(u_eyePosWorld.xyz- (u_ModelMatrix * a_Pos1).xyz); 
      vec3 H = normalize(lightDirection + eyeDirection); 
      float nDotH = max(dot(H, normal), 0.0); 
      float e02 = pow(nDotH, float(u_MatlSet[0].shiny)); 
    float e04 = e02*e02; 
    float e08 = e04*e04; 
    float e16 = e08*e08; 
    float e32 = e16*e16;  
    float e64 = pow(nDotH, float(u_MatlSet[0].shiny));
    vec3 emissive = u_MatlSet[0].emit;
      float nDotL = max(dot(lightDirection, normal), 0.0);
      // Calculate the color due to diffuse reflection
     vec3 diffuse = u_DiffuseLight * nDotL * u_MatlSet[0].diff;
      // Calculate the color due to ambient reflection
     vec3 ambient = u_AmbientLight * u_MatlSet[0].ambi;

     if (u_PhongLight == 1.0){
      vec3 reflectDir = reflect(-lightDirection, normal);
      float specAngle = max(dot(reflectDir, eyeDirection), 0.0);
      vec3 speculr = u_Lamp0Spec * u_Ks * pow(specAngle, float(u_MatlSet[0].shiny));
      v_Color = vec4(diffuse + ambient +speculr + emissive, 1);
    }else{
      float spec = pow(nDotL, float(u_MatlSet[0].shiny)) ;
      vec3 speculr = u_Lamp0Spec * u_MatlSet[0].spec * e64;
      v_Color = vec4(diffuse + ambient + speculr + emissive, 1);
    }
      
     }`;
  //========YOUR CHOICE OF 3 Fragment shader programs=======
  //				(use /* and */ to uncomment ONLY ONE)
  // Each is an example of how to use the built-in vars for gl.POINTS to
  // improve their on-screen appearance.
  // a)'SQUARE points' -- DEFAULT; simple fixed-color square set by point-size.
  // b) 'ROUND FLAT' -- uses 'gl_PointCoord' to make solid-color dot instead;
  // c) 'SHADED Sphere' -- radial distance sets color to 'fake' a lit 3D sphere.
  //   You too can be a 'shader writer'! What other fragment shaders would help?

   // a) SQUARE points:
   this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
   `#ifdef GL_ES
   precision mediump float;
   #endif
   
    varying vec4 v_Color;

    void main() {
      gl_FragColor = v_Color;
    }`;
  

  /*
   // b) ROUND FLAT dots:
    this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
   `precision mediump float;
    varying vec3 v_Colr1;
    void main() {
      float dist = distance(gl_PointCoord, vec2(0.5, 0.5)); 
      if(dist < 0.5) {
        gl_FragColor = vec4(v_Colr1, 1.0);
        } else {discard;};
    }`;
  */
  // /*
   // c) SHADED, sphere-like dots:
  //   this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  //  `precision mediump float;
  //   varying vec3 v_Colr1;
  //   void main() {
  //     float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
  //     if(dist < 0.5) {
  //        gl_FragColor = vec4((1.0-2.0*dist)*v_Colr1.rgb, 1.0);
  //       } else {discard;};
  //   }`;
  //     this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  //  `precision mediump float;
  //   varying vec3 v_Colr1;
  //   void main() {
  //     gl_FragColor = v_Colr1;
  //   }`;
 
  // this.FRAG_SRC =
  // '#ifdef GL_ES\n' +
  // 'precision mediump float;\n' +
  // '#endif\n' +
  // 'varying vec4 v_Color;\n' +
  // 'void main() {\n' +
  // '  gl_FragColor = v_Color;\n' +
  // '}\n';
  var ctrColr = new Float32Array([0.930, 1, 0.843]);	// pink
	var topColr = new Float32Array([0.628, 0.910, 0.854]);	// blue
	var botColr = new Float32Array([0.940, 0.913, 0.620]); //yellow
    this.vboContents = //---------------------------------------------------------
      new Float32Array ([					// Array of vertex attribute values we will
                                  // transfer to GPU's vertex buffer object (VBO)

        // Front face
    1.5, 2, 1.5, 1, ctrColr[0], ctrColr[1], ctrColr[2], -1.5, 2, 1.5, 1, topColr[0], topColr[1], topColr[2], -1.5, 0.0, 1.5,1, botColr[0], botColr[1], botColr[2], // Triangle 1
    1.5, 2, 1.5, 1, ctrColr[0], ctrColr[1], ctrColr[2], -1.5, 0.0, 1.5,1, botColr[0], botColr[1], botColr[2],  1.5, 0.0, 1.5,  1,topColr[0], topColr[1], topColr[2], // Triangle 2

    // Right face
    1.5, 2, 1.5, 1,ctrColr[0], ctrColr[1], ctrColr[2], 1.5, 0.0, 1.5, 1,topColr[0], topColr[1], topColr[2], 1.5, 0.0, -1.5, 1,botColr[0], botColr[1], botColr[2], // Triangle 1
    1.5, 2, 1.5, 1,ctrColr[0], ctrColr[1], ctrColr[2], 1.5, 0.0, -1.5, 1,botColr[0], botColr[1], botColr[2],  1.5, 2, -1.5,1,topColr[0], topColr[1], topColr[2], // Triangle 2

    // Up face
    1.5, 2, 1.5,1, ctrColr[0], ctrColr[1], ctrColr[2], 1.5, 2,-1.5, 1,topColr[0], topColr[1], topColr[2],-1.5, 2, -1.5,1,botColr[0], botColr[1], botColr[2],// Triangle 1
    1.5, 2, 1.5, 1,ctrColr[0], ctrColr[1], ctrColr[2], -1.5, 2, -1.5,1,botColr[0], botColr[1], botColr[2],-1.5, 2, 1.5, 1,topColr[0], topColr[1], topColr[2],// Triangle 2

    // Left face
    -1.5, 2, 1.5,1, ctrColr[0], ctrColr[1], ctrColr[2],-1.5, 2,-1.5,1,topColr[0], topColr[1], topColr[2], -1.5,  0.0,-1.5, 1,botColr[0], botColr[1], botColr[2], // Triangle 1
    -1.5, 2, 1.5,1, ctrColr[0], ctrColr[1], ctrColr[2],-1.5,  0.0,-1.5,1, botColr[0], botColr[1], botColr[2], -1.5,  0.0, 1.5, 1,topColr[0], topColr[1], topColr[2],// Triangle 2

    // Down face
    -1.5,  0.0,-1.5,1, ctrColr[0], ctrColr[1], ctrColr[2], 1.5,  0.0,-1.5, 1,topColr[0], topColr[1], topColr[2], 1.5,  0.0, 1.5, 1, botColr[0], botColr[1], botColr[2], // Triangle 1
    -1.5,  0.0,-1.5,1, ctrColr[0], ctrColr[1], ctrColr[2],1.5,  0.0, 1.5, 1,botColr[0], botColr[1], botColr[2], -1.5,  0.0, 1.5,1,topColr[0], topColr[1], topColr[2],  // Triangle 2

    // Back face
    1.5, 0.0, -1.5,1,ctrColr[0], ctrColr[1], ctrColr[2],-1.5, 0.0, -1.5,1,topColr[0], topColr[1], topColr[2], -1.5, 2, -1.5,1,botColr[0], botColr[1], botColr[2], // Triangle 1
    1.5, 0.0, -1.5,1,ctrColr[0], ctrColr[1], ctrColr[2],  -1.5, 2, -1.5,1,botColr[0], botColr[1], botColr[2], 1.5, 2, -1.5,1,topColr[0], topColr[1], topColr[2]// Triangle 2
    ]);	
    
    this.vboVerts =this.vboContents.length/7;							// # of vertices held in 'vboContents' array;
    this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
                                  // bytes req'd by 1 vboContents array element;
                                  // (why? used to compute stride and offset 
                                  // in bytes for vertexAttribPointer() calls)
    this.vboBytes = this.vboContents.length * this.FSIZE;               
                                  // (#  of floats in vboContents array) * 
                                  // (# of bytes/float).
    this.vboStride = this.vboBytes / this.vboVerts;     
                                  // (== # of bytes to store one complete vertex).
                                  // From any attrib in a given vertex in the VBO, 
                                  // move forward by 'vboStride' bytes to arrive 
                                  // at the same attrib for the next vertex.
                                   
                //----------------------Attribute sizes
    this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
                                  // attribute named a_Pos1. (4: x,y,z,w values)
    this.vboFcount_a_Colr1 = 3;   // # of floats for this attrib (r,g,b values) 
    this.vbFcount_a_Normal = 3;
    console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
                    this.vboFcount_a_Colr1) *   // every attribute in our VBO
                    this.FSIZE == this.vboStride, // for agreeement with'stride'
                    "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
                    
                //----------------------Attribute offsets
    this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
                                  // of 1st a_Pos1 attrib value in vboContents[]
    this.vboOffset_a_Colr1 = (this.vboFcount_a_Pos1) * this.FSIZE;  
                                  // == 4 floats * bytes/float
                                  //# of bytes from START of vbo to the START
                                  // of 1st a_Colr1 attrib value in vboContents[]
    this.vboOffset_a_PtSiz1 =(this.vboFcount_a_Pos1 +
                              this.vboFcount_a_Colr1) * this.FSIZE; 
                                  // == 7 floats * bytes/float
                                  // # of bytes from START of vbo to the START
                                  // of 1st a_PtSize attrib value in vboContents[]
  
                //-----------------------GPU memory locations:                                
    this.vboLoc;									// GPU Location for Vertex Buffer Object, 
                                  // returned by gl.createBuffer() function call
    this.shaderLoc;								// GPU Location for compiled Shader-program  
                                  // set by compile/link of VERT_SRC and FRAG_SRC.
                            //------Attribute locations in our shaders:
    this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
    this.a_Colr1Loc;							// GPU location: shader 'a_Colr1' attribute
    this.a_normalLoc;
    this.u_NormalMatrix;
    this.u_MvpMatrixLoc;

    
                //---------------------- Uniform locations &values in our shaders
    this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
    this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform
    this.u_AmbientLight;
    this.u_Lamp0Pos;
    this.u_DiffuseLight;
 
    this.u_PhongLight;
    this.matl0 = new Material(matlSel);


  };
  
  
  VBObox7.prototype.init = function() {
  //==============================================================================
  // Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
  // kept in this VBObox. (This function usually called only once, within main()).
  // Specifically:
  // a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
  //  executable 'program' stored and ready to use inside the GPU.  
  // b) create a new VBO object in GPU memory and fill it by transferring in all
  //  the vertex data held in our Float32array member 'VBOcontents'. 
  // c) Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
  // -------------------
  // CAREFUL!  before you can draw pictures using this VBObox contents, 
  //  you must call this VBObox object's switchToMe() function too!
  //--------------------
  // a) Compile,link,upload shaders-----------------------------------------------
    this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
    if (!this.shaderLoc) {
      console.log(this.constructor.name + 
                  '.init() failed to create executable Shaders on the GPU. Bye!');
      return;
    }
  // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
  //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}
  
    gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())
    
  // b) Create VBO on GPU, fill it------------------------------------------------
    this.vboLoc = gl.createBuffer();	
    if (!this.vboLoc) {
      console.log(this.constructor.name + 
                  '.init() failed to create VBO in GPU. Bye!'); 
      return;
    }
    
    // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
    //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
    // (positions, colors, normals, etc), or 
    //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
    // that each select one vertex from a vertex array stored in another VBO.
    gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
                    this.vboLoc);				  // the ID# the GPU uses for this buffer.
                          
    // Fill the GPU's newly-created VBO object with the vertex data we stored in
    //  our 'vboContents' member (JavaScript Float32Array object).
    //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
    //	 use gl.bufferSubData() to modify VBO contents without changing VBO size)
    gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
                      this.vboContents, 		// JavaScript Float32Array
                     gl.STATIC_DRAW);			// Usage hint.  
    //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
    //	(see OpenGL ES specification for more info).  Your choices are:
    //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
    //				contents rarely or never change.
    //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
    //				contents may change often as our program runs.
    //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
    // 			times and then discarded; for rapidly supplied & consumed VBOs.
    
    
      
  
  // c1) Find All Attributes:-----------------------------------------------------
  //  Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (for switchToMe(), adjust(), draw(), reload(), etc.)
    this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Pos1');
    if(this.a_Pos1Loc < 0) {
      console.log(this.constructor.name + 
                  '.init() Failed to get GPU location of attribute a_Pos1');
      return -1;	// error exit.
    }
    //  this.a_Colr1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Colr1');
    // if(this.a_Colr1Loc < 0) {
    //   console.log(this.constructor.name + 
    //               '.init() failed to get the GPU location of attribute a_Colr1');
    //   return -1;	// error exit.
    // }
    this.a_normalLoc = gl.getAttribLocation(this.shaderLoc, 'a_Normal');
    if(this.a_normalLoc < 0) {
      console.log(this.constructor.name + 
                  '.init() failed to get the GPU location of attribute a_Normal');
      return -1;	// error exit.
    }
    
    this.u_DiffuseLight = gl.getUniformLocation(this.shaderLoc, 'u_DiffuseLight');
    this.u_AmbientLight = gl.getUniformLocation(this.shaderLoc, 'u_AmbientLight');
    this.u_Lamp0Spec = gl.getUniformLocation(this.shaderLoc, 'u_Lamp0Spec');
    this.u_Lamp0Pos = gl.getUniformLocation(this.shaderLoc, 'u_Lamp0Pos');
    this.u_eyePosWorld = gl.getUniformLocation(this.shaderLoc, 'u_eyePosWorld');
    this.u_NormalMatrix = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix')
    this.u_MvpMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');

    //material
    this.matl0.uLoc_Ke = gl.getUniformLocation(gl.program, 'u_MatlSet[0].emit');
    this.matl0.uLoc_Ka = gl.getUniformLocation(gl.program, 'u_MatlSet[0].ambi');
    this.matl0.uLoc_Kd = gl.getUniformLocation(gl.program, 'u_MatlSet[0].diff');
    this.matl0.uLoc_Ks = gl.getUniformLocation(gl.program, 'u_MatlSet[0].spec');
	  this.matl0.uLoc_Kshiny = gl.getUniformLocation(gl.program, 'u_MatlSet[0].shiny');
    this.u_PhongLight = gl.getUniformLocation(this.shaderLoc, 'u_PhongLight')
    if(!matl0.uLoc_Ke || !matl0.uLoc_Ka || !matl0.uLoc_Kd 
      || !matl0.uLoc_Ks || !matl0.uLoc_Kshiny
) {
console.log('Failed to get GPUs Reflectance storage locations');
return;
}

    
   

    // c2) Find All Uniforms:-----------------------------------------------------
    //Get GPU storage location for each uniform var used in our shader programs: 
    
   this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
  
   if (!this.u_ModelMatrixLoc || !this.u_DiffuseLight || !this.u_AmbientLight) { 
     console.log('Failed to get the storage location');
     return;
   }
    
    
  }
  
  VBObox7.prototype.switchToMe = function () {
  //==============================================================================
  // Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
  //
  // We only do this AFTER we called the init() function, which does the one-time-
  // only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
  // even then, you are STILL not ready to draw our VBObox's contents onscreen!
  // We must also first complete these steps:
  //  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
  //  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
  //  c) tell the GPU to connect the shader program's attributes to that VBO.
  
  // a) select our shader program:
    gl.useProgram(this.shaderLoc);	
  //		Each call to useProgram() selects a shader program from the GPU memory,
  // but that's all -- it does nothing else!  Any previously used shader program's 
  // connections to attributes and uniforms are now invalid, and thus we must now
  // establish new connections between our shader program's attributes and the VBO
  // we wish to use.  
    
  // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
  //  instead connect to our own already-created-&-filled VBO.  This new VBO can 
  //    supply values to use as attributes in our newly-selected shader program:
    gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
                      this.vboLoc);			// the ID# the GPU uses for our VBO.
  
  // c) connect our newly-bound VBO to supply attribute variable values for each
  // vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
  // this sets up data paths from VBO to our shader units:
    // 	Here's how to use the almost-identical OpenGL version of this function:
    //		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
    gl.vertexAttribPointer(
      this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
      this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
      gl.FLOAT,		  // type == what data type did we use for those numbers?
      false,				// isNormalized == are these fixed-point values that we need
                    //									normalize before use? true or false
      this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
                    // stored attrib for this vertex to the same stored attrib
                    //  for the next vertex in our VBO.  This is usually the 
                    // number of bytes used to store one complete vertex.  If set 
                    // to zero, the GPU gets attribute values sequentially from 
                    // VBO, starting at 'Offset'.	
                    // (Our vertex size in bytes: 4 floats for pos + 3 for color)
      this.vboOffset_a_Pos1);						
                    // Offset == how many bytes from START of buffer to the first
                    // value we will actually use?  (we start with position).
    // gl.vertexAttribPointer(this.a_Colr1Loc, this.vboFcount_a_Colr1,
    //                        gl.FLOAT, false, 
    //                        this.vboStride,  this.vboOffset_a_Colr1);
                           
    // var normals = [];
    // var colors = []
    // for (let i = 0; i < this.vboContents.length; i += 7) {
    //   let normal = [this.vboContents[i+4], this.vboContents[i+5], this.vboContents[i+6] ];
    //   normals = normals + normal;
    //   let color = [Math.max(normal.x, 0), Math.max(normal.y, 0), Math.max(normal.z, 0), 1.0];
    // }
    
    
    gl.vertexAttribPointer(this.a_normalLoc, this.vboFcount_a_Pos1,
      gl.FLOAT, false, 
      this.vboStride,  this.vboOffset_a_Pos1);

    

    //-- Enable this assignment of the attribute to its' VBO source:
    gl.enableVertexAttribArray(this.a_Pos1Loc);
    // gl.enableVertexAttribArray(this.a_Colr1Loc);
    gl.enableVertexAttribArray(this.a_normalLoc);
  }

  function initArrayBuffer(gl, attribute, data, num) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.shaderLoc, attribute);
    if (a_attribute < 0) {
      console.log('Failed to get the storage location of ' + attribute);
      return false;
    }
    gl.vertexAttribPointer(a_attribute, num, gl.FLOAT, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);
  
    return true;
  }
  
  VBObox7.prototype.isReady = function() {
  //==============================================================================
  // Returns 'true' if our WebGL rendering context ('gl') is ready to render using
  // this objects VBO and shader program; else return false.
  // see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter
  
  var isOK = true;
  
    if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
      console.log(this.constructor.name + 
                  '.isReady() false: shader program at this.shaderLoc not in use!');
      isOK = false;
    }
    if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
        console.log(this.constructor.name + 
                '.isReady() false: vbo at this.vboLoc not in use!');
      isOK = false;
    }
    return isOK;
  }
  
  VBObox7.prototype.adjust = function() {
  //==============================================================================
  // Update the GPU to newer, current values we now store for 'uniform' vars on 
  // the GPU; and (if needed) update each attribute's stride and offset in VBO.
  
    // check: was WebGL context set to use our VBO & shader program?
    if(this.isReady()==false) {
          console.log('ERROR! before' + this.constructor.name + 
                '.adjust() call you needed to call this.switchToMe()!!');
    }
    // Set the light color (white)
  
  // Set the light direction (in the world coordinate)

  gl.uniform4f(this.u_Lamp0Pos, lightPos.elements[0],lightPos.elements[1],lightPos.elements[2], 1.0);
  if (specOff){
    gl.uniform3f(this.u_Lamp0Spec, 0,0,0);
  }else{
    gl.uniform3f(this.u_Lamp0Spec, 1,1,1);
  }
  
  gl.uniform4f(this.u_eyePosWorld, camPos.elements[0],camPos.elements[1],camPos.elements[2], 1);
  // Set the ambient light
  if (ambientOff){
    gl.uniform3f(this.u_AmbientLight, 0, 0, 0);
  }else{
    gl.uniform3f(this.u_AmbientLight,  0.25,     0.20725,  0.20725);
  }
  

  if(diffuseOff){
    gl.uniform3f(this.u_DiffuseLight, 0.0, 0.0, 0.0);
  }else{
    gl.uniform3f(this.u_DiffuseLight, 0.6,     0.0,    0.0);
  }
  
  gl.uniform3fv(this.matl0.uLoc_Ke, matl0.K_emit.slice(0,3));				// Ke emissive
	gl.uniform3fv(this.matl0.uLoc_Ka, matl0.K_ambi.slice(0,3));				// Ka ambient
  gl.uniform3fv(this.matl0.uLoc_Kd, matl0.K_diff.slice(0,3));				// Kd	diffuse
	gl.uniform3fv(this.matl0.uLoc_Ks, matl0.K_spec.slice(0,3));				// Ks specular
	gl.uniform1i(this.matl0.uLoc_Kshiny, parseInt(matl0.K_shiny, 10)); 
  gl.uniform1f(this.u_PhongLight, phongLightValue);
  
    // Adjust values for our uniforms,
    this.ModelMatrix.setIdentity();
 
    //this.ModelMatrix.scale(0.8, 0.8, 0.8);
    // pushMatrix(this.ModelMatrix);  // SAVE world drawing coords.
    pushMatrix(this.ModelMatrix);
      //---------Draw Ground Plane, without spinning.
      // position it.
      this.ModelMatrix.translate( 0.4, -0.4, 0.0);	
      // this.ModelMatrix.scale(0.1, 0.1, 0.1);				// shrink by 10X:
      this.ModelMatrix.rotate(90, 1.0, 0.0, 0.0);
  
      
      //draw robot arm
      
      this.ModelMatrix.setTranslate(3.0, -6, 0.1);
        pushMatrix(this.ModelMatrix);
        
      
        // this.ModelMatrix.scale(0.05,  0.05,0.005); // Make it a little thicker
      
        this.ModelMatrix = popMatrix(); 
        this.ModelMatrix.scale(0.6,  1,0.05);
        //this.ModelMatrix.scale(0.05, 0.05, 1.25);
        gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                        false, 										// use matrix transpose instead?
                        this.ModelMatrix.elements);	
      var mvpMatrix = new Matrix4();
      mvpMatrix.setIdentity();
      mvpMatrix.set(g_worldMat);
      mvpMatrix.multiply(this.ModelMatrix);
      // console.log(mvpMatrix)
      // Pass the model view projection matrix to u_mvpMatrix
      gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
      false, 										// use matrix transpose instead?
      this.ModelMatrix.elements);	// send data from Javascript.
      var normalMatrix = new Matrix4();
      normalMatrix.setInverseOf(this.ModelMatrix);
                        normalMatrix.transpose();
                        gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
              drawBox(gl, 0, this.vboVerts);
    this.ModelMatrix = popMatrix(); 
    pushMatrix(this.ModelMatrix);
    
    // Arm1
    var arm1Length = 10.0; // Length of arm1
    this.ModelMatrix.translate(3, -4.5, 1);
    this.ModelMatrix.rotate(g_angle0now, 0.0, 0.0, 1.0);    // Rotate around the y-axis
    pushMatrix(this.ModelMatrix);

    this.ModelMatrix.scale(0.25, 0.25, 0.5);
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ModelMatrix.elements);	
    
    mvpMatrix.set(g_worldMat);
    mvpMatrix.multiply(this.ModelMatrix);
    // console.log(mvpMatrix)
    // Pass the model view projection matrix to u_mvpMatrix
    gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ModelMatrix.elements);	// send data from Javascript.
    normalMatrix.setInverseOf(this.ModelMatrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
    drawBox(gl, 0, this.vboVerts);

    this.ModelMatrix = popMatrix();
    pushMatrix(this.ModelMatrix);

    // Arm2
    this.ModelMatrix.translate(-0.5, 0, 1);
    this.ModelMatrix.rotate(g_angle1now, 0.0, 1.0, 0.0);  // Rotate around the z-axis
    pushMatrix(this.ModelMatrix);
    this.ModelMatrix.scale(0.5, 0.257, 0.25); 　　　// Move to joint1
   
    //this.ModelMatrix.scale(2, 2.0, 2); // Make it a little thicker
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ModelMatrix.elements);	
  
    mvpMatrix.set(g_worldMat);
    mvpMatrix.multiply(this.ModelMatrix);
    // console.log(mvpMatrix)
    // Pass the model view projection matrix to u_mvpMatrix
    gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ModelMatrix.elements);	// send data from Javascript.
    normalMatrix.setInverseOf(this.ModelMatrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
    drawBox(gl, 0, this.vboVerts);
  

    // Arm3
    this.ModelMatrix = popMatrix();
    //pushMatrix(this.ModelMatrix);
    this.ModelMatrix.translate(-0.7, 0.2, 0);
    
    // this.ModelMatrix.rotate(180, 0.0, 1.0, 0.0);  
    this.ModelMatrix.rotate(90, 0.0, 0.0, 1.0);   　　　
    this.ModelMatrix.rotate(g_angle4now, 0.0, 1.0, 0.0);  
    this.ModelMatrix.scale(0.25, 0.5, 0.25); 
    this.ModelMatrix.scale(0.8, 0.08, 1.2); 
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ModelMatrix.elements);	

    mvpMatrix.set(g_worldMat);
    mvpMatrix.multiply(this.ModelMatrix);
    // console.log(mvpMatrix)
    // Pass the model view projection matrix to u_mvpMatrix
    gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ModelMatrix.elements);	// send data from Javascript.
    normalMatrix.setInverseOf(this.ModelMatrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
    drawBox(gl, 0, this.vboVerts);
  

    this.ModelMatrix = popMatrix();


     //Tongs1
     this.ModelMatrix.translate(0, 0,1.0);
     //this.ModelMatrix.rotate(g_angle2now, 1.0, 0.0, 0.0);  // Rotate around the x-axis

     this.ModelMatrix.scale(0.3, 0.2, 0.3); // Make it a little thicker
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ModelMatrix.elements);	

    mvpMatrix.set(g_worldMat);
    mvpMatrix.multiply(this.ModelMatrix);
    // console.log(mvpMatrix)
    // Pass the model view projection matrix to u_mvpMatrix
    gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
    false, 										// use matrix transpose instead?
    this.ModelMatrix.elements);	// send data from Javascript.
    normalMatrix.setInverseOf(this.ModelMatrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
    //drawBox(gl, 0, this.vboVerts);
     this.ModelMatrix = popMatrix();

//Tongs2
this.ModelMatrix.translate(0, 0,-1.0);
//this.ModelMatrix.rotate(-g_angle2now, 1.0, 0.0, 0.0);  // Rotate around the x-axis
    
     this.ModelMatrix.scale(0.3, 0.2, 0.3); // Make it a little thicker
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	
 
     mvpMatrix.set(g_worldMat);
     mvpMatrix.multiply(this.ModelMatrix);
     // console.log(mvpMatrix)
     // Pass the model view projection matrix to u_mvpMatrix
     gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	// send data from Javascript.
     normalMatrix.setInverseOf(this.ModelMatrix);
         normalMatrix.transpose();
         gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
     //drawBox(gl, 0, this.vboVerts);

     //this.ModelMatrix = popMatrix();  
     //this.ModelMatrix = popMatrix();


  this.ModelMatrix.translate(-10,0,10.5);
  //this.ModelMatrix.translate(transX_c, transY_c,transZ_c);	 
  pushMatrix(this.ModelMatrix);
  this.ModelMatrix.scale(1, 1.0, 1);
  this.ModelMatrix.rotate(body_rotate, 0.0, 0.0, 1.0);
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	
 
     mvpMatrix.set(g_worldMat);
     mvpMatrix.multiply(this.ModelMatrix);
     // console.log(mvpMatrix)
     // Pass the model view projection matrix to u_mvpMatrix
     gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	// send data from Javascript.
     normalMatrix.setInverseOf(this.ModelMatrix);
         normalMatrix.transpose();
         gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
  drawBox(gl, 0, this.vboVerts);
  var arm1Length = 10.0; 
  this.ModelMatrix.translate(0,arm1Length, 0,0);	
  pushMatrix(this.ModelMatrix);
  this.ModelMatrix = popMatrix();
  pushMatrix(this.ModelMatrix);

  //Arm1
  this.ModelMatrix.translate(2.2, -8.5, 1.0); 
  this.ModelMatrix.rotate(90, 1, 0, 0);
  this.ModelMatrix.rotate(g_angle1now_c, 1.0, 0.0, 0.0);  
  pushMatrix(this.ModelMatrix);
  this.ModelMatrix.scale(0.5, -1.3, 0.5); 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	
 
     mvpMatrix.set(g_worldMat);
     mvpMatrix.multiply(this.ModelMatrix);
     // console.log(mvpMatrix)
     // Pass the model view projection matrix to u_mvpMatrix
     gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	// send data from Javascript.
     normalMatrix.setInverseOf(this.ModelMatrix);
         normalMatrix.transpose();
         gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
  drawBox(gl, 0, this.vboVerts);
  
  
  this.ModelMatrix = popMatrix();
  this.ModelMatrix.translate(0, -3, 0.0); 
  this.ModelMatrix.rotate(-g_angle4now_c, 1.0, 0.0, 0.0);  
  this.ModelMatrix.scale(0.5, 1.5, 0.5); 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	
 
     mvpMatrix.set(g_worldMat);
     mvpMatrix.multiply(this.ModelMatrix);
     // console.log(mvpMatrix)
     // Pass the model view projection matrix to u_mvpMatrix
     gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	// send data from Javascript.
     normalMatrix.setInverseOf(this.ModelMatrix);
         normalMatrix.transpose();
         gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
  drawBox(gl, 0, this.vboVerts);
  

  this.ModelMatrix = popMatrix();
  pushMatrix(this.ModelMatrix);

  //Arm2
  this.ModelMatrix.translate(-2.2, -9, 1.0); 
  this.ModelMatrix.rotate(90, 1, 0, 0);
  this.ModelMatrix.rotate(-g_angle1now_c, 1.0, 0.0, 0.0);  
  pushMatrix(this.ModelMatrix);
  this.ModelMatrix.scale(0.5, -1.3, 0.5); 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	
 
     mvpMatrix.set(g_worldMat);
     mvpMatrix.multiply(this.ModelMatrix);
     // console.log(mvpMatrix)
     // Pass the model view projection matrix to u_mvpMatrix
     gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	// send data from Javascript.
     normalMatrix.setInverseOf(this.ModelMatrix);
         normalMatrix.transpose();
         gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
  drawBox(gl, 0, this.vboVerts);
  
  
  this.ModelMatrix = popMatrix();
  this.ModelMatrix.translate(0, -3, 0.0); 
  this.ModelMatrix.rotate(-g_angle4now_c, 1.0, 0.0, 0.0);  
  this.ModelMatrix.scale(0.5, 1.5, 0.5); 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	
 
     mvpMatrix.set(g_worldMat);
     mvpMatrix.multiply(this.ModelMatrix);
     // console.log(mvpMatrix)
     // Pass the model view projection matrix to u_mvpMatrix
     gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	// send data from Javascript.
     normalMatrix.setInverseOf(this.ModelMatrix);
         normalMatrix.transpose();
         gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
  drawBox(gl, 0, this.vboVerts);
  

  this.ModelMatrix = popMatrix();
  pushMatrix(this.ModelMatrix);
  
   // Leg1
  
   this.ModelMatrix.translate(1.8, -8.5, -3); 
   this.ModelMatrix.rotate(-g_angle1now_c, 1.0, 0.0, 0.0);  
   pushMatrix(this.ModelMatrix);
   this.ModelMatrix.scale(0.5, -0.5, 1); 
   gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	
 
     mvpMatrix.set(g_worldMat);
     mvpMatrix.multiply(this.ModelMatrix);
     // console.log(mvpMatrix)
     // Pass the model view projection matrix to u_mvpMatrix
     gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	// send data from Javascript.
     normalMatrix.setInverseOf(this.ModelMatrix);
         normalMatrix.transpose();
         gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
   drawBox(gl, 0, this.vboVerts);
   
   //lowleg1
   this.ModelMatrix = popMatrix();
   //this.ModelMatrix = popMatrix();
   
   this.ModelMatrix.translate(0, 0, -2.8); 
   this.ModelMatrix.rotate(g_angle3now_c, 1.0, 0.0, 0.0); 
   this.ModelMatrix.translate(0, 0, 3.5); 
   this.ModelMatrix.translate(0, 0, -3.5); 

   this.ModelMatrix.scale(0.5, -0.5, -1); 
   gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	
 
     mvpMatrix.set(g_worldMat);
     mvpMatrix.multiply(this.ModelMatrix);
     // console.log(mvpMatrix)
     // Pass the model view projection matrix to u_mvpMatrix
     gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
     false, 										// use matrix transpose instead?
     this.ModelMatrix.elements);	// send data from Javascript.
     normalMatrix.setInverseOf(this.ModelMatrix);
         normalMatrix.transpose();
         gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
   drawBox(gl, 0, this.vboVerts);
   
   
 
   this.ModelMatrix = popMatrix();
   pushMatrix(this.ModelMatrix);


    // Leg2
  
    this.ModelMatrix.translate(-1.8, -8.5, -3); 
    this.ModelMatrix.rotate(g_angle1now_c, 1.0, 0.0, 0.0);  
    pushMatrix(this.ModelMatrix);
    this.ModelMatrix.scale(0.5, -0.5, 1); 
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
      false, 										// use matrix transpose instead?
      this.ModelMatrix.elements);	
  
      mvpMatrix.set(g_worldMat);
      mvpMatrix.multiply(this.ModelMatrix);
      // console.log(mvpMatrix)
      // Pass the model view projection matrix to u_mvpMatrix
      gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
      false, 										// use matrix transpose instead?
      this.ModelMatrix.elements);	// send data from Javascript.
      normalMatrix.setInverseOf(this.ModelMatrix);
          normalMatrix.transpose();
          gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
    drawBox(gl, 0, this.vboVerts);
    
    //lowleg2
    this.ModelMatrix = popMatrix();
    //this.ModelMatrix = popMatrix();
    
    this.ModelMatrix.translate(0, 0, -2.8); 
    this.ModelMatrix.rotate(g_angle3now_c, 1.0, 0.0, 0.0); 
    this.ModelMatrix.translate(0, 0, 3.5); 
    this.ModelMatrix.translate(0, 0, -3.5); 
 
    this.ModelMatrix.scale(0.5, -0.5, -1); 
    gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
      false, 										// use matrix transpose instead?
      this.ModelMatrix.elements);	
  
      mvpMatrix.set(g_worldMat);
      mvpMatrix.multiply(this.ModelMatrix);
      // console.log(mvpMatrix)
      // Pass the model view projection matrix to u_mvpMatrix
      gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
      false, 										// use matrix transpose instead?
      this.ModelMatrix.elements);	// send data from Javascript.
      normalMatrix.setInverseOf(this.ModelMatrix);
          normalMatrix.transpose();
          gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
    drawBox(gl, 0, this.vboVerts);
    
    
  
    this.ModelMatrix = popMatrix();
    pushMatrix(this.ModelMatrix);
        
    

  }


  
  VBObox7.prototype.draw = function() {
  //=============================================================================
  // Send commands to GPU to select and render current VBObox contents.
    g_mvpMatrix = new Matrix4();
    // check: was WebGL context set to use our VBO & shader program?
    if(this.isReady()==false) {
          console.log('ERROR! before' + this.constructor.name + 
                '.draw() call you needed to call this.switchToMe()!!');
    }
  
  this.adjust();

   

    
    
    // ----------------------------Draw the contents of the currently-bound VBO:
    // gl.drawArrays(gl.TRIANGLES,		    // select the drawing primitive to draw:
    //                 // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
    //                 //          gl.TRIANGLES, gl.TRIANGLE_STRIP,
    //               0, 								// location of 1st vertex to draw;
    //               this.vboVerts);		// number of vertices to draw on-screen.


      
    //   //draw robot arm
      
        this.ModelMatrix.setTranslate(10.0, 0, 20.0);
        pushMatrix(this.ModelMatrix);
        this.ModelMatrix.scale(1.25, 0.05, 1.25); // Make it a little thicker
        this.adjust();
         gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                  false, 										// use matrix transpose instead?
                  this.ModelMatrix.elements);	
        drawBox(gl, 0, this.vboVerts);

  }

  function drawBox(gl, start, end) {
    // Calculate the model view project matrix and pass it to u_MvpMatrix
    // g_mvpMatrix= g_worldMat;
    // g_mvpMatrix.multiply(this.ModelMatrix);
    // gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, g_mvpMatrix);
    // this.ModelMatrix.set(g_worldMat);
    // ModelMatrix.multiply(this.g_mvpMatrix);
    // gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, g_mvpMatrix.elements);
    //gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, g_mvpMatrix.elements)
  
    // Draw
    
  
    gl.drawArrays(gl.TRIANGLES, start,end);
  
  }
  
  VBObox7.prototype.reload = function() {
  //=============================================================================
  // Over-write current values in the GPU for our already-created VBO: use 
  // gl.bufferSubData() call to re-transfer some or all of our Float32Array 
  // contents to our VBO without changing any GPU memory allocations.
  
   gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                    0,                  // byte offset to where data replacement
                                        // begins in the VBO.
                      this.vboContents);   // the JS source-data array used to fill VBO
  }



  function VBObox8() {
    //=============================================================================
    //=============================================================================
    // CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
    // needed to render vertices from one Vertex Buffer Object (VBO) using one 
    // separate shader program (a vertex-shader & fragment-shader pair) and one
    // set of 'uniform' variables.
    
    // Constructor goal: 
    // Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
    // written into code) in all other VBObox functions. Keeping all these (initial)
    // values here, in this one coonstrutor function, ensures we can change them 
    // easily WITHOUT disrupting any other code, ever!
      
    this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
   `precision highp float;				// req'd in OpenGL ES if we use 'float'
    //
    struct MatlT {		// Describes one Phong material by its reflectances:
			vec3 emit;			// Ke: emissive -- surface 'glow' amount (r,g,b);
			vec3 ambi;			// Ka: ambient reflectance (r,g,b)
			vec3 diff;			// Kd: diffuse reflectance (r,g,b)
			vec3 spec; 		// Ks: specular reflectance (r,g,b)
			int shiny;			// Kshiny: specular exponent (integer >= 1; typ. <200)
  		};
    uniform mat4 u_ModelMatrix;
    attribute vec4 a_Pos1;
    attribute vec4 a_Normal;
    uniform vec3 u_Kd; 

    uniform mat4 u_MvpMatrix; 


    uniform mat4 u_NormalMatrix; 

    uniform vec3 u_DiffuseLight;   // Diffuse light color
    uniform vec3 u_AmbientLight;   // Color of an ambient light
    uniform vec3 u_Ka; // Ambient reflectance
    uniform vec3 u_Ks; // Specular reflectance
    uniform vec3 u_Lamp0Spec;			// Phong Illum: specular
    uniform vec3 u_Ke;						// Phong Reflectance: emissive
    uniform vec4 u_Lamp0Pos; 
    uniform vec4 u_eyePosWorld;
    uniform float shininess;
    uniform float u_PhongLight;

    varying vec4 v_Color;
  
    //
    void main() {
      gl_Position = u_MvpMatrix * a_Pos1;

      vec3 normal = normalize(normalize(vec3(u_NormalMatrix * a_Normal))); 
      vec3 lightDirection = normalize(u_Lamp0Pos.xyz - (u_ModelMatrix * a_Pos1).xyz);
      vec3 eyeDirection = normalize(u_eyePosWorld.xyz- (u_ModelMatrix * a_Pos1).xyz); 
      vec3 H = normalize(lightDirection + eyeDirection); 
      float nDotH = max(dot(H, normal), 0.0); 
      float e02 = pow(nDotH, shininess); 
    float e04 = e02*e02; 
    float e08 = e04*e04; 
    float e16 = e08*e08; 
    float e32 = e16*e16;  
    float e64 = pow(nDotH, shininess);
    vec3 emissive = u_Ke;
      float nDotL = max(dot(lightDirection, normal), 0.0);
      // Calculate the color due to diffuse reflection
     vec3 diffuse = u_DiffuseLight * nDotL * u_Kd;
      // Calculate the color due to ambient reflection
     vec3 ambient = u_AmbientLight * u_Ka;

     if (u_PhongLight == 1.0){
      vec3 reflectDir = reflect(-lightDirection, normal);
      float specAngle = max(dot(reflectDir, eyeDirection), 0.0);
      vec3 speculr = u_Lamp0Spec * u_Ks * pow(specAngle, shininess);
      v_Color = vec4(diffuse + ambient +speculr + emissive, 1);
    }else{
      float spec = pow(nDotL, shininess) ;
      vec3 speculr = u_Lamp0Spec * u_Ks * e64;
      v_Color = vec4(diffuse + ambient + speculr + emissive, 1);
    }
      
     }`;
    
     this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
     `#ifdef GL_ES
     precision mediump float;
     #endif
     
      varying vec4 v_Color;
  
      void main() {
        gl_FragColor = v_Color;
      }`;
  
    /*
     // b) ROUND FLAT dots:
      this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
     `precision mediump float;
      varying vec3 v_Colr1;
      void main() {
        float dist = distance(gl_PointCoord, vec2(0.5, 0.5)); 
        if(dist < 0.5) {
          gl_FragColor = vec4(v_Colr1, 1.0);
          } else {discard;};
      }`;
    */
    // /*
     // c) SHADED, sphere-like dots:
    //   this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
    //  `precision mediump float;
    //   varying vec3 v_Colr1;
    //   void main() {
    //     float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
    //     if(dist < 0.5) {
    //        gl_FragColor = vec4((1.0-2.0*dist)*v_Colr1.rgb, 1.0);
    //       } else {discard;};
    //   }`;
    //     this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
    //  `precision mediump float;
    //   varying vec3 v_Colr1;
    //   void main() {
    //     gl_FragColor = v_Colr1;
    //   }`;
   
    // this.FRAG_SRC =
    // '#ifdef GL_ES\n' +
    // 'precision mediump float;\n' +
    // '#endif\n' +
    // 'varying vec4 v_Color;\n' +
    // 'void main() {\n' +
    // '  gl_FragColor = v_Color;\n' +
    // '}\n';

    var c30 = Math.sqrt(0.75);					
  var sq2	= Math.sqrt(2.0);		
      this.vboContents = //---------------------------------------------------------
        new Float32Array ([					// Array of vertex attribute values we will
                                    // transfer to GPU's vertex buffer object (VBO)
  
          // Front face
          0.0,	 0.0, sq2, 1,		1.0, 	1.0,	1.0,	
          c30, -0.5, 0.0, 1,		0.0,  0.0,  1.0, 	
          0.0,  1.0, 0.0,  1,	1.0,  0.0,  0.0,	
           
          0.0,	 0.0, sq2, 	1	,	1.0, 	1.0,	1.0,	
          0.0,  1.0, 0.0,  1	,		1.0,  0.0,  0.0,	
         -c30, -0.5, 0.0,  	1	,	0.0,  1.0,  0.0, 	
           
          0.0,	 0.0, sq2,	1	,	1.0, 	1.0,	1.0,	
         -c30, -0.5, 0.0, 	1	,	0.0,  1.0,  0.0, 	
          c30, -0.5, 0.0, 	1	,	0.0,  0.0,  1.0, 
             
         -c30, -0.5,  0.0, 	1	,	0.0,  1.0,  0.0, 	
          0.0,  1.0,  0.0,  1	, 	1.0,  0.0,  0.0,	
          c30, -0.5,  0.0, 	1	,	0.0,  0.0,  1.0, 
      ]);	
      
      this.vboVerts =this.vboContents.length/7;							// # of vertices held in 'vboContents' array;
      this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
                                    // bytes req'd by 1 vboContents array element;
                                    // (why? used to compute stride and offset 
                                    // in bytes for vertexAttribPointer() calls)
      this.vboBytes = this.vboContents.length * this.FSIZE;               
                                    // (#  of floats in vboContents array) * 
                                    // (# of bytes/float).
      this.vboStride = this.vboBytes / this.vboVerts;     
                                    // (== # of bytes to store one complete vertex).
                                    // From any attrib in a given vertex in the VBO, 
                                    // move forward by 'vboStride' bytes to arrive 
                                    // at the same attrib for the next vertex.
                                     
                  //----------------------Attribute sizes
      this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
                                    // attribute named a_Pos1. (4: x,y,z,w values)
      this.vboFcount_a_Colr1 = 3;   // # of floats for this attrib (r,g,b values) 
      console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
                      this.vboFcount_a_Colr1) *   // every attribute in our VBO
                      this.FSIZE == this.vboStride, // for agreeement with'stride'
                      "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
                      
                  //----------------------Attribute offsets
      this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
                                    // of 1st a_Pos1 attrib value in vboContents[]
      this.vboOffset_a_Colr1 = (this.vboFcount_a_Pos1) * this.FSIZE;  
                                    // == 4 floats * bytes/float
                                    //# of bytes from START of vbo to the START
                                    // of 1st a_Colr1 attrib value in vboContents[]
      this.vboOffset_a_PtSiz1 =(this.vboFcount_a_Pos1 +
                                this.vboFcount_a_Colr1) * this.FSIZE; 
                                    // == 7 floats * bytes/float
                                    // # of bytes from START of vbo to the START
                                    // of 1st a_PtSize attrib value in vboContents[]
    
                  //-----------------------GPU memory locations:                                
      this.vboLoc;									// GPU Location for Vertex Buffer Object, 
                                    // returned by gl.createBuffer() function call
      this.shaderLoc;								// GPU Location for compiled Shader-program  
                                    // set by compile/link of VERT_SRC and FRAG_SRC.
                              //------Attribute locations in our shaders:
      this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
      this.u_NormalMatrix;

            //---------------------- Uniform locations &values in our shaders
      this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
      this.u_MvpMatrixLoc;
      this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform
      this.u_AmbientLight;
      this.u_Lamp0Pos;
      this.u_DiffuseLight;
      this.u_Ka;
      this.u_Kd;
      this.u_Ks;
      this.u_Lamp0Spec;
      this.u_Ke;
      this.u_eyePosWorld;					// GPU location for u_ModelMat uniform
      this.shininess;
      this.u_PhongLight;
    };
    
    
    VBObox8.prototype.init = function() {
    //==============================================================================
    // Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
    // kept in this VBObox. (This function usually called only once, within main()).
    // Specifically:
    // a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
    //  executable 'program' stored and ready to use inside the GPU.  
    // b) create a new VBO object in GPU memory and fill it by transferring in all
    //  the vertex data held in our Float32array member 'VBOcontents'. 
    // c) Find & save the GPU location of all our shaders' attribute-variables and 
    //  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
    // -------------------
    // CAREFUL!  before you can draw pictures using this VBObox contents, 
    //  you must call this VBObox object's switchToMe() function too!
    //--------------------
    // a) Compile,link,upload shaders-----------------------------------------------
      this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
      if (!this.shaderLoc) {
        console.log(this.constructor.name + 
                    '.init() failed to create executable Shaders on the GPU. Bye!');
        return;
      }
    // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
    //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}
    
      gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())
    
    // b) Create VBO on GPU, fill it------------------------------------------------
      this.vboLoc = gl.createBuffer();	
      if (!this.vboLoc) {
        console.log(this.constructor.name + 
                    '.init() failed to create VBO in GPU. Bye!'); 
        return;
      }
      
      // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
      //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
      // (positions, colors, normals, etc), or 
      //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
      // that each select one vertex from a vertex array stored in another VBO.
      gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
                      this.vboLoc);				  // the ID# the GPU uses for this buffer.
                            
      // Fill the GPU's newly-created VBO object with the vertex data we stored in
      //  our 'vboContents' member (JavaScript Float32Array object).
      //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
      //	 use gl.bufferSubData() to modify VBO contents without changing VBO size)
      gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
                        this.vboContents, 		// JavaScript Float32Array
                       gl.STATIC_DRAW);			// Usage hint.  
      //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
      //	(see OpenGL ES specification for more info).  Your choices are:
      //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
      //				contents rarely or never change.
      //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
      //				contents may change often as our program runs.
      //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
      // 			times and then discarded; for rapidly supplied & consumed VBOs.
    
    // c1) Find All Attributes:-----------------------------------------------------
    //  Find & save the GPU location of all our shaders' attribute-variables and 
    //  uniform-variables (for switchToMe(), adjust(), draw(), reload(), etc.)
      this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Pos1');
      if(this.a_Pos1Loc < 0) {
        console.log(this.constructor.name + 
                    '.init() Failed to get GPU location of attribute a_Pos1');
        return -1;	// error exit.
      }
      this.a_normalLoc = gl.getAttribLocation(this.shaderLoc, 'a_Normal')
  
      // c2) Find All Uniforms:-----------------------------------------------------
      //Get GPU storage location for each uniform var used in our shader programs: 
     this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
      if (!this.u_ModelMatrixLoc) { 
        console.log(this.constructor.name + 
                    '.init() failed to get GPU location for u_ModelMatrix uniform');
        return;
      }
      this.u_MvpMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');
      this.u_DiffuseLight = gl.getUniformLocation(this.shaderLoc, 'u_DiffuseLight');
      this.u_AmbientLight = gl.getUniformLocation(this.shaderLoc, 'u_AmbientLight');
      this.u_Lamp0Spec = gl.getUniformLocation(this.shaderLoc, 'u_Lamp0Spec');
      this.u_Lamp0Pos = gl.getUniformLocation(this.shaderLoc, 'u_Lamp0Pos');
      this.u_eyePosWorld = gl.getUniformLocation(this.shaderLoc, 'u_eyePosWorld');
      this.u_NormalMatrix = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix')


      //material
      this.u_Ka = gl.getUniformLocation(this.shaderLoc, 'u_Ka');
      this.u_Kd = gl.getUniformLocation(this.shaderLoc, 'u_Kd');
      this.u_Ks = gl.getUniformLocation(this.shaderLoc, 'u_Ks');
      this.u_Ke = gl.getUniformLocation(this.shaderLoc, 'u_Ke');
      this.shininess = gl.getUniformLocation(this.shaderLoc, 'shininess');
      this.u_PhongLight = gl.getUniformLocation(this.shaderLoc, 'u_PhongLight');
      
      
    }
    
    VBObox8.prototype.switchToMe = function () {
    //==============================================================================
    // Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
    //
    // We only do this AFTER we called the init() function, which does the one-time-
    // only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
    // even then, you are STILL not ready to draw our VBObox's contents onscreen!
    // We must also first complete these steps:
    //  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
    //  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
    //  c) tell the GPU to connect the shader program's attributes to that VBO.
    
    // a) select our shader program:
      gl.useProgram(this.shaderLoc);	
    //		Each call to useProgram() selects a shader program from the GPU memory,
    // but that's all -- it does nothing else!  Any previously used shader program's 
    // connections to attributes and uniforms are now invalid, and thus we must now
    // establish new connections between our shader program's attributes and the VBO
    // we wish to use.  
      
    // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
    //  instead connect to our own already-created-&-filled VBO.  This new VBO can 
    //    supply values to use as attributes in our newly-selected shader program:
      gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
                        this.vboLoc);			// the ID# the GPU uses for our VBO.
    
    // c) connect our newly-bound VBO to supply attribute variable values for each
    // vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
    // this sets up data paths from VBO to our shader units:
      // 	Here's how to use the almost-identical OpenGL version of this function:
      //		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
      gl.vertexAttribPointer(
        this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
        this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
        gl.FLOAT,		  // type == what data type did we use for those numbers?
        false,				// isNormalized == are these fixed-point values that we need
                      //									normalize before use? true or false
        this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
                      // stored attrib for this vertex to the same stored attrib
                      //  for the next vertex in our VBO.  This is usually the 
                      // number of bytes used to store one complete vertex.  If set 
                      // to zero, the GPU gets attribute values sequentially from 
                      // VBO, starting at 'Offset'.	
                      // (Our vertex size in bytes: 4 floats for pos + 3 for color)
        this.vboOffset_a_Pos1);						
                      // Offset == how many bytes from START of buffer to the first
                      // value we will actually use?  (we start with position).

  
      gl.vertexAttribPointer(this.a_normalLoc, this.vboFcount_a_Pos1,
        gl.FLOAT, false, 
        this.vboStride,  this.vboOffset_a_Pos1);
  
      
  
      //-- Enable this assignment of the attribute to its' VBO source:
      gl.enableVertexAttribArray(this.a_Pos1Loc);
      // gl.enableVertexAttribArray(this.a_Colr1Loc);
      gl.enableVertexAttribArray(this.a_normalLoc);
    }
    
    VBObox8.prototype.isReady = function() {
    //==============================================================================
    // Returns 'true' if our WebGL rendering context ('gl') is ready to render using
    // this objects VBO and shader program; else return false.
    // see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter
    
    var isOK = true;
    
      if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
        console.log(this.constructor.name + 
                    '.isReady() false: shader program at this.shaderLoc not in use!');
        isOK = false;
      }
      if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
          console.log(this.constructor.name + 
                  '.isReady() false: vbo at this.vboLoc not in use!');
        isOK = false;
      }
      return isOK;
    }
    
    VBObox8.prototype.adjust = function() {
    //==============================================================================
    // Update the GPU to newer, current values we now store for 'uniform' vars on 
    // the GPU; and (if needed) update each attribute's stride and offset in VBO.
    
      // check: was WebGL context set to use our VBO & shader program?
      if(this.isReady()==false) {
            console.log('ERROR! before' + this.constructor.name + 
                  '.adjust() call you needed to call this.switchToMe()!!');
      }
      gl.uniform4f(this.u_Lamp0Pos, lightPos.elements[0],lightPos.elements[1],lightPos.elements[2], 1.0);
      if (specOff){
        gl.uniform3f(this.u_Lamp0Spec, 0,0,0);
      }else{
        gl.uniform3f(this.u_Lamp0Spec, 1,1,1);
      }
      
      gl.uniform4f(this.u_eyePosWorld, 0,0,0, 1);
      // Set the ambient light
      if(ambientOff){
        gl.uniform3f(this.u_AmbientLight, 0, 0, 0);
      }
      else{
        gl.uniform3f(this.u_AmbientLight, 0.05,    0.05,   0.05);
      }

      if(diffuseOff){
        gl.uniform3f(this.u_DiffuseLight, 0, 0, 0);
      }else{
        gl.uniform3f(this.u_DiffuseLight, 0.0,     0.2,    0.6);
      }
      
      
      gl.uniform3f(this.u_Ka, 0.24725, 0.1995, 0.0745);
      gl.uniform3f(this.u_Kd,1,     1,    0);
      gl.uniform3f(this.u_Ks, 0.1,     0.2,    0.3);
      gl.uniform3f(this.u_Ke, 0.0, 0.0, 0.0);
      gl.uniform1f(this.shininess, 5.0);
      gl.uniform1f(this.u_PhongLight, phongLightValue);
      
      
      // Adjust values for our uniforms,
      this.ModelMatrix.setIdentity();
    // THIS DOESN'T WORK!!  this.ModelMatrix = g_worldMat;
      //this.ModelMatrix.set(g_worldMat);
     //this.ModelMatrix.rotate(90, 1, 0, 0);
      // //this.ModelMatrix.rotate(g_angle1now, 0, 1, 0);	// -spin drawing axes,
      
      this.ModelMatrix.translate(4, 1,0);	
      //this.ModelMatrix.rotate(180, 0, 0, 1);
      pushMatrix(this.ModelMatrix);
      this.ModelMatrix.translate(-5, -4,0);	
      this.ModelMatrix.scale(0.5, 0.5,0.5);	
      
    //this.ModelMatrix.translate(transX_c, transY_c,transZ_c);	
    //this.ModelMatrix.rotate(body_rotate, 0.0, 1.0, 0.0); 
    pushMatrix(this.ModelMatrix);
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	
  var mvpMatrix = new Matrix4();
  mvpMatrix.setIdentity();
  mvpMatrix.set(g_worldMat);
  mvpMatrix.multiply(this.ModelMatrix);
  // console.log(mvpMatrix)
  // Pass the model view projection matrix to u_mvpMatrix
  gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  false, 										// use matrix transpose instead?
  this.ModelMatrix.elements);	// send data from Javascript.
  var normalMatrix = new Matrix4();
  normalMatrix.setInverseOf(this.ModelMatrix);
                    normalMatrix.transpose();
                    gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
    drawBox(gl, 0, this.vboVerts);

this.ModelMatrix = popMatrix();
this.ModelMatrix.translate(0, 0, 2.2);
this.ModelMatrix.rotate(90, 1, 0, 0);
this.ModelMatrix.scale(-1,-1, -1);
this.ModelMatrix.rotate(g_angle2now_c, 0.0, 1, 0);
gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	

  mvpMatrix.set(g_worldMat);
  mvpMatrix.multiply(this.ModelMatrix);
  // console.log(mvpMatrix)
  // Pass the model view projection matrix to u_mvpMatrix
  gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  false, 										// use matrix transpose instead?
  this.ModelMatrix.elements);	// send data from Javascript.
  normalMatrix.setInverseOf(this.ModelMatrix);
                    normalMatrix.transpose();
                    gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
        drawBox(gl, 0, this.vboVerts);
    //this.ModelMatrix.scale(0.3, 1.2, 0.3);
    
     gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);
                    var normalMatrix = new Matrix4(); 


  this.ModelMatrix = popMatrix();
  this.ModelMatrix.translate(0, -2, 1);
  this.ModelMatrix.rotate(90, 1, 0, 0);
  this.ModelMatrix.scale(-1,-1, -1);
  // this.ModelMatrix.rotate(10, 0.0, 1, 0);
  this.ModelMatrix.rotate(60, 0.0, 1, 0);
  this.ModelMatrix.scale(0.5, 0.5, 0.5);
  pushMatrix(this.ModelMatrix);
  this.ModelMatrix.rotate(g_angle2now_c, 0.0, 1, 0);
  //console.log(g_angle2now_c)
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	

  mvpMatrix.set(g_worldMat);
  mvpMatrix.multiply(this.ModelMatrix);
  // console.log(mvpMatrix)
  // Pass the model view projection matrix to u_mvpMatrix
  gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  false, 										// use matrix transpose instead?
  this.ModelMatrix.elements);	// send data from Javascript.
  normalMatrix.setInverseOf(this.ModelMatrix);
                    normalMatrix.transpose();
                    gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
          drawBox(gl, 0, this.vboVerts);

  //second triangle   
  this.ModelMatrix = popMatrix();
  pushMatrix(this.ModelMatrix);
  
  // Set the ambient light

  if(ambientOff){
    gl.uniform3f(this.u_AmbientLight, 0, 0, 0);
  }
  else{
    gl.uniform3f(this.u_AmbientLight, 0.329412, 0.223529, 0.027451);
  }

  if(diffuseOff){
    gl.uniform3f(this.u_DiffuseLight, 0, 0, 0);
  }else{
    gl.uniform3f(this.u_DiffuseLight, 0.780392, 0.568627, 0.113725);
  }
  gl.uniform3f(this.u_Ka, 0.1, 0.1, 0.1);
  gl.uniform3f(this.u_Kd,1, 1, 0);
  gl.uniform3f(this.u_Ks, 0.992157, 0.941176, 0.807843);
  gl.uniform3f(this.u_Ke, 0, 0.0, 0.0);// send data from Javascript.
  gl.uniform1f(this.shininess, 27.8974);
  this.ModelMatrix.translate(-1.5, 1, 0);
  this.ModelMatrix.rotate(g_angle2now_c, 0.0, 1, 0);
  //this.ModelMatrix.scale(0.5, 0.5, 0.5);
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	
  mvpMatrix.setIdentity();
  mvpMatrix.set(g_worldMat);
  mvpMatrix.multiply(this.ModelMatrix);
  // console.log(mvpMatrix)
  // Pass the model view projection matrix to u_mvpMatrix
  gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  false, 										// use matrix transpose instead?
  this.ModelMatrix.elements);	// send data from Javascript.
  normalMatrix.setInverseOf(this.ModelMatrix);
                    normalMatrix.transpose();
                    gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
          drawBox(gl, 0, this.vboVerts);
// third triangle
this.ModelMatrix = popMatrix();

// Set the ambient light
if(ambientOff){
gl.uniform3f(this.u_AmbientLight, 0, 0, 0);
}
else{
gl.uniform3f(this.u_AmbientLight, 0.19225,  0.19225,  0.19225);
}

if(diffuseOff){
gl.uniform3f(this.u_DiffuseLight, 0, 0, 0);
}else{
gl.uniform3f(this.u_DiffuseLight, 0.50754,  0.50754,  0.50754);
}
gl.uniform3f(this.u_Ka, 0.1, 0, 0);
gl.uniform3f(this.u_Kd,1, 1, 0);
gl.uniform3f(this.u_Ks, 0.508273, 0.508273, 0.508273);
gl.uniform3f(this.u_Ke, 0, 0.0, 0.0);// send data from Javascript.
gl.uniform1f(this.shininess, 51.2);
this.ModelMatrix.translate(-1, 1, 2);
this.ModelMatrix.rotate(g_angle2now_c, 0.0, 1, 0);
//this.ModelMatrix.scale(0.5, 0.5, 0.5);
gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
              false, 										// use matrix transpose instead?
              this.ModelMatrix.elements);	
mvpMatrix.setIdentity();
mvpMatrix.set(g_worldMat);
mvpMatrix.multiply(this.ModelMatrix);
// console.log(mvpMatrix)
// Pass the model view projection matrix to u_mvpMatrix
gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
false, 										// use matrix transpose instead?
this.ModelMatrix.elements);	// send data from Javascript.
normalMatrix.setInverseOf(this.ModelMatrix);
              normalMatrix.transpose();
              gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
    drawBox(gl, 0, this.vboVerts);
    }
    
    VBObox8.prototype.draw = function() {
    //=============================================================================
    // Send commands to GPU to select and render current VBObox contents.
      g_mvpMatrix = new Matrix4();
      // check: was WebGL context set to use our VBO & shader program?
      if(this.isReady()==false) {
            console.log('ERROR! before' + this.constructor.name + 
                  '.draw() call you needed to call this.switchToMe()!!');
      }
    
    this.adjust();
  
     
  
      

          this.ModelMatrix.setTranslate(10.0, 0, 20.0);
          pushMatrix(this.ModelMatrix);
          this.ModelMatrix.scale(1.25, 0.05, 1.25); // Make it a little thicker
          this.adjust();
           gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
                    false, 										// use matrix transpose instead?
                    this.ModelMatrix.elements);	
          drawBox(gl, 0, this.vboVerts);
  
    }
  

    
    VBObox8.prototype.reload = function() {
    //=============================================================================
    // Over-write current values in the GPU for our already-created VBO: use 
    // gl.bufferSubData() call to re-transfer some or all of our Float32Array 
    // contents to our VBO without changing any GPU memory allocations.
    
     gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                      0,                  // byte offset to where data replacement
                                          // begins in the VBO.
                        this.vboContents);   // the JS source-data array used to fill VBO
    }
    function VBObox9() {
      //=============================================================================
      //=============================================================================
      // CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
      // needed to render vertices from one Vertex Buffer Object (VBO) using one 
      // separate shader program (a vertex-shader & fragment-shader pair) and one
      // set of 'uniform' variables.
      
      // Constructor goal: 
      // Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
      // written into code) in all other VBObox functions. Keeping all these (initial)
      // values here, in this one coonstrutor function, ensures we can change them 
      // easily WITHOUT disrupting any other code, ever!
        
      this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
      `precision highp float;				// req'd in OpenGL ES if we use 'float'
       //
       struct MatlT {		// Describes one Phong material by its reflectances:
         vec3 emit;			// Ke: emissive -- surface 'glow' amount (r,g,b);
         vec3 ambi;			// Ka: ambient reflectance (r,g,b)
         vec3 diff;			// Kd: diffuse reflectance (r,g,b)
         vec3 spec; 		// Ks: specular reflectance (r,g,b)
         int shiny;			// Kshiny: specular exponent (integer >= 1; typ. <200)
         };
       uniform mat4 u_ModelMatrix;
       attribute vec4 a_Pos1;
       attribute vec4 a_Normal;
       uniform vec3 u_Kd; 
   
       uniform mat4 u_MvpMatrix; 
   
   
       uniform mat4 u_NormalMatrix; 
   
       uniform vec3 u_DiffuseLight;   // Diffuse light color
       uniform vec3 u_AmbientLight;   // Color of an ambient light
       uniform vec3 u_Ka; // Ambient reflectance
       uniform vec3 u_Ks; // Specular reflectance
       uniform vec3 u_Lamp0Spec;			// Phong Illum: specular
       uniform vec3 u_Ke;						// Phong Reflectance: emissive
       uniform vec4 u_Lamp0Pos; 
       uniform vec4 u_eyePosWorld;
       uniform float shininess;
       uniform float u_PhongLight;
   
       varying vec4 v_Color;
     
       //
       void main() {
         gl_Position = u_MvpMatrix * a_Pos1;
   
         vec3 normal = normalize(normalize(vec3(u_NormalMatrix * a_Normal))); 
         vec3 lightDirection = normalize(u_Lamp0Pos.xyz - (u_ModelMatrix * a_Pos1).xyz);
         vec3 eyeDirection = normalize(u_eyePosWorld.xyz- (u_ModelMatrix * a_Pos1).xyz); 
         vec3 H = normalize(lightDirection + eyeDirection); 
         float nDotH = max(dot(H, normal), 0.0); 
         float e02 = pow(nDotH, shininess); 
       float e04 = e02*e02; 
       float e08 = e04*e04; 
       float e16 = e08*e08; 
       float e32 = e16*e16;  
       float e64 = pow(nDotH, shininess);
       vec3 emissive = u_Ke;
         float nDotL = max(dot(lightDirection, normal), 0.0);
         // Calculate the color due to diffuse reflection
        vec3 diffuse = u_DiffuseLight * nDotL * u_Kd;
         // Calculate the color due to ambient reflection
        vec3 ambient = u_AmbientLight * u_Ka;
   
        if (u_PhongLight == 1.0){
         vec3 reflectDir = reflect(-lightDirection, normal);
         float specAngle = max(dot(reflectDir, eyeDirection), 0.0);
         vec3 speculr = u_Lamp0Spec * u_Ks * pow(specAngle, shininess);
         v_Color = vec4(diffuse + ambient +speculr + emissive, 1);
       }else{
         float spec = pow(nDotL, shininess) ;
         vec3 speculr = u_Lamp0Spec * u_Ks * e64;
         v_Color = vec4(diffuse + ambient + speculr + emissive, 1);
       }
         
        }`;
       
        this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
        `#ifdef GL_ES
        precision mediump float;
        #endif
        
         varying vec4 v_Color;
     
         void main() {
           gl_FragColor = v_Color;
         }`;
      
      
      
      /*
       // b) ROUND FLAT dots:
        this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
       `precision mediump float;
        varying vec3 v_Colr1;
        void main() {
          float dist = distance(gl_PointCoord, vec2(0.5, 0.5)); 
          if(dist < 0.5) {
            gl_FragColor = vec4(v_Colr1, 1.0);
            } else {discard;};
        }`;
      */
      // /*
       // c) SHADED, sphere-like dots:
      // 	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
      //  `precision mediump float;
      //   varying vec3 v_Colr1;
      //   void main() {
      //     float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
      //     if(dist < 0.5) {
      //  	  	gl_FragColor = vec4((1.0-2.0*dist)*v_Colr1.rgb, 1.0);
      //       } else {discard;};
      //   }`;
      //*/
        this.vboContents = //---------------------------------------------------------
          new Float32Array ([					// Array of vertex attribute values we will
                                      // transfer to GPU's vertex buffer object (VBO)
            // 1 vertex per line: pos1 x,y,z,w;   colr1; r,g,b;   ptSiz1; 
          // -0.3,  0.7,	0.0, 1.0,		0.0, 1.0, 1.0,  17.0,
          // -0.3, -0.3, 0.0, 1.0,		1.0, 0.0, 1.0,  20.0,
          //  0.3, -0.3, 0.0, 1.0,		1.0, 1.0, 0.0,  33.0,
          0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
      0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
      0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
      0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
      0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
      0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
      -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
      -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
      -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
      -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
      -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
      -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
      0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
      0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
      0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
      0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
      1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
      0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
      0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
      0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
      0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
      -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
      -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
      -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
      -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
      -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
      -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
      0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
      0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
      0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
      0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
      0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
      0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
      -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
      -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
      -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
      -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
      -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
      -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
      -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
      -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
      -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
      0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
      0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
      0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
      0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
      0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
      0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
      -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
      -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
      -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
      -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
      -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
      -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
      -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
      -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
      -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
      0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
      0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
      0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
      0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
      0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
      0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
      0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
      0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
      0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
      0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
      0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
      0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
      -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
      -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
      -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
      0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
      -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
      -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
      0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
      -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
      0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
      -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
      -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
      -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
      -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
      -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
      -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
      -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
      -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
      -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
      0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
      -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
      0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
      -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
      -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
      0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
      -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
      -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
      -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
      0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
      0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
      0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
      0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
      0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
      0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
      0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
      0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
      0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
      0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
      0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
      0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
      0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
      0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
      0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
      0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
      0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
      0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
      -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
      -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
      -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
      0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
      0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
      -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
      -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
      -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
      -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
      -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
      -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
      -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
      -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
      -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
      -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
      -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
      -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
      -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
      -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
      -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
      -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
      -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
      -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
      -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
      0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
      0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
      -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
      0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
      0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
      0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
      0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
      0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
      0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
      0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
      0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
      0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
      -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
      0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
      -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
      0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
      0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
      0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
      0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
      0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
      0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
      -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
      -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
      -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
      -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
      -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
      -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
      -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
      -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
      -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
      -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
      -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
      -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
      -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
      -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
      -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
      -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
      -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
      -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
      0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
      0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
      0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
      0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
      0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
      0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
      -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
      0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
      -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
      0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
      0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
      0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
      0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
      1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
      0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
      0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
      0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
      0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
      0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
      -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
      0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
      0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
      0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
      0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
      -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
      -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
      0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
      -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
      -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
      -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
      -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
      -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
      -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
      -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
      -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
      -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
      -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
      -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
      -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
      -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
      -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
      -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
      -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
      -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
      -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
      0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
      0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
      0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
      0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
      0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
      0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
      0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
      0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
      0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
      -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
      0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
      0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
      -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
      -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
      0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
      0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
      0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
      0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
      0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
      0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
      0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
      0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
      0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
      0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
      0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
      0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
      0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
      0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
      -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
      0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
      -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
      0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
      -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
      -0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
      -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
      -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
      -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
      -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
      0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
      0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
      0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
      0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
      0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
      0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
      -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
      0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
      0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
      0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
      0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
      0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
      0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
      0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
      0.59719444730133864,-0.43388208882657253,-0.67461479757557852,1.0,0.59719444730133864,-0.43388208882657253,-0.67461479757557852, 
      0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
      0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
      0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
      0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
      0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
      0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
      0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
      0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
      0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
      0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
      0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
      0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
      0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
      0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
      0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
      0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
      0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
      0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
      0.22107564835334848,-0.16061896854687382,-0.96193924166138733,1.0,0.22107564835334848,-0.16061896854687382,-0.96193924166138733, 
      -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
      -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
      -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
      -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
      -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
      -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
      -0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
      -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
      -0.22810345272070531,-0.70204216970216216,-0.67461515460058674,1.0,-0.22810345272070531,-0.70204216970216216,-0.67461515460058674, 
      -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
      -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
      -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
      -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
      -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
      -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
      -0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
      -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
      -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
      -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
      -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
      -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
      -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
      -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
      -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
      0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
      -0.08444169435259005,-0.25988920911714120,-0.96193929082834040,1.0,-0.08444169435259005,-0.25988920911714120,-0.96193929082834040, 
      -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
      -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
      -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
      -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
      -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
      -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
      -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
      -0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
      -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
      -0.73817386557071718,0.00000000000000000,-0.67461051295424135,1.0,-0.73817386557071718,0.00000000000000000,-0.67461051295424135, 
      -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
      -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
      -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
      -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
      -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
      -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
      -0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
      -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
      -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
      -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
      -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
      -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
      -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
      -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
      -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
      0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
      -0.27326575969449873,0.00000000000000000,-0.96193857630234803,1.0,-0.27326575969449873,0.00000000000000000,-0.96193857630234803, 
      -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
      -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
      -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
      0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
      0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
      0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
      -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
      -0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
      -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
      -0.22810346021999717,0.70204214595288861,-0.67461517677971594,1.0,-0.22810346021999717,0.70204214595288861,-0.67461517677971594, 
      0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
      0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
      0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
      0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
      0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
      0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
      0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
      0.59719444730164417,0.43388208882561580,-0.67461479757592357,1.0,0.59719444730164417,0.43388208882561580,-0.67461479757592357, 
      0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
      0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
      0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
      0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
      -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
      0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
      -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
      0.00000000000000000,0.00000000000000000,-1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,-1.00000000000000000, 
      -0.08444169486640170,0.25988918728542543,-0.96193929668155809,1.0,-0.08444169486640170,0.25988918728542543,-0.96193929668155809, 
      0.22107564835334428,0.16061896854698868,-0.96193924166136913,1.0,0.22107564835334428,0.16061896854698868,-0.96193924166136913, 
      0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
      0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
      0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
      0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
      0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
      0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
      0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
      0.81827198516270072,-0.27326185738834036,-0.50572612706342079,1.0,0.81827198516270072,-0.27326185738834036,-0.50572612706342079, 
      0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
      0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
      1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
      0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
      0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
      0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
      1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
      0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
      0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
      0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
      0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
      0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
      0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
      0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
      0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
      0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
      0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
      0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
      0.81827198516270072,0.27326185738834025,-0.50572612706342079,1.0,0.81827198516270072,0.27326185738834025,-0.50572612706342079, 
      0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
      0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
      -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
      0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
      -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
      0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
      -0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
      -0.00702551696721834,-0.86266453601114879,-0.50572773348909061,1.0,-0.00702551696721834,-0.86266453601114879,-0.50572773348909061, 
      -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
      0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
      0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
      0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
      0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
      0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
      0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
      0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
      0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
      0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
      0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
      0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
      0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
      0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
      0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
      0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
      0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
      0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
      0.51275308353657978,-0.69377520407321591,-0.50572743799095665,1.0,0.51275308353657978,-0.69377520407321591,-0.50572743799095665, 
      -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
      -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
      -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
      -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
      -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
      -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
      -0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
      -0.82261759492685604,-0.25989042096644904,-0.50572449180026569,1.0,-0.82261759492685604,-0.25989042096644904,-0.50572449180026569, 
      -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
      -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
      -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
      -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
      -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
      -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
      -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
      -0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
      -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
      -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
      -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
      -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
      -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
      -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
      -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
      -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
      -0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
      -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
      -0.50137310489200804,-0.70204338323388915,-0.50572729583092690,1.0,-0.50137310489200804,-0.70204338323388915,-0.50572729583092690, 
      -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
      -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
      -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
      -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
      -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
      -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
      -0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
      -0.50137308840848038,0.70204340698308054,-0.50572727920424754,1.0,-0.50137308840848038,0.70204340698308054,-0.50572727920424754, 
      -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
      -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
      -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
      -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
      -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
      -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
      -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
      -0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
      -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
      -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
      -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
      -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
      -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
      -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
      -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
      -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
      -0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
      -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
      -0.82261759492660402,0.25989042096754789,-0.50572449180011070,1.0,-0.82261759492660402,0.25989042096754789,-0.50572449180011070, 
      0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
      0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
      0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
      0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
      0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
      0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
      0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
      0.51275310019570730,0.69377517978356151,-0.50572745442182387,1.0,0.51275310019570730,0.69377517978356151,-0.50572745442182387, 
      0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
      0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
      0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
      0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
      0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
      0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
      0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
      0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
      0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
      0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
      0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
      0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
      -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
      0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
      -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
      0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
      -0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
      -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
      -0.00702551696721834,0.86266453601114890,-0.50572773348909050,1.0,-0.00702551696721834,0.86266453601114890,-0.50572773348909050, 
      0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
      0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
      0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
      0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
      0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
      0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
      0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
      0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
      0.95925272966283204,-0.16061987366423069,0.23245527917965703,1.0,0.95925272966283204,-0.16061987366423069,0.23245527917965703, 
      0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
      0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
      0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
      0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
      0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
      0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
      0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
      0.44918494122000235,-0.86266840836933290,0.23245667506592463,1.0,0.44918494122000235,-0.86266840836933290,0.23245667506592463, 
      0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
      0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
      0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
      0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
      0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
      0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
      0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
      0.72360734907896007,-0.52572532227755686,-0.44721950972098579,1.0,0.72360734907896007,-0.52572532227755686,-0.44721950972098579, 
      0.87046509900020530,-0.43388305415508394,-0.23245646203024589,1.0,0.87046509900020530,-0.43388305415508394,-0.23245646203024589, 
      0.68164130078374940,-0.69377884373412035,-0.23245656164708539,1.0,0.68164130078374940,-0.69377884373412035,-0.23245656164708539, 
      0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
      0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
      -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
      -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
      -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
      0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
      0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
      0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
      0.14366128609370871,-0.96193835991845233,0.23245650473862750,1.0,0.14366128609370871,-0.96193835991845233,0.23245650473862750, 
      -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
      -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
      -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
      -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
      -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
      -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
      -0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
      -0.68164130078374940,-0.69377884373412035,0.23245656164708550,1.0,-0.68164130078374940,-0.69377884373412035,0.23245656164708550, 
      -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
      -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
      -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
      -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
      0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
      -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
      -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
      -0.27638800318459639,-0.85064920909880903,-0.44721985058268821,1.0,-0.27638800318459639,-0.85064920909880903,-0.44721985058268821, 
      -0.14366128609370873,-0.96193835991845245,-0.23245650473862739,1.0,-0.14366128609370873,-0.96193835991845245,-0.23245650473862739, 
      -0.44918494122000230,-0.86266840836933301,-0.23245667506592452,1.0,-0.44918494122000230,-0.86266840836933301,-0.23245667506592452, 
      -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
      -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
      -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
      -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
      -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
      -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
      -0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
      -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
      -0.87046509900020530,-0.43388305415508394,0.23245646203024589,1.0,-0.87046509900020530,-0.43388305415508394,0.23245646203024589, 
      -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
      -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
      -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
      -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
      -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
      -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
      -0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
      -0.87046509899990876,0.43388305415572176,0.23245646203016668,1.0,-0.87046509899990876,0.43388305415572176,0.23245646203016668, 
      -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
      -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
      -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
      -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
      -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
      -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
      -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
      -0.89442617947204162,0.00000000000000000,-0.44721561854998659,1.0,-0.89442617947204162,0.00000000000000000,-0.44721561854998659, 
      -0.95925272966283204,-0.16061987366423069,-0.23245527917965694,1.0,-0.95925272966283204,-0.16061987366423069,-0.23245527917965694, 
      -0.95925273146667001,0.16061986225874217,-0.23245527961678017,1.0,-0.95925273146667001,0.16061986225874217,-0.23245527961678017, 
      -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
      -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
      -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
      -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
      -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
      -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
      -0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
      -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
      -0.68164127863740132,0.69377886802353528,0.23245655409463245,1.0,-0.68164127863740132,0.69377886802353528,0.23245655409463245, 
      -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
      0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
      -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
      0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
      -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
      0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
      0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
      0.14366128609370876,0.96193835991845233,0.23245650473862756,1.0,0.14366128609370876,0.96193835991845233,0.23245650473862756, 
      0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
      0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
      -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
      -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
      -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
      -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
      -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
      -0.27638800318459644,0.85064920909880903,-0.44721985058268832,1.0,-0.27638800318459644,0.85064920909880903,-0.44721985058268832, 
      -0.44918494122000235,0.86266840836933290,-0.23245667506592455,1.0,-0.44918494122000235,0.86266840836933290,-0.23245667506592455, 
      -0.14366128609370876,0.96193835991845233,-0.23245650473862745,1.0,-0.14366128609370876,0.96193835991845233,-0.23245650473862745, 
      0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
      0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
      0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
      0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
      0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
      0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
      0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
      0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
      0.44918494122000241,0.86266840836933278,0.23245667506592466,1.0,0.44918494122000241,0.86266840836933278,0.23245667506592466, 
      0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
      0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
      0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
      0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
      0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
      0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
      0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
      0.95925273146667001,0.16061986225874214,0.23245527961678025,1.0,0.95925273146667001,0.16061986225874214,0.23245527961678025, 
      0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
      0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
      0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
      0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
      0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
      0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
      0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
      0.72360734907910951,0.52572532227727276,-0.44721950972107810,1.0,0.72360734907910951,0.52572532227727276,-0.44721950972107810, 
      0.68164127863740132,0.69377886802353528,-0.23245655409463234,1.0,0.68164127863740132,0.69377886802353528,-0.23245655409463234, 
      0.87046509899990876,0.43388305415572176,-0.23245646203016668,1.0,0.87046509899990876,0.43388305415572176,-0.23245646203016668, 
      0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
      0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
      0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
      0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
      0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
      0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
      0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
      0.50137310489200804,-0.70204338323388915,0.50572729583092690,1.0,0.50137310489200804,-0.70204338323388915,0.50572729583092690, 
      0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
      0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
      0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
      0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
      0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
      0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
      0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
      0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
      0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
      0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
      0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
      0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
      0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
      0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
      0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
      0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
      0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
      0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
      0.82261759492685593,-0.25989042096644910,0.50572449180026569,1.0,0.82261759492685593,-0.25989042096644910,0.50572449180026569, 
      -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
      -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
      -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
      -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
      -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
      -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
      -0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
      -0.51275308353657956,-0.69377520407321580,0.50572743799095676,1.0,-0.51275308353657956,-0.69377520407321580,0.50572743799095676, 
      -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
      -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
      -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
      -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
      0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
      0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
      -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
      0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
      -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
      0.08444169435259004,-0.25988920911714120,0.96193929082834051,1.0,0.08444169435259004,-0.25988920911714120,0.96193929082834051, 
      0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
      -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
      0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
      -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
      0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
      -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
      0.27638800318459644,-0.85064920909880892,0.44721985058268843,1.0,0.27638800318459644,-0.85064920909880892,0.44721985058268843, 
      0.22810345272070515,-0.70204216970216204,0.67461515460058685,1.0,0.22810345272070515,-0.70204216970216204,0.67461515460058685, 
      0.00702551696721834,-0.86266453601114879,0.50572773348909061,1.0,0.00702551696721834,-0.86266453601114879,0.50572773348909061, 
      -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
      -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
      -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
      -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
      -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
      -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
      -0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
      -0.81827198516270061,0.27326185738834019,0.50572612706342102,1.0,-0.81827198516270061,0.27326185738834019,0.50572612706342102, 
      -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
      -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
      -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
      -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
      -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
      -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
      -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
      0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
      -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
      -0.22107564835334831,-0.16061896854687377,0.96193924166138733,1.0,-0.22107564835334831,-0.16061896854687377,0.96193924166138733, 
      -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
      -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
      -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
      -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
      -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
      -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
      -0.72360734907896018,-0.52572532227755675,0.44721950972098590,1.0,-0.72360734907896018,-0.52572532227755675,0.44721950972098590, 
      -0.59719444730133864,-0.43388208882657253,0.67461479757557852,1.0,-0.59719444730133864,-0.43388208882657253,0.67461479757557852, 
      -0.81827198516270061,-0.27326185738834030,0.50572612706342102,1.0,-0.81827198516270061,-0.27326185738834030,0.50572612706342102, 
      -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
      -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
      0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
      0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
      0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
      -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
      0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
      0.00702551696721834,0.86266453601114890,0.50572773348909050,1.0,0.00702551696721834,0.86266453601114890,0.50572773348909050, 
      0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
      0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
      -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
      0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
      -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
      -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
      -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
      0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
      0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
      -0.22107564835334412,0.16061896854698865,0.96193924166136924,1.0,-0.22107564835334412,0.16061896854698865,0.96193924166136924, 
      -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
      -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
      -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
      -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
      -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
      -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
      -0.72360734907910951,0.52572532227727264,0.44721950972107821,1.0,-0.72360734907910951,0.52572532227727264,0.44721950972107821, 
      -0.59719444730164417,0.43388208882561580,0.67461479757592357,1.0,-0.59719444730164417,0.43388208882561580,0.67461479757592357, 
      -0.51275310019570719,0.69377517978356151,0.50572745442182410,1.0,-0.51275310019570719,0.69377517978356151,0.50572745442182410, 
      0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
      0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
      0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
      0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
      0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
      0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
      0.89442617947204150,0.00000000000000000,0.44721561854998682,1.0,0.89442617947204150,0.00000000000000000,0.44721561854998682, 
      0.82261759492660402,0.25989042096754789,0.50572449180011081,1.0,0.82261759492660402,0.25989042096754789,0.50572449180011081, 
      0.73817386557071729,0.00000000000000000,0.67461051295424135,1.0,0.73817386557071729,0.00000000000000000,0.67461051295424135, 
      0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
      0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
      0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
      0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
      0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
      0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
      0.00000000000000000,0.00000000000000000,1.00000000000000000,1.0,0.00000000000000000,0.00000000000000000,1.00000000000000000, 
      0.27326575969449879,0.00000000000000000,0.96193857630234814,1.0,0.27326575969449879,0.00000000000000000,0.96193857630234814, 
      0.08444169486640168,0.25988918728542537,0.96193929668155809,1.0,0.08444169486640168,0.25988918728542537,0.96193929668155809, 
      0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
      0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
      0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
      0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
      0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
      0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
      0.27638800318459655,0.85064920909880892,0.44721985058268854,1.0,0.27638800318459655,0.85064920909880892,0.44721985058268854, 
      0.22810346021999703,0.70204214595288850,0.67461517677971605,1.0,0.22810346021999703,0.70204214595288850,0.67461517677971605, 
      0.50137308840848038,0.70204340698308054,0.50572727920424754,1.0,0.50137308840848038,0.70204340698308054,0.50572727920424754, 
      0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
      0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
      0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
      0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
      0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
      0.36180031024791159,0.26286296940847692,0.89442920056216468,1.0,0.36180031024791159,0.26286296940847692,0.89442920056216468, 
      0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
      0.44721062810236778,0.52572716621419147,0.72361149853818751,1.0,0.44721062810236778,0.52572716621419147,0.72361149853818751, 
      0.63819450331188654,0.26286372875981140,0.72360931174562892,1.0,0.63819450331188654,0.26286372875981140,0.72360931174562892, 
      -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
      -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
      -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
      0.16245557649437448,0.49999534361588421,0.85065436108228731,1.0,0.16245557649437448,0.49999534361588421,0.85065436108228731, 
      -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
      -0.13819731964266874,0.42531954978782599,0.89442986388641066,1.0,-0.13819731964266874,0.42531954978782599,0.89442986388641066, 
      -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
      -0.36180353084437333,0.58777919628825115,0.72361165101128810,1.0,-0.36180353084437333,0.58777919628825115,0.72361165101128810, 
      -0.05279036938617947,0.68818537725750772,0.72361181819329945,1.0,-0.05279036938617947,0.68818537725750772,0.72361181819329945, 
      -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
      -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
      -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
      -0.42532269512579807,0.30901140236359598,0.85065419426475009,1.0,-0.42532269512579807,0.30901140236359598,0.85065419426475009, 
      -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
      -0.44720988657311983,0.00000000000000000,0.89442904545372259,1.0,-0.44720988657311983,0.00000000000000000,0.89442904545372259, 
      -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
      -0.67081698268558809,-0.16245681071892848,0.72361064143062293,1.0,-0.67081698268558809,-0.16245681071892848,0.72361064143062293, 
      -0.67081698268559242,0.16245681071889001,0.72361064143062759,1.0,-0.67081698268559242,0.16245681071889001,0.72361064143062759, 
      0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
      -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
      -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
      -0.42532269820327995,-0.30901138118404425,0.85065420041977746,1.0,-0.42532269820327995,-0.30901138118404425,0.85065420041977746, 
      -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
      -0.13819731964259949,-0.42531954978879122,0.89442986388596235,1.0,-0.13819731964259949,-0.42531954978879122,0.89442986388596235, 
      -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
      -0.05279036938617945,-0.68818537725750784,0.72361181819329923,1.0,-0.05279036938617945,-0.68818537725750784,0.72361181819329923, 
      -0.36180353084445682,-0.58777919628799402,0.72361165101145508,1.0,-0.36180353084445682,-0.58777919628799402,0.72361165101145508, 
      0.52572977425754031,0.00000000000000000,0.85065163519452291,1.0,0.52572977425754031,0.00000000000000000,0.85065163519452291, 
      0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
      0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
      0.16245557649447021,-0.49999534361500031,0.85065436108278858,1.0,0.16245557649447021,-0.49999534361500031,0.85065436108278858, 
      0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
      0.36180030802104829,-0.26286299120562384,0.89442919505699647,1.0,0.36180030802104829,-0.26286299120562384,0.89442919505699647, 
      0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
      0.63819450331195238,-0.26286372875944569,0.72360931174570364,1.0,0.63819450331195238,-0.26286372875944569,0.72360931174570364, 
      0.44721062810209067,-0.52572716621504445,0.72361149853773921,1.0,0.44721062810209067,-0.52572716621504445,0.72361149853773921, 
      0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
      0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
      0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
      0.68818933284220996,0.49999691183204148,0.52573617939097139,1.0,0.68818933284220996,0.49999691183204148,0.52573617939097139, 
      0.86180415255415010,0.42532197399259364,0.27639613072448532,1.0,0.86180415255415010,0.42532197399259364,0.27639613072448532, 
      0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
      0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
      0.67082030694436845,0.68818986652102743,0.27639613493830523,1.0,0.67082030694436845,0.68818986652102743,0.27639613493830523, 
      0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,0.80901848884612193,0.58778319532386891,0.00000000000000000, 
      0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
      -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
      -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
      -0.26286886641884827,0.80901164675169512,0.52573768600679560,1.0,-0.26286886641884827,0.80901164675169512,0.52573768600679560, 
      -0.13819853937071799,0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071799,0.95105510806629945,0.27639707874143626, 
      -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
      -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
      -0.44721585945278503,0.85064844367460846,0.27639681678317729,1.0,-0.44721585945278503,0.85064844367460846,0.27639681678317729, 
      -0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,0.95105643411808527,0.00000000000000000, 
      -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
      -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
      -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
      -0.85064787217921256,0.00000000000000000,0.52573586291690055,1.0,-0.85064787217921256,0.00000000000000000,0.52573586291690055, 
      -0.94721320074182358,0.16245765983302266,0.27639584132545802,1.0,-0.94721320074182358,0.16245765983302266,0.27639584132545802, 
      -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
      -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
      -0.94721320254337160,-0.16245764843467633,0.27639584185114785,1.0,-0.94721320254337160,-0.16245764843467633,0.27639584185114785, 
      -1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,-1.00000000000000000,0.00000000000000000,0.00000000000000000, 
      -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
      -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
      -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
      -0.26286886641884832,-0.80901164675169512,0.52573768600679571,1.0,-0.26286886641884832,-0.80901164675169512,0.52573768600679571, 
      -0.44721585945278514,-0.85064844367460835,0.27639681678317735,1.0,-0.44721585945278514,-0.85064844367460835,0.27639681678317735, 
      -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
      0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
      -0.13819853937071802,-0.95105510806629945,0.27639707874143626,1.0,-0.13819853937071802,-0.95105510806629945,0.27639707874143626, 
      -0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,-0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
      0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
      0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
      0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
      0.68818933284180439,-0.49999691183292538,0.52573617939066164,1.0,0.68818933284180439,-0.49999691183292538,0.52573617939066164, 
      0.67082032856357132,-0.68818984186990317,0.27639614384600231,1.0,0.67082032856357132,-0.68818984186990317,0.27639614384600231, 
      0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
      0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
      0.86180415255472598,-0.42532197399130661,0.27639613072467001,1.0,0.86180415255472598,-0.42532197399130661,0.27639613072467001, 
      0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
      0.00000000000000000,1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,1.00000000000000000,0.00000000000000000, 
      0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
      0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
      0.58778566602099969,0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,0.80901669378341612,0.00000000000000000, 
      0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
      0.30901724728984298,0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,0.95105643411808527,0.00000000000000000, 
      0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
      0.13819853937071799,0.95105510806629945,-0.27639707874143610,1.0,0.13819853937071799,0.95105510806629945,-0.27639707874143610, 
      0.44721585945278508,0.85064844367460857,-0.27639681678317723,1.0,0.44721585945278508,0.85064844367460857,-0.27639681678317723, 
      -0.95105792597593508,0.30901265578994147,0.00000000000000000,1.0,-0.95105792597593508,0.30901265578994147,0.00000000000000000, 
      -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
      -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
      -0.58778566602099958,0.80901669378341623,0.00000000000000000,1.0,-0.58778566602099958,0.80901669378341623,0.00000000000000000, 
      -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
      -0.80901848884612193,0.58778319532386891,0.00000000000000000,1.0,-0.80901848884612193,0.58778319532386891,0.00000000000000000, 
      -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
      -0.86180415255415010,0.42532197399259369,-0.27639613072448532,1.0,-0.86180415255415010,0.42532197399259369,-0.27639613072448532, 
      -0.67082030694436856,0.68818986652102732,-0.27639613493830517,1.0,-0.67082030694436856,0.68818986652102732,-0.27639613493830517, 
      -0.58778566602099958,-0.80901669378341634,0.00000000000000000,1.0,-0.58778566602099958,-0.80901669378341634,0.00000000000000000, 
      -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
      -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
      -0.95105792597593497,-0.30901265578994158,0.00000000000000000,1.0,-0.95105792597593497,-0.30901265578994158,0.00000000000000000, 
      -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
      -0.80901848884630856,-0.58778319532361178,0.00000000000000000,1.0,-0.80901848884630856,-0.58778319532361178,0.00000000000000000, 
      -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
      -0.67082032856357132,-0.68818984186990306,-0.27639614384600225,1.0,-0.67082032856357132,-0.68818984186990306,-0.27639614384600225, 
      -0.86180415255472598,-0.42532197399130667,-0.27639613072467006,1.0,-0.86180415255472598,-0.42532197399130667,-0.27639613072467006, 
      0.58778566602099969,-0.80901669378341612,0.00000000000000000,1.0,0.58778566602099969,-0.80901669378341612,0.00000000000000000, 
      0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
      0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
      0.00000000000000000,-1.00000000000000000,0.00000000000000000,1.0,0.00000000000000000,-1.00000000000000000,0.00000000000000000, 
      0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
      0.30901724728984298,-0.95105643411808527,0.00000000000000000,1.0,0.30901724728984298,-0.95105643411808527,0.00000000000000000, 
      0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
      0.44721585945278514,-0.85064844367460835,-0.27639681678317723,1.0,0.44721585945278514,-0.85064844367460835,-0.27639681678317723, 
      0.13819853937071802,-0.95105510806629945,-0.27639707874143615,1.0,0.13819853937071802,-0.95105510806629945,-0.27639707874143615, 
      0.95105792597593508,0.30901265578994142,0.00000000000000000,1.0,0.95105792597593508,0.30901265578994142,0.00000000000000000, 
      1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
      0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
      0.95105792597593508,-0.30901265578994153,0.00000000000000000,1.0,0.95105792597593508,-0.30901265578994153,0.00000000000000000, 
      0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
      1.00000000000000000,0.00000000000000000,0.00000000000000000,1.0,1.00000000000000000,0.00000000000000000,0.00000000000000000, 
      0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
      0.94721320074182358,0.16245765983302268,-0.27639584132545814,1.0,0.94721320074182358,0.16245765983302268,-0.27639584132545814, 
      0.94721320254337160,-0.16245764843467636,-0.27639584185114802,1.0,0.94721320254337160,-0.16245764843467636,-0.27639584185114802, 
      0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
      0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
      0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
      0.26286886641884843,0.80901164675169523,-0.52573768600679560,1.0,0.26286886641884843,0.80901164675169523,-0.52573768600679560, 
      0.36180353084437328,0.58777919628825104,-0.72361165101128810,1.0,0.36180353084437328,0.58777919628825104,-0.72361165101128810, 
      0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
      -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
      0.05279036938617959,0.68818537725750772,-0.72361181819329934,1.0,0.05279036938617959,0.68818537725750772,-0.72361181819329934, 
      0.13819731964266890,0.42531954978782605,-0.89442986388641066,1.0,0.13819731964266890,0.42531954978782605,-0.89442986388641066, 
      -0.16245557649437437,0.49999534361588427,-0.85065436108228720,1.0,-0.16245557649437437,0.49999534361588427,-0.85065436108228720, 
      -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
      -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
      -0.68818933284220984,0.49999691183204159,-0.52573617939097150,1.0,-0.68818933284220984,0.49999691183204159,-0.52573617939097150, 
      -0.44721062810236784,0.52572716621419169,-0.72361149853818763,1.0,-0.44721062810236784,0.52572716621419169,-0.72361149853818763, 
      -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
      -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
      -0.63819450331188665,0.26286372875981145,-0.72360931174562892,1.0,-0.63819450331188665,0.26286372875981145,-0.72360931174562892, 
      -0.36180031024791148,0.26286296940847698,-0.89442920056216479,1.0,-0.36180031024791148,0.26286296940847698,-0.89442920056216479, 
      -0.52572977425754042,0.00000000000000000,-0.85065163519452291,1.0,-0.52572977425754042,0.00000000000000000,-0.85065163519452291, 
      -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
      -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
      -0.68818933284180439,-0.49999691183292549,-0.52573617939066164,1.0,-0.68818933284180439,-0.49999691183292549,-0.52573617939066164, 
      -0.63819450331195249,-0.26286372875944575,-0.72360931174570353,1.0,-0.63819450331195249,-0.26286372875944575,-0.72360931174570353, 
      -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
      -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
      -0.44721062810209067,-0.52572716621504456,-0.72361149853773910,1.0,-0.44721062810209067,-0.52572716621504456,-0.72361149853773910, 
      -0.36180030802104818,-0.26286299120562384,-0.89442919505699647,1.0,-0.36180030802104818,-0.26286299120562384,-0.89442919505699647, 
      0.42532269512579823,0.30901140236359598,-0.85065419426475009,1.0,0.42532269512579823,0.30901140236359598,-0.85065419426475009, 
      0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
      0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
      0.85064787217921267,0.00000000000000000,-0.52573586291690033,1.0,0.85064787217921267,0.00000000000000000,-0.52573586291690033, 
      0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
      0.67081698268559253,0.16245681071889001,-0.72361064143062748,1.0,0.67081698268559253,0.16245681071889001,-0.72361064143062748, 
      0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
      0.44720988657311983,0.00000000000000000,-0.89442904545372259,1.0,0.44720988657311983,0.00000000000000000,-0.89442904545372259, 
      0.67081698268558820,-0.16245681071892845,-0.72361064143062281,1.0,0.67081698268558820,-0.16245681071892845,-0.72361064143062281, 
      -0.16245557649447009,-0.49999534361500036,-0.85065436108278847,1.0,-0.16245557649447009,-0.49999534361500036,-0.85065436108278847, 
      0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
      0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
      0.26286886641884843,-0.80901164675169512,-0.52573768600679560,1.0,0.26286886641884843,-0.80901164675169512,-0.52573768600679560, 
      0.05279036938617958,-0.68818537725750784,-0.72361181819329923,1.0,0.05279036938617958,-0.68818537725750784,-0.72361181819329923, 
      0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
      0.42532269820328006,-0.30901138118404425,-0.85065420041977735,1.0,0.42532269820328006,-0.30901138118404425,-0.85065420041977735, 
      0.36180353084445682,-0.58777919628799402,-0.72361165101145519,1.0,0.36180353084445682,-0.58777919628799402,-0.72361165101145519, 
      0.13819731964259963,-0.42531954978879127,-0.89442986388596235,1.0,0.13819731964259963,-0.42531954978879127,-0.89442986388596235, 
      
        ]);	
        
        this.vboVerts =this.vboContents.length/7;							// # of vertices held in 'vboContents' array;
        this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
                                      // bytes req'd by 1 vboContents array element;
                                      // (why? used to compute stride and offset 
                                      // in bytes for vertexAttribPointer() calls)
        this.vboBytes = this.vboContents.length * this.FSIZE;               
                                      // (#  of floats in vboContents array) * 
                                      // (# of bytes/float).
        this.vboStride = this.vboBytes / this.vboVerts;     
                                      // (== # of bytes to store one complete vertex).
                                      // From any attrib in a given vertex in the VBO, 
                                      // move forward by 'vboStride' bytes to arrive 
                                      // at the same attrib for the next vertex.
                                       
                    //----------------------Attribute sizes
        this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
                                      // attribute named a_Pos1. (4: x,y,z,w values)
        this.vboFcount_a_Colr1 = 3;   // # of floats for this attrib (r,g,b values))   
        console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
                        this.vboFcount_a_Colr1 ) *   // every attribute in our VBO
                        this.FSIZE == this.vboStride, // for agreeement with'stride'
                        "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
                        
                    //----------------------Attribute offsets
        this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
                                      // of 1st a_Pos1 attrib value in vboContents[]
        this.vboOffset_a_Colr1 = (this.vboFcount_a_Pos1) * this.FSIZE;  
                                      // == 4 floats * bytes/float
                                      //# of bytes from START of vbo to the START
                                      // of 1st a_Colr1 attrib value in vboContents[]
      
                                      // == 7 floats * bytes/float
                                      // # of bytes from START of vbo to the START
                                      // of 1st a_PtSize attrib value in vboContents[]
      
                    //-----------------------GPU memory locations:                                
        this.vboLoc;									// GPU Location for Vertex Buffer Object, 
                                      // returned by gl.createBuffer() function call
        this.shaderLoc;								// GPU Location for compiled Shader-program  
                                      // set by compile/link of VERT_SRC and FRAG_SRC.
                                //------Attribute locations in our shaders:
        this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
          this.a_Colr1Loc;							// GPU location: shader 'a_Colr1' attribute
          this.a_normalLoc;
          this.u_NormalMatrix;
          this.u_MvpMatrixLoc;
      
          
                      //---------------------- Uniform locations &values in our shaders
          this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
          this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform
          this.u_AmbientLight;
          this.u_Lamp0Pos;
          this.u_DiffuseLight;
          this.u_Ka;
          this.u_Kd;
          this.u_Ks;
          this.u_Lamp0Spec;
          this.u_Ke;
          this.u_eyePosWorld;
          this.shininess;						// GPU location for u_ModelMat uniform
          this.u_PhongLight;
      };
      
      
      VBObox9.prototype.init = function() {
      //==============================================================================
      // Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
      // kept in this VBObox. (This function usually called only once, within main()).
      // Specifically:
      // a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
      //  executable 'program' stored and ready to use inside the GPU.  
      // b) create a new VBO object in GPU memory and fill it by transferring in all
      //  the vertex data held in our Float32array member 'VBOcontents'. 
      // c) Find & save the GPU location of all our shaders' attribute-variables and 
      //  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
      // -------------------
      // CAREFUL!  before you can draw pictures using this VBObox contents, 
      //  you must call this VBObox object's switchToMe() function too!
      //--------------------
      // a) Compile,link,upload shaders-----------------------------------------------
        this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
        if (!this.shaderLoc) {
          console.log(this.constructor.name + 
                      '.init() failed to create executable Shaders on the GPU. Bye!');
          return;
        }
      // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
      //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}
      
        gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())
      
      // b) Create VBO on GPU, fill it------------------------------------------------
        this.vboLoc = gl.createBuffer();	
        if (!this.vboLoc) {
          console.log(this.constructor.name + 
                      '.init() failed to create VBO in GPU. Bye!'); 
          return;
        }
        
        // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
        //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
        // (positions, colors, normals, etc), or 
        //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
        // that each select one vertex from a vertex array stored in another VBO.
        gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
                        this.vboLoc);				  // the ID# the GPU uses for this buffer.
                              
        // Fill the GPU's newly-created VBO object with the vertex data we stored in
        //  our 'vboContents' member (JavaScript Float32Array object).
        //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
        //	 use gl.bufferSubData() to modify VBO contents without changing VBO size)
        gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
                          this.vboContents, 		// JavaScript Float32Array
                         gl.STATIC_DRAW);			// Usage hint.  
        //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
        //	(see OpenGL ES specification for more info).  Your choices are:
        //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
        //				contents rarely or never change.
        //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
        //				contents may change often as our program runs.
        //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
        // 			times and then discarded; for rapidly supplied & consumed VBOs.
      
      // c1) Find All Attributes:-----------------------------------------------------
      //  Find & save the GPU location of all our shaders' attribute-variables and 
      //  uniform-variables (for switchToMe(), adjust(), draw(), reload(), etc.)
      this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Pos1');
      if(this.a_Pos1Loc < 0) {
        console.log(this.constructor.name + 
                    '.init() Failed to get GPU location of attribute a_Pos1');
        return -1;	// error exit.
      }
      //  this.a_Colr1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Colr1');
      // if(this.a_Colr1Loc < 0) {
      //   console.log(this.constructor.name + 
      //               '.init() failed to get the GPU location of attribute a_Colr1');
      //   return -1;	// error exit.
      // }
      this.a_normalLoc = gl.getAttribLocation(this.shaderLoc, 'a_Normal');
      if(this.a_normalLoc < 0) {
        console.log(this.constructor.name + 
                    '.init() failed to get the GPU location of attribute a_Normal');
        return -1;	// error exit.
      }
      
      this.u_DiffuseLight = gl.getUniformLocation(this.shaderLoc, 'u_DiffuseLight');
      this.u_AmbientLight = gl.getUniformLocation(this.shaderLoc, 'u_AmbientLight');
      this.u_Lamp0Spec = gl.getUniformLocation(this.shaderLoc, 'u_Lamp0Spec');
      this.u_Lamp0Pos = gl.getUniformLocation(this.shaderLoc, 'u_Lamp0Pos');
      this.u_eyePosWorld = gl.getUniformLocation(this.shaderLoc, 'u_eyePosWorld');
      this.u_NormalMatrix = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix')
      this.u_MvpMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');
      
      //material
      this.u_Ka = gl.getUniformLocation(this.shaderLoc, 'u_Ka');
      this.u_Kd = gl.getUniformLocation(this.shaderLoc, 'u_Kd');
      this.u_Ks = gl.getUniformLocation(this.shaderLoc, 'u_Ks');
      this.u_Ke = gl.getUniformLocation(this.shaderLoc, 'u_Ke');
      this.shininess = gl.getUniformLocation(this.shaderLoc, 'shininess');
      this.u_PhongLight = gl.getUniformLocation(this.shaderLoc, 'u_PhongLight');
      
      if(!this.u_Ke || !this.u_Ka || !this.u_Kd 
        //		 || !u_Ks || !u_Kshiny
             ) {
            console.log('Failed to get the Phong Reflectance storage locations');
            return;
          }
      
      
      
      // c2) Find All Uniforms:-----------------------------------------------------
      //Get GPU storage location for each uniform var used in our shader programs: 
      
      this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
      
      if (!this.u_ModelMatrixLoc || !this.u_DiffuseLight || !this.u_AmbientLight) { 
       console.log('Failed to get the storage location');
       return;
      }
      }
      
      VBObox9.prototype.switchToMe = function () {
      //==============================================================================
      // Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
      //
      // We only do this AFTER we called the init() function, which does the one-time-
      // only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
      // even then, you are STILL not ready to draw our VBObox's contents onscreen!
      // We must also first complete these steps:
      //  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
      //  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
      //  c) tell the GPU to connect the shader program's attributes to that VBO.
      
      // a) select our shader program:
        gl.useProgram(this.shaderLoc);	
      //		Each call to useProgram() selects a shader program from the GPU memory,
      // but that's all -- it does nothing else!  Any previously used shader program's 
      // connections to attributes and uniforms are now invalid, and thus we must now
      // establish new connections between our shader program's attributes and the VBO
      // we wish to use.  
        
      // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
      //  instead connect to our own already-created-&-filled VBO.  This new VBO can 
      //    supply values to use as attributes in our newly-selected shader program:
        gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
                          this.vboLoc);			// the ID# the GPU uses for our VBO.
      
      // c) connect our newly-bound VBO to supply attribute variable values for each
      // vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
      // this sets up data paths from VBO to our shader units:
        // 	Here's how to use the almost-identical OpenGL version of this function:
        //		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
        gl.vertexAttribPointer(
          this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
          this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
          gl.FLOAT,		  // type == what data type did we use for those numbers?
          false,				// isNormalized == are these fixed-point values that we need
                        //									normalize before use? true or false
          this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
                        // stored attrib for this vertex to the same stored attrib
                        //  for the next vertex in our VBO.  This is usually the 
                        // number of bytes used to store one complete vertex.  If set 
                        // to zero, the GPU gets attribute values sequentially from 
                        // VBO, starting at 'Offset'.	
                        // (Our vertex size in bytes: 4 floats for pos + 3 for color)
          this.vboOffset_a_Pos1);						
                        // Offset == how many bytes from START of buffer to the first
                        // value we will actually use?  (we start with position).
      
              gl.vertexAttribPointer(this.a_normalLoc, this.vboFcount_a_Pos1,
              gl.FLOAT, false, 
              this.vboStride,  this.vboOffset_a_Pos1);
            
              
            
              //-- Enable this assignment of the attribute to its' VBO source:
              gl.enableVertexAttribArray(this.a_Pos1Loc);
              // gl.enableVertexAttribArray(this.a_Colr1Loc);
              gl.enableVertexAttribArray(this.a_normalLoc);
      
      }
      
      VBObox9.prototype.isReady = function() {
      //==============================================================================
      // Returns 'true' if our WebGL rendering context ('gl') is ready to render using
      // this objects VBO and shader program; else return false.
      // see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter
      
      var isOK = true;
      
        if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
          console.log(this.constructor.name + 
                      '.isReady() false: shader program at this.shaderLoc not in use!');
          isOK = false;
        }
        if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
            console.log(this.constructor.name + 
                    '.isReady() false: vbo at this.vboLoc not in use!');
          isOK = false;
        }
        return isOK;
      }
      
      VBObox9.prototype.adjust = function() {
        //=============================================================================
        // Update the GPU to newer, current values we now store for 'uniform' vars on 
        // the GPU; and (if needed) update the VBO's contents, and (if needed) each 
        // attribute's stride and offset in VBO.
        
          // check: was WebGL context set to use our VBO & shader program?
          if(this.isReady()==false) {
                console.log('ERROR! before' + this.constructor.name + 
                      '.adjust() call you needed to call this.switchToMe()!!');
          }
          gl.uniform4f(this.u_Lamp0Pos, lightPos.elements[0],lightPos.elements[1],lightPos.elements[2], 1.0);
          if (specOff){
            gl.uniform3f(this.u_Lamp0Spec, 0,0,0);
          }else{
            gl.uniform3f(this.u_Lamp0Spec, 1,1,1);
          }
          
          gl.uniform4f(this.u_eyePosWorld, camPos.elements[0],camPos.elements[1],camPos.elements[2], 1);
          // Set the ambient light
          if (ambientOff){
            gl.uniform3f(this.u_AmbientLight, 0, 0, 0);
          }else{
            gl.uniform3f(this.u_AmbientLight, 0.25,     0.20725,  0.20725);
          }
          
        
          if(diffuseOff){
            gl.uniform3f(this.u_DiffuseLight, 0.0, 0.0, 0.0);
          }else{
            gl.uniform3f(this.u_DiffuseLight, 1.0,      0.829,    0.829);
          }
          
          gl.uniform3f(this.u_Ka, ambientR, ambientG, ambientB);
          gl.uniform3f(this.u_Kd,diffuseR, diffuseG, diffuseB);
          gl.uniform3f(this.u_Ks, specularR, specularG, specularB);
          gl.uniform3f(this.u_Ke, 0.0, 0.0, 0.0);
          gl.uniform1f(this.shininess, shiness);
          gl.uniform1f(this.u_PhongLight, phongLightValue);
        // Adjust values for our uniforms,
        this.ModelMatrix.setIdentity();
      
      
        //this.ModelMatrix.rotate(g_angle1now, 0, 0, 1);	// -spin drawing axes,
        //this.ModelMatrix.translate(0, 0.0, 0);	
        this.ModelMatrix.rotate(g_angle5now, 0,0, 1);					// then translate them.
        //  Transfer new uniforms' values to the GPU:-------------
        // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
      
      var mvpMatrix = new Matrix4();
      mvpMatrix.setIdentity();
      mvpMatrix.set(g_worldMat);
      mvpMatrix.multiply(this.ModelMatrix);
      // console.log(mvpMatrix)
      // Pass the model view projection matrix to u_mvpMatrix
      gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, mvpMatrix.elements);
      gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
      false, 										// use matrix transpose instead?
      this.ModelMatrix.elements);	// send data from Javascript.
      var normalMatrix = new Matrix4();
      normalMatrix.setInverseOf(this.ModelMatrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
        
      }
      
      VBObox9.prototype.draw = function() {
      //=============================================================================
      // Send commands to GPU to select and render current VBObox contents.
      
        // check: was WebGL context set to use our VBO & shader program?
        if(this.isReady()==false) {
              console.log('ERROR! before' + this.constructor.name + 
                    '.draw() call you needed to call this.switchToMe()!!');
        }
        
        // ----------------------------Draw the contents of the currently-bound VBO:
        // gl.drawArrays(gl.TRIANGLE_STRIP,		    // select the drawing primitive to draw:
        //                 // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
        //                 //          gl.TRIANGLES, gl.TRIANGLE_STRIP,
        // 							0, 								// location of 1st vertex to draw;
        // 							this.vboVerts);		// number of vertices to draw on-screen.
        gl.drawArrays(gl.TRIANGLE_STRIP,0, this.vboVerts);	
      }
      
      
      VBObox9.prototype.reload = function() {
      //=============================================================================
      // Over-write current values in the GPU for our already-created VBO: use 
      // gl.bufferSubData() call to re-transfer some or all of our Float32Array 
      // contents to our VBO without changing any GPU memory allocations.
      
       gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                        0,                  // byte offset to where data replacement
                                            // begins in the VBO.
                          this.vboContents);   // the JS source-data array used to fill VBO
      }
      