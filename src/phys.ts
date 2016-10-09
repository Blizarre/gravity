let WIDTH = 640;
let HEIGHT = 480;
const TIMESTEP = 0.5
const NB_PLANETS = 10;
//const G_CST = 6.67e-11 //  N (Mm/kg)2;
//const M = 5.972e24; // earth mass

const G_CST = 6.67e-11 //  N (Mm/kg)2;
const M = 5.972e14; // a mass

import Vector from "./Vector";

class Point {
    constructor(public position: Vector, public velocity: Vector = new Vector(0, 0), public halfAcceleration: Vector = new Vector(0, 0)) { }
    static new(position: Vector) { return new Point(position, new Vector(0, 0), new Vector(0, 0)); }
}




class World {

    planets: Point[] = [];

    constructor(public width: number, public height: number, public nb_planets: number) {
        for (let i = 0; i < nb_planets; i++) {
            this.planets.push(Point.new(new Vector(Math.random() * this.width, Math.random() * this.height)));
        }
    }

    compute_force(planet: Point, other: Point): Vector {
        // this is direction_vector * distance
        let diff: Vector = other.position.sub(planet.position);

        let distance: number = diff.norm();
        // to get X / distance^2, need to divide byt distance ^ 3
        return diff.divIp(distance * distance * distance).mulIp(G_CST * M * M);
    }

    update(timestep) {
        // update the position vector
        for (let p of this.planets) {
            p.position.addIp(
                // (velocity + acceleration * timestep / 2) * timestep
                p.velocity.add(p.halfAcceleration.mul(timestep)).mul(timestep)
            );
        }

        // Update the velocity vector
        for (let p1 of this.planets) {
            let sum_forces = new Vector(0, 0);
            for (let p2 of this.planets) {
                // use the velocity Verlet method: http://gamedev.stackexchange.com/questions/15708/how-can-i-implement-gravity
                if (!p1.position.equal(p2.position)) {
                    // pull_vector = direction_vector * m1*m2*G / (distance * distance)
                    sum_forces.addIp(this.compute_force(p1, p2));
                }
            }
            let newhalfAcceleration = sum_forces.div(2 * M);
            p1.velocity.addIp(
                // timestep * (accelerationv + newAcceleration) / 2
                p1.halfAcceleration.add(newhalfAcceleration).mul(timestep)
            );
            p1.halfAcceleration = newhalfAcceleration;
        }
    }
}


class DrawingBoard {
    constructor(public world: World, public ctx: CanvasRenderingContext2D) { }

    drawPoint(imageData: ImageData, location: Vector) {
        if (location.y >= 0 && location.y < imageData.height && location.x >= 0 && location.x < imageData.width) {
            let offset: number = (location.y | 0) * (imageData.width * 4) + (location.x | 0) * 4;
            imageData.data[offset + 0] = 255;
            imageData.data[offset + 1] = 255;
            imageData.data[offset + 2] = 255;
            imageData.data[offset + 3] = 255;
        }
    }

    draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

        let imageData = ctx.getImageData(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

        for (let p of world.planets) {
            this.drawPoint(imageData, new Vector(p.position.x, p.position.y));
        }

        ctx.putImageData(imageData, 0, 0);
    }
}



let $canv = document.createElement("canvas");
let $message = document.createElement("p");

$canv.width = WIDTH;
$canv.height = HEIGHT;

document.body.appendChild($canv);
document.body.appendChild($message);

let ctx: CanvasRenderingContext2D = $canv.getContext("2d");

let world = new World(WIDTH, HEIGHT, NB_PLANETS);
let drawingBoard = new DrawingBoard(world, ctx);

let time = 0
setInterval(() => {
    world.update(TIMESTEP);
    drawingBoard.draw();
    $message.textContent = "time: " + time + "s.";
    time += TIMESTEP;
}, 500);
