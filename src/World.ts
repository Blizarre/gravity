import { G_CST } from "./constants";
import Vector from "./Vector";
import Planet from "./Planet";


class World {

    planets: Planet[] = [];

    constructor(nb_planets: number) {
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

    clear() {
        this.planets = []
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
            if(p.isEmpty()) {
                continue
            }
            p.position.addIp(
                // (velocity + acceleration * timestep / 2) * timestep
                p.velocity.add(p.acceleration.mul(timestep).div(2)).mul(timestep)
            );
        }

        // Update the velocity vector
        for (let p1 of this.planets) {
            if(p1.isEmpty()) {
                continue;
            }
            let sum_forces = new Vector(0, 0);
            for (let p2 of this.planets) {
                if (p1 == p2 || p2.isEmpty() ) {
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

export default World