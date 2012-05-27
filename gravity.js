/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:false, undef:true, curly:true, browser:true, indent:4, maxerr:50 */

function Vector(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

Vector.prototype.add = function (v) {
    return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
};

Vector.prototype.multiply = function (k) {
    return new Vector(this.x * k, this.y * k, this.z * k);
};

Vector.prototype.clone = function () {
    return new Vector(this.x, this.y, this.z);
};

Vector.prototype.diff = function (v) {
    if (v != undefined) {
        return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
    }
};

Vector.prototype.unit = function () {
    var length = this.length();
    return new Vector(this.x / length, this.y / length, this.z / length);
};

Vector.prototype.length = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};

function System(trace, earth, moon, rocket) {

    this.bodies = [];
    this.running = false;

    this.time = 15;
    this.gravity = 0.667;

    this.earth = earth;
    this.moon = moon;
    this.rocket = rocket;

    this.add(moon);
    this.add(rocket);

    this.canvas = document.getElementById(trace);
    this.context = this.canvas.getContext('2d');
}

System.prototype.acceleration = function (state, bodies) {

    var body, diff, distance, force, a, speed = state.speed;

    // init acceleration
    a = new Vector(0, 0, 0);

    for (var i = 0, length = bodies.length; i < length; i++) {

        body = bodies[i];

        // calculate distance between current position and other body
        diff = body.state.position.diff(state.position);
        distance = diff.length();

        // calculate gravitational force and add it to acceleration
        force = this.gravity * body.mass * (distance / Math.pow(Math.abs(distance), 3));
        a = a.add(diff.unit().multiply(force));

        // collision detection
        if (distance < 60) {
            a = new Vector(0, 0, 0);
        }
    }

	return a;
};

System.prototype.euler = function (state, t, steps, bodies) {

    var results = [], result = state.clone(), h = t / steps, a;

    for (var k = 0; k < t; k = k + h) {

		a = this.acceleration(result, bodies);

		// y = y + h*a

	    // increase speed with acceleration
	    result.speed = result.speed.add(a.multiply(h));
	
	    // change position based on speed
	    result.position = result.position.add(result.speed.multiply(h));

        // add step to results array
        results.push(result.clone());
    }

    return results;
};

System.prototype.start = function () {

    var that = this;

    setInterval(function () {
        if (that.running) {
            that.step();
        }
    }, this.time);

    setInterval(function () {
        that.refresh();
    }, this.time);

    this.run();
};

System.prototype.pause = function () {
    this.running = false;
};

System.prototype.run = function () {
    this.running = true;
};

System.prototype.step = function () {

    var body, results;

	results = this.euler(this.moon.state, this.time/10, 5, [this.earth]);
	this.draw(results, 10);
    this.moon.state = results.pop();
    //this.rocket.state = this.euler(this.rocket.state, 1, 0.1, [this.earth, this.moon]).pop();
};

System.prototype.refresh = function () {
    var landed = false;
    var lastBody = [];
    var distance, diff = 99999;
    
    for (var i = 0, length = this.bodies.length; i < length; i++) {
        this.bodies[i].draw();

        diff = this.bodies[i].state.position.diff(lastBody.position);

        if (diff != undefined) {
            distance = diff.length();
        }

        if (distance < 30) {
            landed = true;
        }
        
        lastBody = this.bodies[i];
    }
    
    if (landed) {
        console.log("The eagle has landed!");
        this.pause();
    }
};

System.prototype.add = function (body) {
    this.bodies.push(body);
};

System.prototype.draw = function (results, each) {

    var position;

    // fade out trace
    for (var i = 0, length = results.length; i < length; i++) {
        if (i % each === 0) {
            position = results[i].position;
            this.context.fillStyle = 'rgba(255, 236, 145, 1)';
            this.context.fillRect(position.x, position.y, 1, 1);
        }
    }
};

System.prototype.clear = function (results) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

function Body(id, mass, speed, fixed) {

    this.div = document.getElementById(id);
    this.mass = mass;
    this.fixed = fixed;
    this.traces = [];

    this.state = new State(speed, this.offset());
}

Body.prototype.offset = function () {
    return new Vector(this.div.offsetLeft + this.div.offsetWidth / 2, this.div.offsetTop + this.div.offsetHeight / 2, 0);
};

Body.prototype.draw = function () {
    this.div.style.left = (this.state.position.x - this.div.offsetWidth / 2) + "px";
    this.div.style.top = (this.state.position.y - this.div.offsetHeight / 2) + "px";
};

function State(speed, position) {
	this.speed = speed;
	this.position = position;
}

State.prototype.clone = function () {
    return new State(this.speed.clone(), this.position.clone());
};

