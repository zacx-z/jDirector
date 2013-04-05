## jDirector

jDirector is a simple and extensible framework for animation and timing written in JavaScript, providing a jQuery-like interface.

An experimental library on functional programming and simulating coroutine.

### How To Use

Download [jDirector.js](https://github.com/ladace/jDirector/raw/master/src/jDirector.js) and include it in the html.

```HTML
<script src="jDirector.js"></script>
```

Hello World:

```javascript
var d = new jD.Director();
d.wait(1000).log("Hello World!");
```

Then "Hello World" will appear after 1s.

Yet another Hello World, which behaves the same:
```javascript
var d = new jD.Director();
d.wait(1000).instant(function () { console.log("Hello World!"); });
```

*Only chrome is tested now.*

#### Serial Scheduling

Director commands can be called in chains.
Later invocations will be scheduled after earlier ones.

NOTE: `d` is an instance of a `jD.Director` in following code.

```javascript
d.wait(1000).log("something");
```

`log` will be delayed 1s.

We can call any command multiple times.

```javascript
d.wait(1000).wait(1000).log('Hello').wait(3000).log('Bye');
```

"Hello" will appear after 2s and "Bye" will appear 3s after "Hello" appears.

#### Parallel Scheduling

The following code schedule two chains parallelly.

```javascript
d.wait(1000).log('Hi').wait(2000).log('Bye');
d.wait(2000).log('Hello, ').wait(1000).log('World.');
```

If you want to schedule them serially, you should:

```javascript
var r = d.wait(1000).log('Hi').wait(2000).log('Bye');
r.wait(2000).log('Hello, ').wait(1000).log('World.');
```

#### Instant & Constant

`instant(callback)` will call the callback in the timing flow.

```javascript
d.wait(1000)
.instant(function () {
    console.log("Hello");
})
.wait(1000)
.instant(function (str) {
    console.log(str);
}, ["Bye"]);
```

`constant(callback, [length], [interval])` will call the callback every `interval` milliseconds for `length` milliseconds.

If length is not specified or is null, the animation will not stop until the callback returns false or null (strict!).

The default value of `interval` is 20.

The callback will be called with a parameter, which represents the time period from the start in milliseconds.

Subsequent invocations will be scheduled after the animation.

```javascript
d.constant(function(t) {
    var c = t / 10;
    document.body.style.background = 'rgb(' + c + ',' + c + ',' + c + ')';
    return c <= 255; // while c <= 255
}, null, 20)
.log("Animation end.");
```

#### Extending jDirector & Writing Plugins

jDirector provides `addCommand(name, func)` to add commands to it.

Example:
```javascript
var d = new jD.Director();
d.addCommand("logStart", function () {
    console.log("start");
    return this;
});

d.addCommand("fadeToBlack", function (speed) {
    var t = 255;
    return this.constant(function () {
        document.body.style.background = 'rgb(' + t + ',' + t + ',' + t + ')';
        t -= speed;
        return t >= 0;
    });
});
d.wait(1000).logStart().fadeToBlack(5).log("over");
```

`addCommand` will return the director object when succeeding, or throw an error due to a name conflict.

The body of the command should return `this` or a `jD.Future` object.

 * Return `this`: Indicating an instant command, whose behavior should finish immediately after invocation, such as hiding, changing texts. Invocations next to it will be called immediatly.
 * Return `jD.Future`: Indicating a constant command, whose behavior will last a period of time, such as fading, moving around. Invocations next to it will be called after it has finished.


With `addCommand`, we can write plugins for jDirector.

Example:

```javascript
function MyDirector() {}
var proto = new jD.Director();
proto.addCommand("logOK", function () {
    return this.log("OK");
});
MyDirector.prototype = proto;
new MyDirector().wait(1000).logOK();
```

#### The Future Object

`jD.Future` is the return value of many commands of `jD.Director`, such as `wait` and `constant`. It has commands of the same names. However, the execution of them will be delayed. So it is the "future".

`new jD.Future(director)`: Contructor. Should be provided a valid `jD.Director` object.

`jD.Future.schedule()`: Make all delayed calls to be scheduled immediately.

`jD.Future.follow(future)`: Make it be scheduled after `future` is scheduled.

`jD.Future.onSchedule(callback)`: The callback will be called when the future is scheduled. The calling code: `callback.call(future, director)`.

Use `jD.Future` in `addCommand`:

```javascript
d.addCommand("delay1s", function () {
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
