import DrawingBoard from "../src/DrawingBoard";
import Vector from "../src/Vector";


describe("Drawing Board", function() {
    let draw = new DrawingBoard(undefined);

      it("will give the same pixel location after being transformed to world space and back", function() {
          for(var i =-1000; i < 1000; i+=100)
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

