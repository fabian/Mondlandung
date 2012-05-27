buster.testCase("State", {

	setUp: function () {

        var a = new Vector(1, 2, 3);
        var b = new Vector(4, 5, 6);

        this.state = new State(a, b);
    },

    "position": function () {

    	buster.assert.equals(this.state.position.x, 1);
    	buster.assert.equals(this.state.position.y, 2);
    	buster.assert.equals(this.state.position.z, 3);
    },

    "velocity": function () {

    	buster.assert.equals(this.state.velocity.x, 4);
    	buster.assert.equals(this.state.velocity.y, 5);
    	buster.assert.equals(this.state.velocity.z, 6);
    },

    "clone": function () {

		var clone = this.state.clone();

		clone.position.x = 7;
		clone.position.y = 8;
		clone.position.z = 9;

    	buster.assert.equals(clone.position.x, 7);
    	buster.assert.equals(clone.position.y, 8);
    	buster.assert.equals(clone.position.z, 9);
    	buster.assert.equals(this.state.position.x, 1);
    	buster.assert.equals(this.state.position.y, 2);
    	buster.assert.equals(this.state.position.z, 3);

		clone.velocity.x = 10;
		clone.velocity.y = 11;
		clone.velocity.z = 12;

    	buster.assert.equals(clone.velocity.x, 10);
    	buster.assert.equals(clone.velocity.y, 11);
    	buster.assert.equals(clone.velocity.z, 12);
    	buster.assert.equals(this.state.velocity.x, 4);
    	buster.assert.equals(this.state.velocity.y, 5);
    	buster.assert.equals(this.state.velocity.z, 6);
    }
});
