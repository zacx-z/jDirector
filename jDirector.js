function Director() {
    var director = this;
    function Future(obj) {
        var actions = [];
        this.blackBG = function (context) {
            actions.push(function () {
                this.blackBG(context);
            });
            return this;
        }
        this.delay = function (ms) {
            var future = new Future();
            actions.push(function () {
                future.follow(this.delay(ms));
            });
            return future;
        }

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
    /*this.setAnimation = function (callback) {
        var that = this;
        var future = new Future(this);
        var cid = setInterval(function() {
            if (callback.call(that)) {
                clearInterval(cid);
                future.schedule(this);
            }
        }, 20);
        return future;
    }*/


    // animation functions
    this.blackBG = function () {
        console.log('black');
        /*this.draw = function (context) {
            context.fillStyle = "black";
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        }*/
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
director.delay(1000).blackBG().delay(2000).blackBG().delay(5000).blackBG();
