# Karel.js Demo
- (Just press 'RUN' below if you are impatient.)
- (also add '?fancy=true' to the URL to use a fancier shader.)

# Built-in functions
Things Karel knows how to do!  
Here is Karel's FULL API 

##### Navigation
[`step()`](#step)  
[`isBlocked()`](#isBlocked)  
[`turnLeft()`](#turnLeft)  
##### Beepers
[`takeBeeper()`](#takeBeeper)  
[`isNearBeeper()`](#isNearBeeper)  
[`placeBeeper()`](#placeBeeper)  
[`hasBeeper()`](#hasBeeper)  

---

## Navigation:
These are methods that tell karel to move around

## `step()` 
will make karel move forward  
in whatever direction he is facing  
if he crashes into a wall, he stops.  

## `isBlocked()` 
will make him check if a wall is in front of him,  
coming back `true` if he is blocked,  
and false if the space is open.  

## `turnLeft()` 
will make him turn to the left.  
He doesn't know how to turn right,  
but you can teach him!

---

## Beepers:
He also knows how to interact with 'beepers'.
Karel is able to pick up and carry beepers.

## `takeBeeper()`
tells him to pick one up  
he will crash if he is not on one.

## `isNearBeeper()` 
will have him check his feet for beepers,  
coming back `true` if he is near one,  
and `false` if there are none.  

## `placeBeeper()` 
will make him put a beeper on the ground
but he will crash if he has none,

## `hasBeeper()`
will make him check his pockets for a beeper  
coming back `true` if he has one,   
and `false` if he has none.