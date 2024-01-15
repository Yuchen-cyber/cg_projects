var VSHADER_SOURCE = 
 `uniform mat4 u_ModelMatrix;
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_ModelMatrix * a_Position;
    gl_PointSize = 10.0;
    v_Color = a_Color;
  }`

  var FSHADER_SOURCE = 
 `precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color;
  }`

  // Global Variables
var ANGLE_STEP = 45.0;		// Rotation angle rate (degrees/second)
var floatsPerVertex = 7;	// # of Float32Array elements used for each vertex
													// (x,y,z,w)position + (r,g,b)color
													// Later, see if you can add:
													// (x,y,z) surface normal + (tx,ty) texture addr.

function main() {
//==============================================================================
	// Retrieve <canvas> element
	var canvas = document.getElementById('parts');

	// Get the rendering context for WebGL
	var gl = getWebGLContext(canvas);
	if (!gl) {
	console.log('Failed to get the rendering context for WebGL');
	return;
	}

	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
	console.log('Failed to intialize shaders.');
	return;
	}

	// 
	var n = initVertexBuffer(gl);
	if (n < 0) {
	console.log('Failed to set the vertex information');
	return;
	}

	// Specify the color for clearing <canvas>
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// NEW!! Enable 3D depth-test when drawing: don't over-draw at any pixel 
	// unless the new Z value is closer to the eye than the old one..
//	gl.depthFunc(gl.LESS);			 // WebGL default setting: (default)
	gl.enable(gl.DEPTH_TEST); 	  
	
	// Get handle to graphics system's storage location of u_ModelMatrix
	var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	if (!u_ModelMatrix) { 
	console.log('Failed to get the storage location of u_ModelMatrix');
	return;
	}
	// Create a local version of our model matrix in JavaScript 
	var modelMatrix = new Matrix4();
	
	// Create, init current rotation angle value in JavaScript
	var currentAngle = 0.0;

//-----------------  

	// Start drawing: create 'tick' variable whose value is this function:
	var tick = function() {
	currentAngle = animate(currentAngle);  // Update the rotation angle
	draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);   // Draw shapes
	// report current angle on console
	//console.log('currentAngle=',currentAngle);
	requestAnimationFrame(tick, canvas);   
										// Request that the browser re-draw the webpage
	};
	tick();							// start (and continue) animation: draw current image
	
}

function initVertexBuffer(gl) {
//==============================================================================
// Create one giant vertex buffer object (VBO) that holds all vertices for all
// shapes.
	
		// Make each 3D shape in its own array of vertices:
		makeEgg();					// create, fill the eggVerts array
	// makeGroundGrid();				// create, fill the gndVerts array
	makeDiamond(); //create, fill the diaVerts array
	// how many floats total needed to store all shapes?
	// var mySiz = (eggVerts.length + diaVerts.length + gndVerts.length);		
	var mySiz = (eggVerts.length + diaVerts.length);						

	// How many vertices total?
	var nn = mySiz / floatsPerVertex;
	console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);
	// Copy all shapes into one big Float32 array:
	var colorShapes = new Float32Array(mySiz);
	// Copy them:  remember where to start for each shape:
	eggSatrt = 0;							// we stored the cylinder first.
	for(i=0,j=0; j< eggVerts.length; i++,j++) {
		colorShapes[i] = eggVerts[j];
		}
	diaStart =i;
	for(j=0; j< diaVerts.length; i++, j++) {
		colorShapes[i] = diaVerts[j];
		}
	// gndStart = i;						// next we'll store the ground-plane;
	// for(j=0; j< gndVerts.length; i++, j++) {
	// 	colorShapes[i] = gndVerts[j];
	// 	}
	// Create a buffer object on the graphics hardware:
	var shapeBufferHandle = gl.createBuffer();  
	if (!shapeBufferHandle) {
	console.log('Failed to create the shape buffer object');
	return false;
	}

	// Bind the the buffer object to target:
	gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
	// Transfer data from Javascript array colorShapes to Graphics system VBO
	// (Use sparingly--may be slow if you transfer large shapes stored in files)
	gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);
	
	//Get graphics system's handle for our Vertex Shader's position-input variable: 
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
	console.log('Failed to get the storage location of a_Position');
	return -1;
	}

	var FSIZE = colorShapes.BYTES_PER_ELEMENT; // how many bytes per stored value?

	// Use handle to specify how to retrieve **POSITION** data from our VBO:
	gl.vertexAttribPointer(
			a_Position, 	// choose Vertex Shader attribute to fill with data
			4, 						// how many values? 1,2,3 or 4.  (we're using x,y,z,w)
			gl.FLOAT, 		// data type for each value: usually gl.FLOAT
			false, 				// did we supply fixed-point data AND it needs normalizing?
			FSIZE * floatsPerVertex, // Stride -- how many bytes used to store each vertex?
										// (x,y,z,w, r,g,b) * bytes/value
			0);						// Offset -- now many bytes from START of buffer to the
										// value we will actually use?
	gl.enableVertexAttribArray(a_Position);  
										// Enable assignment of vertex buffer object's position data

	// Get graphics system's handle for our Vertex Shader's color-input variable;
	var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	if(a_Color < 0) {
	console.log('Failed to get the storage location of a_Color');
	return -1;
	}
	// Use handle to specify how to retrieve **COLOR** data from our VBO:
	gl.vertexAttribPointer(
		a_Color, 				// choose Vertex Shader attribute to fill with data
		3, 							// how many values? 1,2,3 or 4. (we're using R,G,B)
		gl.FLOAT, 			// data type for each value: usually gl.FLOAT
		false, 					// did we supply fixed-point data AND it needs normalizing?
		FSIZE * 7, 			// Stride -- how many bytes used to store each vertex?
										// (x,y,z,w, r,g,b) * bytes/value
		FSIZE * 4);			// Offset -- how many bytes from START of buffer to the
										// value we will actually use?  Need to skip over x,y,z,w
										
	gl.enableVertexAttribArray(a_Color);  
										// Enable assignment of vertex buffer object's position data

	//--------------------------------DONE!
	// Unbind the buffer object 
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return nn;
}

function makeDiamond() {
	//==============================================================================
	// Make a diamond-like shape from two adjacent tetrahedra, aligned with Z axis.

	var ctrColr = new Float32Array([0.930, 0.605, 0.843]);	// pink
	var topColr = new Float32Array([0.628, 0.910, 0.854]);	// blue
	var botColr = new Float32Array([0.940, 0.913, 0.620]); //yellow
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

function makeEgg() {
	//==============================================================================
	var ctrColr = new Float32Array([0.930, 0.605, 0.843]);	// pink
	var topColr = new Float32Array([0.628, 0.910, 0.854]);	// blue
	var botColr = new Float32Array([0.940, 0.913, 0.620]); //yellow
	var slices = 7;		// # of slices of the sphere along the z axis. >=3 req'd
	// (choose odd # or prime# to avoid accidental symmetry)
	var sliceVerts	= 27;	// # of vertices around the top edge of the slice

	var sliceAngle = Math.PI/(slices * 2);	// lattitude angle spanned by one slice.

	var topR = 2
	var ctrR = 1
	var botR = 0.8

	// Create a (global) array to hold this sphere's vertices:
	eggVerts = new Float32Array(  ((slices * 2* sliceVerts) -2 + sliceVerts * 2) * floatsPerVertex);

	// INITIALIZE:
	var cosBot = 0.0;					// cosine and sine of the lattitude angle for
	var sinBot = 0.0;					// 	the current slice's BOTTOM (southward) edge. 
	// (NOTE: Lattitude = 0 @equator; -90deg @south pole; +90deg at north pole)
	var cosTop = 0.0;					// "	" " for current slice's TOP (northward) edge
	var sinTop = 0.0;

	var j = 0;							// initialize our array index
	var isFirstSlice = 1;		// ==1 ONLY while making south-pole slice; 0 otherwise
	var isLastSlice = 0;		// ==1 ONLY while making north-pole slice; 0 otherwise
	for(s=0; s<slices; s++) {	// for each slice of the sphere,---------------------
		// For current slice's top & bottom edges, find lattitude angle sin,cos:
		if(s==0) {
			isFirstSlice = 1;		// true ONLY when we're creating the south-pole slice
			cosBot =  0.0; 			// initialize: first slice's lower edge is south pole.
			sinBot = -1.0;			// (cos(lat) sets slice diameter; sin(lat) sets z )
		}
		else {					// otherwise, set new bottom edge == old top edge
			isFirstSlice = 0;	
			cosBot = cosTop;
			sinBot = sinTop;
		}								// then compute sine,cosine of lattitude of new top edge.
		cosTop = botR * Math.cos((-Math.PI/2) +(s+1)*sliceAngle); 
		sinTop = Math.sin((-Math.PI/2) +(s+1)*sliceAngle);
		for(v=isFirstSlice;    v< 2*sliceVerts-isLastSlice;   v++,j+=floatsPerVertex)
		{						// for each vertex of this slice,
			if(v%2 ==0) { // put vertices with even-numbered v at slice's bottom edge;
										// by circling CCW along longitude (east-west) angle 'theta':
										// (0 <= theta < 360deg, increases 'eastward' on sphere).
										// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
										// where			theta = 2*PI*(v/2)/capVerts = PI*v/capVerts
				eggVerts[j  ] = topR * cosBot * Math.cos(Math.PI * v/sliceVerts);	// x
				eggVerts[j+1] = topR * cosBot * Math.sin(Math.PI * v/sliceVerts);	// y
				eggVerts[j+2] = sinBot;																			// z
				eggVerts[j+3] = 1.0;																				// w.				
			}
			else {	// put vertices with odd-numbered v at the the slice's top edge
							// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
							// and thus we can simplify cos(2*PI* ((v-1)/2)*sliceVerts)
							// (why (v-1)? because we want longitude angle 0 for vertex 1).  
				eggVerts[j  ] = topR * cosTop * Math.cos(Math.PI * (v-1)/sliceVerts); 	// x
				eggVerts[j+1] = topR * cosTop * Math.sin(Math.PI * (v-1)/sliceVerts);	// y
				eggVerts[j+2] = sinTop;		// z
				eggVerts[j+3] = 1.0;	
			}
			// finally, set some interesting colors for vertices:
			if(v%3 == 0) { 	
				eggVerts[j+4]=ctrColr[0]; 
				eggVerts[j+5]=ctrColr[1]; 
				eggVerts[j+6]=ctrColr[2];				
				}
			else if(v%3 == 1) {	
				eggVerts[j+4]=botColr[0]; 
				eggVerts[j+5]=botColr[1]; 
				eggVerts[j+6]=botColr[2];	
				}
			else if(v%3 == 2) {
				eggVerts[j+4]=topColr[0]; 
				eggVerts[j+5]=topColr[1]; 
				eggVerts[j+6]=topColr[2];	
			}

		}
	}

	cosBot = cosTop;
	sinBot = sinTop;
	for(v=0;    v< 2*sliceVerts;   v++,j+=floatsPerVertex)
	{						
		if(v%2 ==0) { 

			eggVerts[j  ] = topR * cosBot * Math.cos(Math.PI * v/sliceVerts);	// x
			eggVerts[j+1] = topR * cosBot * Math.sin(Math.PI * v/sliceVerts);	// y
			eggVerts[j+2] = sinBot;																			// z
			eggVerts[j+3] = 1.0;																				// w.				
		}
		else {
 
			eggVerts[j  ] = 0
			eggVerts[j+1] = 0
			eggVerts[j+2] = sinTop;		// z
			eggVerts[j+3] = 1.0;	
		}
		// finally, set some interesting colors for vertices:
		if(v%3 == 0) { 	
			eggVerts[j+4]=ctrColr[0]; 
			eggVerts[j+5]=ctrColr[1]; 
			eggVerts[j+6]=ctrColr[2];				
			}
		else if(v%3 == 1) {	
			eggVerts[j+4]=botColr[0]; 
			eggVerts[j+5]=botColr[1]; 
			eggVerts[j+6]=botColr[2];	
			}
		else if(v%3 == 2) {
			eggVerts[j+4]=topColr[0]; 
			eggVerts[j+5]=topColr[1]; 
			eggVerts[j+6]=topColr[2];	
		}
	}

	
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

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//==============================================================================
  // Clear <canvas>  colors AND the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //-------Draw Spinning Cylinder:
  modelMatrix.setTranslate(-0.4,-0.4, 0.0);  // 'set' means DISCARD old matrix,
  						// (drawing axes centered in CVV), and then make new
  						// drawing axes moved to the lower-left corner of CVV. 
  modelMatrix.scale(1,1,-1);							// convert to left-handed coord sys
  																				// to match WebGL display canvas.
  modelMatrix.scale(0.2, 0.2, 0.2);
  						// if you DON'T scale, cyl goes outside the CVV; clipped!
  modelMatrix.rotate(currentAngle, 0, 1, 0);  // spin around y axis.
	// Drawing:
  // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // Draw the cylinder's vertices, and no other vertices:
  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  							eggSatrt/floatsPerVertex, // start at this vertex number, and
  							eggVerts.length/floatsPerVertex);	// draw this many vertices.

 //-------Draw Spinning Diamonds:
 modelMatrix.setTranslate( 0.4, 0.4, 0.0); // 'set' means DISCARD old matrix,
  						// (drawing axes centered in CVV), and then make new
  						// drawing axes moved to the lower-left corner of CVV.
  modelMatrix.scale(1,1,-1);							// convert to left-handed coord sys
  																				// to match WebGL display canvas.
  modelMatrix.scale(0.3, 0.3, 0.3);
  						// Make it smaller:
  modelMatrix.rotate(currentAngle, 1, 1, 0);  // Spin on XY diagonal axis
// Drawing:
// Pass our current matrix to the vertex shaders:
gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
// Draw the cylinder's vertices, and no other vertices:
gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
	 diaStart/floatsPerVertex, // start at this vertex number, and
	 diaVerts.length/floatsPerVertex);	// draw this many vertices.
  

// 	//---------Draw Ground Plane, WITHOUT spinning.
// 	// position it;  *SET* translate() discards all previous matrix content.
// 	modelMatrix.setTranslate( 0.0, 0.0, 0.0);	
// 	modelMatrix.scale(0.05, 0.05, 0.05);				// shrink!
// //	modelMatrix.rotate(-60.0, 1,0,0 );
// 	// Drawing:
// 	// Pass our current matrix to the vertex shaders:
//   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
//   // Draw just the ground-plane's vertices
//   gl.drawArrays(gl.LINES, 								// use this drawing primitive, and
//   						  gndStart/floatsPerVertex,	// start at this vertex number, and
//   						  gndVerts.length/floatsPerVertex);	// draw this many vertices.
	
}


// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animate(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;    
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
//  if(angle >  120.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
//  if(angle < -120.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}

//==================HTML Button Callbacks
function nextShape() {
	shapeNum += 1;
	if(shapeNum >= shapeMax) shapeNum = 0;
}

function spinDown() {
 ANGLE_STEP -= 25; 
}

function spinUp() {
  ANGLE_STEP += 25; 
}

function runStop() {
  if(ANGLE_STEP*ANGLE_STEP > 1) {
    myTmp = ANGLE_STEP;
    ANGLE_STEP = 0;
  }
  else {
  	ANGLE_STEP = myTmp;
  }
}
 
	
	
