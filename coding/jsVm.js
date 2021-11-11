
let delay = 1;
let running = false;
let runId = 0;
let runTask = null;
const INTERRUPTED = "INTERRUPTED";

export const jsInfo = {
	doExec: execJS, 
	mode: "javascript",
	ready: true,
}

function SimConsole() {
	this.buffer = "";
	this.print = (thing) => { this.buffer += thing; }
	this.println = (thing) => { this.buffer += thing + "\n"; }
	this.clear = () => { this.buffer = ""; }
}

/** Promise wrapper to run code after a delay */
function wait(ms) {
	return new Promise((resolve, reject) => { setTimeout( ()=>{resolve(); }, ms); });
}
/** directly async version of 'wait' */
async function pause(ms) { await wait(ms); }

const simConsole = new SimConsole();
const injectedFunctions = {
	print: simConsole.print,
	println: simConsole.println
}

export async function execJS(script, lesson) {
	const results = [];
	running = true;
	runId = interp.runId;
	
	const testCode = lesson.TestCode;
	for (let i = 0; i < lesson.TestCases.length; i++) {
		const test = lesson.TestCases[i];
		
		const args = test.args;
		const expectExact = test.expectExact;
		const expected = test.expected;
		const expectedConsole = test.expectedConsole;
		
		const code = script 
			+ "\nconst args = " + JSON.stringify(args)
			+ "\n" + testCode;
		
		// console.log(`executing:\n--------------\n${code}\n---------------\n`);
		let returnVal = undefined;
		simConsole.clear();
		const start = new Date().getTime();
		let result = null;
		try {
			runTask = evaluate(code, "dynamic", 1, injectedFunctions);
			returnVal = result = await runTask;
			//M.toast({html: "Run Finished.", classes:"green", displayLength: 2000  } );
		} catch (e) {
			if (e === INTERRUPTED) {
				M.toast({html:`${e}.`, classes:"yellow black-text", displayLength: 1000});
			} else {
				M.toast({html:`Script Error. ${e}`, classes:"red" })
				console.error("e");
			}
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
