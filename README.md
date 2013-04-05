## jDirector

jDirector is a simple and lightweight framework for animation and timing written in JavaScript, providing a jQuery-like interface.

An experimental library on functional programming and simulating coroutine.

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

The following code schedule two chains parallelly.

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

`animate(callback, [length], [interval])` will call the callback every `interval` milliseconds for `length` milliseconds.

If length is not specified or is null, the animation will not stop until the callback returns false or null (strict!).

The default value of `interval` is 20.

The callback will be called with a parameter, which represents the time period from the start in milliseconds.

Subsequent invocations will be scheduled after the animation.

```javascript
d.animate(function(t) {
    var c = t / 10;
    document.body.style.background = 'rgb(' + c + ',' + c + ',' + c + ')';
    return c <= 255; // while c <= 255
}, null, 20)
.log("Animation end.");
```

#### Extending jDirector & Writing Plugins

jDirector provides `addFunc(name, func)` to add function to it.

Example:
```javascript
var d = new jD.Director();
d.addFunc("logOK", function () {
    console.log("OK");
    return this;
});

d.addFunc("fadeToBlack", function (speed) {
    var t = 255;
    return this.animate(function () {
        document.body.style.background = 'rgb(' + t + ',' + t + ',' + t + ')';
        t -= speed;
        return t >= 0;
    });
});
d.delay(1000).logOK().fadeToBlack(5).log("over");
```

`addFunc` will return the director object when succeeding, or throw an error due to a name conflict.

The body of the function should return `this` or a `jD.Future` object.

 * RETURN `this`: Indicating an instant function, whose behavior should finish immediately after invocation, such as hiding, changing texts. Invocations next to it will be called immediatly.
 * RETURN `jD.Future`: Indicating a continuous function, whose behavior will last a period of time, such as fading, moving around. Invocations next to it will be called after it has finished.


With `addFunc`, we can write plugins for jDirector.

Example:

```javascript
function MyDirector() {}
var proto = new jD.Director();
proto.addFunc("logOK", function () {
    console.log("OK");
    return this;
});
MyDirector.prototype = proto;
new MyDirector().delay(1000).logOK();
```

#### The Future Object

`jD.Future` is the return value of many functions of `jD.Director`, such as `delay` and `animate`. It has functions of the same names that are added through `jD.Director.addFunc`. However, the execution of them will be delayed. So it is the "future".

`new jD.Future(director)`: Contructor. Should be provided a valid `jD.Director` object.

`jD.Future.schedule()`: Make all delayed calls to be scheduled immediately.

`jD.Future.follow(future)`: Make it be scheduled after `future` is scheduled.

`jD.Future.onSchedule(callback)`: The callback will be called when the future is scheduled. The calling code: `callback.call(future, director)`.

Use `jD.Future` in `addFunc`:

```javascript
d.addFunc("delay1s", function () {
    var future = new jD.Future(this);
    setTimeout(function () {
        future.schedule();
    }, 1000);
    return future;
});
```

### TODO
 * Parallel Timing
 * Cancellation
 * Flow Figure Generation
