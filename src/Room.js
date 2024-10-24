import React, { useRef, useEffect } from 'react';

const Room = ({ socket }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    socket.on('drawing', (data) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.lineWidth;
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
      ctx.lineTo(data.xEnd, data.yEnd);
      ctx.stroke();
    });

    return () => {
      socket.off('drawing');
    };
  }, [socket]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    
    const draw = (e) => {
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
      
      socket.emit('drawing', {
        room: 'your_room_id',
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
        xEnd: e.nativeEvent.offsetX,
        yEnd: e.nativeEvent.offsetY,
        color: '#000000', // or any selected color
        lineWidth: 2, // or any selected line width
      });
    };

    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => {
      canvas.removeEventListener('mousemove', draw);
    });
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      onMouseDown={handleMouseDown}
      style={{ border: '1px solid black' }}
    />
  );
};

export default Room;
