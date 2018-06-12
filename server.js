global.express = require('express')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
require('dotenv').config()
const session = require('express-session')
global.passport = require('passport')
global.fs = require('fs')
global.path = require('path')
global.request = require('request')
const bodyParser = require("body-parser")
const cors = require('cors') // To allow requests from different domains.
const SteamStrategy = require('./lib/passport-steam').Strategy;

const usersRouter = require('./routes/users');
const teamsRouter = require('./routes/teams');
const authRouter = require('./routes/auth');
const usersController = require('./controllers/users')

global.db = require('./utilities/db');
global.functions = require('./utilities/functions');

global.sSmsesIoApiToken = "$2y$10$fkMJCdFng8vkbpVD2h1OcuWGMuUCIk2SWfe62JvtXZtqhtiqvmPw6";

passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Use the SteamStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3333/auth/steam/return',
    realm: 'http://localhost:3333',
    apiKey: process.env.STEAM_API_KEY
  },
  function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's Steam profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Steam account with a user record in your database,
      // and return that user instead.
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

// const app = express()

app.use(session({
    secret: 'your secret',
    name: 'name of session id',
    resave: true,
    saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../../public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(cors({origin: 'https://cthorsoe.host'}));
app.use(cors({origin: process.env.FRONTEND_URL}));
app.use('/teams', teamsRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);


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
