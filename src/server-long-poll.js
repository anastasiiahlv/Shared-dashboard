const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;  

app.use(cors());
app.use(express.json());

let elements = [];  
let clients = [];  

const notifyClients = () => {
  clients.forEach((res) => res.json(elements)); 
  clients = [];  
};

app.get('/long-poll', (req, res) => {
  clients.push(res);  

  req.on('close', () => {
    clients = clients.filter(client => client !== res);  
  });
});

app.post('/update-drawing', (req, res) => {
  elements = req.body; 
  notifyClients();     
  res.status(200).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
