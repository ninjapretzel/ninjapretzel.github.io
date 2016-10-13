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

function isElementInView(element, fullyInView) {
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

var frags = {};

function redrawFragment(ctx, prog, rate) {
	setInterval( () => {
		if (isElementInView(ctx.canvas)) {
			ctx.drawFrag(prog);
		}
	}, rate );
}
var frameRate = 50;
function startFrag(id, progData, uniforms) {
	var ctx = new GLContext(id);
	var prog = ctx.compile(progData);
	ctx.setUniforms(prog, uniforms);
	redrawFragment(ctx, prog, 1000/frameRate);
	frags[id] = {id, prog, ctx, progData, uniforms};
}

function drawFrag(id, progData, uniforms) {
	var ctx = new GLContext(id);
	var prog = ctx.compile(progData);
	ctx.setUniforms(prog, uniforms);
	ctx.drawFrag(prog);
	frags[id] = {id, prog, ctx, progData, uniforms};
}

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

var stdHeader = `
precision mediump float;
#define PI 3.14159265359
uniform vec2 resolution;
uniform float time;`;
var noisePrim = `
#define SCALE 2.0
#define SEED 1333.0
#define OCTAVES 6
#define PERSISTENCE 0.65

uniform float seed;
uniform float scale;
uniform float persistence;

float _seed;
float _scale;
float _persistence;
void resetNoise() {
	_seed = seed;
	_scale = scale;
	_persistence = persistence;
}

void defaultNoise() {
	_seed = SEED;
	_scale = SCALE;
	_persistence = PERSISTENCE;
}

float hash(float n) { return fract(sin(n)*_seed); }
float hash3(vec3 v) { return hash(v.x + v.y * 113.0 + v.z * 157.0); }
float lerp(float a, float b, float x) { return a + (b-a) * x; }
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
var nnoise = `
float nnoise(vec3 pos, float factor) {	
	float total = 0.0
		, frequency = _scale
		, amplitude = 1.0
		, maxAmplitude = 0.0;
	
	for (int i = 0; i < OCTAVES; i++) {
		total += noise(pos * frequency) * amplitude;
		frequency *= 2.0, maxAmplitude += amplitude;
		amplitude *= _persistence;
	}
	
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
float nnoise(vec3 pos) { return nnoise(pos, .5); }`;

var diffNoise =`
float diff(float a, float b) { return abs(a-b); }
float diffNoise(vec3 pos) {
	float v = nnoise(pos);
	for (int i = 0; i < 3; i++) {
		pos.z += 2.0;
		v = diff(v, nnoise(pos));
	}
	return v;	
}`;

var filters = `
float map(float val, float olda, float oldb, float newa, float newb) {
	float oldRange = olda-oldb;
	float newRange = newa-newb;
	float p = (val - olda) / oldRange;
	return newa + (newRange * p);
}
float curvesMid(float val) {
	val = clamp(val, 0.0, 1.0);
	if (val < .5) {
		val = map(val, 0.0, .5, .0, 1.);	
	} else {
		val = map(val, .5, 1., 1., 0.);	
	}
	return val;
}
float levels(float val, float a, float b, float c, float d) {
	val = clamp(val, a, b);
	return map(val, a,b,c,d);
}`;

var voroniHeader = `
#define NORMAL 0
#define MANHATTAN 1
vec3 _shift = vec3(1);
float voroni(vec3 v, vec3 shift, vec4 comp, int distMode) {
	vec3 p = floor(v);
	vec3 f = fract(v);
	
	vec3 closest = vec3(2.0);

	for (int k = -1; k <= 2; k++) {
		for (int j = -1; j <= 2; j++) {
			for (int i = -1; i <= 2; i++) {
				vec3 sampleOffset = vec3(i,j,k);
				vec3 featurePoint = sampleOffset - f + (shift * hash3(p + sampleOffset));
				
				float dist = 0.0;
				if (distMode == MANHATTAN) {
					featurePoint = abs(featurePoint);
					dist = max(max(featurePoint.x, featurePoint.y), featurePoint.z);
				} else if (distMode == NORMAL) {
					dist = length(featurePoint);
				}
				
				if (dist < closest[0]) { closest[2] = closest[1]; closest[1] = closest[0]; closest[0] = dist; }
				else if (dist < closest[1]) { closest[2] = closest[1]; closest[1] = dist; }
				else if (dist < closest[2]) { closest[2] = dist; }
			}
		}
	}
	return comp.w * (comp.x * closest.x + comp.y * closest.y + comp.z * closest.z);
}
float manhattan(vec3 v) { return voroni(v, vec3(1,1,0), vec4(-1,1,0,1), MANHATTAN); }
float voroni1f(vec3 v) { return voroni(v, vec3(1,1,1), vec4(1,0,0,1), NORMAL); }
float voroni2f(vec3 v) { return voroni(v, vec3(1,1,1), vec4(0,1,0,1), NORMAL); }
float worley(vec3 v) { return voroni(v, vec3(1,1,1), vec4(-1,1,0,1), NORMAL); }
`;


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


