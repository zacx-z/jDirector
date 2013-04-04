
// Test Code
director = new jD.Director();
director.delay(1000).delay(1000).instant(function () { console.log("OK"); }).delay(1000).log("Ah").delay(2000).log("Oops").delay(1000).log("Hah");
director.animate((function () {
    var t = 0;
    return function() {
        document.body.style.background = 'rgb(' + t + ',' + t + ',' + t + ')';
        t += 2;
        return t >= 255; // until t >= 255
    };
})())
.log("Animation end.");

