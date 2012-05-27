buster.testCase("Derivative", {

	setUp: function () {

        var velocity = new Vector(1, 2, 3);
        var acceleration = new Vector(4, 5, 6);

        this.derivative = new Derivative(velocity, acceleration);
    },

    "velocity": function () {

    	buster.assert.equals(this.derivative.velocity.x, 1);
    	buster.assert.equals(this.derivative.velocity.y, 2);
    	buster.assert.equals(this.derivative.velocity.z, 3);
    },

    "acceleration": function () {

    	buster.assert.equals(this.derivative.acceleration.x, 4);
    	buster.assert.equals(this.derivative.acceleration.y, 5);
    	buster.assert.equals(this.derivative.acceleration.z, 6);
    }
});
