import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import Konva from 'konva';

const strokeWidthEffeciency = {
  "Georgia": 0.4,
  "Arial": 0.33,
  "Courier New": 1.37,
  "Verdana": .45,
  "Times New Roman": .4,
  "Trebuchet MS": .48,
  "Lucida Console": 1.85,
  "Comic Sans MS": .5,
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

    const gradient = new fabric.Gradient({
      type: 'linear',
      coords: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 100
      },
      colorStops: [
        { offset: 0, color: '#000' },
        { offset: 1, color: 'rgba(255,255,255,0.2)' }
      ]
    });

    const engravedText = new fabric.Text(text, {
      fontFamily: fontFamily,
      fontSize: fontSize,
      fontWeight: 800,
      fill: 'rgba(0, 0, 0, .1)',
      stroke: gradient,
      strokeWidth: 3,
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
      clipPath: engravedText
    });

    const group = new fabric.Group([engravedText, shadowText], {
      shadow: {
        color: 'rgba(0, 0, 0, 0.5)',
        blur: 15,
        offsetX: 5,
        offsetY: 5
      },
    });

    canvas.add(group);
    canvas.renderAll();

    const width = window.innerWidth / 2;
    const height = 600;

    const stage = new Konva.Stage({
      container: containerRef.current as string,
      width,
      height
    })

    const backgroundLayer = new Konva.Layer();
    stage.add(backgroundLayer);

    const imageObj = new Image();
    imageObj.src = './wood.jpg';
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
    stickerLayer.opacity(.6);
    stage.add(stickerLayer);

    const _top = 200, left = 100, strokeWidth = fontSize * strokeWidthEffeciency[fontFamily];

    const stickerText = new Konva.Text({
      x: left,
      y: _top,
      text,
      fontSize,
      align: 'center',
      fontFamily,
      stroke: '#fff',
      fill: '#fff',
      fontStyle: 'bold',
      strokeWidth,
      fillEnabled: true,
      fillAfterStrokeEnabled: true
    })

    stickerLayer.add(stickerText);

    const textLayer = new Konva.Layer();
    stage.add(textLayer);
    const textContent = new Konva.Text({
      x: left,
      y: _top,
      text,
      fontSize,
      fontFamily,
      align: 'center',
      fontStyle: 'bold',
      fill: 'red'
    })

    textLayer.add(textContent);

    textLayer.draw();
    stickerLayer.draw();
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
        <input
          className="border-2 border-solid border-[#000] rounded-md w-32 px-2 py-1"
          type="text"
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
          <option value="Comic Sans MS">Comic Sans MS</option>
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
