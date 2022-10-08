const TIMESTEP = 0.5
const NB_PLANETS = 10;


import World from "./World";
import Vector from "./Vector";
import Planet from "./Planet";
import DrawingBoard from "./DrawingBoard";

function log(msg: string, param: any = undefined) {
    if (param != null) {
        console.log(msg.replace("{}", param + ''))
    } else {
        console.log(msg)
    }
    return param
}



enum State { NONE, CENTER_SELECTED, RADIUS_SELECTED, VELOCITY_SELECTED }

function PrepareCanvasDOM() {
    let $canv = document.createElement("canvas");
    document.body.appendChild($canv);

    $canv.width = window.innerWidth
    $canv.height = window.innerHeight

    document.body.style.margin = "0px"

    let style = $canv.style
    style.width = "100%"
    style.height = "100%"
    style.margin = "0px"
    style.padding = "0px"
    return $canv
}

window.onload = function () {
    let debug = true;
    let pause = false;
    let $canv = PrepareCanvasDOM()

    let ctx: CanvasRenderingContext2D = $canv.getContext("2d");
    let world = new World(NB_PLANETS);
    let drawingBoard = new DrawingBoard(new Vector($canv.width, $canv.height), ctx);
    let state = State.NONE;
    let new_planet: Planet;

    window.addEventListener('resize', function () {
        $canv.width = window.innerWidth;
        $canv.height = window.innerHeight;
        drawingBoard.setSize_px($canv.width, $canv.height)
    }, false);

    document.onkeypress = (event: KeyboardEvent) => {
        if (event.key == "+") { drawingBoard.scale(0.5); }
        if (event.key == "-") { drawingBoard.scale(2); }
        if (event.key == "d") { debug = !debug; }
        if (event.key == "p") { pause = !pause; }
        if (event.key == "c") { world.clear(); }
    }

    var mc = new Hammer.Manager($canv);
    var pinch = new Hammer.Pinch();
    var pan = new Hammer.Pan();
    pinch.recognizeWith(pan);
    mc.add([pan, pinch]);

    var lastPan: Vector = null;
    var lastPinch: number = null;

    mc.on('pinchstart panstart', function (ev) {
        log('Start of ' + ev.type)
        lastPan = new Vector(0, 0);
        lastPinch = ev.scale;
    });

    mc.on('pinch pan', function (ev) {
        if (lastPan != null && lastPinch != null) {
            var newPinch: number = ev.scale
            var diff = newPinch - lastPinch;

            drawingBoard.scale(1 / (1 + diff))
            lastPinch = newPinch

            var newVect = new Vector(-ev.deltaX, -ev.deltaY)
            var diffPan = newVect.sub(lastPan);
            drawingBoard.move_px(diffPan.x, diffPan.y);
            lastPan = newVect
        }
    });

    mc.on('pinchend panend pitchcancel', function (ev) {
        log('End of ' + ev.type)
        lastPinch = null;
        lastPan = null
    });

    $canv.onmousemove = (event: MouseEvent) => {
        // http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element/18053642#18053642
        let rect = $canv.getBoundingClientRect();
        let x: number = event.clientX - rect.left;
        let y: number = event.clientY - rect.top;
        let mousePosition = new Vector(x, y);
        switch (state) {
            case State.CENTER_SELECTED:
                new_planet.setRadius(drawingBoard.screenToWorld(mousePosition).sub(new_planet.position).norm(), false)
                break;
            case State.RADIUS_SELECTED:
                new_planet.velocity = drawingBoard.screenToWorld(mousePosition).sub(new_planet.position)
                break;
            case State.VELOCITY_SELECTED:
                new_planet.acceleration = drawingBoard.screenToWorld(mousePosition).sub(new_planet.position)
                break;
        }
    }


    $canv.onclick = (event: MouseEvent) => {
        // http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element/18053642#18053642
        let rect = $canv.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        let mousePosition = new Vector(x, y);
        switch (state) {
            case State.NONE:
                state = State.CENTER_SELECTED;
                new_planet = new Planet(drawingBoard.screenToWorld(mousePosition), 1, new Vector(0, 0), new Vector(0, 0), "red", true);
                world.planets.push(new_planet)
                log("New planet added at location {}", new_planet.position);
                break;
            case State.CENTER_SELECTED:
                new_planet.setRadius(drawingBoard.screenToWorld(mousePosition).sub(new_planet.position).norm(), false)
                state = State.RADIUS_SELECTED;
                break;
            case State.RADIUS_SELECTED:
                new_planet.velocity = drawingBoard.screenToWorld(mousePosition).sub(new_planet.position)
                state = State.VELOCITY_SELECTED;
                break;
            case State.VELOCITY_SELECTED:
                log("new planet added")
                new_planet.acceleration = drawingBoard.screenToWorld(mousePosition).sub(new_planet.position)
                new_planet.updateMass()
                state = State.NONE;
                new_planet = null
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
        if (new_planet != null) {
            drawingBoard.draw([new_planet], false, lastTime);
        }
        let t2 = new Date();

        lastTime = t2.getTime() - t1.getTime();
    }, 1000 / 30);
}

