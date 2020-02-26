
/** Transpose a given matrix */
function transpose(a) {
	let result = []
	for (let i = 0; i < a[0].length; i++) {
		result[i] = []	
		for (let j = 0; j < a.length; j++) {
			result[i][j] = a[j][i]	
		}
	}
	return result;
}

/** signTable for 2^(k=2) */
// Turns out these needed to be transposed.
const signTableK2 = transpose([
	[ 1, -1, -1, 1 ],
	[ 1, 1, -1, -1 ],
	[ 1, -1, 1, -1 ],
	[ 1, 1, 1, 1 ]	
]);


function mul(row, n) {
	let result = [];
	for (let i = 0; i < row.length; i++) {
		result[i] = row[i] *= n;
	}
	return result
}
function add(rowa, rowb) {
	let result = [];
	for (let i = 0; i < rowa.length; i++) {
		result[i] = rowa[i] + rowb[i];
	}
	return result;
}
function rref(matrix) {
	
}

/** signTable for 2^(k=3) */
const signTableK3 = transpose([
	[	1,	-1,	-1,	-1,		1,	1,	1,	-1	],
	[	1,	1,	-1,	-1,		-1,	-1,	1,	1	],
	[	1,	-1,	1,	-1,		-1,	1,	-1,	1	],
	[	1,	1,	1,	-1,		1,	-1,	-1,	-1	],
	
	[	1,	-1,	-1,	1,		1,	-1,	-1,	1	],
	[	1,	1,	-1,	1,		-1,	1,	-1,	-1	],
	[	1,	-1,	1,	1,		-1,	-1,	1,	-1	],
	[	1,	1,	1,	1,		1,	1, 1,	1	],
]

);

/** Multiply a matrix by another */
function mul(a, b) {
	let an = a.length;
	let bn = b.length;
	let cn = b[0].length;
	
	if (b.length != bn) {
		var s = `Expected matricies of sane lengths (a x b) (b x c), but have lengths (${an}x${a.length}) (${bn}x${cn})`
		throw s;
	}
	
	result = []
	for (let i = 0; i < an; i++) {
		result[i] = [];
		for (let j = 0; j < cn; j++) {
			result[i][j] = 0;	
		}
	}
	for (let i = 0; i < an; i++) {
		for (let j = 0; j < bn; j++) {
			for (let k = 0; k < cn; k++) {
				result[i][k] += a[i][j] * b[j][k]
			}
			
		}
	}
	
	return result
}


/** Vector to matrix */
function vtom(v) {
	let result = []
	for (let i = 0; i < v.length; i++) {
		result[i] = [v[i]];	
	}
	return result;
}
/** Matrix column vector */
function mtov(m, col) {
	if (!col) { col = 0; }
	let result = []
	for (let i = 0; i < m.length; i++) {
		result[i] = m[i][col];	
	}
	return result;
}

/** Is bit {index} on in integer {num}? */
function bit(num, index) {
	return (num & (1 << index)) != 0;
}

/** Plain Ascii-code lexicographic comparison */
function strcmp(a,b) {
	for (let i = 0; i < a.length && i < b.length; i++) {
		if (a[i] < b[i]) { return -1; }
		if (a[i] > b[i]) { return 1; }
	}
	if (a.length != b.length) { return a.length - b.length; }
	return 0;
}

/** Builds names of SSTs for use in displaying data. */
function names(k) {
	/** Comparison for sorting names in SST array */
	function SSTCompare(a,b) {
		if (a === b) { return 0; }
		// Consider SST the lowest.
		if (a === "SST") { return -1; }
		if (b === "SST") { return 1; }
		
		// Consider shorter strings always lower.
		if (a.length !== b.length) {
			return a.length - b.length;	
		}
		// Otherwise, alphabetical order
		return strcmp(a,b);
	}
	// All letters but T to avoid collision with "SST"
	const LETTERS = "ABCDEFGHIJKLMNOPQRSUVWXYZ";
	const names = [ "SST" ] // T for total in index 0
	const limit = Math.pow(2,k);
	if (k > 10) { return null;	}
	
	for (let i = 1; i < limit; i++) {
		let s = "";
		for (let j = 0; j < k; j++) {
			if (bit(i, j)) { s += LETTERS[j]; }
		}
		names[i] = "SS"+s;
	}
	
	names.sort( SSTCompare );
	return names;
}

/** Crunch the general SST data out of the q[] coefficient vector. */
function GeneralSST(v) {
	function VariationCompare(a, b) {
		return a.val < b.val ? -1 
			: b.val < a.val ? 1 : 0
	}
	const k = Math.log2(v.length);
	if (k % 1 != 0) { return null; }
	
	const SS = [ 0 ]
	const ns = names(k);
	x
	// Calculate 
	for (let i = 1; i < v.length; i++) {
		SS[i] = v.length * v[i] * v[i]; // 2^k * qi^2
		SS[0] += SS[i];
	}
	
	const result = {
		Column_qx: v,
		SS: {},
		Variation: []
	};
	// could interleave these, but it would produce output sorted differently.
	for (let i = 0; i < ns.length; i++) {
		result.SS[ns[i]] = SS[i];
		if (i == 0) { continue; }
		const v = SS[i] / SS[0];
		const vrn = {}
		result.Variation[i-1] = vrn
		vrn.name = ns[i]
		vrn.val = v;
	}
	result.Variation.sort(VariationCompare);
	
	return result;
}

/** Fully analyize the given data. {data} Must be a 2^k x n data matrix. */
function Analyze(data) {
	/** Unscales the given matrix, dividing each element by its length. */
	function unscale(m) {
		for (let i = 0; i < m.length; i++) {
			for (let k = 0; k < m[0].length; k++) {
				m[i][k] /= m.length;
			}
		}
	}
	const k = Math.log2(data.length);
	if (k % 1 != 0) { return null; }
	
	let matrix = null;
	// Todo: generalize creation of signTable...
	if (data.length == 4) { matrix = signTableK2; }
	if (data.length == 8) { matrix = signTableK3; }
	if (!matrix) { console.log("Currently unsupported"); return; }
	
	// Create matrix of multiplied data (for multifactor)
	const qm = mul(matrix, data);
	// Unscale each element by the number of rows (2^k)
	unscale(qm, data.length);
	
	console.log(`====================================================================`);
	console.log(`====================================================================`);
	console.log(`\nAnalysis of 2^(k=${k}) data = `)
	console.log(data);
	// Loop over each col in the data matrix
	for (let i = 0; i < data[0].length; i++) {
		// Grab the q coefficient vector 
		const q = mtov(qm, i);
		console.log(`\n--------------------------------------`)
		//console.log(`\nColumn q[${i}] = `)
		//console.log(q);
		// Perform general SST on that vector.
		const ssts = GeneralSST(q);
		console.log(`\nSSTs for column q[${i}]:`);
		console.log(ssts);
	}
}

let observations = vtom([15, 45, 25, 75]);

let output = mul(signTableK2, observations);


let tnr = [
	[ .6041, 3, 1.655], 
	[ .7922, 2, 1.262],
	[ .4220, 5, 2.378], 
	[ .4717, 4, 2.190]	
]
let res = mul(signTableK2, tnr);
let hw_6_2 = [
	[  90 ], // A1 B1 C1
	[ 150 ],// A2 B1 C1
	[  60 ],// A1 B2 C1
	[   5 ],// A2 B2 C1
	[  20 ],// A1 B1 C2
	[  50 ],// A2 B1 C2
	[  40 ],// A1 B2 C2
	[  40 ],// A2 B2 C2
];

// TNR was from board example
//  Analyze(tnr);
Analyze(hw_6_2);