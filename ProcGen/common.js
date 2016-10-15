/////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
//Javascript Helpers

///Add a set of gridlines to a given SVG
///Returns the group that was added.
function addGridLines(id, start, end, step) {
	var elem = $("#"+id);
	var group = $("<g></g>");
	group.addClass("graph-lines");
	if (!step) { step = 1.0; }
	if (!end) { end = start + step * 10.0; }
	var width = step / 40;
	
	for (var y = start; y <= end; y+=step) {
		var line = $("<line />");
		line.attr("stroke-width", width);
		line.attr("y1", y);
		line.attr("y2", y);
		line.attr("x1", start);
		line.attr("x2", end);
		group.append(line);
	}
	
	for (var x = start; x <= end; x+=step) {
		var line = $("<line />");
		line.attr("stroke-width", width);
		line.attr("x1", x);
		line.attr("x2", x);
		line.attr("y1", start);
		line.attr("y2", end);
		group.append(line);
	}
	
	elem.prepend(group);
	return group;
}

///Refresh a given SVG element
///Modifying a SVG with jQuery does not properly refresh
///So this must be called once all modifications are complete.
function refreshSVG(id) {
	var elem = $("#"+id);
	$("#"+id).html(elem.html());
}

///Makes all images clickable, so they open in a new tab.
function clickableImages() {
	var imgs = $("img");
	imgs.each(function(i){
		var a = $("<a></a>");
		var i = $("<img></img>");
		a.attr("href", $(this).attr("src"));
		a.attr("target", "_blank");
		i.attr("src", $(this).attr("src"));
		a.append(i);
		$(this).replaceWith(a);
	});
}

///Is the given element in the view of the page
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

///Map of present fragments by their names
var frags = {};

///Constantly refresh GL Context fragment
function redrawFragment(ctx, prog, rate) {
	setInterval( () => {
		if (isElementInView(ctx.canvas)) {
			ctx.drawFrag(prog);
		}
	}, rate );
}
var frameRate = 50;

///Gets a GL Context, and renders a shader repeatidly
function startFrag(id, progData, uniforms) {
	var ctx = new GLContext(id);
	var prog = ctx.compile(progData);
	ctx.setUniforms(prog, uniforms);
	redrawFragment(ctx, prog, 1000/frameRate);
	frags[id] = {id, prog, ctx, progData, uniforms};
}

///Gets a GL Context, and renders a shader once
function drawFrag(id, progData, uniforms) {
	var ctx = new GLContext(id);
	var prog = ctx.compile(progData);
	ctx.setUniforms(prog, uniforms);
	ctx.drawFrag(prog);
	frags[id] = {id, prog, ctx, progData, uniforms};
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

/////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
//GLSL code
///Standard header with common defines, and uniform variables.
var stdHeader = `
precision mediump float;
#define PI 3.14159265359
uniform vec2 resolution;
uniform float time;`;

/////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///Noise primitive, built to be compatable with GLSL Sandbox.
var noisePrim = `
//Default noise values (Defines, fixed values)
#define SCALE 2.0
#define SEED 1333.0
#define OCTAVES 6
#define PERSISTENCE 0.65

//Uniforms vars for noise (Global, set by context, shared by all pixels)
uniform float seed;
uniform float scale;
uniform float persistence;

//Local noise variables (Local, Each pixel has their own)
float _seed;
float _scale;
float _persistence;

//Reset local variables to context's values
void resetNoise() {
	_seed = seed;
	_scale = scale;
	_persistence = persistence;
}

//Reset local variables to default #define'd values
void defaultNoise() {
	_seed = SEED;
	_scale = SCALE;
	_persistence = PERSISTENCE;
}

//1d Hash
float hash(float n) { return fract(sin(n)*_seed); }

//3d hash (uses 1d hash at prime scale offsets for y/z)
float hash3(vec3 v) { return hash(v.x + v.y * 113.0 + v.z * 157.0); }
//Quick 3d smooth noise
float noise(vec3 x) {
	vec3 p = floor(x);
	vec3 f = fract(x);
	f       = f*f*(3.0-2.0*f);
	float n = p.x + p.y*157.0 + 113.0*p.z;

	return mix(mix(	mix( hash(n+0.0), hash(n+1.0),f.x),
			mix( hash(n+157.0), hash(n+158.0),f.x),f.y),
		   mix(	mix( hash(n+113.0), hash(n+114.0),f.x),
			mix( hash(n+270.0), hash(n+271.0),f.x),f.y),f.z);
}
`;
/////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
//Normalized Fractal Noise
var nnoise = `
float nnoise(vec3 pos, float factor) {	
	float total = 0.0
		, frequency = _scale
		, amplitude = 1.0
		, maxAmplitude = 0.0;
	
	//Accumulation
	for (int i = 0; i < OCTAVES; i++) {
		total += noise(pos * frequency) * amplitude;
		frequency *= 2.0, maxAmplitude += amplitude;
		amplitude *= _persistence;
	}
	
	//Normalization
	float avg = maxAmplitude * .5;
	if (factor != 0.0) {
		float range = avg * clamp(factor, 0.0, 1.0);
		float mmin = avg - range;
		float mmax = avg + range;
		
		float val = clamp(total, mmin, mmax);
		return val = (val - mmin) / (mmax - mmin);
	} 
	
	if (total > avg) { return 1.0; }
	return 0.0;
}
//Default normalization factor of .5
//This maps the range (.25,.75) to (0, 1)
float nnoise(vec3 pos) { return nnoise(pos, .5); }`;

/////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
//Difference Noise
var diffNoise =`
//Absolute difference
float diff(float a, float b) { return abs(a-b); }
//Fractal difference noise, samples once and applies difference 4 times.
float diffNoise(vec3 pos) {
	float v = nnoise(pos);
	for (int i = 0; i < 3; i++) {
		pos.z += 2.0;
		v = diff(v, nnoise(pos));
	}
	return v;	
}`;

/////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
//Some simple image processing 'filters'
//Derived from photoshop filters 'levels' and 'curves'
var filters = `
//Maps a value from one range to a new range
float map(float val, float olda, float oldb, float newa, float newb) {
	float oldRange = olda-oldb;
	float newRange = newa-newb;
	float p = (val - olda) / oldRange;
	return newa + (newRange * p);
}
//Curves 
//Output peak (1) in the middle (.5)
//Outputs nothing (0) at the edges (0, 1)
float curvesMid(float val) {
	val = clamp(val, 0.0, 1.0);
	if (val < .5) {
		val = map(val, 0.0, .5, .0, 1.);	
	} else {
		val = map(val, .5, 1., 1., 0.);	
	}
	return val;
}
//Levels adjustment. Performs a clamp on the first range, and then a map.
float levels(float val, float a, float b, float c, float d) {
	val = clamp(val, a, b);
	return map(val, a,b,c,d);
}`;

//Slower, modular voroni noise.
var voroniHeader = `
//Mode constants
#define NORMAL 0
#define MANHATTAN 1

float voroni(vec3 v, vec3 shift, vec4 comp, int distMode) {
	//Integer and fractional components
	vec3 p = floor(v);
	vec3 f = fract(v);
	
	//Closest point distances
	vec3 closest = vec3(2.0);
	
	//Loop over the (4x4x4) local neighborhood
	for (int k = -1; k <= 2; k++) {
		for (int j = -1; j <= 2; j++) {
			for (int i = -1; i <= 2; i++) {
				//Offset of current sample
				vec3 sampleOffset = vec3(i,j,k);
				//Difference to current feature point
				vec3 featurePoint = sampleOffset - f + (shift * hash3(p + sampleOffset));
				
				float dist = 0.0;
				//Different distance modes
				if (distMode == MANHATTAN) {
					//Uses the highest cardinal direction distance
					featurePoint = abs(featurePoint);
					dist = max(max(featurePoint.x, featurePoint.y), featurePoint.z);
				} else if (distMode == NORMAL) {
					//Otherwise uses the eculidean length
					dist = length(featurePoint);
				}
				
				//Properly track the closest 3 point distances
				if (dist < closest[0]) { closest[2] = closest[1]; closest[1] = closest[0]; closest[0] = dist; }
				else if (dist < closest[1]) { closest[2] = closest[1]; closest[1] = dist; }
				else if (dist < closest[2]) { closest[2] = dist; }
			}
		}
	}
	//Combine the 3 distances based on the 'comp' parameter
	return comp.w * abs(comp.x * closest.x + comp.y * closest.y + comp.z * closest.z);
}
//Some functions that use the above function with different parameters
float manhattan(vec3 v) { return voroni(v, vec3(1,1,1), vec4(-1,1,.30,1.), MANHATTAN); }
float manhattan3(vec3 v) { return voroni(v, vec3(1,1,1), vec4(-1,.5,.5,1.7), MANHATTAN); }
float voroni1f(vec3 v) { return voroni(v, vec3(1,1,1), vec4(1,0,0,.8), NORMAL); }
float voroni2f(vec3 v) { return voroni(v, vec3(1,1,1), vec4(0,1,0,.8), NORMAL); }
float worley(vec3 v) { return voroni(v, vec3(1,1,1), vec4(-1,1,0,1.5), NORMAL); }
`;

//Faster, individual fixed voroni noise functions
//Manhattan distance voroni
var mvoroni = `
float mvoroni(vec3 v) {
	vec3 p = floor(v);
	vec3 f = fract(v);
	
	float closest = 2.0;
	float second = 2.0;
	for (int k = -1; k <= 2; k++) {
		for (int j = -1; j <= 2; j++) {
			for (int i = -1; i <= 2; i++) {
				vec3 sampleOffset = vec3(i,j,k);
				vec3 featurePoint = sampleOffset - f + hash3(p + sampleOffset);
				featurePoint = abs(featurePoint);
				float dist = max(max(featurePoint.x, featurePoint.y), featurePoint.z);
				
				if (dist < closest) { second = closest; closest = dist; }
				else if (dist < second) { second = dist;}
			}
		}
	}	
	
	float val = second - closest;
	return 3. * val ;
}`;

//Closest Point distance voroni
var d1voroni = `
float d1voroni(vec3 v) {
	vec3 p = floor(v);
	vec3 f = fract(v);
	
	float closest = 2.0;
	for (int k = -1; k <= 2; k++) {
		for (int j = -1; j <= 2; j++) {
			for (int i = -1; i <= 2; i++) {
				vec3 sampleOffset = vec3(i,j,k);
				vec3 featurePoint = sampleOffset - f + hash3(p + sampleOffset);
				
				float dist = length(featurePoint);
				if (dist < closest) { closest = dist; }
			}
		}
	}	
	
	return closest * .8;
}`;

//Second Closest Point distance voroni
var d2voroni = `
float d2voroni(vec3 v) {
	vec3 p = floor(v);
	vec3 f = fract(v);
	
	float closest = 2.0;
	float second = 2.0;
	for (int k = -1; k <= 2; k++) {
		for (int j = -1; j <= 2; j++) {
			for (int i = -1; i <= 2; i++) {
				vec3 sampleOffset = vec3(i,j,k);
				vec3 featurePoint = sampleOffset - f + hash3(p + sampleOffset);
				
				float dist = length(featurePoint);
				if (dist < closest) { second = closest; closest = dist; }
				else if (dist < second) { second = dist;}
			}
		}
	}	
	
	return second * .8;
}`;

//Worley noise
var wvoroni = `
float wvoroni(vec3 v) {
	vec3 p = floor(v);
	vec3 f = fract(v);
	
	float closest = 1.0;
	float second = 1.0;
	for (int k = -1; k <= 2; k++) {
		for (int j = -1; j <= 2; j++) {
			for (int i = -1; i <= 2; i++) {
				vec3 sampleOffset = vec3(i,j,k);
				vec3 featurePoint = sampleOffset - f + hash3(p + sampleOffset);
				
				float dist = length(featurePoint);
				if (dist < closest) { second = closest; closest = dist; }
				else if (dist < second) { second = dist; }
			}
		}
	}	
	
	return (second-closest);
}`;

//Idea taken from the tutorial at:
//http://www.quantumpetshop.com/tutorials/camo.asp
var camo = stdHeader + noisePrim + nnoise + diffNoise + `
#define TAN vec4(125.0/255.0, 110.0/255.0, 75.0/255.0, 1.0)
#define BROWN vec4(70.0/255.0, 50.0/255.0, 15.0/255.0, 1.0)
#define GREEN vec4(50.0/255.0, 60.0/255.0, 25.0/255.0, 1.0)

uniform vec4 color1;
uniform vec4 color2;
uniform vec4 color3;
uniform vec4 color4;
uniform vec4 clips;

void main( void ) {
	resetNoise();
	vec2 uv = ( gl_FragCoord.xy / resolution.xy ) - .5;
	uv += vec2(sin(time), cos(time)) * .5;
	uv += vec2(time * .2);
	vec3 pos = vec3(uv, 0) * 5.0;
	
	vec4 c;
	float clip4 = diffNoise(pos);
	if (clip4 < clips.w) {
		pos.z += 3.0;
		float clip3 = diffNoise(pos);
		if (clip3 < clips.z) {
			pos.z -= 5.0;
			float clip2 = diffNoise(pos);
			if (clip2 > clips.y) {
				c = color1;
			} else { 
				c = color2; 
			}
		} else {
			c = color3;
		}
		
	} else {
		c = color4;
	}
	
	gl_FragColor = c;
}`;


