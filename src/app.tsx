import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import Konva from 'konva';
import { Layer } from 'konva/lib/Layer';

interface Point {
  x: number;
  y: number;
}

export const App = () => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [text, setText] = useState<string>('abc');
  const [fontSize, setFontSize] = useState<number>(100);
  const [fontFamily, setFontFamily] = useState<string>('Georgia');
  const [imageUrl, setImageUrl] = useState<string>('/metal.jpg');

  const loadImage = (_imageUrl: string) => {
    setImageUrl(_imageUrl)
  };

  useEffect(() => {
    const canvas = new fabric.Canvas('fabric-canvas');
    canvasRef.current = canvas;
    if (canvasRef.current) {
      fabric.Image.fromURL(imageUrl, (img) => {
        img.scaleToWidth(800);
        img.scaleToHeight(600);
        canvasRef.current?.setBackgroundImage(img, canvasRef.current.renderAll.bind(canvasRef.current));
      });
    }

    const engravedText = new fabric.Text(text, {
      fontFamily: fontFamily,
      fontSize: fontSize,
      fontWeight: 800,
      fill: 'rgba(0, 0, 0, .05)',
      stroke: 'rgba(255,255,255,.4)',
      strokeWidth: 1,
      left: 50,
      top: 100,
    });

    const shadowText = new fabric.Text(text, {
      fontFamily: fontFamily,
      fontSize: fontSize,
      fontWeight: 800,
      fill: '',
      stroke: 'rgba(0,0,0,.4)',
      strokeWidth: 8,
      left: 50,
      top: 100,
      clipPath: engravedText,
    });

    const shadow = new fabric.Shadow({
      color: 'rgba(0, 0, 0, 0.5)', // Shadow color
      blur: 15, // Shadow blur amount
      offsetX: 5, // Shadow X offset
      offsetY: 5, // Shadow Y offset
    });

    const group = new fabric.Group([engravedText, shadowText], {
      shadow,
    });

    canvas.add(group);
    canvas.renderAll();

    const width = window.innerWidth / 2;
    const height = 600;

    /*-----------------------      Overview      --------------------------------*/
    /*-----------------------------------------------------------------------------
    | 1. Add Background Layer                                                     |                          
    |    Add background on this layer and it would be at the bottom of the stage. |
    | 2. Add Sticker Layer                                                        |
    |    This layer make cut off shape. Draw text with stroke and fill with white |
    |    color. Detect the white pixels from this layer and then remove.          |
    | 3. Detect White Pixels from stickerLayer                                    |
    |    const whitePixels = extractWhitePixels(stickerLayer);                    |
    |    Get x, y coordinates of white pixels from stickerLayer.                  |
    | 4. Find the minimized polygon vertices from whitePixels                     |
    |    const polygonVertices = findPolygonVertices(whitePixels);                |
    |    drawFilledPath(polygonVertices);                                         | 
    |    Find the coordinates of polygon of shape that include all points based   |
    |    on the coordinates of white pixels. And fill the background color(e.g.   |
    |    white) in this polygon.                                                  |
    | 5. Add the Text Layer                                                       |
    |    Add text on the stage.                                                   |
    -----------------------------------------------------------------------------*/

    const stage = new Konva.Stage({
      container: containerRef.current as HTMLDivElement,
      width,
      height
    })

    const backgroundLayer = new Konva.Layer();
    stage.add(backgroundLayer);

    const imageObj = new Image();
    imageObj.src = imageUrl;
    imageObj.onload = function () {
      const backgroundImage = new Konva.Image({
        x: 0,
        y: 0,
        image: imageObj,
        width,
        height
      })
      backgroundLayer.add(backgroundImage);
      backgroundLayer.draw();
    }

    const stickerLayer = new Konva.Layer();

    const _top = 200, left = 100, strokeWidth = 1;
    const stickerText = new Konva.Text({
      x: left + fontSize * .2,
      y: _top + fontSize * .15,
      text,
      fontSize: fontSize * .9,
      align: 'center',
      fontFamily,
      fill: '#fff', // filled by white color
      stroke: '#fff', // filled by white color
      strokeWidth,
      fillEnabled: true,
      fillAfterStrokeEnabled: true,
      lineJoin: 'round',
    })

    stickerLayer.add(stickerText);

    stage.add(stickerLayer);
    stickerLayer.draw();

    // sort white pixels by x coordinate
    const sortWhitePixels = (whitePixels: Point[]): Point[] => {
      return whitePixels.sort((a: Point, b: Point) => {
        if (a.x === b.x) {
          return a.y - b.y;
        }
        return a.x - b.x;
      });
    };

    // detect white pixel coordinates from layer. in this case from stickerLayer
    const extractWhitePixels = (layer: Layer, stepSize: number = 5): Point[] => {
      const offScreenCanvas = layer.toCanvas();
      const offScreenCtx = offScreenCanvas.getContext('2d');

      const imageData = offScreenCtx?.getImageData(0, 0, offScreenCanvas.width, offScreenCanvas.height);
      const data = imageData?.data;
      if (!data) return [];
      const whitePixels = [];
      for (let y = 0; y < offScreenCanvas.height; y += stepSize) {
        for (let x = 0; x < offScreenCanvas.width; x += stepSize) {
          const i = (y * offScreenCanvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (r === 255 && g === 255 && b === 255 && a === 255) {
            whitePixels.push({ x, y });
          }
        }
      }
      return sortWhitePixels(whitePixels);
    }

    // find the minimized polygon vertices that includes all white pixels
    const findPolygonVertices = (whitePixels: Point[]) => {
      if (whitePixels.length === 0) return [];

      const vertices = [];
      const visited = new Set();

      function distance(p1: Point, p2: Point) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
      }

      let currentPoint = whitePixels[0];
      vertices.push(currentPoint);
      visited.add(`${currentPoint.x},${currentPoint.y}`);

      while (true) {
        let nearestPoint = null;
        let minDist = Infinity;

        for (const pixel of whitePixels) {
          const pixelKey = `${pixel.x},${pixel.y}`;
          if (!visited.has(pixelKey)) {
            const dist = distance(currentPoint, pixel);
            if (dist < minDist) {
              minDist = dist;
              nearestPoint = pixel;
            }
          }
        }

        if (!nearestPoint) break;

        vertices.push(nearestPoint);
        visited.add(`${nearestPoint.x},${nearestPoint.y}`);

        currentPoint = nearestPoint;
      }

      vertices.push(vertices[0]);

      return vertices;
    }

    // draw shape based on polygon vertices
    const drawFilledPath = (whitePixels: Point[]) => {
      const points = whitePixels.flatMap(pixel => [pixel.x, pixel.y]);
      const path = new Konva.Line({
        points: points,
        fill: 'rgba(255, 255, 255, 1)',
        stroke: '#1677ff',
        strokeWidth: fontSize * .6,
        closed: true,
        lineCap: 'square',
        lineJoin: 'round',
        shadowColor: '#fff',  // Green shadow color
        shadowBlur: 2,  // Blur effect for shadow
        shadowOffset: { x: 0, y: 0 },  // Offset for the shadow (moves it right and down)
        shadowOpacity: 0.6,
      });
      const layer = new Konva.Layer();
      layer.opacity(.3);
      layer.add(path);
      stage.add(layer);
      layer.draw();
    }

    const whitePixels = extractWhitePixels(stickerLayer);
    const polygonVertices = findPolygonVertices(whitePixels);
    drawFilledPath(polygonVertices);

    // after detecting white pixels remove the stickerLayer
    stickerLayer.remove()

    const textLayer = new Konva.Layer();
    stage.add(textLayer);

    const textContent = new Konva.Text({
      x: left,
      y: _top,
      text,
      fontSize,
      fontFamily,
      align: 'center',
      fill: '#fff',
      stroke: '#1677ff',  // Green shadow color
      strokeWidth: 1,
      opacity: .8
    })
    textLayer.add(textContent);
    textLayer.draw();
    return () => {
      canvas.dispose();
      stage.destroy();
      canvasRef.current = null;
    };
  }, [text, fontSize, fontFamily, imageUrl]);

  return (
    <>
      <div className="flex">

        <canvas
          id="fabric-canvas"
          width={800}
          height={600}
          style={{ border: '1px solid #ccc' }}
        />
        <div ref={containerRef}>
        </div>
      </div>

      <div className="my-5 w-64 flex justify-between items-center">
        <label>Text: </label>
        <textarea
          className="border-2 border-solid border-[#000] rounded-md w-32 px-2 py-1"
          value={text}
          onChange={(e) => {
            const value = (e.target as HTMLInputElement).value;
            if (e.target) setText(value);
          }}
        />
      </div>

      <div className="w-64 flex justify-between items-center">
        <label>Font Size: </label>
        <input
          className="border-2 border-solid border-[#000] rounded-md w-32 px-2 py-1"
          type="number"
          value={fontSize}
          min={100}
          max={300}
          onChange={(e) => {
            const value = (e.target as HTMLInputElement).value;
            if (e.target) setFontSize(Number(value));
          }}
        />
      </div>

      <div className="w-64 flex justify-between items-center mt-5">
        <label>Font Family: </label>
        <select
          className="border-2 border-solid border-[#000] rounded-md w-32 px-2 py-1"
          value={fontFamily}
          onChange={(e) => {
            const selectedFont = (e.target as HTMLSelectElement).value;
            setFontFamily(selectedFont);
          }}
        >
          <option value="Georgia">Georgia</option>
          <option value="Arial">Arial</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Trebuchet MS">Trebuchet MS</option>
          <option value="Lucida Console">Lucida Console</option>
          <option value="Great Vibes">Great Vibes</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
          <option value="customFont1">Custom Font 1</option>
          <option value="customFont2">Custom Font 2</option>
        </select>
      </div>

      <div className="w-64 flex justify-between items-center mt-5">
        <label>Background Image: </label>
        <select
          className="border-2 border-solid border-[#000] rounded-md w-32 px-2 py-1"
          onChange={(e) => {
            const selectedImage = (e.target as HTMLSelectElement).value;
            if (selectedImage === 'upload') {
              document.getElementById('imageUpload')?.click();
            } else {
              loadImage(selectedImage);
            }
          }}
        >
          <option value="/metal.jpg">Metal</option>
          <option value="/wood.jpg">Wood</option>
          <option value="/stone.jpg">Stone</option>
          <option value="upload">Upload Your Own</option>
        </select>

        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const uploadedImage = event.target?.result;
                if (uploadedImage) {
                  loadImage(uploadedImage as string);
                }
              };
              reader.readAsDataURL(file);
            }
          }}
        />
      </div>
    </>
  );
};
