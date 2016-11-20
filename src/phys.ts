let WIDTH = 1000;
let HEIGHT = 600;
const TIMESTEP = 0.5
const NB_PLANETS = 10;


import { G_CST, DEFAULT_RESOLUTION } from "./constants";
import Vector from "./Vector";
import Planet from "./Planet";


class World {

    planets: Planet[] = [];

    constructor(public width: number, public height: number, public nb_planets: number) {
        // Sun 1
        this.planets.push(new Planet(
            new Vector(0, 5000000),
            1000000,
            new Vector(100000, 0),
            new Vector(0, 0),
            "red"));

        // Sun 2
        this.planets.push(new Planet(
            new Vector(0, -5000000),
            1000000,
            new Vector(-100000, 0),
            new Vector(0, 0),
            "yellow"));

        for (let i = 0; i < nb_planets; i++) {
            this.planets.push(new Planet(
                Vector.random(5500000, 5500000),
                Math.random() * 100000,
                Vector.random(0, 500000),
                new Vector(0, 0),
                "blue"));
        }
    }


    compute_force(planet: Planet, other: Planet): Vector {
        // this is direction * distance
        let diff: Vector = other.position.sub(planet.position);

        let distance: number = diff.norm();
        let direction: Vector = diff.div(distance);
        // force = G * M1 * M2 / (distance ^ 2)
        return direction.mulIp(G_CST * planet.mass * other.mass).divIp(distance * distance);
    }

    update(timestep) {
        // update the position vector
        for (let p of this.planets) {
            p.position.addIp(
                // (velocity + acceleration * timestep / 2) * timestep
                p.velocity.add(p.acceleration.mul(timestep).div(2)).mul(timestep)
            );
        }

        // Update the velocity vector
        for (let p1 of this.planets) {
            let sum_forces = new Vector(0, 0);
            for (let p2 of this.planets) {
                if (p1 == p2) {
                    continue;
                    // collision: FIXME: might miss if tow elements are very very fast
                } else if (p1.position.sub(p2.position).norm() < p1.radius + p2.radius) {
                    continue;
                    // use the velocity Verlet method: http://gamedev.stackexchange.com/questions/15708/how-can-i-implement-gravity
                } else {
                    // pull_vector = direction_vector * m1*m2*G / (distance * distance)
                    sum_forces.addIp(this.compute_force(p1, p2));
                }
            }
            // newAcceleration = sum_forces / M
            let newacceleration = sum_forces.div(p1.mass);
            // velocity +=
            p1.velocity.addIp(
                // timestep * (acceleration + newAcceleration) / 2
                p1.acceleration.add(newacceleration).div(2).mul(timestep)
            );
            p1.acceleration = newacceleration;
        }
    }
}


class DrawingBoard {

    offset: Vector;
    resolution: number;

    constructor(public ctx: CanvasRenderingContext2D) {
        this.resolution = DEFAULT_RESOLUTION;
        this.offset = new Vector(- WIDTH * this.resolution / 2, - HEIGHT * this.resolution / 2)
    }

    scale(factor) {
        this.resolution *= factor;
        this.offset = new Vector(- WIDTH * this.resolution / 2, - HEIGHT * this.resolution / 2)
    }

    draw(planets: Planet[], debug: boolean, renderTime: number) {
        let ct = this.ctx;
        ct.fillStyle = "black";
        ct.fillRect(0, 0, ct.canvas.clientWidth, ct.canvas.clientHeight);
        for (let p of planets) {
            let relativePosition = p.position.sub(this.offset).divIp(this.resolution);

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
                ct.moveTo(relativePosition.x , relativePosition.y - 2);
                ct.lineTo(relativePosition.x , relativePosition.y + 2);
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
        if(debug) {
            // Draw render time for the previous frame
            ct.fillStyle = "white";
            ct.font = "16px sans-serif";
            ct.fillText("render: " + renderTime + "ms.", 20, 20);
            ct.fillText("[d] to disable", 20, 40);
        }
    }
}



let $canv = document.createElement("canvas");
$canv.width = WIDTH;
$canv.height = HEIGHT;


window.onload = function() {
    let debug = true;
    let ctx: CanvasRenderingContext2D = $canv.getContext("2d");
    let world = new World(WIDTH, HEIGHT, NB_PLANETS);
    let drawingBoard = new DrawingBoard(ctx);

    document.body.appendChild($canv);

    document.onkeypress = (event: KeyboardEvent) => {
        if (event.key == "+") { drawingBoard.scale(0.5); }
        if (event.key == "-") { drawingBoard.scale(2); }
        if (event.key == "d") { debug = !debug; }
    }

    document.onclick = function(event) {

    }


    var lastTime = 0
    setInterval(() => {
        let t1 = new Date();
        world.update(TIMESTEP);
        // todo: create Debug structure with enable flag and infos
        drawingBoard.draw(world.planets, debug, lastTime);
        let t2 = new Date();

        lastTime = t2.getTime() - t1.getTime();
    }, 1000 / 30);
}

