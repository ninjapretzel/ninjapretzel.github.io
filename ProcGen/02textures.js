var dNoise = stdHeader + noisePrim + nnoise + diffNoise + `
void main(void) {
	resetNoise();
	vec2 uv = ( gl_FragCoord.xy / resolution.xy ) - .5;
	uv += .3 * vec2(sin(time), cos(time));
	uv *= 10.0;
	vec3 pos = vec3(uv, 1.0);
	float v = diffNoise(pos);
	vec4 c = vec4(v,v,v,1.0);
	
	gl_FragColor = c;
}`; 

var dNoiseEx = stdHeader + noisePrim + nnoise + `
	void main( void ) {
	resetNoise();
	
	vec2 uv = ( gl_FragCoord.xy / resolution.xy ) - .5;
	uv += .3 * vec2(sin(time), cos(time));
	float aspect = resolution.x / resolution.y;
	uv.x *= aspect;
	float scale = 20.;
	uv *= scale;
	
	float scaledPos = (gl_FragCoord.x / resolution.x) * 3.0;
	float cell = floor(scaledPos);
	float xpos = scaledPos - cell + sin(time) * .3;
	vec4 c = vec4(0, 0, 0, 1);
	
	if (cell < 1.0) {
		vec3 pos = vec3(xpos*scale, uv.y, 0.0);
		float v = nnoise(pos);
		c.xyz = vec3(v, v, v);
	} else if (cell < 2.0) {
		vec3 pos = vec3(xpos*scale, uv.y, 2.0);	
		float v = nnoise(pos);
		c.xyz = vec3(v, v, v);
	} else {
		vec3 pos1 = vec3(xpos*scale, uv.y, 0.0);
		vec3 pos2 = vec3(xpos*scale, uv.y, 2.0);
		float v1 = nnoise(pos1);
		float v2 = nnoise(pos2);
		float v = abs(v1 - v2);
		c.xyz = vec3(v,v,v);
	}
	
	gl_FragColor = c;
}`;
var dNoiseClip = stdHeader + noisePrim + nnoise + diffNoise + `
void main(void) {
	resetNoise();
	vec2 uv = ( gl_FragCoord.xy / resolution.xy ) - .5;
	uv += .3 * vec2(sin(time), cos(time));
	float scale = 10.0;
	uv *= scale;

	vec3 pos = vec3(0, uv.y, 1.0);
	float scaledPos = (gl_FragCoord.x / resolution.x) * 3.0;
	float cell = floor(scaledPos);
	float xpos = scaledPos - cell + sin(time) * .3;
	vec4 c = vec4(0, 0, 0, 1);
	pos.x = (xpos + .5) * scale;
	
	if (cell < 1.0) {
		pos.z = -31.;
		c.rgb = vec3(.3215, .1882, .1529);
	} else if (cell < 2.0) {
		pos.z = 0.;
		c.rgb = vec3(.3647, .4941, .2156);
	} else {
		pos.z = 16.0;
		c.rgb = vec3(.5607, .3490, .2000);
	}
	
	float v = diffNoise(pos);
	if (v < .35) { 
		c.rgb = vec3(0.0);
	}
	gl_FragColor = c;
}`; 


var ering = stdHeader + noisePrim + nnoise + diffNoise + filters + `
void main( void ) {
	resetNoise();
	vec2 uv = ( gl_FragCoord.xy / resolution.xy ) - .5;
	float aspect = resolution.y / resolution.x;
	uv.x /= aspect;
	uv *= 10.;
	
	float t = time * .22;
	float angle = atan(uv.y, uv.x);
	uv *= 1.0 + .0152 * sin(angle * PI * 16.0 + time * .6);
	float d = length(uv);
	float a = .1 * angle + .3 * sin(d * 2.3 * sin(t * 3.3));
	//d = max(d, 1.0);
	
	mat2 rot = mat2(cos(a), -sin(a),
					sin(a), cos(a));
	uv = rot * uv;
	
	vec3 pos = vec3(uv * 1., -200. + time * .2 );
	float v = 0.;
	v = diffNoise(pos);
	float grad = length(uv) / 4.0;
	v = lerp(v, grad, .6);
	
	v = levels(v, .38, .49, 0.0, 1.0);
	v = curvesMid(v);
	v *= v;
	
	d *= .2 + .5 * (1.0 + sin(time));
	vec4 color = vec4(0.51 * v/d, 2.0 *v/d, 15.0 *v/d, 1);
	gl_FragColor = color;

}`;

var voroex1 = stdHeader + noisePrim + mvoroni + d1voroni + d2voroni + wvoroni + `
void main( void ) {
	resetNoise();
	//vec2 uv = ( gl_FragCoord.xy / resolution.xy ) - .5;
	vec2 scaledPos = (gl_FragCoord.xy / resolution.xy) * vec2(4.0, 2.0);
	vec2 cell = floor(scaledPos);
	vec2 uv = scaledPos - cell;

	uv += vec2(sin(time), cos(time)) * .3;
	uv *= 10.0;
	vec3 pos = vec3(vec2(25., 25.) + uv, 3.0 + .3 * time);
	
	float v;
	if (cell.x < 1.0) {
		v = mvoroni(pos);
	} else if (cell.x < 2.0) {
		v = d1voroni(pos);
	} else if (cell.x < 3.0) {
		v = d2voroni(pos);
	} else {
		v = wvoroni(pos);
	}
	
	if (cell.y < 1.0) {
		v = 1.0 - v;
	} else {
		
	}
	
	vec4 c = vec4(v,v,v,1);
	gl_FragColor = c;
}`;

$(document).ready(()=>{
	startFrag("dNoiseEx", {frag:dNoiseEx}, { 
		scale:.5, 
		seed:137, 
		persistence:.35,
	});
	startFrag("dNoise", {frag:dNoise}, { 
		scale:.5, 
		seed:137, 
		persistence:.35,
	});
	startFrag("dNoiseClip", {frag:dNoiseClip}, { 
		scale:.5, 
		seed:137, 
		persistence:.35,
	});
	startFrag("camoWoods2", {frag:camo}, {
		scale:1., 
		seed:137, 
		persistence:.35,
		color1:hexToColor("191418"),
		color2:hexToColor("523027"),
		color3:hexToColor("5D7E37"),
		color4:hexToColor("8F5933"),
		clips:[.7,.3,.3,.3],
	});
	startFrag("ering", {frag:ering}, { 
		scale:.15, 
		seed:3337, 
		persistence:.85,
	});
	startFrag("voroex1", {frag:voroex1}, { seed:111, });
});