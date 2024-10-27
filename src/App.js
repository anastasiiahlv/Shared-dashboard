import React, { useEffect, useRef, useState } from 'react';
import Canvas from './Canvas';
import './App.css'; 
import rough from 'roughjs/bundled/rough.esm';
import io from 'socket.io-client';
import { longPoll, sendCanvasData } from './longPoll';  

const generator = rough.generator();

const App = () => {
  const [ping, setPing] = useState(null);
  const canvasRef = useRef(null);
  const ctx = useRef(null);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState('pencil');
  const [thickness, setThickness] = useState(5);
  const [elements, setElements] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const socketRef = useRef(null);
  const [connectionType, setConnectionType] = useState('WebSocket');  

  useEffect(() => {
    const canvas = canvasRef.current;

    // Встановлення розмірів полотна з урахуванням масштабу
    canvas.height = window.innerHeight * 2;
    canvas.width = window.innerWidth * 2;

    // Встановлення стилю полотна
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2); 
    context.lineCap = 'round';
    ctx.current = context;

    if (connectionType === 'WebSocket') {
      socketRef.current = io('http://localhost:5000');
      socketRef.current.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      socketRef.current.on('pong', () => {
        const latency = Date.now() - socketRef.current.pingStart;
        setPing(latency); // Зберігаємо значення пінгу в стані
      });

      socketRef.current.on('drawing', (receivedElements) => {
        setElements(receivedElements);
      });

      return () => {
        socketRef.current.disconnect(); 
      };
    } else if (connectionType === 'LongPoll') {
      longPoll(setElements); 
      console.log('Connected to Long Poll server');
    }
  }, [connectionType]);

  const measurePing = () => {
    if (connectionType === 'WebSocket') {
      socketRef.current.pingStart = Date.now();
      socketRef.current.emit('ping');
    } else if (connectionType === 'LongPoll') {
      const start = Date.now();
      fetch('http://localhost:5000/ping')
        .then(() => {
          const latency = Date.now() - start;
          setPing(latency); // Зберігаємо значення пінгу в стані
        })
        .catch((error) => {
          console.error('Ping error:', error);
        });
    }
  };

  useEffect(() => {
    const interval = setInterval(measurePing, 5000); 
    return () => clearInterval(interval);
  }, [connectionType]);

  const sendDrawing = (updatedElements) => {
    if (connectionType === 'WebSocket') {
      socketRef.current.emit('drawing', updatedElements);
    } else if (connectionType === 'LongPoll') {
      sendCanvasData(updatedElements);  
    }
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
        <label>Connection: </label>
        <select value={connectionType} onChange={(e) => setConnectionType(e.target.value)}>
          <option value="WebSocket">WebSocket</option>
          <option value="LongPoll">Long Poll</option>
        </select>
        <div>Ping: {ping !== null ? `${ping} ms` : 'N/A'}</div>
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
          <option value="circle">Circle</option>
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
