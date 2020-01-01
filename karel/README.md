# Karel.js Demo
- (Just press 'RUN' below if you are impatient.)
- (also add '?fancy=true' to the URL to use a fancier shader.)

# Built-in functions
Things Karel knows how to do!  
Here is Karel's FULL API 

##### Navigation
[`void step()`](#void-step)  
[`bool isBlocked()`](#bool-isBlocked)  
[`void turnLeft()`](#void-turnLeft)  
##### Beepers
[`void takeBeeper()`](#void-takeBeeper)  
[`bool isNearBeeper()`](#bool-isNearBeeper)  
[`void placeBeeper()`](#void-placeBeeper)  
[`bool hasBeeper()`](#bool-hasBeeper)  

---

## Navigation:
These are methods that tell karel to move around

## `void step()` 
will make karel move forward  
in whatever direction he is facing  
if he crashes into a wall, he stops.  
- Example use:
```js
// Have karel take a step forward
step();
```

## `bool isBlocked()` 
will make him check if a wall is in front of him,  
coming back `true` if he is blocked, and `false` if the space is open.  
- Example use:
```js
// Have karel check if he's not (the ! means not) blocked  before taking a step
if (!isBlocked()) {
	step();
}
```

## `void turnLeft()` 
will make him turn to the left.  
He doesn't know how to turn right,  
but you can teach him!
- Example use:
```js
// Have karel find a direction that's open before taking a step.
while (isBlocked()) {
	turnLeft();
}
step();
```
- Example of teaching karel:
```js
// Teach karel how to turnRight(); by doing three turnLeft();'s
function turnRight() {
	turnLeft();
	turnLeft();
	turnLeft();
}
// Teach karel how to turnAround(); by doing two turnLeft();'s
function turnAround() {
	turnLeft();
	turnLeft();
}
```

---

## Beepers:
He also knows how to interact with 'beepers'.
Karel is able to pick up and carry beepers.

## `void takeBeeper()`
tells him to pick one up  
he will crash if he is not on one.
- Example use:
```js
// Have karel just try to take a beeper from the ground.
// He will crash if he's not standing on a beeper.
takeBeeper();
```

## `bool isNearBeeper()` 
will have him check his feet for beepers,  
coming back `true` if he is near one,  
and `false` if there are none.  
- Example use:
```js
// Have karel safely take a beeper,
// by checking if he's on one before taking it
if (isNearBeeper()) {
	takeBeeper();
}
```

## `void placeBeeper()` 
will make him put a beeper on the ground
but he will crash if he has none,
```js
// Have karel just try to place a beeper on the ground.
// He will crash if he does not have any beepers in his pockets.
placeBeeper();
```

## `bool hasBeeper()`
will make him check his pockets for a beeper  
coming back `true` if he has one,   
and `false` if he has none.
- Example use:
```js
// Have karel safely place a beeper,
// by checking if he has one in his pockets before placing it
if (hasBeeper()) {
	placeBeeper();
}
```