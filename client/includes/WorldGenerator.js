/**
 * Tool for converting from objects representing walls to JSON that can be
 * used to render the scene.
 *
 * NOTE: Walls must be parallel to the x or z axes.
 * "width" and "height" represent the conventional numbers you would imagine
 * if you were looking at the wall head-on.
 * NOTE: This tool does not take into account the fact that you might want to
 * reverse the textures in some instances.
 */

function WorldGenerator() {
  this.recipe = [
    // Far wall (A-Left)
    {
      s: 1.5,
      t: 1,
      width: 1.5,
      height: 1.0,
      origin: [-2.0, 1.0, -2.0],
      dir: "x"
    },
    // Far wall (A-Right)
    {
      s: 1.5,
      t: 1,
      width: 1.5,
      height: 1.0,
      origin: [0.5, 1.0, -2.0],
      dir: "x"
    },
    // Near wall (B-Left)
    {
      s: 1.5,
      t: 1,
      width: 1.5,
      height: 1.0,
      origin: [-2.0, 1.0, 2.0],
      dir: "x"
    },
    // Near wall (B-Right)
    {
      s: 1.5,
      t: 1,
      width: 1.5,
      height: 1.0,
      origin: [0.5, 1.0, 2.0],
      dir: "x"
    },
    // Left wall (C-Left)
    {
      s: 1.5,
      t: 1,
      width: 1.5,
      height: 1.0,
      origin: [-2.0, 1.0, -2.0],
      dir: "z"
    },
    // Left wall (C-Right)
    {
      s: 1.5,
      t: 1,
      width: 1.5,
      height: 1.0,
      origin: [-2.0, 1.0, 0.5],
      dir: "z"
    },
    // Right wall (D-Left)
    {
      s: 1.5,
      t: 1,
      width: 1.5,
      height: 1.0,
      origin: [2.0, 1.0, -2.0],
      dir: "z"
    },
    // Right wall (D-Right)
    {
      s: 1.5,
      t: 1,
      width: 1.5,
      height: 1.0,
      origin: [2.0, 1.0, 0.5],
      dir: "z"
    },
    // E near A
    {
      s: 1,
      t: 1,
      width: 1.0,
      height: 1.0,
      origin: [-0.5, 1.0, -3.0],
      dir: "z"
    },
    // H near A
    {
      s: 2.0,
      t: 1,
      width: 2.0,
      height: 1.0,
      origin: [0.5, 1.0, -4.0],
      dir: "z"
    },
    // G near A
    {
      s: 2.0,
      t: 1,
      width: 2.0,
      height: 1.0,
      origin: [-1.5, 1.0, -4.0],
      dir: "x"
    },
    // F near A
    {
      s: 1.0,
      t: 1,
      width: 1.0,
      height: 1.0,
      origin: [-1.5, 1.0, -3.0],
      dir: "x"
    },

    // E near B
    {
      s: 1,
      t: 1,
      width: 1.0,
      height: 1.0,
      origin: [0.5, 1.0, 2.0],
      dir: "z"
    },
    // H near B
    {
      s: 2.0,
      t: 1,
      width: 2.0,
      height: 1.0,
      origin: [-0.5, 1.0, 2.0],
      dir: "z"
    },
    // G near B
    {
      s: 2.0,
      t: 1,
      width: 2.0,
      height: 1.0,
      origin: [-0.5, 1.0, 4.0],
      dir: "x"
    },
    // F near B
    {
      s: 1.0,
      t: 1,
      width: 1.0,
      height: 1.0,
      origin: [0.5, 1.0, 3.0],
      dir: "x"
    },

    // E near C
    {
      s: 1,
      t: 1,
      width: 1.0,
      height: 1.0,
      origin: [-3.0, 1.0, 0.5],
      dir: "x"
    },
    // H near C
    {
      s: 2.0,
      t: 1,
      width: 2.0,
      height: 1.0,
      origin: [-4.0, 1.0, -0.5],
      dir: "x"
    },
    // G near C
    {
      s: 2.0,
      t: 1,
      width: 2.0,
      height: 1.0,
      origin: [-4.0, 1.0, -0.5],
      dir: "z"
    },
    // F near C
    {
      s: 1.0,
      t: 1,
      width: 1.0,
      height: 1.0,
      origin: [-3.0, 1.0, 0.5],
      dir: "z"
    },

    // E near D
    {
      s: 1,
      t: 1,
      width: 1.0,
      height: 1.0,
      origin: [2.0, 1.0, -0.5],
      dir: "x"
    },
    // H near D
    {
      s: 2.0,
      t: 1,
      width: 2.0,
      height: 1.0,
      origin: [2.0, 1.0, 0.5],
      dir: "x"
    },
    // G near D
    {
      s: 2.0,
      t: 1,
      width: 2.0,
      height: 1.0,
      origin: [4.0, 1.0, -1.5],
      dir: "z"
    },
    // F near D
    {
      s: 1.0,
      t: 1,
      width: 1.0,
      height: 1.0,
      origin: [3.0, 1.0, -1.5],
      dir: "z"
    }
  ];

  this.generateWorld = function() {
    var output = [];
    for (var i in this.recipe) {
      var obj = this.recipe[i];

      for (var r = 1; r <= 6; r++) {
        var row = [];
        switch (r) {
          case 1:
          case 4:
            row.push(obj.origin[0]);
            row.push(obj.origin[1]);
            row.push(obj.origin[2]);
            row.push(0);
            row.push(obj.t);
            break;
          case 2:
            row.push(obj.origin[0]);
            row.push(obj.origin[1] - obj.height);
            row.push(obj.origin[2]);
            row.push(0);
            row.push(0);
            break;
          case 3:
          case 6:
            row.push((obj.dir == "x") ? obj.origin[0] + obj.width : obj.origin[0]);
            row.push(obj.origin[1] - obj.height);
            row.push((obj.dir == "x") ? obj.origin[2] : obj.origin[2] + obj.width);
            row.push(obj.s);
            row.push(0);
            break;
          case 5:
            row.push((obj.dir == "x") ? obj.origin[0] + obj.width : obj.origin[0]);
            row.push(obj.origin[1]);
            row.push((obj.dir == "x") ? obj.origin[2] : obj.origin[2] + obj.width);
            row.push(obj.s);
            row.push(obj.t);
            break;
        }
        output.push(row);
      }
    }
    return output;
  }
}
