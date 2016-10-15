
var voroex1 = stdHeader + noisePrim + voroniHeader + `
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
		//pos.z = 0.;
		v = manhattan(pos);
	} else if (cell.x < 2.0) {
		v = voroni1f(pos);
	} else if (cell.x < 3.0) {
		v = voroni2f(pos);
	} else {
		v = worley(pos);
	}
	
	if (cell.y < 1.0) {
		v = 1.0 - v;
	} else {
		
	}
	
	vec4 c = vec4(v,v,v,1);
	gl_FragColor = c;
}`;


var voroex2 = stdHeader + noisePrim + voroniHeader + `
void main( void ) {
	resetNoise();
	
	//vec2 uv = ( gl_FragCoord.xy / resolution.xy ) - .5;
	vec2 scaledPos = (gl_FragCoord.xy / resolution.xy) * vec2(2.0, 2.0);
	vec2 cell = floor(scaledPos);
	vec2 uv = scaledPos - cell;

	uv += vec2(sin(time), cos(time)) * .3;
	uv *= 20.0;
	vec3 pos = vec3(vec2(25., 25.) + uv, 3.0 + .3 * time);
	
	int mode = (cell.x > 0.0) ? NORMAL : MANHATTAN;
	float pshift = sin(time * .2);
	vec3 phase = vec3(0.0, pshift * PI / 3.0,  pshift * 2.0 * PI / 3.0);
	vec3 shift = vec3(sin(phase + (time * 1.13)));
	vec4 comp = vec4(
		sin(time * .2),
		cos(time * .2 + pshift * PI / 3.0),
		.3 * sin(time * .03 + pshift * PI / 1.5),
		.75 + .25 * sin(time * .15));
	
	
	
	float v = abs(voroni(pos, shift, comp, mode));
	if (cell.y < 1.0) { v = 1.0 - v; }
	vec4 c = vec4(v,v,v,1);
	gl_FragColor = c;
}`;

//fractional part of number
function frac(n) { return Math.abs(n)%1; }
//alias for Math.sin
function sin(n) { return Math.sin(n); }
//global seed
SEED = 123.456;

//Raw 1d hash function
function hash(n) { return frac(sin(n)*SEED); }
//3d grid noise function
function hash3(x,y,z) { return hash(x + y * 113.0 + 157.0 * z); }

function addFeatures(id, start, end, step, scale) {
	var elem = $("#"+id);
	var points = $("<g></g>");
	var points2 = $("<g></g>");
	var lines = $("<g></g>");
	if (!scale) { scale = 1.0; }
	
	points.addClass("graph-dots");
	lines.addClass("graph-lines");
	
	for (var y = start; y <= end; y += step) {
		for (var x = start; x <= end; x += step) {
			var pt1 = $("<circle />");
			var pt2 = $("<circle />");
			var line = $("<line />");
			var vx = -1 + 2 * hash3(x,y,0);
			var vy = -1 + 2 * hash3(x,0,y);
			vx /= Math.sqrt(2);
			vy /= Math.sqrt(2);
			
			pt1.attr("cx", x);
			pt1.attr("cy", y);
			pt1.attr("r", scale*step/12.0);
			pt1.attr("fill", "#488");
			pt1.attr("stroke-width", .04 * scale);
			pt1.attr("stroke", "#133");
			
			
			pt2.attr("cx", x + vx);
			pt2.attr("cy", y + vy);
			pt2.attr("r", scale*step/8.0);
			pt2.attr("fill", "#C4C");
			pt2.attr("stroke-width", .05 * scale);
			pt2.attr("stroke", "#414");
			
			
			line.attr("x1", x)
			line.attr("x2", x + vx);
			line.attr("y1", y);
			line.attr("y2", y + vy);
			
			line.attr("stroke-width", ".05");
			line.attr("stroke", "#4CC");
			
			lines.append(line);
			points.append(pt1);
			points2.append(pt2);
		}
	}
	
	elem.prepend(points2);
	elem.prepend(points);
	elem.prepend(lines);
	
	
}


$(document).ready(()=>{
	addFeatures("exampleLattice", -10, 10, 1);
	addGridLines("exampleLattice", -10, 10, 1);
	refreshSVG("exampleLattice");
	
	addFeatures("exampleLattice2", 10, 13, 1, .5);
	addGridLines("exampleLattice2", 8, 15, 1);
	refreshSVG("exampleLattice2");
	startFrag("voroex1", {frag:voroex1}, { seed:111, });
	startFrag("voroex2", {frag:voroex2}, { seed:111, });
});