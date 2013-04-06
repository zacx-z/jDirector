
// Test Code
director = new jD.Director();
director.wait(1000).wait(1000).instant(function () { console.log("OK"); }).wait(1000).log("Ah").wait(2000).log("Oops").wait(1000).log("Hah");

var r = director.wait(1000).log('OK');
r.after(r.constant(function(t) {
    var c = t / 10;
    document.body.style.background = 'rgb(' + c + ',' + c + ',' + c + ')';
    return c < 255; // while t <= 255
}, null, 20)
.log("Animation end.")).log('all over');


var d = new jD.Director();

d.wait(1000).invoke(function () {
    return this.after(
        this.log('branch 1 start').wait(1000).log('branch 1 end'),
        this.log('branch 2 start').wait(2000).log('branch 2 end')
    );
}).log('all branches over');
