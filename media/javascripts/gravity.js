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
