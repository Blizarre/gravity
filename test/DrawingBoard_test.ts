import DrawingBoard from "../src/DrawingBoard";
import Vector from "../src/Vector";


describe("Drawing Board", function() {
    let draw = new DrawingBoard(undefined);

    it("can be moved across the world view", function() {
        for(var i =-1000; i < 1000; i+=500)
        {
            for(var j =-1000; j < 1000; j+=500)
            {
                let center = new Vector(i, j)
                console.log("(" + i + "," + j + ")")
                // setcenter will change the central value in the WORLD coordinate system.
                draw.setCenter(center)
                // X--------------+
                // |topLeftCorner | H
                // |              | E
                // |      X center| I
                // |         (i,j)| G
                // |              | H
                // +----WIDTH-----+ T
                expect(draw.topLeftCorner()).toEqual(
                    draw.screenToWorld(new Vector(0, 0)))
                expect(draw.worldToScreen(center)).toEqual(
                    draw.getSize_px().div(2))
            }
        }
    })

    draw = new DrawingBoard(undefined);

    it("will give the same pixel location after being transformed to world space and back", function() {
      for(var i =-1000; i < 1000; i+=100)
      {
          for(var j =-1000; j < 1000; j+=100)
          {
              for(var scaling = 0.01; scaling < 1000; scaling *= 10) {
                  draw.move_px(i, j)
                  draw.scale(scaling)
                  expect(draw.worldToScreen(draw.screenToWorld(new Vector(640, 480)))).toEqual(new Vector(640, 480));
              }
          }
      }
    });

});

