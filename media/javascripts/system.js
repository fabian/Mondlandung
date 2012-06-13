/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:false, undef:true, curly:true, browser:true, indent:4, maxerr:50 */

function System(trace, earth, moon, rocket) {

    this.bodies = [];
    this.running = false;

	this.t = 0;
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
    this.running = true;
};

System.prototype.pause = function () {
    this.running = false;
};

System.prototype.calc = function (body, integration, bodies) {

    var results, result;

	results = integration.call(this, body.state, this.time/1000, 2, bodies);
	result = results.pop();

    if (!this.collision(result.position, body, bodies)) {
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
        	body.collision(b, diff);
        }
    }

    return collision;
};

System.prototype.step = function () {

	if (this.running) {

		this.t = this.t + this.time/1000;

		this.calc(this.moon, this.rk4, [this.earth]);
		this.calc(this.rocket, this.rk4, [this.earth, this.moon]);
	}
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

System.prototype.vector = function (degrees, percent) {
    var radians = (degrees - 135) * (Math.PI / 180);
    var force = 400 * (percent / 100);
    return new Vector(Math.cos(radians) * force, Math.sin(radians) * force, 0);
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
    this.original = this.state.clone();

    this.callbacks = [];
}

Body.prototype.reset = function () {
    this.state = this.original.clone();
};

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

Body.prototype.addCallback = function (callback) {
	this.callbacks.push(callback);
};

Body.prototype.collision = function (body, diff) {
	for (var i = 0; i < this.callbacks.length; i++) {
		this.callbacks[i].call(this, body, diff);
	}
};
