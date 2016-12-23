import DrawingBoard from "../src/DrawingBoard";
import Vector from "../src/Vector";


describe("Drawing Board", function() {
      let draw = new DrawingBoard(undefined);

      it("will give the same pixel location after being transformed to world space and back", function() {
          for(var i =-1000; i < 1000; i+=100)
          {
              for(var j =-1000; j < 1000; j+=100)
              {
                  for(var scaling = 0.01; scaling < 1000; scaling *= 10) {
                      draw.move(i, j)
                      draw.scale(scaling)
                      expect(draw.worldToPoint(draw.pointToWorld(new Vector(640, 480)))).toEqual(new Vector(640, 480));
                  }
              }
          }
      });

});

