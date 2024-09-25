import {useEffect} from "preact/hooks";

class WordTransform {
    // where the user drags it to, relative to x,y
    public translateX = 0;
    public translateY = 0;

    public rotation = 0;
    public scale = 1;

    // where it is drawn on the canvas
    public x = 0;
    public y = 0;

    constructor(public text: string, public metric: TextMetrics) {}

    get width() {
        return Math.abs(this.metric.actualBoundingBoxLeft) + Math.abs(this.metric.actualBoundingBoxRight);
    }

    get height() {
        return Math.abs(this.metric.actualBoundingBoxAscent) + Math.abs(this.metric.actualBoundingBoxDescent);
    }

    get x1() {
        return this.x;
    }

    get y1() {
        return this.y;
    }

    get x2() {
        return this.x + this.width;
    }

    get y2() {
        return this.y + this.height;
    }

    get centerX() {
        return this.x1 + this.width / 2;
    }

    get centerY() {
        return this.y1 + this.height / 2;
    }
}

function draw() {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // all drawing must be done on the layer canvas
    // and then draw the layer canvas on the main canvas
    const layerCanvas = document.createElement('canvas') as HTMLCanvasElement;
    const layerCtx = layerCanvas.getContext('2d')!;
    layerCanvas.width = canvas.width;
    layerCanvas.height = canvas.height;
    layerCtx.font = '56px sans-serif';

    // words must be drawn individually
    const words = ['Hello', 'World'].map(word => new WordTransform(word, layerCtx.measureText(word)));

    words[0].x = 300;
    words[0].y = 300;

    words[1].x = words[0].x2 + 20;
    words[1].y = words[0].y;

    for (const transform of words) {
        ctx.save();
        layerCtx.save();
        layerCtx.clearRect(0, 0, layerCanvas.width, layerCanvas.height);

        // todo: apply effects here
        layerCtx.fillText(transform.text, transform.x, transform.y);

        ctx.drawImage(layerCanvas, 0, 0);
        ctx.restore();
        layerCtx.restore();
    }
}

export function App() {
    useEffect(() => {
        draw();
    }, []);

    return (
        <div>
            <canvas width={1000} height={1000} className={'border border-red-400'}></canvas>
        </div>
    )
}