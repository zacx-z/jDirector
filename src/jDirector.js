jD = (function () {
    var api = {};
    var Future = api.Future =  function (obj) {
        var actions = [];
        var done = false;

        function instantPort(func) {
            return function () {
                var args = arguments;
                var f = function () {
                    func.apply(obj, args);
                }
                if (done) f();
                else actions.push(f);
                return this;
            }
        }
        function continuousPort(func) {
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
                future.schedule();
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
                    future.schedule();
                }
            }, interval);
            return future;
        });
    }
    return api;
})();

