## jDirector

jDirector is a simple and lightweight framework for animation and timing written in JavaScript, providing a jQuery-like interface.

An experimental library on functional programming.

### How To Use

Download [jDirector.js](https://github.com/ladace/jDirector/raw/master/src/jDirector.js) and include it in the html.

```HTML
<script src="jDirector.js"></script>
```

Hello World:

```javascript
var d = new jD.Director();
d.delay(1000).log("Hello World!");
```

Then "Hello World" will appear after 1s.

Yet another Hello World, which behaves the same:
```javascript
var d = new jD.Director();
d.delay(1000).instant(function () { console.log("Hello World!"); });
```

*Only chrome is tested now.*

#### Serial Scheduling

Director functions can be called in chains.
Later invocations will be scheduled after earlier ones.

NOTE: `d` is an instance of a `jD.Director` in following code.

```javascript
d.delay(1000).log("something");
```

`log` will be delayed 1s.

We can call functions multiple times.

```javascript
d.delay(1000).delay(1000).log('Hello').delay(3000).log('Bye');
```

"Hello" will appear after 2s and "Bye" will appear 3s after "Hello" appears.

#### Parallel Scheduling

The following code schedule two invocations parallelly.

```javascript
d.delay(1000).log('Hi').delay(2000).log('Bye');
d.delay(2000).log('Hello, ').delay(1000).log('World.');
```

If you want to schedule them serially, you should:

```javascript
var r = d.delay(1000).log('Hi').delay(2000).log('Bye');
r.delay(2000).log('Hello, ').delay(1000).log('World.');
```

#### Instant & Animate

`instant(callback)` will call the callback in the timing flow.

```javascript
d.delay(1000)
.instant(function () {
    console.log("Hello");
})
.delay(1000)
.instant(function (str) {
    console.log(str);
}, ["Bye"]);
```

`animate(callback, [interval])` will call the callback every `interval` milliseconds until it returns true indicating the end. The default valud of `interval` is 20.
Subsequent invocations will be scheduled after the animation.

```javascript
d.animate((function () {
    var t = 0;
    return function() {
        document.body.style.background = 'rgb(' + t + ',' + t + ',' + t + ')';
        t += 2;
        return t > 255; // until t > 255
    };
})(), 20)
.log("Animation end.");
```

#### Extending jDirector & Writing Plugins

jDirector provides two functions to add functions to it.

 * `addInstantFunc(name, func)` Add an instant function, whose behavior should finish immediately after invocation, such as hiding, changing texts. Invocations next to it will be called immediatly.
 * `addContinuousFunc(name, func)` Add a continuous function, whose behavior will last a period of time, such as fading, moving around. Invocations next to it will be called after it has finished.

Both functions will return true when succeeding, or return false due to a name conflict.

There are some conventions for `func`:
`addInstantFunc`: Should always return `this`.
`addContinuousFunc`: Should always return a `jD.Future` Object.

Example:
```javascript
var d = new jD.Director();
d.addInstantFunc("logOK", function () {
    console.log("OK");
});
d.addContinuousFunc("fadeToBlack", function (speed) {
    var t = 255;
    return this.animate(function () {
        document.body.style.background = 'rgb(' + t + ',' + t + ',' + t + ')';
        t -= speed;
        return t < 0;
    });
});

// Test
d.delay(1000).fadeToBlack(5).logOK();
```
*Future versions may merge them into one.*

So we can write plugins through jDirector.

Example:

```javascript
function MyDirector() {}
var proto = new jD.Director();
proto.addInstantFunc("logOK", function () {
    console.log("OK");
});
MyDirector.prototype = proto;
new MyDirector().delay(1000).logOK();
```

### TODO
 * Docs: 
     - Advance: The Future Object
 * Parallel Timing
 * Cancellation
 * Flow Figure Generation
