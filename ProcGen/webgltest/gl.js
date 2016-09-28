
function GLContext(canvasID) {
	this.canvas = document.getElementById(canvasID);
	this.gl = this.canvas.getContext("webgl");
	
	if (!this.gl) { console.log("Welp, no webgl for yuo"); return; }
	console.log("webgl successfully started in (#" + canvasID + ")");
	this.start = new Date().getTime();
}
GLContext.prototype.defaultVertCode = 
`
attribute vec4 position;
void main() {
	gl_Position = position;
}`;

GLContext.prototype.screenClipVerts = [ 
	-1, -1,		1, -1,		-1, 1, 
	1, -1,		-1, 1,		1, 1,
];

GLContext.prototype.shader = function(type, source) {
	var gl = this.gl;
	var s = gl.createShader(type);
	gl.shaderSource(s, source);
	gl.compileShader(s);
	var success = gl.getShaderParameter(s, gl.COMPILE_STATUS);
	if (success) { return s; }
	console.log("Shader Compile FAIL: " + gl.getShaderInfoLog(s));
	gl.deleteShader(s);
}

GLContext.prototype.program = function(vert, frag) {
	var gl = this.gl;
	var p = gl.createProgram();
	gl.attachShader(p, vert);
	gl.attachShader(p, frag);
	gl.linkProgram(p);
	
	var success = gl.getProgramParameter(p, gl.LINK_STATUS);
	if (success) { return p; }
	
	console.log("Program link FAIL: " + gl.getProgramInfoLog(p));
	gl.deleteProgram(p);
}

GLContext.prototype.compile = function(source) {
	var gl = this.gl;
	if (!gl) { console.log("loadShaders: Failed, WebGL not initialized."); return; }
	var vertCode = source.vert;
	var fragCode = source.frag;
	if (!vertCode) { vertCode = this.defaultVertCode; }
	
	var atts = source.atts;
	if (!atts) { atts = {}; }
	
	var vertShader = this.shader(gl.VERTEX_SHADER, vertCode);
	var fragShader = this.shader(gl.FRAGMENT_SHADER, fragCode);
	var prog = this.program(vertShader, fragShader);
	
	if (prog) { return prog; }
}


GLContext.prototype.drawFrag = function(prog) {
	var gl = this.gl;
	var size = 2;
	var type = gl.FLOAT;
	var normalize = false;
	var stride = 0;
	var offset = 0;
	var paloc = gl.getAttribLocation(prog, "position");
	var resLoc = gl.getUniformLocation(prog, "resolution");
	var timeLoc = gl.getUniformLocation(prog, "time");
	
	var pbuff = gl.createBuffer();
	var width = gl.canvas.width;
	var height = gl.canvas.height;
	
	gl.bindBuffer(gl.ARRAY_BUFFER, pbuff);
	gl.bufferData(gl.ARRAY_BUFFER, 
				  new Float32Array(this.screenClipVerts), 
				  gl.STATIC_DRAW);
	
	gl.enableVertexAttribArray(paloc);
	gl.vertexAttribPointer(paloc, size, type, normalize, stride, offset);
	
	gl.viewport(0, 0, width, height);
	gl.useProgram(prog);
	
	var now = new Date().getTime();
	var time = (now - this.start) / 1000.0;
	
	if (timeLoc) { gl.uniform1f(timeLoc, time); }
	if (resLoc) { gl.uniform2f(resLoc, width, height); }
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	
	
}




var start;
function load(canvasID) {
	var canvas = document.getElementById(canvasID);
	var gl = canvas.getContext("webgl");
	
	if (!gl) { console.log("Welp, no webgl for yuo"); return; }
	start = new Date().getTime();
}






















