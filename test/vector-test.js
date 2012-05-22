buster.testCase("Vector", {

	setUp: function () {

        this.a = new Vector(1, 2, 3);
        this.b = new Vector(4, 5, 6);
    },

    "addition": function () {

    	var c = this.a.add(this.b);

    	buster.assert.equals(c.x, 5);
    	buster.assert.equals(c.y, 7);
    	buster.assert.equals(c.z, 9);
    },

    "multiplication": function () {

    	var c = this.a.multiply(3);

    	buster.assert.equals(c.x, 3);
    	buster.assert.equals(c.y, 6);
    	buster.assert.equals(c.z, 9);
    },

    "clone": function () {

    	var c = this.a.clone();

    	buster.assert.equals(c.x, 1);
    	buster.assert.equals(c.y, 2);
    	buster.assert.equals(c.z, 3);
    },

    "difference": function () {

    	var c = this.b.diff(this.a);

    	buster.assert.equals(c.x, 3);
    	buster.assert.equals(c.y, 3);
    	buster.assert.equals(c.z, 3);
    },

    "unit": function () {

    	var c = this.a.unit();

    	buster.assert.equals(c.x, 0.2672612419124244);
    	buster.assert.equals(c.y, 0.5345224838248488);
    	buster.assert.equals(c.z, 0.8017837257372732);
    },

    "length": function () {

    	var l = this.a.length();

    	buster.assert.equals(l, 3.7416573867739413);
    }
});
