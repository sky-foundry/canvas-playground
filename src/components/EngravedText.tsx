import React, { useRef } from 'react';
import { Stage, Layer, Text, Image as KonvaImage, Group } from 'react-konva';
import useImage from 'use-image';

interface Props {
  text: string;
  fontSize: number;
  fontFamily: string;
  imageUrl: string;
}

const EngravedEffect: React.FC<Props> = ({ text, fontSize, fontFamily, imageUrl }) => {
  const stageRef = useRef(null);
  const [image] = useImage(imageUrl);

  return (
    <Stage ref={stageRef} width={window.innerWidth} height={600}>
      {/* Background Image Layer */}
      <Layer>
        {image && (
          <KonvaImage
            image={image}
            width={800}
            height={600}
          />
        )}
      </Layer>

      {/* Engraved Text Effect Layer */}
      <Layer>
        <Group>
          {/* Shadow Text (Outer) */}
          <Text
            text={text}
            fontSize={fontSize}
            fontFamily={fontFamily}
            fontStyle="bold"
            stroke="rgba(0, 0, 0, 0.4)" // Shadow stroke
            strokeWidth={8}
            x={50}
            y={100}
            fill="" // No fill to match fabric.js
            shadowColor="rgba(0, 0, 0, 0.5)" // Adding shadow for depth
            shadowBlur={15}
            shadowOffsetX={5}
            shadowOffsetY={5}
          />

          {/* Engraved Text (Inner) */}
          <Text
            text={text}
            fontSize={fontSize}
            fontFamily={fontFamily}
            fontStyle="bold"
            fill="rgba(0, 0, 0, .05)" // Light fill to simulate engraving
            stroke="rgba(255,255,255,.4)"
            strokeWidth={1}
            x={50}
            y={100}
          />
        </Group>
      </Layer>
    </Stage>
  );
};

export default EngravedEffect;
