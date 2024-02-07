// HelloPoint1.js (c) 2012 matsuda
// Vertex shader program
/*
// MODIFIED J. Tumblin 1/2017  to make 'HelloMatrixDegen.js'. 
// MODIFIED J. Tumblin 1/2017 to make 'HelloQuaternion.js' 

Simple program to test basic quaternion operations using the 'Quaternion'
objects and functions found in ../lib/cuon-matrix-quat03.js

--Includes code to encourage exploring basic vector/matrix operations;
-- Demonstrate that matrices have finite precision, and thus contain tiny errors that can accumulate. THUS you should never write code that endlessly concatenates rotation-only matrices (e.g. an 'orientation' matrix made by continually re-applying rotation matrices), because eventually the result accumulates numerical errors that cause wholly unpredictable non-rotation transforms, including non-uniform scale, translation, shear, skew, and even unwanted projective distortions.  These matrices 'degenerate' -- they're no longer pure 3D  rotations!

-- Further code encourages exploring quaternion operations.

Nothing interesting happens in the canvas -- it's all in the console!
*/

var VSHADER_SOURCE = 
  'void main() {\n' +
  '  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n' + // Set the vertex coordinates of the one and only point
  '  gl_PointSize = 10.0;\n' +                    // Set the point size. CAREFUL! MUST be float, not integer value!!
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' + // Set the point color
  '}\n';
  function testQuaternions() {
	var res = 5;
	/*
	//============================================================
	// Learning Activity: try basic vector operations
	//============================================================
	*/
	//-- Create two different Vector4 objects with nonzero elements.
	var vec1 = new Vector4([1, 2, 3, 4]); 
	var vec2 = new Vector4([5, 6, 7, 8]);
	console.log('create two vector4 objetcs');
	vec1.printMe();
	vec2.printMe();
	
	//-- Compute and print their lengths in the console window.
	var vec1_len = Math.sqrt(vec1.elements[0] ** 2 + vec1.elements[1] ** 2 + vec1.elements[2] ** 2 + vec1.elements[3] ** 2);
	var vec2_len = Math.sqrt(vec2.elements[0] ** 2 + vec2.elements[1] ** 2 + vec2.elements[2] ** 2 + vec2.elements[3] ** 2);
	console.log('Length of vec1(computed)', vec1_len.toFixed(res));
	console.log('Length of vec2(computed):', vec2_len.toFixed(res));

	//--Can any Vector4 member function compute that for you?  : no
	//--Should you add a new member fcn? :yes, so I add the function compute vector4 length
	Vector4.prototype.length = function() {
		var v = this.elements;
		return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2] + v[3]*v[3]);
	};
	console.log("Length of vec1(member fcn): ", vec1.length().toFixed(res));
	console.log("Length of vec2(member fcn): ", vec2.length().toFixed(res));
	console.log("the result are the same")

	//--How can you normalize these vectors?
	Vector4.prototype.normalize = function() {
		var v = this.elements;
		var len = this.length();
		if (len > 0) {
			v[0] /= len;
			v[1] /= len;
			v[2] /= len;
			v[3] /= len;
		}
		return this;
	};
	console.log("normalization of vec1: ");
	vec1.normalize().printMe();

	//--Can you compute a 'dotProduct()' for two Vector4 objects?  
	Vector4.prototype.dotProduct = function(vec) {
		var v1 = this.elements;
		var v2 = vec.elements;
		return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2] + v1[3]*v2[3];
	};
	console.log("dot product of vec1 and vec2(new member fcn): ", vec1.dotProduct(vec2));

	//var vec_result = vec1.elements[0] * vec2.elements[0] + vec1.elements[1] * vec2.elements[1] + vec1.elements[2] * vec2.elements[2] + vec1.elements[3] * vec2.elements[3];
	var vec_result = vec1.dot(vec2);
	console.log("dot product of vec1 and vect2(original):", vec_result);

	if (vec_result == vec1.dotProduct(vec2)){
		console.log("The new member one and the original member function version one are the same,the test passed")
	}
	// --Can you compute a 'crossProduct()' for two Vector4 objects? 
	//Can you find a Vector4 member function to do this? Ans: yes
	var vec_cross = vec1.cross(vec2);
	console.log("Vector4 after multiplication:");
	vec_cross.printMe();
	//Can you make one? Did it work?
	Vector4.prototype.crossProduct = function(opt_src) {
		if (!opt_src || !opt_src.hasOwnProperty('elements')) {
			console.error('The input argument must be a Vector4 with elements property.');
			return null;
		}
	
		var vA = this.elements; 
		var vB = opt_src.elements; 
		var ans = new Vector4(); 
		var vC = ans.elements; 
	
		// Compute cross-product
		vC[0] = vA[1] * vB[2] - vA[2] * vB[1]; 
		vC[1] = vA[2] * vB[0] - vA[0] * vB[2]; 
		vC[2] = vA[0] * vB[1] - vA[1] * vB[0]; 
		vC[3] = 0.0; 
	
		return ans; 
	};
	var new_vec_cross = vec1.crossProduct(vec2);
	console.log("cross product of vec1 and vect2(new member fcn):")
	new_vec_cross.printMe();
	if(vec_cross.elements[0] == new_vec_cross.elements[0] && vec_cross.elements[1] == new_vec_cross.elements[1] && vec_cross.elements[2] == new_vec_cross.elements[2]){
		console.log("The new member one and the original member function version one are the same,the test passed")
	}
	

	//============================================================
	// Learning Activity: Make some simple quaternions for testing
	//============================================================
	//--q0: a LONG Quaternion (magnitude larger than 1) that rotates by +30 degrees around +X axis
	console.log("------q0----------");
	var q0 = new Quaternion(5,5,5,1);		
	console.log('constructor: q0(x,y,z,w)=', 
	q0.x, q0.y, q0.z, q0.w);
	// test length if it is long enough(maginitude larger than 1)
	console.log('q0.length()=', q0.length().toFixed(res));
	if (q0.length() > 1){
		console.log("it is a long quaternion")
	}
	//roate q0
	q0.setFromAxisAngle(1,0,0, 30.0);	
	console.log('q0 after rotate 30 degrees around x aixs', q0.x.toFixed(res), q0.y.toFixed(res), q0.z.toFixed(res), q0.w.toFixed(res));

	
	// test normalization
	q0.normalize();
	console.log('q0.normalize()=', 
	q0.x.toFixed(res), q0.y.toFixed(res), q0.z.toFixed(res), q0.w.toFixed(res));
	console.log('q0.length()=', q0.length().toFixed(res));


	//--q1: a SHORT Quaternion (magnitude less than 1) that rotates by -45 degrees around the +Z axis
	console.log('-------q1--------');
	var q1 = new Quaternion(0,0,0.5,0.5);
	console.log('constructor: q1(x,y,z,w)=', 
	q1.x, q1.y, q1.z, q1.w);
	// test length if it is long enough(maginitude larger than 1)
	console.log('q1.length()=', q1.length().toFixed(res));
	if (q1.length() < 1){
		console.log("it is a shot quaternion")
	}
	//rotate q1
	q1.setFromAxisAngle(0,0,1, -45.0);
	console.log('q1 after rotate -45 degrees around z aixs', q1.x.toFixed(res), q1.y.toFixed(res), q1.z.toFixed(res), q1.w.toFixed(res));
	
	
	// test normalization
	q1.normalize();
	console.log('q1.normalize()=', 
	q1.x.toFixed(res), q1.y.toFixed(res), q1.z.toFixed(res), q1.w.toFixed(res));
	console.log('q1.length()=', q1.length().toFixed(res));

	//--q2: a Quaternion that rotates by +90 degrees around the (1,1,1) axis
	console.log('-------q2--------');
	var q2 = new Quaternion(1,1,1,1);
	console.log('constructor: q0(x,y,z,w)=', 
	q2.x, q2.y, q2.z, q2.w);
	//rotate q2
	q2.setFromAxisAngle(1,1,1, 90.0);
	console.log('q1 after rotate 90 degrees around (1,1,1) aixs', q2.x.toFixed(res), q2.y.toFixed(res), q2.z.toFixed(res), q2.w.toFixed(res));

	// test normalization
	q2.normalize();
	console.log('q2.normalize()=', 
	q2.x.toFixed(res), q2.y.toFixed(res), q2.z.toFixed(res), q2.w.toFixed(res));
	console.log('q2.length()=', q2.length().toFixed(res));

	//============================================================
	// Learning Activity: Convert q0 and q1 to rotation matrices R0 and R1.
	//============================================================
	var R0 = new Matrix4();
	var R1 = new Matrix4();
	//test R0
	R0.setFromQuat(q0.x, q0.y, q0.z, q0.w);
	R0.printMe();
	console.log('YES! AGREES with online quaternion calculator!');
	//test R1
	R1.setFromQuat(q1.x, q1.y, q1.z, q1.w);
	R1.printMe();
	console.log('YES! AGREES with online quaternion calculator!');

	//============================================================
	// Learning Activity: Use Matrix4.concatenate() function
	//============================================================
	var R01 = R0.concat(R1);
	console.log('R01 as matrix: (+x <== +z)(+y <== +x )(+z <== +y');
	R01.printMe();
	R0.setFromQuat(q0.x, q0.y, q0.z, q0.w);
	var R10 = R1.concat(R0);
	console.log('R10 as matrix: (+x <== +z)(+y <== +x )(+z <== +y');
	R10.printMe();

	//============================================================
	// Learning Activity: use quaternion multiply function
	//============================================================

	// Test quaternion multiply: 
	var q01 = new Quaternion;
	var q10 = new Quaternion;

	console.log('-------q01--------')
	q01.multiply(q0,q1);
	console.log(' q01: q0* q1=');
	q01.printMe();
	console.log('q01 length', q01.length())


	console.log('-------q10--------')
	q10.multiply(q1,q0);
	console.log(' q10: q1* q0=');
	q10.printMe();
	console.log('q10 length', q10.length())

	//--Convert q01 and q10 to rotation matrices; 
	var q01R = new Matrix4();
	q01R.setFromQuat(q01.x, q01.y, q01.z, q01.w);
	console.log('q01R as matrix: (+x <== +z)(+y <== +x )(+z <== +y');
	q01R.printMe();

	var q10R = new Matrix4();
	q10R.setFromQuat(q10.x, q10.y, q10.z, q10.w);
	console.log('q10R as matrix: (+x <== +z)(+y <== +x )(+z <== +y');
	q10R.printMe();
	//Do these match the online calculator's results?: Ans: yes
	console.log('YES! AGREES with online quaternion calculator!');
	//Which quaternions (q10 or q10) yields a rotation matrix that matches R01? R10? Why?
	console.log('two quaternions yields a rotation matrix that matches R01 abd R10');
	//============================================================
	// Some more new testings
	//============================================================
	//first rotate then transform
	console.log("-----below is the some more explorations on quaternions-----")
	console.log('--------test rotating before transforming-------');
	var q3 = new Quaternion(1,1,1,1); 	
	var q4 = new Quaternion(1,1,1,1); 
	console.log('q4',q4.x.toFixed(res), q4.y.toFixed(res), q4.z.toFixed(res), q4.w.toFixed(res));
	console.log('q3',q3.x.toFixed(res), q3.y.toFixed(res), q3.z.toFixed(res), q3.w.toFixed(res));
	var q3_rotate = q3.setFromAxisAngle(1,0,0,45);
	console.log('first rotating around the x aixs about 45 degrees', q3_rotate.x.toFixed(res), q3_rotate.y.toFixed(res), q3_rotate.z.toFixed(res), q3_rotate.w.toFixed(res))
	var q3_translate = q3_rotate.multiply(q3_rotate,q4);
	console.log('q3 trasnlated by q4', q3_translate.x.toFixed(res), q3_translate.y.toFixed(res), q3_translate.z.toFixed(res), q3_translate.w.toFixed(res));
	// first transform then rotate
	console.log('-------test rotating after transforming-------');
	var q3 = new Quaternion(1,1,1,1); 	
	var q4 = new Quaternion(1,1,1,1); 
	console.log('q4',q4.x.toFixed(res), q4.y.toFixed(res), q4.z.toFixed(res), q4.w.toFixed(res));
	console.log('q3',q3.x.toFixed(res), q3.y.toFixed(res), q3.z.toFixed(res), q3.w.toFixed(res));
	var q3_translate = q3_rotate.multiply(q3_rotate,q4);
	console.log('first q3 trasnlated by q4', q3_translate.x.toFixed(res), q3_translate.y.toFixed(res), q3_translate.z.toFixed(res), q3_translate.w.toFixed(res));
	var q3_rotate = q3_translate.setFromAxisAngle(1,0,0,45);
	console.log('then rotating around the x aixs about 45 degrees', q3_rotate.x.toFixed(res), q3_rotate.y.toFixed(res), q3_rotate.z.toFixed(res), q3_rotate.w.toFixed(res))
	console.log('these two are totally different, the reason is because of the different orders applied.')

}
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

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
  console.log('Hey! we have all our shaders initialized!');

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw a point
  gl.drawArrays(gl.POINTS, 0, 1);

 /*
  //============================================================
  // Lets play around with Vector4 objects:
  //============================================================
  
  var aVec = new Vector4();   
  var bVec = new Vector4();
  aVec[0] = 4.0; aVec[1] = 3.0; aVec[2] = 2.0; aVec[3] = 0.0;   
  bVec[0] = 1.0; bVec[1] = 2.0; bVec[2] = 3.0; bVec[3] = 0.0;
  // x,y,z,w=0 (vector, not point)
  console.log('\n---------------Vector4 Ops------------\n');
  res = 3;		// number of digits we will print on console log
  tmp = aVec;	// (temporary var so we don't change aVec or bVec)
  console.log('aVec: x=', tmp[0].toFixed(res), 
										'y=', tmp[1].toFixed(res), 
									  'z=', tmp[2].toFixed(res), 
									 	'w=', tmp[3].toFixed(res),'\n');
  tmp = bVec;
  console.log('bVec: x=', tmp[0].toFixed(res), 
										'y=', tmp[1].toFixed(res), 
										'z=', tmp[2].toFixed(res), 
									 	'w=', tmp[3].toFixed(res),'\n');
	console.log('or equivalently, in the cuon-matrix-quat03.js library');
	console.log('you will find \'printMe()\' fcns for Vector4, Matrix4, and Quaternion objects.');
	console.log('aVec.printMe() yields:');
	aVec.printMe();
	console.log('bVec.printMe() yields:');
	bVec.printMe();
	console.log('Add more tests of your own--see HTML file for instructions...');
	// You add more here ... see our HTML file for instructions...
*/	
	
/*
  //============================================================
	// Lets play around with Matrix4 objects
  //============================================================
  var aMat = new Matrix4();
	aMat.setIdentity();
	var mySiz = 3000;
	var count;
	
	console.log('Rotate aMat by (360/'+mySiz+') degrees\n around the (1,3,5) axis,'+mySiz+' times:');
	for(count = 0; count < mySiz; count++) {
			aMat.rotate(-360.0/mySiz, 1.0, 3.0, 5.0);
		}
		console.log('Result SHOULD be a perfect identity matrix, but it is not:');
		aMat.printMe();
		console.log('Instead, this degenerate matrix accumulated errors that');
		console.log('cause other, unpredictable, non-rotation transforms.  BAD!');
		console.log('THUS you should never use matrix multiplies to combine a');
		console.log('long series of rotations.  Instead, use quaternions.');
		console.log('NOTE: open the .js file and the HTML file; \n Plenty to explore, comment & uncomment!');
*/



	//============================================================
	//  Let's play around with Quaternion objects
	//============================================================
	/* I found these Quaternion member functions:
				Constructor: Quaternion(x,y,z,w);
				clear();
				copy(q);
--> 		printMe();
-->			setFromAxisAngle(ax, ay, az, angleDeg);
				UNFINISHED: setFromEuler(AlphaDeg, BetaDeg, gammaDeg);
-->			setFromRotationMatrix(m);
				calculateW();
				inverse();
				length();
-->			normalize();
				multiplySelf(quat2);
-->			multiply(q1,q2);
				multiplyVector3(vec, dest);
				slerp(qa,ab,qm,t);
	I also found this Matrix4 member:
			setFromQuat(qx,qy,qz,qw);
	*/	
		
/*
	console.log('------------------Try some Quaternions--------------------');
// GLOBAL variables:
var q0 = new Quaternion(); 	
var q1 = new Quaternion();
var R0 = new Matrix4();
var R1 = new Matrix4();
	console.log('q0 made with empty constructor:');
	q0.printMe();
	console.log('convert this default q0 to matrix R0; makes identity matrix:');
	R0.setFromQuat(q0.x, q0.y, q0.z, q0.w);
	R0.printMe();
	console.log('YES! AGREES with online quaternion calculator!');
	console.log('set q0 to axis 2,0,0; +30deg.-----------------');
	console.log('Call setFromAxisAngle(2,0,0, 30.0) -- it always creates a UNIT quaternion:');
	q0.setFromAxisAngle(2,0,0, 30.0);
	q0.printMe();
	console.log('q0 length==',q0.length());
	console.log('convert q0 to matrix R0:');
	R0.setFromQuat(q0.x, q0.y, q0.z, q0.w);
	R0.printMe();
	console.log('YES! AGREES with online quaternion calculator!');
	console.log('set q1 to axis 0,0,0.2; -45deg.---------------');
	q1.setFromAxisAngle(0,0,0.2, -45.0);
	q1.printMe();
	console.log('q1 length==',q0.length());
	console.log('convert q1 to matrix R1:');
	R1.setFromQuat(q1.x, q1.y, q1.z, q1.w);
	R1.printMe();
	console.log('YES! AGREES with online quaternion calculator!');
	*/
	
	/*
	*
	*
	*  YOU write the rest ...
	*  (Be sure you try the quaternion multiply vs. matrix multiply)
	*
	*/

	testQuaternions();
	}
