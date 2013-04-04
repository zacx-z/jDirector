## jDirector

jDirector is a lightweight framework for animation and timing written in JavaScript, providing a jQuery-like interface.

An experimental library on functional programming.

### How To Use

Download jDirector.js and include it in the html.

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

#### Serial Calling

Director functions can be called in chains.
Later invocations will be scheduled after earlier ones.

`d` is an instance of a `jD.Director` in following code.

```javascript
d.delay(1000).log("something");
```

`log` will be delayed 1s.

We can call functions multiple times.

```javascript
d.delay(1000).delay(1000).log('Hello').delay(3000).log('Bye');
```

"Hello" will appear after 2s and "Bye" will appear 3s after "Hello" appears.

#### Parallel Calling

The following code schedule two invocations parallelly.
```javascript
d.delay(1000).log('Hi').delay(2000).log('Bye');
d.delay(2000).log('Hello, ').delay(1000).log('World.');
```

If you want to schedule it serially, you should do this:

```
var r = d.delay(1000).log('Hi').delay(2000).log('Bye');
r.delay(2000).log('Hello, ').delay(1000).log('World.');
```

#### Instant & Animate

`instant` will call the callback in the timing flow.

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

`animate` will call the callback frequently until it returns true indicating the end.
Subsequent invocations will be scheduled after the animation.

```javascript
d.animate((function () {
    var t = 0;
    return function() {
        document.body.style.background = 'rgb(' + t + ',' + t + ',' + t + ')';
        t += 2;
        return t >= 255; // until t >= 255
    };
})())
.log("Animation end.");
```

### TODO
 * Docs: 
     - Extending Director & Writing Plugins
     - Advance: The Future Object
 * Parallel Timing
 * Cancelation
 * Flow Figure Generation
