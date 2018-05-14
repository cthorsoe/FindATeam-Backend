const express = require('express')
const bodyParser = require("body-parser");
const app = express()
const cors = require('cors') // To allow requests from different domains.
const mysql = require('mysql')
const moment = require('moment')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({origin: 'http://localhost:4200'}));

app.listen(3333, err => {
  if(err){
    console.log('err')
    return false
  }
  console.log('ok')
});

//  ------------ DATABASE CONNECTION ------------

const db = mysql.createConnection({
  host:"localhost",
  port:8889,
  user:"admin",
  password: "password",
  database:"find-a-team"
})

// ------------ USERS ------------

app.get('/get-user/:username', (req, res) => {
  const sUsername = req.params.username
  const sQuery = 'SELECT users.id, users.firstname, users.lastname, users.username, users.dateofbirth, users.email, users.playerrole, users.avatar, users.phone, users.description FROM users WHERE username = ?'
  db.query(sQuery, sUsername, (err, ajData) => {
    if(ajData.length == 1){
      const jUser = ajData[0];
      // const jReturnData = prepareUserData(jUser)
      // return res.send(jReturnData);
      return res.send(jUser);
    }
    return res.send({});
  })
});

app.get('/get-listed-users', (req, res) => {
  const bAvailable = true
  const sQuery = 'SELECT id, firstname, lastname, username, dateofbirth, email, playerrole, avatar, description FROM users WHERE available = ?'
  db.query(sQuery, bAvailable, (err, ajData) => {
    console.log(ajData);    
    const ajReturnData = prepareMultipleUsersData(ajData)
    return res.send(ajReturnData);
  })
});

app.post('/create-user', (req, res) => {
  // console.log('BODY USER', req.body);
  let jUser = req.body
  jUser.passwordhash = "HASH"
  jUser.passwordsalt = "SALT"
  jUser.userrole = 1
  delete jUser.password
  delete jUser.passwordConfirm
  console.log(jUser);

  const sQuery = 'INSERT INTO users SET ?'
  db.query(sQuery, jUser, (err, ajData) => {
    if(err){
      console.log('ERR', err)
    }
    console.log(ajData);
    if(ajData.affectedRows == 1){
      return res.send('OK');
    }
    return res.send({error:'ERROR'});
  }) 
});

app.put('/edit-user', (req, res) => {
  return res.send('OK')
});

app.delete('/delete-user', (req, res) => {
  return res.send('OK')
});

app.get('/user-login/:username', (req, res) => {
  const sUsername = req.params.username;
  const sQuery = `SELECT id, firstname, lastname, username, dateofbirth, email, playerrole, avatar, description FROM users WHERE username = ?`
  db.query(sQuery, sUsername, (err, ajUsers) => {
    console.log(ajUsers)
    if(ajUsers.length == 1){
      return res.send(ajUsers[0])
    }
    return res.send('ERROR')
  })
});

app.post('/list-user', (req, res) => {
  console.log('BODY USER', req.body);
  const jUser = req.body
  const aParams = [jUser.firstname, jUser.lastname, jUser.email, jUser.dateofbirth, jUser.playerrole, jUser.description, 1, jUser.username]
  const sQuery = 'UPDATE users SET users.firstname = ?, users.lastname = ?, users.email = ?, users.dateofbirth = ?, users.playerrole = ?, users.description = ?, users.available = ? WHERE users.username = ?'
  db.query(sQuery, aParams, (err, ajData) => {
    console.log(ajData);
    if(ajData.affectedRows == 1){
      return res.send('OK');
    }
    return res.send({error:'ERROR'});
  })  
});

// ------------ TEAMS ------------

app.get('/get-team/:id', (req, res) => {
  let team = JSON.parse('');
  // user.username = req.params.username;
  // user.description = 'My description';
  // user.role = "Leader";
  return res.send(JSON.stringify(team));
});

app.get('/get-listed-teams', (req, res) => {
  const sQuery = `SELECT teams.id AS teamId, teams.name, users.id AS userId, users.firstname, users.lastname, users.username, users.dateofbirth, users.email, users.playerrole, users.avatar, users.phone 
                FROM teams 
                INNER JOIN teamusers ON teamusers.team = teams.id
                INNER JOIN users ON users.id = teamusers.user
                WHERE teams.recruiting = true && teamusers.useraccepted = true
                ORDER BY teams.id`
  db.query(sQuery, (err, result) => {
    ajPreparedTeams = prepareTeamsWithMembers(result);
    return res.send(ajPreparedTeams)
  })
});

app.get('/get-my-teams/:username', (req, res) => {
  const aParams = [true, req.params.username]
  const sQuery = `SELECT teams.id AS teamId, teams.name, users.id AS userId, users.firstname, users.lastname, users.username, users.dateofbirth, users.email, users.playerrole, users.avatar, users.phone 
                FROM teams 
                INNER JOIN teamusers ON teamusers.team = teams.id
                INNER JOIN users ON users.id = teamusers.user 
                WHERE teams.id IN   (SELECT teams.id 
                                    FROM teams 
                                    INNER JOIN teamusers ON teams.id = teamusers.team
                                    INNER JOIN users ON users.id = teamusers.user
                                    AND teamusers.useraccepted = ? AND users.username = ?) 
                ORDER BY teams.id`
  db.query(sQuery, aParams, (err, result) => {
    if (err){
      console.log('ERR', err);
      return res.send([]);
    }
    ajPreparedTeams = prepareTeamsWithMembers(result);
    return res.send(ajPreparedTeams);
  })
});

app.post('/create-team', (req, res) => {
  return res.send('OK')
});

app.put('/edit-team', (req, res) => {
  return res.send('OK')
});

app.delete('/delete-team', (req, res) => {
  return res.send('OK')
});

app.post('/list-team', (req, res) => {
  const iTeamId = req.body.id
  if(iTeamId){
    const sQuery = 'UPDATE teams SET teams.recruiting = 1 WHERE id = ?'
    db.query(sQuery, iTeamId, (err, ajData) => {
      if(ajData.affectedRows == 1){
        return res.send('OK');
      }
      return res.send({error:'ERROR'});
    })  
  }
  
});

app.get('/test-query', (req, res) => {
  const sQuery = `select teams.id as teamId, teams.name, users.id as userId, users.firstname, users.lastname, users.username, users.dateofbirth, users.email, users.playerrole, users.avatar, users.phone from teams 
                inner join teamusers on teamusers.team = teams.id
                inner join users on users.id = teamusers.user
                order by teams.id`
  db.query(sQuery, (err, result) => {
    // console.log
    ajPreparedTeams = prepareTeamsWithMembers(result);
    return res.send(ajPreparedTeams);
  })
});

const prepareUserData = jUser => {
  const jPreparedUser = {
    id: jUser.id,
    firstname: jUser.firstname,
    lastname: jUser.lastname,
    username: jUser.username,
    dateofbirth: formatDate(jUser.dateofbirth),
    email: jUser.email,
    role: jUser.playerrole,
    avatar: jUser.avatar,
    description: jUser.description,
  };
  return jPreparedUser;
}

const prepareMultipleUsersData = ajUser => {
  ajPreparedUsers = [];
  for (let i = 0; i < ajUser.length; i++) {
    const jUser = ajUser[i];
    console.log(jUser)
    const jPreparedUser = {
      id: jUser.id,
      firstname: jUser.firstname,
      lastname: jUser.lastname,
      username: jUser.username,
      dateofbirth: formatDate(jUser.dateofbirth),
      email: jUser.email,
      role: jUser.playerrole,
      avatar: jUser.avatar,
      description: jUser.description,
    };
    ajPreparedUsers.push(jPreparedUser);
  }
  return ajPreparedUsers;
}

const prepareTeamsWithMembers = ajTeams => {
  let ajPreparedTeams = []
  for(let i = 0; i < ajTeams.length; i++) {
    const jTeam = ajTeams[i]
    if(ajTeams[i-1] && ajTeams[i-1].teamId == ajTeams[i].teamId && ajPreparedTeams.length > 0) {
      const jMember = {
        id : jTeam.userId,
        firstname: jTeam.firstname,
        lastname: jTeam.lastname,
        username: jTeam.username,
        dateofbirth: jTeam.dateofbirth,
        email: jTeam.email,
        playerrole: jTeam.playerrole,
        avatar: jTeam.avatar,
        phone: jTeam.phone
      };
      ajPreparedTeams[ajPreparedTeams.length - 1].members.push(jMember)
    }else{
      const jPreparedTeam = {
        id : jTeam.teamId,
        name : jTeam.name,
        members: [{
          id : jTeam.userId,
          firstname: jTeam.firstname,
          lastname: jTeam.lastname,
          username: jTeam.username,
          dateofbirth: jTeam.dateofbirth,
          email: jTeam.email,
          playerrole: jTeam.playerrole,
          avatar: jTeam.avatar,
          phone: jTeam.phone
        }]
      }
      ajPreparedTeams.push(jPreparedTeam);
    }
    
  }
  return ajPreparedTeams;
}

const formatDate = date => {
  return moment(date).format('DD-MM-YYYY');
}