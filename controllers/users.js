const nodemailer = require('nodemailer')

let usersController = {}
let sQuery = "";
let aParams = [];

usersController.createUser = (jUser, fCallback)=>{
    if(jUser.password == jUser.passwordConfirm){
        const jPasswordData = global.functions.createSaltHash(jUser.password)
        jUser.passwordhash = jPasswordData.hash
        jUser.passwordsalt = jPasswordData.salt
        jUser.userrole = 1
        delete jUser.password
        delete jUser.passwordConfirm
        
        const sQuery = 'INSERT INTO users SET ?'
        db.query(sQuery, jUser, (err, jResult) => {
            if(err){
                return fCallback(true)
            }
            if(jResult.affectedRows == 1){
                jUser.id = jResult.insertId
                sendVerificationEmail(jUser)
                if(jUser.phone && jUser.phone.length == 8){
                    const sVerificationCode = global.functions.genRandomString(4, true)
                    sendVerificationSMS(jUser.id, jUser.phone, sVerificationCode)
                    jUser.code = sVerificationCode
                }
                return fCallback(false, jUser)
            }
            return fCallback(true)
        }) 
    }
}

usersController.updateUser = (jUser, fCallback)=>{
    aParams = [jUser.firstname, jUser.lastname, jUser.email, jUser.dateofbirth, jUser.playerrole, jUser.phone, jUser.description, jUser.username];
    sQuery = 'UPDATE users SET firstname = ?, lastname = ?, email = ?, dateofbirth = ?, playerrole = ?, phone = ?, description = ? WHERE username = ?'
    db.query(sQuery, aParams, (err, jResult) => {
        console.log(jResult);
        if(jResult.affectedRows == 1){
            return fCallback(false, jResult)
        }
        return fCallback(true)
    })
}

usersController.deleteUser = (sUsername, fCallback)=>{
    sQuery = `DELETE FROM users WHERE username = ?`
    db.query(sQuery, sUsername, (err, jResult) => {
      if(err){
        
      }
      console.log(jResult)
      return jResult
    })
}

usersController.getUserByUserName = (sUsername, fCallback)=>{
    sQuery = 'SELECT users.id, users.firstname, users.lastname, users.username, users.dateofbirth, users.email, users.playerrole, users.avatar, users.phone, users.description FROM users WHERE username = ?'
    db.query(sQuery, sUsername, (err, ajData) => {
        if(ajData.length == 1){
            const jUser = ajData[0];
            return fCallback(false, jUser)
        }
        return fCallback(true);
    })
};


usersController.getTeamInvitesCount = (sUsername, fCallback)=>{
    sQuery = 'SELECT COUNT(teamusers.id) as invites FROM teamusers INNER JOIN users ON users.id = teamusers.user WHERE users.username = ? AND teamusers.useraccepted = 0'
    db.query(sQuery, sUsername, (err, ajInvites) => {
    console.log(ajInvites)
    if(ajInvites.length == 1){
        const jInvites = ajInvites[0]
        return fCallback(false, jInvites);
    }
    return fCallback(true);
  })
}

usersController.getListedUsers = (fCallback)=>{
    const bAvailable = true
    sQuery = 'SELECT id, firstname, lastname, username, dateofbirth, email, playerrole, avatar, description FROM users WHERE available = ?'
    db.query(sQuery, bAvailable, (err, ajUsers) => {
        if(err){
            return fCallback(true)
        }
        return fCallback(false, ajUsers)
    })
}

usersController.listUser = (jUser, fCallback)=>{
    aParams = [jUser.firstname, jUser.lastname, jUser.email, jUser.dateofbirth, jUser.playerrole, jUser.description, 1, jUser.username]
    sQuery = 'UPDATE users SET users.firstname = ?, users.lastname = ?, users.email = ?, users.dateofbirth = ?, users.playerrole = ?, users.description = ?, users.available = ? WHERE users.username = ?'
    db.query(sQuery, aParams, (err, jResult) => {
        if(err){
            return fCallback(true)
        }
        console.log(jResult);
        if(jResult.affectedRows == 1){
            return fCallback(false, jResult)
        }else{
            return fCallback(true)
        }
    })  
}


usersController.tryLogin = (jLoginForm, fCallback)=>{
    sQuery = `SELECT passwordsalt, passwordhash, id, firstname, lastname, username, dateofbirth, email, playerrole, avatar, description FROM users WHERE username = ?`
    db.query(sQuery, jLoginForm.username, (err, ajUsers) => {
      if(err){
        return fCallback(true)
      }
      if(ajUsers.length == 1){
        const jUser = ajUsers[0]
        const sInputHash = global.functions.sha512(jLoginForm.password, jUser.passwordsalt).hash;
        if(sInputHash == jUser.passwordhash){
            const jSessionData = global.functions.createSaltHash(jUser.username)
            const aParams = [jSessionData.hash, jUser.id];
            sQuery = 'INSERT INTO loginsessions SET sessionhash = ?, user = ?'
            db.query(sQuery, aParams, (err, jData) => {
                if(err){
                    return fCallback(true)
                }
                if(jData.affectedRows == 1){
                    jUser.session = jSessionData.salt
                    jUser.sessionId = jData.insertId
                    delete jUser.passwordhash
                    delete jUser.passwordsalt
                    return fCallback(false, jUser)
                }
            })
        }else{
          return fCallback(true)
        }
      }else{
        return fCallback(true)
      }
    })
}

usersController.tryLoginBySession = (jSessionData, fCallback)=>{
    const iSessionId = parseInt(jSessionData.sessionId);
    sQuery = 'SELECT loginsessions.id as sessionId, loginsessions.sessionhash, users.id, users.firstname, users.lastname, users.username, users.dateofbirth, users.email, users.playerrole, users.avatar, users.description FROM loginsessions INNER JOIN users ON users.id = loginsessions.user WHERE loginsessions.id = ?'
    db.query(sQuery, iSessionId, (err, ajUsers) => {
        if(err){
            return fCallback(true)
        }
        if(ajUsers.length == 1){
            const jUser = ajUsers[0]
            console.log(jUser)
            const sInputHash = global.functions.sha512(jUser.username, jSessionData.sessionSalt).hash;
            if(sInputHash == jUser.sessionhash){
                delete jUser.sessionId
                delete jUser.sessionhash
                return fCallback(false, jUser)
            }else{
                return fCallback(true)
            }
        }else{
            return fCallback(true)
        }
    })
}

usersController.deleteLoginSession = (iSessionId, fCallback) => {
    const sQuery = `DELETE FROM loginsessions WHERE id = ?`
    db.query(sQuery, iSessionId, (err, jResult) => {
        if(err){
            return fCallback(true)
        }
        return fCallback(false, jResult)
    })
}

usersController.getMyTeams = (sUsername, fCallback) => {
    aParams = [true, sUsername]
    sQuery = `SELECT teams.id AS teamId, teams.name, users.id AS userId, users.firstname, users.lastname, users.username, users.dateofbirth, users.email, users.playerrole, users.avatar, users.phone 
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
            return fCallback(true)
        }
        ajPreparedTeams = global.functions.prepareTeamsWithMembers(result);
        // return res.send(ajPreparedTeams);
        return fCallback(false, ajPreparedTeams)
    })
}

usersController.verifyUserEmail = (sVerificationString, fCallback) =>{
    aParams = [true, sVerificationString];
    sQuery = 'UPDATE users SET emailconfirmed = ? WHERE emailconfirmstring = ?'
    db.query(sQuery, aParams, (err, jResult) => {
        if(err){
            return fCallback(true)
        }
        console.log(jResult);
        if(jResult.affectedRows == 1){
            return fCallback(false)
        }
        return fCallback(true)
    })
}

usersController.verifyUserPhone = (sCodeInput, iUserId, fCallback) => {
    aParams = [true, iUserId, sCodeInput];
    sQuery = 'UPDATE users SET phoneconfirmed = ? WHERE id = ? AND phoneconfirmstring = ?'
    db.query(sQuery, aParams, (err, jResult) => {
        if(err){
            return fCallback(true)
        }
        console.log(jResult);
        if(jResult.affectedRows == 1){
            return fCallback(false, jResult)
        }
        return fCallback(true)
    })
}

usersController.sendSMS = () => {
    sendVerificationSMS(4, '20283907')
}

const sendVerificationSMS = (iUserId, sPhone, sVerificationCode) => {
    addConfirmationPhoneCodeToUser(iUserId, sVerificationCode)
    var jSmsesData = {
        "apiToken":sSmsesIoApiToken,
        "mobile":sPhone,
        "message":"Your confirmation code is: " + sVerificationCode
    };
    request.post('http://smses.io/api-send-sms.php', {
        form: jSmsesData
    });
}

const sendVerificationEmail = (jUser) =>{
    console.log('jUser', jUser);
    
    const transporter = createTransporter();
    const sFilePath = global.path.join(__dirname, '../', '/verification-email.html')
    console.log(sFilePath);
    global.fs.readFile(sFilePath, 'utf8', (err, sVerificationHTML) => {
        console.log('HTML', sVerificationHTML)
        const sVerificationString = global.functions.genRandomString(32)
        addConfirmationStringToUser(jUser.id, sVerificationString)
        sVerificationHTML = sVerificationHTML.replace('{{verification-link}}', 'http://localhost:3333/users/verify-email/' + sVerificationString)
        
        const mailOptions = {
            from: 'Team Up! <teamupwebsite@gmail.com>',
            to: jUser.email,
            subject: 'Welcome to Team Up! Verify your email here!',
            html: sVerificationHTML
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    })
}

const createTransporter = () => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'teamupwebsite@gmail.com',
          pass: 'TeamUpWebsite123'
        }
    });

    return transporter
}

const addConfirmationStringToUser = (iUserId, sVerificationString, fCallback="") => {
    aParams = [sVerificationString, iUserId];
    sQuery = 'UPDATE users SET emailconfirmstring = ? WHERE id = ?'
    db.query(sQuery, aParams, (err, jResult) => {
        console.log(jResult);
        if(jResult.affectedRows == 1){
            // return fCallback(false, jResult)
        }
        // return fCallback(true)
    })
}
const addConfirmationPhoneCodeToUser = (iUserId, sConfirmationCode) => {
    aParams = [sConfirmationCode, iUserId];
    sQuery = 'UPDATE users SET phoneconfirmstring = ? WHERE id = ?'
    db.query(sQuery, aParams, (err, jResult) => {
        console.log(jResult);
        if(jResult.affectedRows == 1){
        }
    })
}

module.exports = usersController