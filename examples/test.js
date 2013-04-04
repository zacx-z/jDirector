
// Test Code
director = new jD.Director();
director.delay(1000).delay(1000).instant(function () { console.log("OK"); }).delay(1000).log("Ah").delay(2000).log("Oops").delay(1000).log("Hah");
director.animate(function(t) {
    var c = t / 10;
    document.body.style.background = 'rgb(' + c + ',' + c + ',' + c + ')';
    return c < 255; // while t <= 255
}, null, 20)
.log("Animation end.");

