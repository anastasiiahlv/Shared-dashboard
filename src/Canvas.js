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
    const { offsetX, offsetY } = e.nativeEvent;
    const canvas = canvasRef.current;

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
    if (!isDrawing) return;

    const { offsetX, offsetY } = e.nativeEvent;
    const canvas = canvasRef.current;

    // Ensure the mouse move is within canvas boundaries
    if (offsetX < 0 || offsetX > canvas.width || offsetY < 0 || offsetY > canvas.height) {
      return;
    }

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
    } else if (tool === 'ellipse') {
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
    } else if (tool === 'circle') {
      setElements((prevElements) =>
        prevElements.map((ele, index) =>
          index === elements.length - 1
            ? {
                ...ele,
                width: Math.sqrt(Math.pow(offsetX - ele.offsetX, 2) + Math.pow(offsetY - ele.offsetY, 2)) * 2,
                height: Math.sqrt(Math.pow(offsetX - ele.offsetX, 2) + Math.pow(offsetY - ele.offsetY, 2)) * 2,
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

    sendDrawing(elements);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    sendDrawing(elements);
  };

  return (
    <div className="canvas-container" style={{ border: '1px solid black', height: '500px', width: '100%' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default Canvas;
