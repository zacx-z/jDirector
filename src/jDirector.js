jD = (function () {
    var api = {};

    // -------
    // Future
    // obj is expected to be an instance of Director

    var Future = function (obj) {
        // Actions to be executed when future resumes
        var actions = [];
        // whether 'resume' function has been called
        var done = false;

        // --------------------
        // Copy all the commands director
        // and change their bodies a little

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

        portAll(obj.commands);

        // -----------------------------
        // future manipulations

        // Do all the actions it has restored
        this.resume = function() {
            if (done) return; // resume can only be executed once
            actions.forEach(function(a) {
                a.call(obj);
            });
            done = true;
        }

        // Add actions manually
        this.onResume = function (callback) {
            var that = this;
            var f = function () {
                callback.call(that, this);
            }
            if (done) f();
            else actions.push(f);
        }

        // Make this resume after another future resumes
        // 'prev' may be a future or a director
        this.follow = function (prev) {
            prev.onResume(this.resume);
        }
    }

    api.Director = function () {
        this.commands = [];

        this.future = function () {
            return new Future(this);
        }

        // Expected to be called by Future.follow
        this.onResume = function (callback) {
            callback.call(this, this);
        }

        // Add a command to customize it
        this.addCommand = function (name, callback) {
            if (this[name]) throw "Name Conflict";
            this[name] = callback;
            this.commands.push(name);
            return this;
        }


        // The same as console.log,
        // except that it is scheduled in the director flow
        this.addCommand("log", function () {
            console.log.apply(console, arguments);
            return this;
        });

        // wait 'ms' milliseconds and execute subsequent commands
        this.addCommand("wait", function (ms) {
            var future = this.future();
            setTimeout(future.resume, ms);
            return future;
        });

        // wait for several futures resume
        // after(future1, future2, ..., [sel])
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

        // do customized commands without calling 'addCommand'
        this.addCommand("invoke", function (callback, args) {
            return callback.apply(this, args);
        });

        // Do it instantly
        this.addCommand("instant", function (callback, args) {
            callback.apply(this, args);
            return this;
        });

        // Do it frequently
        // constant(callback, [length], [interval])
        // execute the callback for 'length' milliseconds every 'interval' milliseconds
        // unless it return false or null (strict!)
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

