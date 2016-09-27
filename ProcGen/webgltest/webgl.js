var fragCode = `
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;
 
void main() {
  // gl_FragColor is a special variable a fragment shader
  // is responsible for setting
  gl_FragColor = vec4(1, 0, 0.5, 1); // return redish-purple
}
`;
var vertCode = `
// an attribute will receive data from a buffer
attribute vec4 a_position;
 
// all shaders have a main function
void main() {
 
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_position;
}
`;

function shader(gl, type, source) {
	var s = gl.createShader(type);
	gl.shaderSource(s, source);
	gl.compileShader(s);
	var success = gl.getShaderParameter(s, gl.COMPILE_STATUS);
	if (success) { return s; }
	console.log("Shader Compile FAIL: " + gl.getShaderInfoLog(s));
	gl.deleteShader(s);
}

function program(gl, vert, frag) {
	var p = gl.createProgram();
	gl.attachShader(p, vert);
	gl.attachShader(p, frag);
	gl.linkProgram(p);
	
	var success = gl.getProgramParameter(p, gl.LINK_STATUS);
	if (success) { return p; }
	
	console.log("Program link FAIL: " + gl.getProgramInfoLog(p));
	gl.deleteProgram(p);
	
}


$(document).ready(function() {
	var canvas = document.getElementById("c");
	var gl = canvas.getContext("webgl");
	
	if (!gl) { console.log("Welp, no webgl for yuo"); return; }
	
	var vertShader = shader(gl, gl.VERTEX_SHADER, vertCode);
	var fragShader = shader(gl, gl.FRAGMENT_SHADER, fragCode);
	
	var prog = program(gl, vertShader, fragShader);
	
	var paloc = gl.getAttribLocation(prog, "a_position");
	var pbuff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pbuff);
	
	var pos = [
		0, 0,
		0, .5,
		.7, 0,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(paloc);
	var size = 2;
	var type = gl.FLOAT;
	var normalize = false;
	var stride = 0;
	var offset = 0;
	gl.vertexAttribPointer(paloc, size, type, normalize, stride, offset);
	
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.useProgram(prog);
	
	var primType = gl.TRIANGLES;
	var off = 0;
	var cnt = 3;
	gl.drawArrays(primType, off, cnt);
	
});