class Vector {
    constructor(public x: number, public y: number) { }
    add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }
    addIp(other: Vector): Vector {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    equal(other: Vector): boolean {
        return this.x == other.x && this.y == other.y;
    }

    sub(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }
    subIp(other: Vector): Vector {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    div(other: number): Vector {
        return new Vector(this.x / other, this.y / other);
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

export default Vector;
