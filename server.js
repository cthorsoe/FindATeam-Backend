global.express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require("body-parser")
const cors = require('cors') // To allow requests from different domains.


const usersRouter = require('./routes/users');
const teamsRouter = require('./routes/teams');

global.db = require('./utilities/db');
global.functions = require('./utilities/functions');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({origin: 'http://localhost:4200'}));
app.use('/teams', teamsRouter);
app.use('/users', usersRouter);

app.listen(3333, err => {
  if(err){
    console.log('err')
    return false
  }
  console.log('ok')
}); 

app.get('/', (req, res) => {
    fs.readFile(__dirname + '/index.html', 'utf8', (err, sIndexHTML) => {
        if(err){

        }
        return res.send(sIndexHTML)
    })
})