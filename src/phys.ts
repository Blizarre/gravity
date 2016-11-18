let WIDTH = 640;
let HEIGHT = 480;
const TIMESTEP = 0.5
const NB_PLANETS = 10;

const G_CST = 6.67e-11 //  N.(m/kg)2;
const DENSITY = 900000000; // kg / m^3
const DEFAULT_RESOLUTION = 40000; // m / pixel

import Vector from "./Vector";

class Point {
    mass: number;

    constructor(public position: Vector, public radius:number, public velocity: Vector = new Vector(0, 0), public acceleration: Vector = new Vector(0, 0), public color) {
        // Mass is volume * Density
        this.mass = (4 / 3) * Math.PI * radius * radius * radius * DENSITY;
    }

    static new(position: Vector, radius: number, velocity:Vector) {
        return new Point(position, radius, velocity, new Vector(0, 0), "white"); 
    }
}

class World {

    planets: Point[] = [];

    constructor(public width: number, public height: number, public nb_planets: number) {
        // Sun 1
        this.planets.push( new Point(
            new Vector(0, 5000000),
            1000000,
            new Vector(100000, 0),
            new Vector(0, 0),
            "red"));

        // Sun 2
        this.planets.push( new Point(
            new Vector(0, -5000000),
            1000000,
            new Vector(-100000, 0),
            new Vector(0, 0),
            "yellow"));

        for(let i = 0; i <  nb_planets; i++) {
            this.planets.push( new Point(
                Vector.random(5500000, 5500000),
                Math.random() * 100000,
                Vector.random(0, 500000),
                new Vector(0, 0),
                "blue"));
        }
    }


    compute_force(planet: Point, other: Point): Vector {
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
                if(p1 == p2) {
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

    offset:Vector;
    resolution:number;
    
    constructor(public ctx: CanvasRenderingContext2D) {
        this.resolution = DEFAULT_RESOLUTION;
        this.offset = new Vector(- WIDTH * this.resolution / 2, - HEIGHT * this.resolution / 2)
    }

    scale(factor) {
        this.resolution *= factor;
        this.offset = new Vector(- WIDTH * this.resolution / 2, - HEIGHT * this.resolution / 2)
    }

    draw(planets: Point[], debug:boolean) {
        let ct = this.ctx;
        ct.fillStyle = "black";
        ct.fillRect(0, 0, ct.canvas.clientWidth, ct.canvas.clientHeight);
        for (let p of planets) {
            let relativePosition = p.position.sub(this.offset).divIp(this.resolution);
            ct.beginPath();
            ct.fillStyle = p.color;
            ct.arc(relativePosition.x, relativePosition.y, p.radius / this.resolution, 0, Math.PI*2, true);
            ct.fill();

            if(debug) {
                ct.beginPath();
                ct.strokeStyle = "blue";
                ct.moveTo(relativePosition.x, relativePosition.y);
                ct.lineTo(relativePosition.x + p.velocity.x / this.resolution, relativePosition.y + p.velocity.y / this.resolution);
                ct.stroke();

                ct.beginPath();
                ct.strokeStyle = "yellow";
                ct.moveTo(relativePosition.x, relativePosition.y);
                ct.lineTo(relativePosition.x + p.acceleration.x / this.resolution, relativePosition.y + p.acceleration.y / this.resolution);
                ct.stroke();
            }
        }
    }
}



let $canv = document.createElement("canvas");
let $message = document.createElement("p");
$message.style.font = "sans-serif";

$canv.width = WIDTH;
$canv.height = HEIGHT;


window.onload = function() {
    let debug = true;
    let ctx: CanvasRenderingContext2D = $canv.getContext("2d");
    let world = new World(WIDTH, HEIGHT, NB_PLANETS);
    let drawingBoard = new DrawingBoard(ctx);

    document.body.appendChild($canv);
    document.body.appendChild($message);

    document.onkeypress = (event: KeyboardEvent) => {
        if(event.key == "-") { drawingBoard.scale(0.5);}
        if(event.key == "+") { drawingBoard.scale(2); }
        if(event.key == "d") { debug = !debug ; }
    }


    let time = 0
    setInterval(() => {
        let t1 = new Date();
        world.update(TIMESTEP);
        drawingBoard.draw(world.planets, debug);
        let t2 = new Date();

        $message.textContent = "time: " + time.toFixed(2) + "s. (took " + (t2.getTime() - t1.getTime()) + "ms.)";
        time += TIMESTEP;
    }, 1000 / 30);
}
