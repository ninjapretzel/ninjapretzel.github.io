//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
//General Utils

clamp = function(v, min, max) { if (v < min) return min; if (v > max) return max; return v; }
clamp01 = function(v) { if (v < 0) return 0; if (v > 1) return 1; return v; }
add = function(a, b) { return a + b; }
mul = function(a, b) { return a * b; }
ratio = function(a, b) { return (1.0 - (1.0 - clamp01(a)) * (1.0 - clamp01(b))) }


isString = function(s) { return typeof(s) === 'string' || s.constructor === String; }
isNumber = function(n) { return typeof(n) === 'number' || n.constructor === Number; }
isBool = function(b) { return typeof(b) === 'boolean' || b.constructor === Boolean; }
isArray = function(a) { return a.constructor === Array; }


Random = {}

Random.value = Math.random;
Random.range = function(min, max) {
	var r = max-min;
	return min + Random.value() * r;
}

Random.normal = function() {
	return (Math.random() + Math.random() + Math.random()) / 3.0;
}

last = function(arr) { return arr[arr.length-1]; }

chooseFrom = function(coll) {
	if (coll instanceof Array) {
		return coll.choose();
	}
	
	var weight = coll.sum();
	var roll = Random.value() * weight;
	var s = 0;
	var it = "none";
	
	coll.each((k,v) => {
		if (isNumber(v)) {
			if (s < roll) { it = k }
			s += v;
		}
	});
	
	return it;
}

getOrChooseString = function(obj, key) {
	var val = obj[key];
	if (!val) { return null; }
	if (isString(val)) { return val; }
	return chooseFrom(val);	
}


formatDate = function(date) {
	var year = date.getFullYear();
	var month = date.getMonth();
	var day = date.getDate();
	
	var hour = date.getHours();
	if (hour < 10) { hour = "0" + hour; }
	var minutes = date.getMinutes();
	if (minutes < 10) { minutes = "0" + minutes; }
	var seconds = date.getSeconds();
	if (seconds < 10) { seconds = "0" + seconds; }
	
	return month+"/"+day+"/"+year+" "+hour+":"+minutes+":"+seconds;
}
//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
//Duckpunching helpers
//Make it easier to punch things into being ducks

function addTo(ptype, name, func) { Object.defineProperty(ptype, name, { value: func, enumerable: false }) }
function addToObject(name, func) { addTo(Object.prototype, name, func) }

//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
//String Duckpunching

addTo(String.prototype, "regexIndexOf", function(regex, startpos) {
	var indexOf = this.substring(startpos || 0).search(regex);
	return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
});

addTo(String.prototype, "prefix", function(s) { return this.startsWith(s); })
addTo(String.prototype, "suffix", function(s) { return this.endsWith(s); })
addTo(String.prototype, "contains", function(s) { return this.includes(s); })
addTo(String.prototype, "capitalize", function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
})

//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
//Number Duckpunching

addTo(Number.prototype, "times", function(callback) {
	var i; for (i = 0; i < this; i+=1) { callback(i); }
});

formatMiliTime = function(t) {
	var milis = Math.floor(t);
	
	var seconds =	Math.floor(milis /     1000) % 60;
	var minutes =	Math.floor(milis /    60000) % 60;
	var hours =		Math.floor(milis /  3600000) % 24;
	var days =		Math.floor(milis / 86400000);
	
	var str = "";
	if (hours < 10) { hours = "0" + hours; }
	if (minutes < 10) { minutes = "0" + minutes; }
	if (seconds < 10) { seconds = "0" + seconds; }
	
	if (days > 0) { str += days + " days "; }
	str += hours + ":";
	str += minutes + ":";
	str += seconds + "";
	
	return str;
};

//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
//Array duckpunching

addTo(Array.prototype, "each", function(callback) { for (var ind in this) { callback(this[ind]) } })
addTo(Array.prototype, "choose", function() {
	var ind = Math.floor(Math.random() * this.length)
	return this[ind];
})

addTo(Array.prototype, "subtract", function(other) {
	var result = [];
	this.each((v) => {result.push(v); } );
	
	other.each((thing) => {
		if (result.indexOf(thing) >= 0) {
			result.splice(result.indexOf(thing), 1);
		}
	})
	return result
})


//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
//Object Duckpunching 

addToObject("has", function(key) { return this[key] !== undefined && this[key] !== null })


addToObject("each", function(callback) {
	for (var key in this) { if (this.hasOwnProperty(key)) { callback(key, this[key]); } }
});

addToObject("toPairRay", function() {
	var result = [];
	this.each((k,v) => {result.push({key:k, value:v} ) } );
	return result;
});

addToObject("mask", function(msk) {
	var val = {}
	if (msk instanceof Array) { msk.each( (k) => { if (this.has(k)) val[k] = this[k] } ) }
	else if (msk instanceof Object) { msk.each( (k,v) => { if (this.has(k)) val[k] = this[k] } ) }
	return val;
});

addToObject("matchingKeys", function(rule) {
	if (!rule) { rule = {}; }
	result = [];
	var pf = rule.xt("prefix", null);
	var sf = rule.xt("suffix", null);
	var cn = rule.xt("contains", null);

	this.each((k,v) => {
		if ((pf && k.prefix(pf)) || (sf && k.suffix(sf)) || (cn && k.contains(cn)) ) {
			result.push(k);
		}
	})
	
	return result;
	
})

addToObject("setVals", function(vals) { vals.each( (k,v) => { this[k]=vals[k] } ); return this; })

addToObject("xt", function(key, defaultVal) { return this.has(key) ? this[key] : defaultVal })
addToObject("num", function(key) { return this.xt(key, 0) })


addToObject("neg", function() {
	var c = {}
	this.each( (k,v) => { if (this.num(k) !== 0) c[k] = -v; } )
	return c
});

addToObject("sum", function() {
	var c = 0
	this.each( (k,v) => { if (isNumber(v)) { c += v; } } );
	return c
});




addToObject("combine", function(b, method) {
	var c = {};
	this.each( (k,v) => { c[k] = v; } )
	b.each( (k,v) => { c[k] = c[k] ? method(c[k], v) : v } )
	return c;
});

addToObject("combinex", function(b, method) {
	b.each( (k,v) => { this[k] = method(this.num(k), v) } )
});

addToObject("addNums", function(b) { return this.combine(b, add); } );
addToObject("mulNums", function(b) { return this.combine(b, mul); } );
addToObject("ratioNums", function(b) { return this.combine(b, ratio); } );

addToObject("matMul", function(b) {
	c = {};
	b.each( (k,v) => {
		r = 0;
		if (v instanceof Object) { v.each( (kk,vv) => { r += this.num(kk) * vv; } ) }
		else if (v instanceof Number) { r = this.num(k) * v; }
		c[k] = r;
	})
	return c;
});

addToObject("inc", function(thing, val) {
	this[thing] = this.num(thing) + val;
});
		
//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
//Actual gameplay stuff

Game = {};
var unit = { 
	name:"Bob",
	level:1,
	exp:0,
	tnl:1000,	
};

Game.unit = unit;
Game.time = 0;

postMessage({
	"#name": unit.name,
	"#level": unit.level,
	"#exp": unit.exp.toFixed(0) + " / " + unit.tnl.toFixed(0),
	
});


Game.elapseTime = function(dt) {
	Game.time += dt;
	
	var message = {};
	message["#result"] = Game.time.toFixed(2)	
	
	postMessage(message);
}

function loop() {
	Game.elapseTime(.1)
    setTimeout("loop()", 100);
}

loop();