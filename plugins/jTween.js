jD.Tween = function () {
    jD.Director.call(this);
    this.extend({'tween': function (obj, end, begin, duration) {
        if (typeof begin == 'number') {
            duration = begin;
            begin = undefined;
        }
        duration = duration || 500;

        var incre = {};
        return this.instant(function () {
            if (begin)
                for (var k in begin) obj[k] = begin;
            for (var k in end)
                incre[k] = (end[k] - obj[k]) / duration * 20;
            console.log(incre);
        }).constant(function () {
            for (var k in incre)
                obj[k] += incre[k];
        }, duration).instant(function () {
            for (var k in end)
                obj[k] = end[k];
        });
    }});
}

jD.tween = new jD.Tween();
