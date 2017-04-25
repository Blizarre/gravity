import Vector from "./Vector";
import { DENSITY } from "./constants";

class Planet {
    mass: number;

    constructor(public position: Vector,
        public radius: number,
        public velocity: Vector = new Vector(0, 0),
        public acceleration: Vector = new Vector(0, 0),
        public color: string,
        empty=false) {
        if(empty) {
            this.mass = 0
        } else {
            this.updateMass()
        }
    }

    updateMass() {
        // Mass is volume * Density
        this.mass = (4 / 3) * Math.PI * this.radius * this.radius * this.radius * DENSITY;        
    }

    isEmpty(): boolean {
        return this.mass == 0
    }
    
    setRadius(new_radius: number, updateMass=true) {
        this.radius = new_radius
        if(updateMass) {
            this.updateMass()
        }
    }
    static new(position: Vector, radius: number, velocity: Vector) {
        return new Planet(position, radius, velocity, new Vector(0, 0), "white");
    }
}


export default Planet;
