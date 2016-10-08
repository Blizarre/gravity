class Point {
    constructor(public position: Vector, public speed: Vector = new Vector(0, 0)) { }
    static new(position: Vector) { return new Point(position, new Vector(0, 0)); }
}

class Vector {
    constructor(public x: number, public y: number) { }
    add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }
    addIp(other: Vector):Vector {
        this.x += other.x;
        this.y += other.y;
        return this;
    }


    sub(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }
    subIp(other: Vector): Vector {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    
    divIp(other: number): Vector {
        this.x /= other;
        this.y /= other;
        return this;
    }

    norm(): number {
        return Math.sqrt(this.normSquare());
    }
    
    normSquare(): number {
        return this.x * this.x + this.y * this.y;
    }

    mul(other: number): Vector {
        return new Vector(this.x * other, this.y * other);
    }
    mulIp(other: number): Vector {
        this.x *= other;
        this.y *= other;
        return this;
    }
}

const NB_ELEMENTS = 100;
const G_CST = 1000;
const M = 1;

// The workd starts with NB_ELEMENTS points in the plane [0, 1[, [0, 1[ 
let world: Point[] = [];
for (let i = 0; i < NB_ELEMENTS; i++) {
    world.push(Point.new(new Vector(Math.random(), Math.random())));
}

function update(world: Point[]) {
    // Update the speed vector
    for (let p1 of world) {
        let average_pull = new Vector(0, 0);
        for (let p2 of world) {
            // pull_vector = direction_vector * m1*m2*G / (distance * distance)
            
            // this is direction_vector * distance
            let pull_vector: Vector = p2.position.sub(p1.position);
            
            let distance: number = pull_vector.norm();
            // to get X / distance^2, need to divide byt distance ^ 3
            pull_vector.divIp( distance * distance * distance ).mulIp( G_CST * M * M);
            average_pull.add(pull_vector);
        }
        p1.speed.add(average_pull);
    }
    // update the position vector
    for (let p of world) {
        p.position.add(p.speed);   
    }
}