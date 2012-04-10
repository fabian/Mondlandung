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

System.prototype.w = function (speed, position, t, h) {

    var body, direction, diff = 0, distance = 0, force = 0, a, results = [];

    for (var k = 0; k < t; k = k+h) {

        a = new Vector(0, 0, 0);

        for (var i = 0, length = this.bodies.length; i < length; i++) {

            body = this.bodies[i];

            // skip moving bodies
            if (body.fixed === false) {
                continue;
            }

            diff = body.position.diff(position);
            distance = diff.length();

            force = this.gravity * body.mass * (distance / Math.pow(Math.abs(distance), 3));
            a = a.add(diff.unit().multiply(force));

            if (distance < 60) {
                speed = a = new Vector(0, 0, 0);
            }
        }

        speed = speed.add(a.multiply(h));

        position = position.add(speed.multiply(h));

        results.push({speed: speed, position: position});
    }

    return results;
};

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

    var body, result;

    for (var i = 0, length = this.bodies.length; i < length; i++) {

        body = this.bodies[i];

        result = this.w(body.speed, body.position, 2, 0.01).pop();

        body.position = result.position;
        body.speed = result.speed;
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

System.prototype.draw = function (results, each) {

    var position;

    // fade out trace
    for (var i = 0, length = results.length; i < length; i++) {
        if (i % each == 0) {
            position = results[i].position;
            this.context.fillStyle = 'rgba(255, 236, 145, 1)';
            this.context.fillRect(position.x, position.y, 1, 1);
        }
    }
};

System.prototype.clear = function (results) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
    this.div.style.left = (this.position.x - this.div.offsetWidth / 2) + "px";
    this.div.style.top = (this.position.y - this.div.offsetHeight / 2) + "px";
};

