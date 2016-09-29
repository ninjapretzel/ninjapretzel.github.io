var vertCode = `
attribute vec4 position;
void main() {
	gl_Position = position;
}
`;
var stdHeader = `
precision mediump float;
#define PI 3.14159265359
uniform vec2 resolution;
uniform float time;
`;
var noisePrims = `
#define SCALE 2.0
#define SEED 1333.0
#define OCTAVES 8
#define PERSISTENCE 0.65

float hash(float n) { return fract(sin(n)*SEED); }
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
float nnoise(vec3 pos, float factor) {
	
	float total = 0.0
		, frequency = SCALE
		, amplitude = 1.0
		, maxAmplitude = 0.0;
	
	for (int i = 0; i < OCTAVES; i++) {
		total += noise(pos * frequency) * amplitude;
		frequency *= 2.0, maxAmplitude += amplitude;
		amplitude *= PERSISTENCE;
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
float nnoise(vec3 pos) { return nnoise(pos, .5); }
`;

var fragCode = stdHeader + noisePrims + `
#define ZOOM 4.0
void main() {
	vec2 p = (gl_FragCoord.xy / resolution) - .5;
	p *= ZOOM;	
	p += vec2(cos(time), sin(time)) * 3.0;
	
	float v = nnoise(vec3(p, 0.0));
  	gl_FragColor = vec4(v, v, v, 1);
}`;

var fragCode2 = stdHeader + noisePrims + ` 
#define ZOOM 4.0
void main() {
	vec2 p = (gl_FragCoord.xy / resolution) - .5;
	p *= ZOOM;
	float t = time * .2;
	p += vec2(cos(t), sin(t)) * 3.0;
	vec3 pos = vec3(p, 0.0);
	vec3 rOff = vec3(.27 * sin(03.0 * t + 0.0 * PI / 3.0)); rOff.x *= -1.;
	vec3 gOff = vec3(.35 * sin(03.0 * t + 1.0 * PI / 3.0)); gOff.z *= -1.;
	vec3 bOff = vec3(.48 * sin(03.0 * t + 2.0 * PI / 3.0)); bOff.y *= -1.;
	

	float r = nnoise(pos + rOff);
	float g = nnoise(pos + gOff);
	float b = nnoise(pos + bOff);
	
  	gl_FragColor = vec4(r,g,b, 1);
}`;

//it's complicated...
var fragCode3 = stdHeader + `
//Disgusting mash of tons of different shaders all together
//Star Nest
//Some fractal field
//And some FBM clouds
//Lots of artifacts on cards without high precision for floating point numbers
//Re-subbmitted because couldn't update
//By ninjapretzel & paulandrewlee (Kali)

#define _Color vec4(1.0, 1.0, 1.0, 1.0)
#define _HueShift 0.53
#define _PostSat 0.15

#define _Scroll vec4(1.3, 1.0, -3.6, 0.02)
#define _Center vec4(1.0, 0.3, 0.5, 0.10)
#define _Rotation vec4(31.0, 29.0, 13.0, .001)

#define _Iterations 20
#define _Volsteps 17

#define _Formuparam .417
#define _StepSize .1550
#define _Tile .356000

#define _Brightness 0.00036
#define _Darkmatter .8330
#define _Distfading .6500
#define _Saturation .7700

#define _FieldVec vec3(-0.73, -0.81, -0.82)
#define _FieldPow 41.7

#define _FieldReps 11
#define _FieldReps2 11
#define _FieldSize 5.3
#define _FieldSize2 3.8
#define _FieldBrightness 2.0
#define _FieldBrightness2 1.0
#define _FieldFreq 3.0
#define _FieldFreq2 2.0
#define _FieldHue 0.4
#define _FieldHue2 0.30

#define _NebulaPower 0.785123
#define _DarkNebula 0.250

#define _Seed 331.1337
#define _Octaves 2
#define _Persistence .55
#define _Scale 7.31

#define ZOOM 2.0

//RGB -> HSV color space conversion
vec3 toHSV(vec3 c) {
	float high = max(max(c.r, c.g), c.b);
	if (high <= 0.0) { return vec3(0.0); }
	
	float val = high;
	float low = min(min(c.r, c.g), c.b);
	float delta = high-low;
	float sat = delta/high;
	
	float hue;//br? hue hue hue hue hue hue
	if (c.r == high) { 
		hue = (c.g - c.b) / delta; 
	} else if (c.g == high) { 
		hue = 2.0 + (c.b - c.r) / delta; 
	} else { 
		hue = 4.0 + (c.r - c.g) / delta;
	}
	
	hue /= 6.0;
	if (hue < 0.0) { hue += 1.0; }
	if (hue > 1.0) { hue -= 1.0; }
	
	return vec3(hue, sat, val);
}

//HSV -> RGB color space conversion
vec3 toRGB(vec3 hsv) {
	int i;
	float f, p, q, t;
	float h = mod(hsv.r, 1.0);
	float s = hsv.g;
	float v = hsv.b;
	
	if (s == 0.0) { return vec3(v,v,v); }
	
	h *= 6.0;
	i = int(floor(h));
	f = h - float(i);
	p = v * (1.0 - s);
	q = v * (1.0 - s*f);
	t = v * (1.0 - s * (1.0 - f) );
	
	if (i == 0) { return vec3(v,t,p); }
	else if (i == 1) { return vec3(q,v,p); }
	else if (i == 2) { return vec3(p,v,t); }
	else if (i == 3) { return vec3(p,q,v); }
	else if (i == 4) { return vec3(t,p,v); }
	return vec3(v,p,q);
}

//Simple hue shift (hue hue hue br?)
//Assumes hueshift is inside (0...1)
vec3 shiftHue(vec3 color, float amt) {
	if (amt > 0.0 && amt < 1.0) {
		vec3 hsv = toHSV(color);
		hsv.x += amt;
		return toRGB(hsv);
	}
	return color;
}

//Leaving these as variables instead of strictly #defines
//Lets them be changed easily if multiple noise layers with different parameters are needed.
//_Octaves is fixed so loop can be unrolled.
float persistence;
float seed;
float scale;
void resetNoise() {
	persistence = _Persistence;
	seed = _Seed;
	scale = _Scale;
}
//Simple hash
float hash(float n) { return fract(sin(n)*seed); }
//Fast noise
float noise(vec3 x) {
	vec3 p = floor(x);
	vec3 f = fract(x);
	f       = f*f*(3.0-2.0*f);
	float n = p.x + p.y*157.0 + 113.0*p.z;

	return mix(mix(	mix( hash(n+0.0), hash(n+1.0),f.x),
			mix( hash(n+157.0), hash(n+158.0),f.x),f.y),
		   mix( mix( hash(n+113.0), hash(n+114.0),f.x),
			mix( hash(n+270.0), hash(n+271.0),f.x),f.y),f.z);
}
//Octave noise (FBM)
float onoise(vec3 pos) {
	float total = 0.0
		, frequency = scale
		, amplitude = 1.0
		, maxAmplitude = 0.0;
	
	for (int i = 0; i < _Octaves; i++) {
		total += noise(pos * frequency) * amplitude;
		frequency *= 2.0, maxAmplitude += amplitude;
		amplitude *= persistence;
	}
	
	
	return total / maxAmplitude;
}

///normalized octave noise function, output is in range [0...1]
///factor parameter controls how 'tight' the noise is.
float nnoise(vec3 pos, float factor) {
	float total = 0.0
		, frequency = scale
		, amplitude = 1.0
		, maxAmplitude = 0.0;
	
	for (int i = 0; i < _Octaves; i++) {
		total += noise(pos * frequency) * amplitude;
		frequency *= 2.0, maxAmplitude += amplitude;
		amplitude *= persistence;
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
//Factor of .5 works well in most cases.
float nnoise(vec3 pos) { return nnoise(pos, 0.5); }

//Fractal Field thingy.
float field(vec3 p, float s) {
    float time = time;
	float strength = 3.0 + .1 * sin(time);
	float accum = s/4.;
	float prev = 0.;
	float tw = 0.;
	float fact = pow(4.0, _FieldPow);
	
	for (int i = 0; i < _FieldReps; ++i) {
		float mag = dot(p, p);
		p = abs(p) / mag + _FieldVec.xyz;
		float w = exp(-float(i) / fact);
		accum += w * exp(-strength * pow(abs(mag - prev), 1.2));
		tw += w;
		prev = mag;
	}
	
	return max(0., 5. * accum / tw - .7);
}

//Noise for darkening
vec3 noisedNebula(vec3 pos, vec3 dir) {
	//float ttime = _Center.w + time / 8.0;
	
	float sc = 2.3;
	float x1 = nnoise(pos + dir);
	float x2 = nnoise(pos + dir * sc);
	float x3 = nnoise(pos + dir / sc);
	
	float n = x1 * x2 * x3;
	if (n < _NebulaPower) {
		float v = -(_NebulaPower - n);
		return vec3(v,v,v) * _DarkNebula;
	}
	
	return vec3(0.0);
}

//Modified StarNest shader
void main(void) {
	resetNoise();
    float time = time;
    
	vec2 p = gl_FragCoord.xy / resolution.xy;
	p -= vec2(.5);
	
	vec2 scpos = p * ZOOM;
	vec3 dir = vec3(scpos.x, scpos.y, -1.0);
	
	float ttime = _Center.w + time / 8.0;
	
	float brightness = _Brightness;
	float stepSize = _StepSize;
	vec3 tile = abs(vec3(_Tile));
	float formparam = _Formuparam;
	
	float darkmatter = _Darkmatter;
	float distFade = _Distfading;
	vec3 from =  _Center.xyz;
	from += _Scroll.xyz * _Scroll.w * ttime;
	
	vec3 rot = _Rotation.xyz + _Rotation.xyz * _Rotation.w * ttime * .1;
	if (length(rot) > 0.0) {
		mat2 rx = mat2(cos(rot.x), sin(rot.x), -sin(rot.x), cos(rot.x));
		mat2 ry = mat2(cos(rot.y), sin(rot.y), -sin(rot.y), cos(rot.y));
		mat2 rz = mat2(cos(rot.z), sin(rot.z), -sin(rot.z), cos(rot.z));
		
		dir.xy = rx * dir.xy;
		dir.xz = ry * dir.xz;
		dir.yz = rz * dir.yz;
		from.xy = rx * from.xy;
		from.xz = ry * from.xz;
		from.yz = rz * from.yz;	
	}
	
    //Star nest volumetric rendering.
	float s = 0.1, fade = 1.0;
	vec3 v = vec3(0.0);
	for (int r = 0; r < _Volsteps; r++) {
		vec3 p = abs(from + s * dir * .5);
		
		p = abs(vec3(tile - mod(p, tile*2.0))); // tiling fold
		float pa, a = pa = 0.0;
		for (int i = 0; i < _Iterations; i++) {
			p = abs(p) / dot(p, p) - formparam; // the magic formula
			float d = abs(length(p) - pa);// absolute sum of average change
			a += i > 7 ? min( 12., d) : d;
			pa = length(p);	
		}
		
		float dm = max(0.0, darkmatter - a * a * .001);//dark matter
		a *= a * a;// add contrast
        if (r > 6) { fade *= 1.0 - dm; } // dark matter, don't render near
		
		v += fade;
		v += vec3(s, s*s, s*s*s*s) * a * brightness * fade; // coloring based on distance
		fade *= distFade; // distance fading
		s += stepSize;
	}
	
	float len = length(v);
	v = mix(vec3(len,len,len), v, _Saturation); //first color adjust
	v.xyz *= _Color.xyz * .01; // Scale output colors down so they are more managable
	v.xyz += noisedNebula(from, dir); //Subtract light blocked by nebulas
	
    //Rendering 2 fractal field overlays
	vec3 fieldPos = (from / (100.0 + (5.55 * sin(_FieldFreq * ttime * 6.11)) ) ); 
		+ (dir / (10.0 + (0.45 * sin(_FieldFreq * ttime * 2.23)) ) );
	fieldPos *= _FieldSize;
	
	float fv1 = field(fieldPos + dir, .7);
	float div = 1.0 + (sin(_FieldFreq2 * ttime * 7.11) * 0.2 
			+ sin(_FieldFreq2 * ttime * 2.53) * .03);
	
	fieldPos = fieldPos / vec3(div, div, div) + vec3(0.3, -0.2, 0.4);
	fieldPos /= _FieldSize2;
	float fv2 = field(fieldPos + dir, .7);
	
	vec4 fb1 = vec4(0.2, 0.2, 0.2, 0.6)
		* vec4(0.45 * fv1 * fv1 * fv1, 0.36 * fv1 * fv1, 0.7 * fv1, fv1 * 0.1);
	fb1.xyz = shiftHue(fb1.xyz, _FieldHue); //Color adjustment of first field
    
	vec4 fb2 = vec4(0.2, 0.2, 0.2, 0.2)
		* vec4(1.3 * fv2 * fv2 * fv2, 1.8 * fv2 * fv2, fv2 * 0.05, fv2 * 0.1);
	fb2.xyz = shiftHue(fb2.xyz, _FieldHue2); //Color adjustment of second field
	
    //Add fields to output
	v.xyz += fb1.xyz * fb1.a * _FieldBrightness
		+fb2.xyz * fb2.a * _FieldBrightness;
	
    //Final hue/saturation adjustments
	vec3 hsv = toHSV(v);
	hsv.r += _HueShift;
	hsv.g += _PostSat;
	v.xyz = toRGB(hsv);
	
	gl_FragColor = vec4(v, 1.0);
}
`;


$(document).ready(function() {
	var c = new GLContext("c");
	var d = new GLContext("d");
	var e = new GLContext("e");
	
	var cprog = c.compile( {frag:fragCode} );
	c.drawFrag(cprog);
	setInterval( () => {
		c.drawFrag(cprog);
	}, 1000/60 )
	
	
	var dprog = d.compile( {frag:fragCode2} );
	d.drawFrag(dprog);
	setInterval( () => {
		d.drawFrag(dprog);
	}, 1000/60 )
	
	var eprog = e.compile( {frag:fragCode3} );
	e.drawFrag(eprog);
	setInterval( () => {
		e.drawFrag(eprog);
	}, 1000/60 )
	
	
});
















