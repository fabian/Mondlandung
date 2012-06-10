/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:false, undef:true, curly:true, browser:true, indent:4, maxerr:50 */

function App() {

    this.earth = new Body('earth', 8000000, new Vector(0, 0, 0), true);
    this.moon = new Body('moon', 600, new Vector(130, 0, 0), false);
    this.rocket = new Body('rocket', 3, new Vector(0, 0, 0), false);
    this.system = new System('trace', this.earth, this.moon, this.rocket);

    this.degrees = 120;
    this.percent = 90;
    this.offset = this.rocket.offset();

    this.init();
    this.background();
    this.preview();

    //this.system.draw(system.w(moon.velocity, moon.position, 770, 0.1), 10);
    this.system.start();
}

App.prototype.init = function () {

    this.bind(document.getElementById('launch'), this.launch);
    this.bind(document.getElementById('pause'), this.pause);
    this.bind(document.getElementById('degrees-up'), this.degreesUp);
    this.bind(document.getElementById('degrees-value'), this.degreesValue);
    this.bind(document.getElementById('degrees-down'), this.degreesDown);
    this.bind(document.getElementById('percent-up'), this.percentUp);
    this.bind(document.getElementById('percent-value'), this.percentValue);
    this.bind(document.getElementById('percent-down'), this.percentDown);
};

App.prototype.degreesUp = function () {
    this.setDegrees(this.degrees + 1);
    this.refresh();
};

App.prototype.degreesDown = function () {
    this.setDegrees(this.degrees - 1);
    this.refresh();
};

App.prototype.degreesValue = function () {
    var degrees = parseInt(prompt('Abschusswinkel (0-180):', 120), 10);
    this.setDegrees(degrees);
    this.refresh();
};

App.prototype.setDegrees = function (degrees) {
    if (!isNaN(degrees) && degrees >= 0 && degrees <= 180) {
        this.degrees = degrees;
    }
};

App.prototype.percentUp = function () {
    this.setPercent(this.percent + 1);
    this.refresh();
};

App.prototype.percentDown = function () {
    this.setPercent(this.percent - 1);
    this.refresh();
};

App.prototype.percentValue = function () {
    var percent = parseInt(prompt('Startgeschwindigkeit (0-100):', 90), 10);
    this.setPercent(percent);
    this.refresh();
};

App.prototype.setPercent = function (percent) {
    if (!isNaN(percent) && percent >= 0 && percent <= 100) {
        this.percent = percent;
    }
};

App.prototype.refresh = function () {
    document.getElementById('degrees-value').innerHTML = this.degrees + '°';
    document.getElementById('percent-value').innerHTML = this.percent + '%';
    this.system.clear();
    this.preview();
};

App.prototype.velocity = function () {
    var radians = (this.degrees - 135) * (Math.PI / 180);
    var force = 400 * (this.percent / 100);
    return new Vector(Math.cos(radians) * force, Math.sin(radians) * force, 0);
};

App.prototype.launch = function () {
    this.rocket.state.position = this.offset.clone();
    this.rocket.state.velocity = this.velocity();
};

App.prototype.pause = function (e) {
    if (this.system.running) {
        e.target.setAttribute('class', 'paused');
        this.system.pause();
    } else {
        e.target.setAttribute('class', '');
        this.system.run();
    }
};

App.prototype.preview = function () {

    var state = new State(this.offset.clone(), this.velocity());
    var results = this.system.rk4(state, 9, 500, [this.earth, this.moon]);

    this.system.draw(results, this.rocket, [this.earth], 1);
};

App.prototype.bind = function (element, func) {

    var that = this, wrap = function () {
        func.apply(that, arguments);
    };

    if ('ontouchstart' in document.documentElement) {
        element.ontouchstart = wrap;
    } else {
        element.onclick = wrap;
    }
};

App.prototype.background = function () {

    var x, y, size, number, opacity = 0.1, canvas, context;
    
    canvas = document.getElementById('background');
    context = canvas.getContext('2d');

    function ran(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;  
    }

    function ran2(min, max) {
        return Math.random() * (max - min) + min;
    }

    for (var i = 0; i < 200; i++) {

        x = ran(0, canvas.width);
        y = ran(0, canvas.height);
        size = ran2(0.5, 1.5);

        context.beginPath();
        context.fillStyle = 'rgba(' + (200 + ran(-30, 30)) + ',220,255,' + Math.random() + ')';
        context.fillRect(x, y, size, size);
    }

    document.body.style.backgroundImage = "url(" + canvas.toDataURL("image/png") + ")";
};
