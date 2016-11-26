import Vector from "./Vector";
import { DENSITY } from "./constants";

class Planet {
    mass: number;

    constructor(public position: Vector,
        public radius: number,
        public velocity: Vector = new Vector(0, 0),
        public acceleration: Vector = new Vector(0, 0),
        public color) {
        // Mass is volume * Density
        this.mass = (4 / 3) * Math.PI * radius * radius * radius * DENSITY;
    }

    static new(position: Vector, radius: number, velocity: Vector) {
        return new Planet(position, radius, velocity, new Vector(0, 0), "white");
    }
}


export default Planet;
