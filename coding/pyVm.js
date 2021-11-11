
export const pyInfo = {
	doExec: execPy, 
	mode: "javascript",	
	ready:false,
}

function SimConsole() {
	this.buffer = "";
	this.print = (thing) => { this.buffer += thing; }
	this.println = (thing) => { this.buffer += thing + "\n"; }
	this.clear = () => { this.buffer = ""; }
}
const simConsole = new SimConsole();
const injectedFunctions = {
	print: simConsole.print,
	println: simConsole.println
}

let pyodide = null;
async function load() {
	console.log("Loading pyodide... Normally takes a few seconds...");
	pyodide = await loadPyodide({ indexURL : "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/" });
	console.log("Python ready, Version:", pyodide.runPython(`
	import sys
	sys.version
	`));
	
	for (let name in injectedFunctions) { 
		pyodide.globals.set(name, injectedFunctions[name]);
	}
	pyInfo.ready = true;
}


async function execPy(script, lesson) {
	const results = [];
	if (!pyInfo.ready) { await loader; }
	const testCode = lesson.TestCode;
	for (let i = 0; i < lesson.TestCases.length; i++) {
		const test = lesson.TestCases[i];
		const args = test.args;
		const expectExact = test.expectExact;
		const expected = test.expected;
		const expectedConsole = test.expectedConsole;
		
		// Thankfully, python and js are very similar...
		// but some things may not work properly...
		// @TODO: Verify any cases where JSON.stringify does _NOT_ work for python args.
		const code = script
			+ "\nargs = " + JSON.stringify(args)
			+ "\n" + testCode;
		
		simConsole.clear();
			
		const start = new Date().getTime();
		let returnVal = undefined;
		let result = undefined;
		try {
			pyodide.runPython(code);
			returnVal = result = pyodide.globals.get("result");
			
		} catch (e) {
			M.toast({html:`Script Error. ${e}`, classes:"red" })
			console.error("e");
		}
		const end = new Date().getTime();
		
		const consoleOutput = simConsole.buffer;
		const elapsedMS = end-start;
		const matchedReturnValue = expectExact 
			? result === expected
			: (!expected || result === expected);
			
		const matchedConsoleOutput = !expectedConsole || simConsole.buffer === expectedConsole;
		
		const res = { elapsedMS, returnVal, consoleOutput, matchedReturnValue, matchedConsoleOutput }
		// console.log(res);
		results[i] = res;
	}
	
	
	return results; 
}



const loader = load();
