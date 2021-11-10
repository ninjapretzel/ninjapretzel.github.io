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
	
	const headers = new Headers();
	headers.append('pragma', 'no-cache');
	headers.append('cache-control', 'no-cache');
	const req = new Request(path);
	const res = await fetch(req, headers);
	return await res.json();
}
function SimConsole() {
	this.buffer = "";
	this.print = (thing) => { this.buffer += thing; }
	this.println = (thing) => { this.buffer += thing + "\n"; }
	this.clear = () => { this.buffer = ""; }
}

let lesson = {
	Content: {
		Category: "Untitled Category",
		Lesson: "Untitled Lesson",
		LessonText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
	},
	
	Preamble: "function placeholder(a,b,c) {",
	InitialCode: "\n\t// Edit Me!\n",
	Postamble: "}",
	TestCases: [
		{ 
			args: ["args", "value", "or", "array"], 
			expectReturnValue: true,
			expected: "expectedReturn", 
			expectConsoleOutput: true,
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
function upgradeBrowser() {
	$(".main").addClass("hidden");
	$(".upgrade").removeClass("hidden");
}

function failedToLoad() {
	$(".main").addClass("hidden");
	$(".failedToLoad").removeClass("hidden");
}
function showLesson() {
	for (let x in lesson.Content) {
		const element = $("#"+x);
		if (element.length != 0) { 
			element.html(lesson.Content[x]);
		}	
	}
	rerenderTestCases();
}

function rerenderTestCases() {
	$("#output").empty();
	renderTestCases();
}


// May allow for custom rendering of test cases, 
// if lessons want to provide custom solutions for this.
let renderTestCases = function() {
	function passFail(result, key) {
		if (result) {
			if (result[key]) { return 1; }
			return 2;
		}
		return 0;
	}
	const passFailColors = [ "blue-grey", "green", "red" ];
	
	const output = $("#output");
	let i = 0;
	console.log("rendering tests in",lesson.TestCases);
	for (let test of lesson.TestCases) {
		const result = results[i++];
		const element = $("<li>");
		const header = $("<div>");
		header.addClass("collapsible-header card blue-grey test");
		header.append("Test Case #"+i+"<br/><pre>args="+JSON.stringify(test.args)+"</pre>");
		
		const body = $("<div>");
		body.addClass("collapsible-body card row blue-grey test");
		element.append(header);
		element.append(body);
		let wasFailure = false;
		
		if (test.expectReturnValue) {
			let text = "Expecting result of " + JSON.stringify(test.expected);	
			if (result) {
				text += "\nGot " + JSON.stringify(result.returnVal);
				if (!result.matchedReturnValue) { wasFailure = true; }
			} else {
				text += "\nNot run yet...";	
			}
			const div = $("<div>");
			div.addClass("col s12 card test");
			div.addClass(passFailColors[passFail(result, "matchedReturnValue")]);
			div.append($("<pre>"+text+"</pre>"));
			body.append(div);
		}
		
		if (test.expectConsoleOutput) {
			const div = $("<div>");
			div.addClass("col s12 card test");
			div.addClass(passFailColors[passFail(result, "matchedConsoleOutput")]);
			
			
			div.append("<span>Expected Console Output:</span>");
			div.append("<pre>"+test.expectedConsole+"</pre>");
			if (result) {
				if (!result.matchedConsoleOutput) { wasFailure = true; }
				if (result.consoleOutput.length == 0) { 
					div.append("<span>Got: </span><pre>(nothing)</pre>");	
					
				} else {
					div.append("<span>Got:</span><pre>"+result.consoleOutput+"</pre>");	
				}
			} else {
				div.append("<span>Not run yet</span><pre>...</pre>");
			}
			body.append(div);
		}
		output.append(element);
		
		
		if (wasFailure) {
			console.log(i, "was failure");
			$('.collapsible').collapsible('open', i-1);
		}
			
		
	}
}

$(document).ready(async ()=>{
	if (!localStorage) { upgradeBrowser(); return; }
	let jsToLoad = "";
	let res = await fetchJson("data/test.json")
	
	if (res) { lesson = res; showLesson(); }
	else { failedToLoad(); return; }
	
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
		try { $('.collapsible').collapsible( {accordion: false} ); } catch (e) { console.warn(e); }
	}, 100);
	
});

function load(key) {
	
}

async function execScript() {
	running = true;
	runId = interp.runId;
	let script = codeEditor.getValue();
	let result = null;
	
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
	
	rerenderTestCases();
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