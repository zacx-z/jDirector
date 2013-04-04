jD = (function () {
    var api = {};
    var Future = api.Future =  function (obj) {
        var actions = [];
        var done = false;

        function portFunc(func) {
            return function () {
                var future = new Future(obj);
                var args = arguments;
                var f = function () {
                    future.follow(func.apply(obj, args));
                }
                if (done) f();
                else actions.push(f);
                return future;
            }
        }

        var thisFuture = this;
        function portAll(funcNames) {
            funcNames.forEach(function (name) {
                thisFuture[name] = portFunc(obj[name]);
            });
        }

        portAll(obj.funcs);

        // future manipulations
        this.schedule = function() {
            actions.forEach(function(a) {
                a.call(obj);
            });
            done = true;
        }
        this.onSchedule = function (callback) {
            var that = this;
            var f = function () {
                callback.call(that, this);
            }
            if (done) f();
            else actions.push(f);
        }
        this.follow = function (prev) {
            var that = this;
            prev.onSchedule(function () {
                that.schedule();
            });
        }
    }

    api.Director = function () {
        this.funcs = [];

        this.onSchedule = function (callback) {
            callback.call(this, this);
        }

        // Animation Manipulation
        this.addFunc = function (name, callback) {
            if (this[name]) return false;
            this[name] = callback;
            this.funcs.push(name);
            return true;
        }

        this.addFunc("instant", function (callback, args) {
            callback.apply(this, args);
            return this;
        });

        this.addFunc("log", function () {
            console.log.apply(console, arguments);
            return this;
        });

        this.addFunc("delay", function (ms) {
            var future = new Future(this);
            setTimeout(function() {
                future.schedule();
            }, ms);
            return future;
        });

        this.addFunc("animate", function (callback, length, interval) {
            var that = this;
            var future = new Future(this);
            interval = interval || 20;

            var t = 0;

            var cid = setInterval(function () {
                var ret = callback.call(that, t);
                if (ret === null || ret === false) {
                    clearInterval(cid);
                    future.schedule();
                }
                t += interval;
            }, interval);

            if (length)
                setTimeout(function () {
                    clearInterval(cid);
                    future.schedule();
                }, length);
            return future;
        });
    }
    return api;
})();

