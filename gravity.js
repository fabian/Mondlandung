/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:false, undef:true, curly:true, browser:true, indent:4, maxerr:50 */

function Vector(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

Vector.prototype.add = function (v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
};

Vector.prototype.multiply = function (k) {
    this.x *= k;
    this.y *= k;
    this.z *= k;
};

Vector.prototype.clone = function () {
    return new Vector(this.x, this.y, this.z);
};

Vector.prototype.diff = function (v) {
    return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
};

Vector.prototype.unit = function () {
    var length = this.length();
    return new Vector(this.x / length, this.y / length, this.z / length);
};

Vector.prototype.length = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};

function System(trace) {

    this.bodies = [];
    this.running = false;

    this.time = 15;
    this.gravity = 0.667;

    this.canvas = document.getElementById(trace);
    this.context = this.canvas.getContext('2d');
}

System.prototype.start = function () {

    var that = this;

    setInterval(function () {
        if (that.running) {
            that.calc();
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

System.prototype.calc = function () {
    for (var i = 0, length = this.bodies.length; i < length; i++) {
        this.bodies[i].live();
    }
};

System.prototype.refresh = function () {
    for (var i = 0, length = this.bodies.length; i < length; i++) {
        this.bodies[i].draw();
    }
};

System.prototype.add = function (body) {
    this.bodies.push(body);
};

System.prototype.draw = function (position, color) {
    this.context.fillStyle = color;
    this.context.fillRect(Math.round(position.x), Math.round(position.y), 1, 1);
};

function Body(id, system, mass, speed, fixed) {

    this.div = document.getElementById(id);
    this.system = system;
    this.mass = mass;
    this.fixed = fixed;
    this.traces = [];

    this.speed = speed;
    this.position = this.offset();

    // add body to system
    this.system.add(this);
}

Body.prototype.offset = function () {
    return new Vector(this.div.offsetLeft + this.div.offsetWidth / 2, this.div.offsetTop + this.div.offsetHeight / 2, 0);
};

Body.prototype.draw = function () {

    var trace;

    this.div.style.left = (this.position.x - this.div.offsetWidth / 2) + "px";
    this.div.style.top = (this.position.y - this.div.offsetHeight / 2) + "px";

    this.system.draw(this.position, 'rgba(255, 236, 145, 1)');

    this.traces.push(this.position.clone());

    // remove older than 100
    if (this.traces.length > 100) {
        trace = this.traces.shift();
        this.system.draw(trace, 'rgba(6, 17, 26, 1)');
    }

    // fade out trace
    for (var i = 0, length = this.traces.length; i < length; i++) {
        trace = this.traces[i];
        this.system.draw(trace, 'rgba(6, 17, 26, 0.02)');
    }
};

Body.prototype.drift = function () {
    this.position.add(this.speed);
};

Body.prototype.live = function () {

    if (this.fixed) {
        return;
    }

    var body, unit, diff = 0, distance = 0, force = 0, delta = new Vector(0, 0, 0);

    for (var i = 0, length = this.system.bodies.length; i < length; i++) {

        body = this.system.bodies[i];

        // skip moving bodies and the body itself
        if (body.fixed === false || body === this) {
            continue;
        }

        diff = body.position.diff(this.position);

        distance = diff.length();
        unit = diff.unit();

        force = this.system.gravity * this.mass * body.mass / (distance * distance);
        unit.multiply(force);

        delta.add(unit);

        if (distance < 60) {
            this.speed = delta = new Vector(0, 0, 0);
        }
    }

    this.speed.add(delta);
    this.drift();
};

