import React, { useEffect, useRef, useState } from 'react';
import Canvas from './Canvas';
import './App.css'; 
import rough from 'roughjs/bundled/rough.esm';
import io from 'socket.io-client';

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

    socketRef.current = io('http://localhost:5000'); 

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    socketRef.current.on('drawing', (receivedElements) => {
      setElements(receivedElements);
    });

    return () => {
      socketRef.current.disconnect(); 
    };
  }, []);

  const sendDrawing = (updatedElements) => {
    socketRef.current.emit('drawing', updatedElements);
  };

  const handleClearCanvas = () => {
    ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setElements([]);
    sendDrawing([]);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Drawing App</h1>
      </div>
      <div className="controls">
        <label>Color: </label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <label>Tool: </label>
        <select value={tool} onChange={(e) => setTool(e.target.value)}>
          <option value="pencil">Pencil</option>
          <option value="rect">Rectangle</option>
          <option value="line">Line</option>
          <option value="eraser">Eraser</option>
          <option value="ellipse">Ellipse</option>
          <option value="circle">Circle</option> {/* Add Circle tool */}
        </select>
        <label>Thickness: </label>
        <input
          type="number"
          value={thickness}
          min="1"
          max="20"
          onChange={(e) => setThickness(e.target.value)}
        />
        <button className="button" onClick={handleClearCanvas}>Clear Canvas</button>
      </div>
      <div className="canvas-container">
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
          sendDrawing={sendDrawing}  
        />
      </div>
    </div>
  );
};

export default App;
