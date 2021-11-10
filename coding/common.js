let codeEditor = undefined;
let delay = 1;
let running = false;
let runId = 0;
let runTask = null;
const INTERRUPTED = "INTERRUPTED";

/** Promise wrapper to run code after a delay */
function wait(ms) {
	return new Promise((resolve, reject) => { setTimeout( ()=>{resolve(); }, ms); });
}
/** directly async version of 'wait' */
async function pause(ms) { await wait(ms); }

async function fetchJson(path) { 
	let req = await fetch(path);
	return await req.json();	
}
function SimConsole() {
	this.buffer = "";
	this.print = (thing) => { this.buffer += thing; }
	this.println = (thing) => { this.buffer += thing + "\n"; }
	this.clear = () => { this.buffer = ""; }
}

let lesson = {
	Category: "Untitled Category",
	Lesson: "Untitled Lesson",
	LessonText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
	
	Preamble: "function placeholder(a,b,c) {",
	InitialCode: "\n\t// Edit Me!\n",
	Postamble: "}",
	TestCases: [
		{ 
			args: ["args", "value", "or", "array"], 
			expected: "expectedReturn", 
			expectedConsole: "expected console output" 
		},
	],
	TestCode: "placeholder(args[0], args[1], args[2]);",
}

let results = []

const simConsole = new SimConsole();
const injectedFunctions = {
	print: simConsole.print,
	println: simConsole.println
}
function measure(str) {
	let line = 0;
	let ch = 0;
	for (let i = 0; i < str.length; i++) {
		if (str[i] == "\n") { ch = 0; line+=1; }
		else { ch += 1; }	
	}
	return {line,ch};
}

$(document).ready(async ()=>{
	if (!localStorage) {
		//alert("You need to use a modern browser to use this website. Please upgrade to Firefox, Opera, or *shudder* Chrome.");	
		$(".main").addClass("hidden");
		$(".upgrade").removeClass("hidden");
		return;
	}
	let jsToLoad = "";
	let res = await fetchJson("data/test.json")
	if (res) { lesson = res; }
	
	const startMarker = { line: -1, ch:-1 }
	if (lesson.Preamble) { jsToLoad += lesson.Preamble; }
	const endOfPreamble = measure(jsToLoad);
	
	if (lesson.InitialCode) { jsToLoad += lesson.InitialCode; }
	const startOfPostamble = measure(jsToLoad);
	if (lesson.Postamble) { jsToLoad += lesson.Postamble; }
	const endMarker = measure(jsToLoad);
	if (lesson.Postamble) { endMarker.line += 1; endMarker.ch+=1; }
	
	$("#run").click(()=>{ execScript(); });
	$("#reset").click(()=>{ resetScriptExec(); });
	$("#restart").click(async ()=>{ 
		await resetScriptExec();
		await execScript(); 
	});
	
	setTimeout(()=>{
		codeEditor = CodeMirror(document.getElementById("scriptEntry"), {
			value: jsToLoad,
			// value: demoJs,
			// value: "\nfunction main() {\n\tconsole.log('hello world');\n}\nmain();",
			mode: "javascript",	
			theme: "solarized dark",
			indentUnit: 4,
			smartIndent: true,
			tabSize: 4,
			indentWithTabs: true,
			electricChars: false,
			lineNumbers: true,
		})
		
		setTimeout(()=>{
			if (lesson.Preamble) {
				codeEditor.markText(startMarker, endOfPreamble, { inclusiveLeft: true, readOnly: true});
			}
			if (lesson.Postamble) {
				codeEditor.markText(startOfPostamble, endMarker, { inclusiveRight: true, readOnly: true});
			}
		}, 100);
			
		try { $('.tooltipped').tooltip(); } catch (e) { console.warn(e); }
	}, 100);
	
});

function load(key) {
	
}

async function execScript() {
	running = true;
	runId = interp.runId;
	let script = codeEditor.getValue();
	let result = null;
	// try {
	// 	runTask = evaluate(script, "dynamic", 1, injectedFunctions);
	// 	result = await runTask;
	// 	M.toast({html: "Run Finished.", classes:"green", displayLength: 2000  } );
		
	// } catch (e) {
	// 	if (e === INTERRUPTED) {
	// 		M.toast({html:`${e}.`, classes:"yellow black-text", displayLength: 1000});
	// 	} else {
	// 		M.toast({html:`Script Error. ${e}`, classes:"red" })
	// 		console.error("e");
	// 	}
	// }
	
	const testCode = lesson.TestCode;
	for (let i = 0; i < lesson.TestCases.length; i++) {
		const test = lesson.TestCases[i];
		
		const args = test.args;
		const expected = test.expected;
		const expectedConsole = test.expectedConsole;
		
		const code = script 
			+ "\nconst args = " + JSON.stringify(args)
			+ "\n" + testCode;
		console.log(`executing:\n--------------\n${code}\n---------------\n`);
		
		simConsole.clear();
		const start = new Date().getTime();
		try {
			runTask = evaluate(code, "dynamic", 1, injectedFunctions);
			result = await runTask;
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
		const elapsedMS = end-start;
		const matchedReturnValue = !expected || result === expected;
		const matchedConsoleOutput = !expectedConsole || simConsole.buffer === expectedConsole;
		
		const res = { elapsedMS, matchedReturnValue, matchedConsoleOutput }
		console.log(res);
		results[i] = res;
	}
	
	console.log(results);
}

async function resetScriptExec() {
	if (running || interp.running) {
		running.false;
		interp.running = false;
		try {
			await runTask;
		} catch (e) {
			if (e !== INTERRUPTED) {
				console.warn("Unexpected throw when interrupting VM:")
				console.warn(e);
				M.toast({html: `Unexpected throw when interrupting VM: ${e}`, classes:"red", displayLength:4000})					
			}
		}
	}
	
	// TODO: Any other reset tasks...
}

async function resetTestCases() {
		
}

function urlParam(parameterName) {
	let result = null;
	let tmp = [];
	let items = location.search.substr(1).split("&");
	for (let i = 0; i < items.length; i++) {
		tmp = items[i].split("=");
		if (tmp[0] === parameterName) { result = decodeURIComponent(tmp[1]); }
	}
	return result;
}