import React, { useEffect, useRef, useState } from 'react';
import Canvas from './Canvas';
import './App.css'; 
import rough from 'roughjs/bundled/rough.esm';

const generator = rough.generator();

const App = () => {
  const canvasRef = useRef(null);
  const ctx = useRef(null);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState('pencil');
  const [thickness, setThickness] = useState(5);
  const [elements, setElements] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.height = window.innerHeight * 2;
    canvas.width = window.innerWidth * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    ctx.current = context;

    // WebSocket connection
    socketRef.current = new WebSocket('ws://localhost:3001');

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    socketRef.current.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          if (data.clear) {
            ctx.current.clearRect(0, 0, canvas.width, canvas.height);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      } else {
        const img = new Image();
        img.src = URL.createObjectURL(event.data);
        img.onload = () => {
          ctx.current.clearRect(0, 0, canvas.width, canvas.height);
          ctx.current.drawImage(img, 0, 0);
        };
      }
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      socketRef.current.close(); // Cleanup WebSocket on component unmount
    };
  }, []);

  const handleClearCanvas = () => {
    ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setElements([]);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ clear: true }));
    }
  };

  return (
    <div className="container"> {/* Apply container class */}
      <div className="header"> {/* Apply header class */}
        <h1>Drawing App</h1>
      </div>
      <div className="controls"> {/* Apply controls class */}
        <label>Color: </label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <label>Tool: </label>
        <select value={tool} onChange={(e) => setTool(e.target.value)}>
          <option value="pencil">Pencil</option>
          <option value="rect">Rectangle</option>
          <option value="line">Line</option>
          <option value="eraser">Eraser</option>
        </select>
        <label>Thickness: </label>
        <input
          type="number"
          value={thickness}
          min="1"
          max="20"
          onChange={(e) => setThickness(e.target.value)}
        />
        <button className="button" onClick={handleClearCanvas}>Clear Canvas</button> {/* Apply button class */}
      </div>
      <div className="canvas-container"> {/* Apply canvas-container class */}
        <Canvas
          canvasRef={canvasRef}
          ctx={ctx}
          color={color}
          setElements={setElements}
          elements={elements}
          tool={tool}
          thickness={thickness}
          socket={socketRef.current}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
        />
      </div>
    </div>
  );
};

export default App;