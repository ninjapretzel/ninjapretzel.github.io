this.demoWorld = {"karel":{"x":0,"y":0,"angle":90,"beepers":0},"horizontalWalls":{"-5,0":1,"-4,0":1,"-3,0":1,"-2,0":1,"-1,0":1,"0,0":1,"1,0":1,"2,0":1},"verticalWalls":{"2,0":1,"-3,-3":1,"-3,-2":1,"-3,-1":1,"-3,0":1,"-3,1":1,"-3,2":1,"-2,2":1,"-2,-2":1,"-1,-3":1,"-1,-2":1,"-1,-1":1},"beepers":{"2,-1":3,"-2,3":2,"-2,2":1}};
this.demoJs = `// Karel.js Demo
// Here is a little demo script that shows Karel's FULL API 
// (Just press 'RUN' below if you are impatient.)
// (also add '?fancy=true' to the URL to use a fancier shader.)
//
// 'step()' will make karel move forward 
//			in whatever direction he is facing 
// 			if he crashes into a wall, he stops.
//
// 'isBlocked()' will make him check if a wall
//				 is in front of him, coming back
//				 true if he is blocked, or false if not.
//
// 'turnLeft()' will make him turn to the left.
// 				He doesn't know how to turn right,
//				but you can teach him!
//
// He also knows how to interact with 'beepers'.
// Karel is able to pick up and carry beepers.
// 'takeBeeper()' tells him to pick one up
//				  he will crash if he is not on one, so
// 'isNearBeeper()' will have him check for beepers,
//				  coming back true if he is near one,
//				  and false if there are none.
// 'placeBeeper()' will make him put a beeper on the ground
//				   but he will crash if he has none,
// 'hasBeeper()' will make him check his pockets for a beeper
//				 coming back true if he has one, 
//				 and falseif he has none.
// 
// And that's all he knows how to do!
// He may not know much, but you can teach him more things!
// just define a javascript function!
// This is a fully functional javascript environment!
// See https://dxr.mozilla.org/mozilla/source/js/narcissus/
// This implementation is (heavily) modified from ^
// And the version present there is a little dated.
// 
// you can also use any javascript construct you want
// if, for, while, do...while
// 
// Some stuff that won't work: 
// Promise - disabled intentionally, since they are used
// 		to inject delays so while(true){} won't crash the page!
// spreading ([...]/{...})

// Teach him how to turn right!
function turnRight() { turnLeft(); turnLeft(); turnLeft(); }
// Teach him to check before taking a beeper!
function safeTakeBeeper() { 
	if (isNearBeeper()) { takeBeeper(); }	
}

step();
turnLeft();
step();
step();
turnRight();
step();
takeBeeper();

step();
safeTakeBeeper();
safeTakeBeeper();
safeTakeBeeper();
safeTakeBeeper();
safeTakeBeeper();
safeTakeBeeper();

turnRight();
step();step();step();step();
turnRight();
while (!isBlocked()) { placeBeeper(); step(); }

turnLeft();
step();
turnRight();
step();
turnRight();
step();
while (isNearBeeper()) { takeBeeper(); }

turnLeft();
while(hasBeeper()) { step(); placeBeeper(); }
`