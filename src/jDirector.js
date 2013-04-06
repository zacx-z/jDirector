jD = (function () {
    var api = {};
    var Future = function (obj) {
        var actions = [];
        var done = false;

        function portFunc(func) {
            return function () {
                var future = obj.future();
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
        this.resume = function() {
            if (done) return; // resume can only be executed once
            actions.forEach(function(a) {
                a.call(obj);
            });
            done = true;
        }
        this.onResume = function (callback) {
            var that = this;
            var f = function () {
                callback.call(that, this);
            }
            if (done) f();
            else actions.push(f);
        }
        this.follow = function (prev) {
            var that = this;
            prev.onResume(function () {
                that.resume();
            });
        }
    }

    api.Director = function () {
        this.funcs = [];

        this.future = function () {
            return new Future(this);
        }

        this.onResume = function (callback) {
            callback.call(this, this);
        }

        // Animation Manipulation
        this.addCommand = function (name, callback) {
            if (this[name]) throw "Name Conflict";
            this[name] = callback;
            this.funcs.push(name);
            return this;
        }

        this.addCommand("instant", function (callback, args) {
            callback.apply(this, args);
            return this;
        });

        this.addCommand("log", function () {
            console.log.apply(console, arguments);
            return this;
        });

        this.addCommand("wait", function (ms) {
            var future = this.future();
            setTimeout(function() {
                future.resume();
            }, ms);
            return future;
        });

        this.addCommand("after", function () {
            var sel = -1;
            var l = arguments.length;
            if (typeof arguments[l - 1] == 'number') {
                sel = arguments[l - 1];
                l --;
            }

            if (sel < 0) sel += l;
                
            var future = this.future();
            for (var i = 0; i < l; ++i) {
                arguments[i].onResume(function () {
                    if (sel == 0) future.resume();
                    sel --;
                });
            }
            return future;
        });

        this.addCommand("constant", function (callback, length, interval) {
            var that = this;
            var future = this.future();
            interval = interval || 20;

            var t = 0;

            var cid = setInterval(function () {
                var ret = callback.call(that, t);
                if (ret === null || ret === false) {
                    clearInterval(cid);
                    future.resume();
                }
                t += interval;
            }, interval);

            if (length)
                setTimeout(function () {
                    clearInterval(cid);
                    future.resume();
                }, length);
            return future;
        });
    }
    return api;
})();

