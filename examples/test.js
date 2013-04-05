
// Test Code
director = new jD.Director();
director.wait(1000).wait(1000).instant(function () { console.log("OK"); }).wait(1000).log("Ah").wait(2000).log("Oops").wait(1000).log("Hah");
director.constant(function(t) {
    var c = t / 10;
    document.body.style.background = 'rgb(' + c + ',' + c + ',' + c + ')';
    return c < 255; // while t <= 255
}, null, 20)
.log("Animation end.");

