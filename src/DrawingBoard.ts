import { DEFAULT_RESOLUTION, WIDTH, HEIGHT } from "./constants";
import Planet from "./Planet";
import Vector from "./Vector";

class DrawingBoard {

    viewPortCenter: Vector;
    resolution: number;

    constructor(public ctx: CanvasRenderingContext2D) {
        this.resolution = DEFAULT_RESOLUTION;
        this.viewPortCenter = new Vector(0, 0);
    }

    scale(factor) {
        this.resolution *= factor;
    }

    move(dx, dy) {
        this.viewPortCenter.addIp(new Vector(dx, dy).mulIp(this.resolution));
    }

    draw(planets: Planet[], debug: boolean, renderTime: number) {
        let topLeftCorner = this.viewPortCenter.sub(new Vector(WIDTH, HEIGHT).div(2).mul(this.resolution));
        let ct = this.ctx;
        ct.fillStyle = "black";
        ct.fillRect(0, 0, ct.canvas.clientWidth, ct.canvas.clientHeight);
        for (let p of planets) {
            let relativePosition = p.position.sub(topLeftCorner).divIp(this.resolution);

            // Draw PLanet
            ct.beginPath();
            ct.fillStyle = p.color;
            ct.arc(relativePosition.x, relativePosition.y, p.radius / this.resolution, 0, Math.PI * 2, true);
            ct.fill();

            if (debug) {
                // Draw cross on each planet
                ct.beginPath();
                ct.strokeStyle = "white";
                ct.lineWidth = 1;
                ct.moveTo(relativePosition.x, relativePosition.y - 2);
                ct.lineTo(relativePosition.x, relativePosition.y + 2);
                ct.moveTo(relativePosition.x + 2, relativePosition.y);
                ct.lineTo(relativePosition.x - 2, relativePosition.y);
                ct.stroke();

                // Draw Velocity vector: 2 pixel wide so that it can still be seen
                // behind the acceleration
                ct.beginPath();
                ct.strokeStyle = "blue";
                ct.lineWidth = 3;
                ct.moveTo(relativePosition.x, relativePosition.y);
                ct.lineTo(relativePosition.x + p.velocity.x / this.resolution, relativePosition.y + p.velocity.y / this.resolution);
                ct.stroke();

                // Draw aceleration vector: * 10 factor as it is nearly invisible
                ct.beginPath();
                ct.strokeStyle = "yellow";
                ct.lineWidth = 1;
                ct.moveTo(relativePosition.x, relativePosition.y);
                ct.lineTo(relativePosition.x + 10 * p.acceleration.x / this.resolution, relativePosition.y + 10 * p.acceleration.y / this.resolution);
                ct.stroke();

            }
        }
        if (debug) {
            // Draw render time for the previous frame
            ct.fillStyle = "white";
            ct.font = "16px sans-serif";
            ct.fillText("render: " + renderTime + "ms.", 20, 20);
            ct.fillText("[d] to disable", 20, 40);
        }
    }
}

export default DrawingBoard
