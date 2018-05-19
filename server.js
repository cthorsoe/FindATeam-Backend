global.express = require('express')
const app = express()
global.fs = require('fs')
global.path = require('path')
global.request = require('request')
const bodyParser = require("body-parser")
const cors = require('cors') // To allow requests from different domains.

const usersRouter = require('./routes/users');
const teamsRouter = require('./routes/teams');

global.db = require('./utilities/db');
global.functions = require('./utilities/functions');

global.sSmsesIoApiToken = "$2y$10$fkMJCdFng8vkbpVD2h1OcuWGMuUCIk2SWfe62JvtXZtqhtiqvmPw6";

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
    global.fs.readFile(__dirname + '/index.html', 'utf8', (err, sIndexHTML) => {
        if(err){

        }
        return res.send(sIndexHTML)
    })
})