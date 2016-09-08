////////////////////////////////////////////////////////////
//Embedded script for 01hashing.html
//Draws some noise output into SVGs (Scalable Vector Graphics)

//fractional part of number
function frac(n) { return Math.abs(n)%1; }
//alias for Math.sin
function sin(n) { return Math.sin(n); }
//global seed
SEED = 123.456;

//Raw 1d hash function
function hash(n) {
	return frac(sin(n)*SEED);
}
//Linear interpolate
function lerp(a, b, x) { return a + (b-a) * x; }
//Cosine interpolate
function coserp(a, b, x) { 
	var ft = x * 3.1415927;
	var f = (1 - Math.cos(ft)) * .5;
	return a + (b-a) * f;
}

//Fill points in a simple svg graph
function fillPoints(id, seed) {
	var container = $(id);
	SEED = seed;
	for (var i = 0; i < 500; i+=1) {
		var v = hash(i);
		var cir = $("<circle />");
		cir.attr("cx", ""+(20 + i));
		cir.attr("cy", ""+(70 - v * 50));
		cir.attr("r", ""+.5);
		container.append(cir);
	}
	
}

//Fill points in a simple svg texture
function fillGrayscale(id, seed) {
	var container = $(id);
	
	count = 50.0;
	size = 1.0/count;
	SEED = seed;
	for (var y = 0; y < count; y++) {
		for (var x = 0; x < count; x++) {
			var v = hash(x + y * count);
			var p = Math.floor(v * 255);
			
			var rect = $("<rect />");
			rect.attr("x", ""+(x*size));
			rect.attr("y", ""+(y*size));
			rect.attr("width", ""+size);
			rect.attr("height", ""+size);
			rect.attr("style", "fill:rgb("+ p + "," + p + "," + p + ");stroke-width:0;");
			
			container.append(rect);
			
		}
	}
	
}

$(document).ready( () => {
	
	fillPoints("#hash1", 31337.1337);
	fillPoints("#hash2", 12345.6789);
	fillGrayscale("#hash1_grayscale", 31337.1337);
	fillGrayscale("#hash2_grayscale", 12345.6789);
	fillGrayscale("#hash3_grayscale", 9876.54321);
	
	//Refresh SVG elements by refreshing page
	$("body").html($("body").html());
});