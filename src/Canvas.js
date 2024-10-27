import React, { useEffect, useLayoutEffect } from 'react';
import rough from 'roughjs/bundled/rough.esm';

const generator = rough.generator();

const Canvas = ({ canvasRef, ctx, color, setElements, elements, tool, thickness, socket, isDrawing, setIsDrawing, sendDrawing }) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.strokeStyle = color;
    context.lineWidth = thickness;

    // Встановлюємо розміри канваса відповідно до контейнера
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
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
      } else if (ele.element === 'ellipse') {
        roughCanvas.draw(generator.ellipse(ele.offsetX, ele.offsetY, ele.width, ele.height, {
          stroke: ele.stroke,
          roughness: 0,
          strokeWidth: ele.thickness,
        }));
      } else if (ele.element === 'circle') {
        const radius = ele.width / 2;
        roughCanvas.draw(generator.ellipse(ele.offsetX, ele.offsetY, radius * 2, radius * 2, {
          stroke: ele.stroke,
          roughness: 0,
          strokeWidth: ele.thickness,
        }));
      }
    });
  }, [elements]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const { offsetX, offsetY } = e.nativeEvent;

    // Ensure the mouse click is within canvas boundaries
    if (offsetX < 0 || offsetX > canvas.width || offsetY < 0 || offsetY > canvas.height) {
      return;
    }

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
      // Start new shape
      setElements((prevElements) => [
        ...prevElements,
        { offsetX, offsetY, stroke: color, element: tool, thickness: thickness },
      ]);
    }
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const { offsetX, offsetY } = e.nativeEvent;

    // Ensure the mouse move is within canvas boundaries
    if (offsetX < 0 || offsetX > canvas.width || offsetY < 0 || offsetY > canvas.height) {
      return;
    }

    if (isDrawing) {
      const updatedElements = [...elements];
      const currentElement = updatedElements[updatedElements.length - 1];

      if (tool === 'pencil' || tool === 'eraser') {
        currentElement.path.push([offsetX, offsetY]);
      } else {
        currentElement.width = offsetX - currentElement.offsetX;
        currentElement.height = offsetY - currentElement.offsetY;
      }

      setElements(updatedElements);
      sendDrawing(updatedElements); // Отправка малюнка на сервер
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      className="canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default Canvas;
