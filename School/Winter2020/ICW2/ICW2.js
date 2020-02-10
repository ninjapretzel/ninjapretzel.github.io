
// Raw data
let data = {
	TKB: { x: 14, y: 2735 },
	MAC: { x: 13, y: 253 },
	COBOL: { x: 8, y: 27 },
	BASIC: { x: 6, y: 27 },
	PASCAL: { x: 6, y: 12 },
	EDT: { x: 4, y: 91 },
	SOS: { x: 1, y: 33 },
};

// Build groups
let groups = [];
// Start with each node as its own group
for (var k in data) { 
	let node = data[k];
	// Normalization of data
	node.y = Math.log(node.y) / Math.log(2);
	// Name node so we can track it later
	node.name = k; 
	// Make node its own group
	groups[groups.length] = [ node ];
}

// Distance helper function
function distance(a, b) {
	const dx = (a.x - b.x);
	const dy = (a.y - b.y);
	return Math.sqrt(dx*dx + dy*dy);
}

// Do full min-spanning-tree
while (groups.length > 1) {
	
	console.log(`-----------------------------------------------------`);
	
	// First calculate group centroids
	let centroids = [];
	for (let i = 0; i < groups.length; i++) {
		const c = {x:0, y: 0}
		for (let k = 0; k < groups[i].length; k++) {
			c.x += groups[i][k].x;
			c.y += groups[i][k].y;
		}
		c.x /= groups[i].length;
		c.y /= groups[i].length;
		centroids[i] = c;
		console.log(`Group ${i}`);
		console.log(groups[i]);
		console.log(`Centroid ${i}: (${c.x},${c.y})\n`);
	}
	
	// Calculate distances between centroids
	let distances = {};
	for (let i = 0; i < groups.length; i++) {
		const c1 = centroids[i];
		for (let k = i + 1; k < groups.length; k++) {
			const c2 = centroids[k]
			const dist = distance(c1, c2);
			distances[`${i}~${k}`] = dist;
		}
	}
	
	// Look for pair of groups with lowest distance.
	let minDist = Number.MAX_VALUE;
	let minGroups = [];
	for (k in distances) {
		const dist = distances[k];
		
		if (minDist > dist) {
			minDist = dist;
			const split = k.split('~')
			const a = Number(split[0]);
			const b = Number(split[1]);
			minGroups = [a, b];
		}
	}
		
	
	// Merge groups and put back into list 
	const groupA = groups[minGroups[0]];
	const groupB = groups[minGroups[1]];
	groups.splice(Math.max(minGroups[0], minGroups[1]),1);
	groups.splice(Math.min(minGroups[0], minGroups[1]),1);
	console.log(`Merging groups ${minGroups[0]} and ${minGroups[1]}`);
	console.log(`Distance was ${minDist}\n`);
	
	console.log(groupA);
	console.log(`\t\t+`);
	console.log(groupB);
	
	const merged = [ ...groupA, ...groupB ];
	groups[groups.length] = merged
	console.log(`\n====Into====\n`);
	console.log(merged);
	
	
	console.log(`\n\n`);
}

