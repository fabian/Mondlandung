/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:false, undef:true, curly:true, browser:true, indent:4, maxerr:50 */

function App() {

    var that = this;

    this.earth = new Body('earth', 8000000, new Vector(0, 0, 0), true);
    this.moon = new Body('moon', 600, new Vector(130, 0, 0), false);
    this.rocket = new Body('rocket', 3, new Vector(0, 0, 0), false);
    this.system = new System('trace', this.earth, this.moon, this.rocket);

    this.degrees = 120;
    this.percent = 90;
    this.time= 2;

	this.launched = false;

    this.init();
    this.background();
    this.preview();

    setInterval(function () {
    	that.step();
    }, this.system.time);

    //this.system.draw(system.w(moon.velocity, moon.position, 770, 0.1), 10);
    this.system.start();
}

App.prototype.step = function () {
	if (this.system.t > this.time && !this.launched) {
		this.launch();
	}
	if (this.system.t > 10.85) {
		this.reset();
	}
    this.system.step();
	this.system.refresh();
	document.getElementById('t').innerHTML = 't = ' + Math.floor(this.system.t) + '"';
};

App.prototype.reset = function () {
	this.moon.reset();
	this.rocket.reset();
	this.system.t = 0;
	this.launched = false;
};

App.prototype.init = function () {

    this.bind(document.getElementById('degrees-up'), this.degreesUp);
    this.bind(document.getElementById('degrees-value'), this.degreesValue);
    this.bind(document.getElementById('degrees-down'), this.degreesDown);
    this.bind(document.getElementById('percent-up'), this.percentUp);
    this.bind(document.getElementById('percent-value'), this.percentValue);
    this.bind(document.getElementById('percent-down'), this.percentDown);
    this.bind(document.getElementById('time-up'), this.timeUp);
    this.bind(document.getElementById('time-value'), this.timeValue);
    this.bind(document.getElementById('time-down'), this.timeDown);
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

App.prototype.timeUp = function () {
    this.setTime(this.time + 1);
    this.refresh();
};

App.prototype.timeDown = function () {
    this.setTime(this.time - 1);
    this.refresh();
};

App.prototype.timeValue = function () {
    var time = parseInt(prompt('Abschusszeit (0-10):', 2), 10);
    this.setTime(time);
    this.refresh();
};

App.prototype.setTime = function (time) {
    if (!isNaN(time) && time >= 0 && time <= 10) {
        this.time = time;
    }
};

App.prototype.refresh = function () {
    document.getElementById('degrees-value').innerHTML = this.degrees + '°';
    document.getElementById('percent-value').innerHTML = this.percent + '%';
    document.getElementById('time-value').innerHTML = this.time + '"';
    this.system.clear();
    this.preview();
};

App.prototype.velocity = function () {
    var radians = (this.degrees - 135) * (Math.PI / 180);
    var force = 400 * (this.percent / 100);
    return new Vector(Math.cos(radians) * force, Math.sin(radians) * force, 0);
};

App.prototype.launch = function () {
	this.launched = true;
    this.rocket.state.velocity = this.velocity();
};

App.prototype.preview = function () {

    var state = new State(this.rocket.original.clone().position, this.velocity());
    var results = this.system.rk4(state, 9, 500, [this.earth, this.moon]);

    this.system.draw(results, this.rocket, [this.earth], 1);
};

App.prototype.bind = function (element, func) {

    var that = this;
    var wrap = function () {
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
