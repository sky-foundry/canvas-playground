import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
// import EngravedText from './components/EngravedText';
import Strike from './components/strike';

export const App = () => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
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
    // canvas.add(engravedText)
    canvas.renderAll();


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

    return () => {
      canvas.dispose();
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
        <Strike fontFamily={fontFamily} fontSize={fontSize} imageUrl={imageUrl} text={text} />
      </div>
      {/* <EngravedText fontFamily={fontFamily} fontSize={fontSize} imageUrl={imageUrl} text={text} /> */}
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
