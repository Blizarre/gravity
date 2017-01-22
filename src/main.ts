const TIMESTEP = 0.5
const NB_PLANETS = 10;


import { G_CST, DEFAULT_RESOLUTION, WIDTH, HEIGHT } from "./constants";
import Vector from "./Vector";
import Planet from "./Planet";
import DrawingBoard from "./DrawingBoard";

function log(msg: string, param: any = undefined) {
    if(param != null) {
        console.log(msg.replace("{}", param + ''))
    } else {
        console.log(msg)
    }
    return param
}

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
                "white"));
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

    update(timestep: number) {
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

let $canv = document.createElement("canvas");
$canv.width = WIDTH;
$canv.height = HEIGHT;

enum State { NONE, CENTER_SELECTED, RADIUS_SELECTED, VELOCITY_SELECTED }

window.onload = function() {
    let debug = true;
    let pause = false;
    let ctx: CanvasRenderingContext2D = $canv.getContext("2d");
    let world = new World(WIDTH, HEIGHT, NB_PLANETS);
    let drawingBoard = new DrawingBoard(ctx);
    let state = State.NONE;
    let new_planet: Planet;

    document.body.appendChild($canv);

    document.onkeypress = (event: KeyboardEvent) => {
        if (event.key == "+") { drawingBoard.scale(0.5); }
        if (event.key == "-") { drawingBoard.scale(2); }
        if (event.key == "d") { debug = !debug; }
        if (event.key == "p") { pause = !pause; }
    }

    $canv.onclick = (event: MouseEvent) => {
        // http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element/18053642#18053642
        let rect = $canv.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        log("(" + x + ", " + y + ")");
        switch(state) {
            case State.NONE:
                state = State.CENTER_SELECTED;
                new_planet = new Planet(drawingBoard.pointToWorld(new Vector(x, y)), 1, new Vector(0, 0), new Vector(0, 0), "red");
                log("New planet added at location {}", new_planet.position);
            break;
            case State.CENTER_SELECTED:
                state = State.RADIUS_SELECTED;
            break;
            case State.RADIUS_SELECTED:
                state = State.VELOCITY_SELECTED;
            break;
            case State.VELOCITY_SELECTED:
                state = State.NONE;
            break;
        }
    }

    document.onkeydown = (event: KeyboardEvent) => {
        const LEFT_ARROW = 37;
        const RIGHT_ARROW = 39;
        const UP_ARROW = 38;
        const DOWN_ARROW = 40;

        let charCode = (event.which) ? event.which : event.keyCode
        if (charCode == LEFT_ARROW) {
            drawingBoard.move_px(-10, 0);
        }
        if (charCode == RIGHT_ARROW) {
            drawingBoard.move_px(10, 0);
        }
        if (charCode == UP_ARROW) {
            drawingBoard.move_px(0, -10);
        }
        if (charCode == DOWN_ARROW) {
            drawingBoard.move_px(0, 10);
        }
    }

    var lastTime = 0
    setInterval(() => {
        let t1 = new Date();
        if (!pause) {
            world.update(TIMESTEP);
        }
        // todo: create Debug structure with enable flag and infos
        drawingBoard.clear();
        drawingBoard.draw(world.planets, debug, lastTime);
        if(new_planet != null) {
            drawingBoard.draw([new_planet], false, lastTime);
        }
        let t2 = new Date();

        lastTime = t2.getTime() - t1.getTime();
    }, 1000 / 30);
}

