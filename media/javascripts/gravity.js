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

    var body, diff, distance, force, a, velocity = state.velocity;

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
    }

	return a;
};

System.prototype.euler = function (state, t, steps, bodies) {

    var results = [], result = state.clone(), h = t / steps, a;

    for (var k = 0; k < t; k = k + h) {

		a = this.acceleration(result, bodies);

		// y = y + h*a

	    // change position based on velocity
	    result.position = result.position.add(result.velocity.multiply(h));

	    // increase velocity with acceleration
	    result.velocity = result.velocity.add(a.multiply(h));

        // add step to results array
        results.push(result.clone());
    }

    return results;
};

System.prototype.rk4 = function (state, t, steps, bodies) {

    var results = [], result = state.clone(), h = t / steps, a, velocity, d0, d1, d2, d3, d4, diff;

	var that = this;
	function evaluate(state, h, derivative, bodies) {

		var result = state.clone(), a;

	    // increase velocity with acceleration
	    result.velocity = result.velocity.add(derivative.acceleration.multiply(h));

	    // change position based on velocity
	    result.position = result.position.add(derivative.velocity.multiply(h));

		a = that.acceleration(result, bodies);

		return new Derivative(result.velocity, a);
	}

    for (var k = 0; k < t; k = k + h) {

		d0 = new Derivative(new Vector(0, 0, 0), new Vector(0, 0, 0));
		d1 = evaluate(result, 0, d0, bodies);
		d2 = evaluate(result, h/2, d1, bodies);
		d3 = evaluate(result, h/2, d2, bodies);
		d4 = evaluate(result, h, d3, bodies);

		// k = (1/6) * ((ka + 2*kb + 2*kc + kd));
		a = d1.acceleration.add(d2.acceleration.multiply(2)).add(d3.acceleration.multiply(2)).add(d4.acceleration).multiply(1/6);
		velocity = d1.velocity.add(d2.velocity.multiply(2)).add(d3.velocity.multiply(2)).add(d4.velocity).multiply(1/6);

		// y = y + h*a

	    // change position based on velocity
	    result.position = result.position.add(velocity.multiply(h));

	    // increase velocity with acceleration
	    result.velocity = result.velocity.add(a.multiply(h));

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

System.prototype.calc = function (body, integration, bodies, trace) {

    var results, result;

	results = integration.call(this, body.state, this.time/1000, 2, bodies);
	result = results.pop();

    if (!this.collision(result.position, body, bodies)) {
    	if (trace) {
	    	this.draw(results, body, bodies, 10);
	    }
	    body.state = result;
    }
};

System.prototype.collision = function (position, body, bodies) {

    var b, collision = false;

    // collision detection
    for (var i = 0, length = bodies.length; i < length; i++) {

        b = bodies[i];

        // calculate distance between current position and other body
        diff = b.state.position.diff(position);

        if (diff.length() < b.size().add(body.size()).x) {
        	collision = true;
        }
    }

    return collision;
};

System.prototype.step = function () {

	this.calc(this.moon, this.rk4, [this.earth], false);
	this.calc(this.rocket, this.rk4, [this.earth, this.moon], true);
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

System.prototype.draw = function (results, body, bodies, each) {

    var position;

    for (var i = 0, length = results.length; i < length; i++) {

        if (i % each === 0) {

            position = results[i].position;

			if (this.collision(position, body, bodies)) {
				return;
			}

            this.context.fillStyle = 'rgba(255, 236, 145, 1)';
            this.context.fillRect(position.x, position.y, 1, 1);
        }
    }
};

System.prototype.clear = function (results) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

function Body(id, mass, velocity, fixed) {

    this.div = document.getElementById(id);
    this.mass = mass;
    this.fixed = fixed;
    this.traces = [];

    this.state = new State(this.offset(), velocity);
}

Body.prototype.offset = function () {
    return new Vector(this.div.offsetLeft + this.div.offsetWidth / 2, this.div.offsetTop + this.div.offsetHeight / 2, 0);
};

Body.prototype.size = function () {
    return new Vector(this.div.offsetWidth / 2, this.div.offsetHeight / 2, 0);
};

Body.prototype.draw = function () {
    this.div.style.left = (this.state.position.x - this.div.offsetWidth / 2) + "px";
    this.div.style.top = (this.state.position.y - this.div.offsetHeight / 2) + "px";
};

function State(position, velocity) {
	this.position = position;
	this.velocity = velocity;
}

State.prototype.clone = function () {
    return new State(this.position.clone(), this.velocity.clone());
};

function Derivative(velocity, acceleration) {
	this.velocity = velocity; // derivative of position
	this.acceleration = acceleration; // derivative of velocity
}
