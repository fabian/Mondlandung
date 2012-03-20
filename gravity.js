
function System(trace) {

    this.bodies = [];

    this.time = 30;
    this.gravity = 0.667;

    this.canvas = document.getElementById(trace).getContext('2d');
    this.traces = [];

    var that = this;
    setInterval(function () {
        that.tick();
    }, this.time);
}

System.prototype.tick = function () {

    var i, trace;

    for (i in this.bodies) {
        this.bodies[i].live();
    }

    this.canvas.clearRect(0, 0, 1000, 700);
    for (i in this.traces) {
        trace = this.traces[i];
        this.canvas.fillStyle = 'rgba(255, 236, 145, 1)';
        this.canvas.fillRect(trace.x, trace.y, 1, 1);
    }
};

System.prototype.add = function (body) {
    this.bodies.push(body);
};

function Body(id, system, mass, speed_x, speed_y, fixed) {

    this.div = document.getElementById(id);
    this.system = system;
    this.mass = mass;
    this.speed = {x: speed_x, y: speed_y};
    this.position = {x: this.div.offsetLeft + this.div.offsetWidth / 2, y: this.div.offsetTop + this.div.offsetHeight / 2}
    this.fixed = fixed;
    
    // add body to system
    this.system.add(this);
}

Body.prototype.draw = function () {
    this.div.style.left = (this.position.x - this.div.offsetWidth / 2) + "px";
    this.div.style.top = (this.position.y - this.div.offsetHeight / 2) + "px";
};

Body.prototype.drift = function () {
    this.position.x += this.speed.x;
    this.position.y += this.speed.y;
};

Body.prototype.delta = function (body) {
    return {x: body.position.x - this.position.x, y: body.position.y - this.position.y};
};

Body.prototype.live = function () {

    if (this.fixed) {
        return;
    }

    var dx = 0;
    var dy = 0;
    var ndx = 0;
    var ndy = 0;
    var i, body;

    for (i in this.system.bodies) {

        body = this.system.bodies[i];

        if (body === this) {
            continue;
        }

        var delta = this.delta(body);

        var theta = Math.atan2(delta.y, delta.x);

        var distance2 = delta.y * delta.y + delta.x * delta.x;
        var ndx = delta.x / Math.sqrt(distance2);
        var ndy = delta.y / Math.sqrt(distance2);

        var force = this.system.gravity * this.mass * body.mass / distance2;
        dx += force * Math.cos(theta);
        dy += force * Math.sin(theta);
    }

    this.speed.x += dx;
    this.speed.y += dy;
    this.drift();

    this.draw();
    this.system.traces.push({x: this.position.x, y: this.position.y});
};

