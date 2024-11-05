import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Text, Line, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

interface Point {
    x: number;
    y: number;
}

interface Props {
    text: string;
    fontSize: number;
    fontFamily: string;
    imageUrl: string;
}

const Strike: React.FC<Props> = ({ text, fontSize, fontFamily, imageUrl }) => {
    const stageRef = useRef(null);
    const [image] = useImage(imageUrl);
    const [polygonVertices, setPolygonVertices] = useState<Point[]>([]);

    useEffect(() => {
        if (!image || !stageRef.current) return;
        const stage: any = stageRef.current;
        stage.children[1].show()
        const extractWhitePixels = (stepSize: number = 5): Point[] => {
            const stage: any = stageRef.current;
            const layer = stage.children[1]; // Assuming the image is on the first layer
            const canvas = layer.toCanvas();
            const context = canvas.getContext('2d');
            const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData?.data;
            if (!data) return [];

            const pixels: Point[] = [];
            for (let y = 0; y < canvas.height; y += stepSize) {
                for (let x = 0; x < canvas.width; x += stepSize) {
                    const i = (y * canvas.width + x) * 4;
                    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
                    if (r === 255 && g === 255 && b === 255 && a === 255) {
                        pixels.push({ x, y });
                    }
                }
            }
            return pixels;
        };

        const findPolygonVertices = (whitePixels: Point[]): Point[] => {
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
        };

        const pixels = extractWhitePixels();
        setPolygonVertices(findPolygonVertices(pixels));
        stage.children[1].hide()
    }, [image, fontSize, fontFamily, text]);

    return (
        <Stage ref={stageRef} width={window.innerWidth / 2} height={600}>
            <Layer>
                {image && (
                    <KonvaImage
                        image={image}
                        width={window.innerWidth / 2}
                        height={600}
                    />
                )}
            </Layer>
            <Layer>
                <Text
                    x={100 + fontSize * .1}
                    y={200 + fontSize * .1}
                    text={text}
                    fontSize={fontSize * .9}
                    fontFamily={fontFamily}
                    align='center'
                    fill="#fff"
                    stroke="#fff"
                    strokeWidth={1}
                    fillEnabled={true}
                    fillAfterStrokeEnabled={true}
                    leftJoin='round'
                />
            </Layer>
            <Layer>
                {polygonVertices.length > 0 && (
                    <Line
                        points={polygonVertices.flatMap(pixel => [pixel.x, pixel.y])}
                        fill="rgba(255, 255, 255, 1)"
                        stroke="#1677ff"
                        strokeWidth={fontSize * 0.6}
                        closed
                        lineCap="round"
                        lineJoin="round"
                        opacity={0.4}
                    />
                )}
            </Layer>
            <Layer>
                <Text
                    x={100}
                    y={200}
                    text={text}
                    align="center"
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    fill="#fff"
                    stroke="#1677ff"
                    strokeWidth={1}
                    opacity={0.8}
                />
            </Layer>
        </Stage>
    );
};

export default Strike;
