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
      x: left,
      y: _top,
      text,
      fontSize,
      align: 'center',
      fontFamily,
      fill: '#fff',
      stroke: '#fff',
      strokeWidth,
    })

    stickerLayer.add(stickerText);

    // const maxWidthOfStickerText = stickerText.width();

    // const textsForLines = text.split('\n');
    // textsForLines.forEach((_text, index) => {
    //   const textInstance = new Konva.Text({
    //     x: left,
    //     y: _top,
    //     text: _text,
    //     fontSize,
    //     align: 'center',
    //     fontFamily,
    //     fill: '#fff',
    //     stroke: '#fff',
    //     strokeWidth: 20
    //   });

    //   let expectedLeft = (maxWidthOfStickerText - textInstance.width()) / 2 + left;
    //   let expectedWidth = textInstance.width();

    //   const textInstanceForFirstletter = new Konva.Text({
    //     x: left,
    //     y: _top,
    //     text: _text[0],
    //     fontSize,
    //     align: 'center',
    //     fontFamily,
    //     fill: '#fff',
    //     stroke: '#fff',
    //     strokeWidth: 20
    //   })

    //   const firstChar = _text[0];
    //   const lastChar = _text[_text.length - 1];

    //   const charsToAdjustLeft = ['A', 'C', 'G', 'O', 'Q', 'V', 'W', 'X', 'Y', 'Z'];
    //   const charsToAdjustLeftMore = ['J'];
    //   const charsToAdjustWidth = ['A', 'B', 'D', 'O', 'Q'];

    //   const textWidth = textInstanceForFirstletter.width();

    //   if (charsToAdjustLeft.includes(firstChar)) {
    //     expectedLeft += textWidth / 4;
    //     expectedWidth -= textWidth / 4;
    //   }

    //   if (charsToAdjustLeftMore.includes(firstChar)) {
    //     expectedLeft += textWidth / 2;
    //     expectedWidth -= textWidth / 2;
    //   }

    //   if (!charsToAdjustWidth.includes(lastChar)) {
    //     expectedWidth -= textWidth;
    //   }

    //   if (expectedWidth < 0) expectedWidth = 0;

    //   const rectForEachTextLine = new Konva.Rect({
    //     x: expectedLeft,
    //     y: _top + index * fontSize + fontSize * .2,
    //     width: expectedWidth,
    //     heigth: fontSize * .6,
    //     fill: '#fff',
    //     strokeWidth: 20,
    //     cornerRadius: 30
    //   })

    //   stickerLayer.add(rectForEachTextLine);

    //   function createTextLineRect(yPosition: number, stickerLayer: Layer, expectedLeft: number, expectedWidth: number, fontSize: number) {
    //     const rectForEachTextLine = new Konva.Rect({
    //       x: expectedLeft,
    //       y: yPosition,
    //       width: expectedWidth,
    //       height: fontSize * 0.6,
    //       fill: '#fff',
    //       strokeWidth: 20,
    //       cornerRadius: 30
    //     });
    //     stickerLayer.add(rectForEachTextLine);
    //   }

    //   if (index > 0 && _text.length < textsForLines[index - 1].length) {
    //     const yPosition = _top + (index - 1) * fontSize + fontSize * 0.8;
    //     createTextLineRect(yPosition, stickerLayer, expectedLeft, expectedWidth, fontSize);
    //   }

    //   if (index < textsForLines.length - 1 && _text.length < textsForLines[index + 1].length) {
    //     const yPosition = _top + (index + 1) * fontSize + fontSize * 0.8;
    //     createTextLineRect(yPosition, stickerLayer, expectedLeft, expectedWidth, fontSize);
    //   }

    // })

    stage.add(stickerLayer);
    stickerLayer.draw()

    const textContent = new Konva.Text({
      x: left,
      y: _top,
      text,
      fontSize,
      fontFamily,
      align: 'center',
      fill: '#fff'
    })

    const sortWhitePixels = (whitePixels: Point[]): Point[] => {
      return whitePixels.sort((a: Point, b: Point) => {
        if (a.x === b.x) {
          return a.y - b.y;
        }
        return a.x - b.x;
      });
    };

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

    const drawFilledPath = (whitePixels: Point[]) => {
      const points = whitePixels.flatMap(pixel => [pixel.x, pixel.y]);
      const path = new Konva.Line({
        points: points,
        fill: 'rgba(255, 255, 255, 1)',
        stroke: '#fff',
        strokeWidth: fontSize * .7,
        closed: true,
        lineCap: 'square',
        lineJoin: 'round',
      });
      // const pathRect = path.getClientRect();

      // const scaleX = textContent.width() / pathRect.width  * 1.2;
      // const scaleY = textContent.height() / pathRect.height * 1.2;

      // path.scaleX(scaleX);
      // path.scaleY(scaleY);
      // const scaledPathRect = path.getClientRect();

      // const newRect = new Konva.Rect({
      //   x: scaledPathRect.x,
      //   y: scaledPathRect.y,
      //   width: scaledPathRect.width,
      //   height: scaledPathRect.height,
      //   fill: 'red',
      //   opacity: .2
      // })

      // const textContentRect = textContent.getClientRect();
      // path.position({
      //   x: textContentRect.x - pathRect.x - 20,
      //   y: textContentRect.y - pathRect.y
      // });
      // newRect.position({
      //   x: textContentRect.x - pathRect.x - 20,
      //   y: textContentRect.y - pathRect.y + 60
      // })

      // console.log(textContent.height(), newRect.height())
      const layer = new Konva.Layer();
      layer.opacity(.5);
      layer.add(path);
      // layer.add(newRect)
      stage.add(layer);
      layer.draw();
    }

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

    const whitePixels = extractWhitePixels(stickerLayer);
    const polygonVertices = findPolygonVertices(whitePixels);
    drawFilledPath(polygonVertices);

    stickerLayer.remove()

    const textLayer = new Konva.Layer();
    stage.add(textLayer);

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
