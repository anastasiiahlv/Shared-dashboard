import React, { useState } from 'react';
import { toast } from 'react-toastify';

const JoinCreateRoom = ({ socket }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!name || !room) return toast.error('Please enter your name and room ID!');
    
    socket.emit('joinRoom', { username: name, room });
  };

  return (
    <div>
      <h1>Join a Room</h1>
      <form onSubmit={handleJoinRoom}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Room ID"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button type="submit">Join Room</button>
      </form>
    </div>
  );
};

export default JoinCreateRoom;
