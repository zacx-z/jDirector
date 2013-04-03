function Director() {
    var director = this;
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

        portAll(["log"], ["delay"]);

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

    this.draw = function () {};
    this.setAnimation = function (callback) {
        var that = this;
        var future = new Future(this);
        var cid = setInterval(function() {
            if (callback.call(that)) {
                clearInterval(cid);
                future.schedule(this);
            }
        }, 20);
        return future;
    }


    // animation functions
    this.log = function () {
        console.log.apply(console, arguments);
        return this;
    }
    this.delay = function (ms) {
        var that = this;
        var future = new Future(this);
        setTimeout(function() {
            future.schedule(that);
        }, ms);
        return future;
    }
    /*this.fadeOut = function () {
        return this.setAnimation(function () {
            return true; // terminate
        });
    }*/
}

director = new Director();
director.delay(1000).log("OK").delay(2000).log("Ah").delay(5000).log("fuck").delay(1000).log("en");
