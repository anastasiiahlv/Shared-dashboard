export const longPoll = (setElements) => {
  const poll = async () => {
    try {
      const response = await fetch('http://localhost:5000/long-poll'); 
      const data = await response.json();
      
      setElements(data); 
      
      poll();
    } catch (error) {
      console.error('Long polling error:', error);
      
      setTimeout(poll, 1000);
    }
  };

  poll();
};

export const sendCanvasData = async (elements) => {
  try {
    await fetch('http://localhost:5000/update-drawing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(elements), 
    });
  } catch (error) {
    console.error('Error sending canvas data:', error);
  }
};