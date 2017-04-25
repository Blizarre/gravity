import { DEFAULT_RESOLUTION } from "./constants";
import Planet from "./Planet";
import Vector from "./Vector";

class DrawingBoard {

    viewPortCenter: Vector;

    // resolution in meter / pixel
    resolution: number;

    constructor(public size_px: Vector, public ctx: CanvasRenderingContext2D) {
        this.resolution = DEFAULT_RESOLUTION;
        this.viewPortCenter = new Vector(0, 0);
    }

    getSize_px(): Vector {
        return this.size_px;
    }

    setSize_px(width: number, height: number) {
        this.size_px = new Vector(width, height);
    }

    setCenter(center: Vector) {
        this.viewPortCenter = center.mul(1)
    }

    scale(factor: number) {
        this.resolution *= factor;
    }

    move_px(dx: number, dy: number) {
        this.viewPortCenter.addIp(new Vector(dx, dy).mulIp(this.resolution));
    }

    screenToWorld(pixel_coord: Vector) {
        return pixel_coord.mul(this.resolution).addIp(this.topLeftCorner())
    }

    worldToScreen(world_coord: Vector, topLeftCorner:Vector = undefined) {
        let tlc = topLeftCorner == null ? this.topLeftCorner() : topLeftCorner
        return world_coord.sub(tlc).divIp(this.resolution);
    }

    clear() {
        let ct = this.ctx;
        ct.fillStyle = "black";
        ct.fillRect(0, 0, this.size_px.x, this.size_px.y);
    }

    topLeftCorner() {
        return this.viewPortCenter.sub(
            this.getSize_px().div(2).mul(this.resolution)
        );
    }


    draw(planets: Planet[], debug: boolean, renderTime: number) {
        let ct = this.ctx;
        for (let p of planets) {
            let relativePosition = this.worldToScreen(p.position);

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
            ct.fillText("[d] toggle debug", 20, 40);
            ct.fillText("[p] toggle pause", 20, 60);
            ct.fillText("[+/-] zoom in-out", 20, 80);
            ct.fillText("[←/→/↑/↓] move", 20, 100);
        }
    }
}

export default DrawingBoard
