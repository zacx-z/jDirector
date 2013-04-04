function Future(obj) {
    var actions = [];

    function instantPort(func) {
        return function () {
            var args = arguments;
            actions.push(function () {
                func.apply(obj, args);
            });
            return this;
        }
    }
    function continuousPort(func) {
        return function () {
            var future = new Future(obj);
            var args = arguments;
            actions.push(function () {
                future.follow(func.apply(this, args));
            });
            return future;
        }
    }

    var thisFuture = this;
    function portAll(insFuncNames, conFuncNames) {
        insFuncNames.forEach(function (name) {
            thisFuture[name] = instantPort(obj[name]);
        });
        conFuncNames.forEach(function (name) {
            thisFuture[name] = continuousPort(obj[name]);
        });
    }

    portAll(obj.instantFuncs, obj.continuousFuncs);

    // future manipulations
    this.schedule = function(obj) {
        actions.forEach(function(a) {
            a.call(obj);
        });
    }
    this.onSchedule = function (callback) {
        var that = this;
        actions.push(function () {
            callback.call(that, this);
        });
    }
    this.follow = function (prev) {
        var that = this;
        prev.onSchedule(function (obj) {
            that.schedule(obj);
        });
    }
}

function Director() {
    this.instantFuncs = [];
    this.continuousFuncs = [];

    // Animation Manipulation
    this.addInstantFunc = function (name, callback) {
        if (this[name]) return false;
        this[name] = callback;
        this.instantFuncs.push(name);
        return true;
    }
    this.addContinuousFunc = function (name, callback) {
        if (this[name]) return false;
        this[name] = callback;
        this.continuousFuncs.push(name);
        return true;
    }

    this.addInstantFunc("instant", function (callback, args) {
        callback.apply(this, args);
    });

    this.addInstantFunc("log", function () {
        console.log.apply(console, arguments);
        return this;
    });
    
    this.addContinuousFunc("delay", function (ms) {
        var that = this;
        var future = new Future(this);
        setTimeout(function() {
            future.schedule(that);
        }, ms);
        return future;
    });

    this.addContinuousFunc("animate", function (callback, interval) {
        var that = this;
        var future = new Future(this);
        interval = interval || 20;
        var cid = setInterval(function() {
            if (callback.call(that)) {
                clearInterval(cid);
                future.schedule(this);
            }
        }, interval);
        return future;
    });
}

// Test Code
director = new Director();
director.delay(1000).instant(function () { console.log("OK"); }).delay(1000).log("Ah").delay(2000).log("Oops").delay(1000).log("Hah");
