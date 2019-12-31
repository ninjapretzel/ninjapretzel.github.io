let frameRate = 50;
let drawCount = 0;
let drawDebug = 0;

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

function exists(val) { return val !== null && val !== undefined; }
function isNumber(v) { return typeof(v) === 'number'; }
function isArray(v) { return Array.isArray(v); }
function isObject(v) { return typeof(v) === 'object' && !isArray(v); }

GLContext.prototype.setUniforms = function(prog, data) {
	if (!prog) { prog = this.prog; }
	if (!data) { data = this.uniforms; }
	for (var key in data) {
		if (!data.hasOwnProperty(key)) { continue; }
		
		var val = data[key];
		this.setUniform(prog, key, val);
	}	
}

GLContext.prototype.setUniform = function(prog, name, val){
	var gl = this.gl;
	gl.useProgram(prog);
	//console.log(`setting unifrom ${name} to ${val}`)
	var loc = gl.getUniformLocation(prog, name);
	if (!loc) { return false; }
	
	var arr = null;
	
	if (isNumber(val)) { 
		gl.uniform1f(loc, val);
		return true;
	} else if (isArray(val)) {
		arr = val;
	} else if (isObject(val)) {
		arr = [];
		if (exists(val.x)) {
			arr.push(val.x);
			if (exists(val.y)) {
				arr.push(val.y);
				if (exists(val.z)) {
					arr.push(val.z);
					if (exists(val.w)) {
						arr.push(val.w);
					}
				}
			}
		} else if (exists(val.r)) {
			arr.push(val.r);
			if (exists(val.g)) {
				arr.push(val.g);
				if (exists(val.b)) {
					arr.push(val.b);
					if (exists(val.a)) {
						arr.push(val.a);
					}
				}
			}
		}
	}
	if (arr) {
		let kind = arr[0];
		if (uniformVecTypes[kind]) {
			let info = uniformVecTypes[kind];
			let count = arr[1];
			
			let s = arr.slice(2);
			if (drawCount < drawDebug) {
				console.log(`Setting array: ${name} to ${s} with ${info.func}`);
			}
			
			if (s.length >= info.size && s.length % info.size == 0) {
				gl[info.func](loc, s);
			} else {
				if (s.length % info.size != 0) {
					console.warn(`Uniform ${name} does not have a size that is a multiple of ${info.size}`)
				}
			}
		} else if (arr.length == 4) {
			if (drawCount < drawDebug) {
				console.log(`setting ${name} to ${arr} with gl.uniform4f`)
			}
			gl.uniform4f(loc, arr[0], arr[1], arr[2], arr[3]);
		} else if (arr.length == 3) {
			if (drawCount < drawDebug) {
				console.log(`setting ${name} to ${arr} with gl.uniform4f`)
			}
			gl.uniform3f(loc, arr[0], arr[1], arr[2]);
		} else if (arr.length == 2) {
			if (drawCount < drawDebug) {
				console.log(`setting ${name} to ${arr} with gl.uniform4f`)
			}
			gl.uniform2f(loc, arr[0], arr[1]);
		} else {
			if (drawCount < drawDebug) {
				console.log(`setting ${name} to ${arr} with gl.uniform4f`)
			}
			gl.uniform1f(loc, arr[0]);
		}
		return true;
	}
	return false;
}
GLContext.prototype.screenClipVerts = [ 
	-1, -1,		1, -1,		-1, 1, 
	1, -1,		-1, 1,		1, 1,
];

function printLines(str) {
	var sbuild = "";
	var lines = str.split("\n");
	
	for (var i = 0; i < lines.length; i++) {
		var line = (1+i);
		while (line.length < 4) { line = " " + line; }
		
		line += ": " + lines[i];
		
		sbuild += line + '\n';
	}
	
	console.log(sbuild);
}
GLContext.prototype.shader = function(type, source) {
	var gl = this.gl;
	var s = gl.createShader(type);
	gl.shaderSource(s, source);
	gl.compileShader(s);
	var success = gl.getShaderParameter(s, gl.COMPILE_STATUS);
	if (success) { return s; }
	console.log("Shader Compile FAIL: " + gl.getShaderInfoLog(s));
	printLines(source);
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
	console.log("loadShaders: Finished cmpiling.");
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
	
	this.setUniform(prog, "time", time);
	this.setUniform(prog, "resolution", [width, height]);
	
	if (timeLoc) { gl.uniform1f(timeLoc, time); }
	if (resLoc) { gl.uniform2f(resLoc, width, height); }
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	drawCount++;
	
}

// Kind should be (float, vec2, vec3, vec4, int, ivec2, ivec3, ivec4)
// All of these are considered vectors.
const uniformVecTypes = { 
	float:	{ func: "uniform1fv", size: 1, },
	int:	{ func: "uniform1iv", size: 1, },
	vec2:	{ func: "uniform2fv", size: 2, },
	ivec2:	{ func: "uniform2iv", size: 2, },
	vec3:	{ func: "uniform3fv", size: 3, },
	ivec3:	{ func: "uniform3iv", size: 3, },
	vec4:	{ func: "uniform4fv", size: 4, },
	ivec4:	{ func: "uniform4iv", size: 4, },
}
function fillUniform(dest, src, kind, max) {
	let typeInfo = uniformVecTypes[kind];
	// Clear destination
	dest.length = 0;
	dest[0] = kind;
	dest[1] = src.length;
	for (let i = 0; i < src.length; i++) {
		let val = src[i];
		if (isArray(val)) {
			for (let k = 0; k < val.length && k < typeInfo.size; k++) {
				dest[dest.length] = val[k];
			}
		}
	}
	/*
	let total = max*typeInfo.size;
	console.log(`Adding to ${total}, size is ${dest.length}`)
	for (let i = dest.length; i < total+2; i++) {
		dest[i] = 0;
	}//*/
}


var start;
function load(canvasID) {
	var canvas = document.getElementById(canvasID);
	var gl = canvas.getContext("webgl");
	
	if (!gl) { console.log("Welp, no webgl for yuo"); return; }
	start = new Date().getTime();
}


function isElementInView(element) {
	var pageTop = $(window).scrollTop();
	var pageBottom = pageTop + window.innerHeight;
	
	var elementTop = $(element).offset().top;
	var elementBottom = elementTop + $(element).height();
	
	if ((elementBottom >= pageTop && elementBottom <= pageBottom) ||
		(elementTop <= pageBottom && elementTop >= pageTop)) {
		return true;	
	}
	
	
	return false;
}




///Takes a valid hex string and returns an array with the RGBA component values
function hexToColor(hex) {
	hex = hex.replace("#", "");
	//console.log(hex + " : " + hex.length);
	var vals = [];
	if (hex.length == 3) {
		vals.push( parseInt("0x"+hex.substring(0,1)) / 15 );
		vals.push( parseInt("0x"+hex.substring(1,2)) / 15 );
		vals.push( parseInt("0x"+hex.substring(2,3)) / 15 );
		vals.push(1);
	}
	if (hex.length == 4) {
		vals.push( parseInt("0x"+hex.substring(0,1)) / 15 );
		vals.push( parseInt("0x"+hex.substring(1,2)) / 15 );
		vals.push( parseInt("0x"+hex.substring(2,3)) / 15 );
		vals.push( parseInt("0x"+hex.substring(3,4)) / 15 );
	}
	if (hex.length == 6) {
		vals.push( parseInt("0x"+hex.substring(0,2)) / 255 );
		vals.push( parseInt("0x"+hex.substring(2,4)) / 255 );
		vals.push( parseInt("0x"+hex.substring(4,6)) / 255 );
		vals.push(1);
	}
	if (hex.length == 8) {
		vals.push( parseInt("0x"+hex.substring(0,2)) / 255 );
		vals.push( parseInt("0x"+hex.substring(2,4)) / 255 );
		vals.push( parseInt("0x"+hex.substring(4,6)) / 255 );
		vals.push( parseInt("0x"+hex.substring(6,8)) / 255 );
	}
	return vals;
}















