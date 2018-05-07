const express = require('express')
const app = express()
const cors = require('cors') // To allow requests from different domains.

app.use(cors({origin: 'http://localhost:4200'}));

app.listen(3333, err => {
  if(err){
    console.log('err')
    return false
  }
  console.log('ok')
});

app.get('/get-users', (req, res) => {
  return res.send('[{"firstname":"Christian","lastname":"Thorsø","username":"cthorsoe","email":"christian@thorsoe.dk","dateofbirth":"1995-10-09"}]')
});

app.post('/create-user', (req, res) => {
  return res.send('OK')
});

app.put('/edit-user', (req, res) => {
  return res.send('OK')
});

app.delete('/delete-user', (req, res) => {
  return res.send('OK')
});

app.get('/user-login', (req, res) => {
  return res.send('{"firstname":"Christian","lastname":"Thorsø","username":"cthorsoe","email":"christian@thorsoe.dk","dateofbirth":"1995-10-09"}');
});