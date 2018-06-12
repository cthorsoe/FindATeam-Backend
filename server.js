global.express = require('express')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
global.fs = require('fs')
global.path = require('path')
global.request = require('request')
const bodyParser = require("body-parser")
const cors = require('cors') // To allow requests from different domains.

const usersRouter = require('./routes/users');
const teamsRouter = require('./routes/teams');
const usersController = require('./controllers/users')

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
    global.fs.readFile(__dirname + '/views/index.html', 'utf8', (err, sIndexHTML) => {
        if(err){

        }
        return res.send(sIndexHTML)
    })
})

io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('on invite', function(jInvite){
        console.log('INVITE', jInvite);
        console.log('emitting', 'user invited');
        usersController.sendTeamInvite(jInvite, (err) => {
            if(err){
                console.log('ERROR adding team invite to database', err)
            }
            jInvite.type = 'new-invite';
            io.emit('user invited', jInvite);
        })
        
    });
});

http.listen(5000, () => {
    console.log('started on port 5000');
});