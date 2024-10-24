import React, { useEffect, useLayoutEffect } from 'react';
import rough from 'roughjs/bundled/rough.esm';

const generator = rough.generator();

const Canvas = ({ canvasRef, ctx, color, setElements, elements, tool, thickness, socket, isDrawing, setIsDrawing, sendDrawing }) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.strokeStyle = color;
    context.lineWidth = thickness;
  }, [color, thickness]);

  useLayoutEffect(() => {
    const roughCanvas = rough.canvas(canvasRef.current);

    if (elements.length > 0) {
      ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    elements.forEach((ele) => {
      if (ele.element === 'rect') {
        roughCanvas.draw(generator.rectangle(ele.offsetX, ele.offsetY, ele.width, ele.height, {
          stroke: ele.stroke,
          roughness: 0,
          strokeWidth: ele.thickness,
        }));
      } else if (ele.element === 'line') {
        roughCanvas.draw(generator.line(ele.offsetX, ele.offsetY, ele.width, ele.height, {
          stroke: ele.stroke,
          roughness: 0,
          strokeWidth: ele.thickness,
        }));
      } else if (ele.element === 'pencil' || ele.element === 'eraser') {
        roughCanvas.linearPath(ele.path, {
          stroke: ele.stroke,
          roughness: 0,
          strokeWidth: ele.thickness,
        });
      }
    });
  }, [elements]);

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (tool === 'pencil' || tool === 'eraser') {
      setElements((prevElements) => [
        ...prevElements,
        {
          offsetX,
          offsetY,
          path: [[offsetX, offsetY]],
          stroke: tool === 'eraser' ? '#FFFFFF' : color,
          element: tool,
          thickness: thickness,
        },
      ]);
    } else {
      setElements((prevElements) => [
        ...prevElements,
        { offsetX, offsetY, stroke: color, element: tool, thickness: thickness },
      ]);
    }

    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;

    if (tool === 'rect') {
      setElements((prevElements) =>
        prevElements.map((ele, index) =>
          index === elements.length - 1
            ? {
                ...ele,
                width: offsetX - ele.offsetX,
                height: offsetY - ele.offsetY,
              }
            : ele
        )
      );
    } else if (tool === 'line') {
      setElements((prevElements) =>
        prevElements.map((ele, index) =>
          index === elements.length - 1
            ? {
                ...ele,
                width: offsetX,
                height: offsetY,
              }
            : ele
        )
      );
    } else if (tool === 'pencil' || tool === 'eraser') {
      setElements((prevElements) =>
        prevElements.map((ele, index) =>
          index === elements.length - 1
            ? {
                ...ele,
                path: [...ele.path, [offsetX, offsetY]],
              }
            : ele
        )
      );
    }

    sendDrawing(elements);  // Відправляємо елементи малювання через WebSocket
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    sendDrawing(elements);  // Відправляємо елементи малювання після завершення
  };

  return (
    <div
      className="canvas-container"
      style={{ border: '1px solid black', height: '500px', width: '100%' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Canvas;

