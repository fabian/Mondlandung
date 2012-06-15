/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:false, undef:true, curly:true, browser:true, indent:4, maxerr:50 */

function App() {

    var that = this;

    this.earth = new Body('earth', 8000000, new Vector(0, 0, 0), true);
    this.moon = new Body('moon', 20000000, new Vector(140, 0, 0), false);
    this.rocket = new Body('rocket', 3, new Vector(0, 0, 0), false);
    this.system = new System('trace', this.earth, this.moon, this.rocket);

	this.rocket.addCallback(function (body, diff) {
		if (body == that.moon) {
			//that.system.pause();
			//alert('You reached the moon! Click OK to run again.');
			that.reset();
		}
	});

    this.degrees = 152;
    this.percent = 98;
    this.time = 0.6;

	this.launched = false;
	this.stopped = false;
	this.break = 0.8;
	this.delay = 4;

    this.init();
    this.background();
    this.preview();
    this.refresh();

    setInterval(function () {
    	that.step();
    }, this.system.time * 1000);

    //this.system.draw(system.w(moon.velocity, moon.position, 770, 0.1), 10);
    this.system.start();
}

App.prototype.step = function () {
    var t = this.system.t - this.delay;
	if (this.system.t > this.delay && !this.launched) {
		this.launch();
	}
	if (this.system.t > this.time + this.delay && !this.stopped) {
	    this.stopped = true;
	    this.rocket.state.velocity = this.rocket.state.velocity.multiply(this.break);
	}
	if (this.system.t > 120) {
		this.reset();
	}
    this.system.step();
	this.system.refresh();
	document.getElementById('t').innerHTML = 't = ' + t.toFixed(1) + '"';
};

App.prototype.reset = function () {
	this.moon.reset();
	this.rocket.reset();
	this.system.t = 0;
	this.launched = false;
	this.stopped = false;
};

App.prototype.init = function () {

    this.bind('degrees-up', this.degreesUp);
    this.bind('degrees-value', this.degreesValue);
    this.bind('degrees-down', this.degreesDown);
    this.bind('percent-up', this.percentUp);
    this.bind('percent-value', this.percentValue);
    this.bind('percent-down', this.percentDown);
    this.bind('time-up', this.timeUp);
    this.bind('time-value', this.timeValue);
    this.bind('time-down', this.timeDown);
    this.bind('solve', this.solve);
    this.bind('t', this.reset);
};

App.prototype.solve = function () {

    //this.setDegrees(173);
    //this.setPercent(100);
    //this.setTime(3);

    var solution, moon, rocket;
    var that = this;
    var count = 0;

    this.system.pause();

    this.min = 9999999;
    this.count = 0;

    for (var i = 0; i < 29; i++) {

        this.count++;

        solution = this.guess();
        velocity = this.system.vector(solution.degrees, solution.percent);

        that.best = solution; // fallback

        moon = this.moon.clone();
        rocket = this.rocket.clone();

        moon.state = this.system.rk4(moon.state, solution.time, solution.time / this.system.time * 2, [this.earth]).pop(); // start delay
        rocket.state = new State(this.rocket.original.clone().position, velocity);

        that.solveStep(solution, moon, rocket, 0);
    }

    this.interval = setInterval(function () {
        count++;
        if (count > 10 || (!that.system.running && that.count <= 0)) {
            clearInterval(that.interval);
            that.setDegrees(that.best.degrees);
            that.setPercent(that.best.percent);
            that.setTime(that.best.time);
            that.reset();
            that.refresh();
            that.system.start();
        }
    }, 500);
};

App.prototype.solveStep = function (solution, moon, rocket, t) {

    var results, collision, distance, speed;
    var that = this;
    var h = this.system.time;

    if (this.system.running) {
        return;
    }

    velocity = this.system.vector(solution.degrees, solution.percent);

    moon.state = this.system.rk4(moon.state, h, 2, [this.earth]).pop();

    results = this.system.rk4(rocket.state, h, 2, [this.earth, moon]);
    collision = this.system.draw(results, rocket, [this.earth], 100);

    if (collision) {
        this.count--;
        return;
    }

    rocket.state = results.pop();

    distance = rocket.state.position.diff(moon.state.position).length();
    speed = rocket.state.velocity.diff(moon.state.velocity).length();
    if (distance <= rocket.size().add(moon.size()).x && speed < this.min) {
        this.min = speed;
        this.best = solution;
    }

    setTimeout(function () {
        if (t < 10) {
            that.solveStep(solution, moon, rocket, t + h);
        }
    }, this.system.time);
};

App.prototype.guess = function () {
    return new Solution(this.random(3, 177), this.random(60, 100), this.random(1, 7));
};

App.prototype.random = function (min, max) {
    return Math.floor((Math.random() * (max - min) + min) * 10) / 10;
};

App.prototype.degreesUp = function () {
    this.setDegrees(this.degrees + 0.1);
    this.refresh();
};

App.prototype.degreesDown = function () {
    this.setDegrees(this.degrees - 0.1);
    this.refresh();
};

App.prototype.degreesValue = function () {
    var degrees = parseFloat(prompt('Abschusswinkel (0-180):', this.degrees));
    this.setDegrees(degrees);
    this.refresh();
};

App.prototype.setDegrees = function (degrees) {
    if (!isNaN(degrees) && degrees > 0 && degrees < 180) {
        this.degrees = degrees;
    }
};

App.prototype.percentUp = function () {
    this.setPercent(this.percent + 0.1);
    this.refresh();
};

App.prototype.percentDown = function () {
    this.setPercent(this.percent - 0.1);
    this.refresh();
};

App.prototype.percentValue = function () {
    var percent = parseFloat(prompt('Startgeschwindigkeit (0-100):', this.percent));
    this.setPercent(percent);
    this.refresh();
};

App.prototype.setPercent = function (percent) {
    if (!isNaN(percent) && percent > 0 && percent <= 100) {
        this.percent = percent;
    }
};

App.prototype.timeUp = function () {
    this.setTime(this.time + 0.1);
    this.refresh();
};

App.prototype.timeDown = function () {
    this.setTime(this.time - 0.1);
    this.refresh();
};

App.prototype.timeValue = function () {
    var time = parseFloat(prompt('Bremszeit (0-10):', this.time));
    this.setTime(time);
    this.refresh();
};

App.prototype.setTime = function (time) {
    if (!isNaN(time) && time > 0 && time <= 10) {
        this.time = time;
    }
};

App.prototype.refresh = function () {
    document.getElementById('degrees-value').innerHTML = parseFloat(this.degrees.toPrecision(12)) + '°';
    document.getElementById('percent-value').innerHTML = parseFloat(this.percent.toPrecision(12)) + '%';
    document.getElementById('time-value').innerHTML = parseFloat(this.time.toPrecision(12)) + '"';
    this.system.clear();
    this.preview();
};

App.prototype.velocity = function () {
    return this.system.vector(this.degrees, this.percent);
};

App.prototype.launch = function () {
	this.launched = true;
    this.rocket.state.velocity = this.velocity();
};

App.prototype.preview = function () {

    var results, collision;
    var delay = (Math.floor(this.delay / this.system.time) + 1) * this.system.time;
    var stopped = false;

    var moon = this.moon.clone();
    var rocket = this.rocket.clone();

    results = this.system.rk4(moon.state, delay, 2000, [this.earth]); // start delay
    moon.state = results.pop();
    rocket.state = new State(this.rocket.original.clone().position, this.velocity());

    for (var i = 0; i < 5000; i++) {

        if (i * this.system.time > this.time && !stopped) {
            stopped = true;
            rocket.state.velocity = rocket.state.velocity.multiply(this.break);
        }

        results = this.system.rk4(moon.state, this.system.time, 2, [this.earth]);
        moon.state = results.pop();
        results = this.system.rk4(rocket.state, this.system.time, 2, [this.earth, moon]);
        rocket.state = results.pop();

        collision = this.system.draw(results, rocket, [this.earth, moon], 10);

        if (collision) {
            return;
        }
    }
};

App.prototype.bind = function (id, func) {

    var element = document.getElementById(id);
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

function Solution(degrees, percent, time) {
    this.degrees = degrees;
    this.percent = percent;
    this.time = time;
}
