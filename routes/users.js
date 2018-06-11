const router = express.Router()
const usersController = require('../controllers/users')

router.get('/get-user/:username', (req, res, next) => {
    const sUsername = req.params.username
    usersController.getUserByUserName(sUsername, (err, jUser)=>{
        if(err){
            console.log(err)
            return res.send(err)
        }
        return res.send(jUser)
    })
});

router.get('/avatar/:username', (req, res, next) => {
    const sUsername = req.params.username
    usersController.getUserAvatar(sUsername, (err, imgAvatar) => {
        res.writeHead(200, {'Content-Type': 'image/jpeg' });
        return res.end(imgAvatar, 'binary');
    })
});

router.get('/get-team-invites-count/:username', (req, res) => {
    const sUsername = req.params.username
    usersController.getTeamInvitesCount(sUsername, (err, jInvites)=>{
        if(err){

        }
        return res.send(jInvites)
    })
});

router.get('/get-listed-users', (req, res) => {
    usersController.getListedUsers((err, ajUsers)=>{
        if(err){
            
        }
        return res.send(ajUsers)
    });
});

router.post('/create-user', (req, res) => {
    let jUser = req.body
    usersController.createUser(jUser, (err, jResult) => {
        if(err){

        }
        return res.send(jResult);
    })
});

router.put('/edit-user', (req, res) => {
    const jUser = req.body
    usersController.updateUser(jUser, (err, jResult)=>{
        if(err){

        }
        return res.send(jResult)
    })
  
});

router.delete('/delete-user/:username', (req, res) => {
    const sUsername = req.params.username;
    usersController.deleteUser(sUsername, (err, jResult) => {
        if(err){

        }
        return res.send(jResult)
    })
});

router.post('/login', (req, res) => {
    const sUsername = req.body.username;
    const sPassword = req.body.password;
    const jLoginForm = {
        username: sUsername, 
        password: sPassword
    }
    usersController.tryLogin(jLoginForm, (err, jUser) => {
        if(err){
        }
        return res.send(jUser)
    })
})

router.post('/login-by-session', (req, res) => {
    console.log(req.body)
    const jSessionData = {
        sessionId: req.body.sessionId,
        sessionSalt: req.body.sessionSalt
    }
    usersController.tryLoginBySession(jSessionData, (err, jData) => {
        if(err){
            return res.send('ERROR')
        }
        return res.send(jData)
    })
})

router.delete('/delete-login-session/:id', (req, res) => {
    const iSessionId = req.params.id;
    console.log('BODY', iSessionId)
    usersController.deleteLoginSession(iSessionId, (err, jResult) => {
        if(err){

        }
        return res.send(jResult)
    })
  });

router.post('/list-user', (req, res) => {
  console.log('BODY USER', req.body);
  const jUser = req.body
  usersController.listUser(jUser, (err, jResult) => {
      if(err){

      }
      return res.send(jResult)
  })
});

router.get('/get-my-teams/:username', (req, res) => {
    const sUsername = req.params.username
    usersController.getMyTeams(sUsername, (err, ajTeams) => {
        if(err){

        }
        return res.send(ajTeams)
    })
});

router.get('/verify-email/:verificationstring', (req, res) => {
    console.log('ROUTER HIT')
    // return res.send('ok')
    const verificationstring = req.params.verificationstring
    usersController.verifyUserEmail(verificationstring, (err) => {
        if(err){

        }
        const sFilePath = global.path.join(__dirname, '../', '/views/email-verified.html');
        global.fs.readFile(sFilePath, 'utf8', (err, sHTML) => {
            if(err){
                console.log('err', err)
            }
            return res.send(sHTML)
        })
    })
})

router.post('verify-phone', (req, res) => {
    const jVerifyPhoneForm = req.body;
    usersController.verifyUserPhone(jVerifyPhoneForm.code, jVerifyPhoneForm.id, (err, jResult) => {
        if(err){
            return res.send('FAIL')
        }
        return res.send('VERIFIED')
    })
})


router.get('/sendsms', (req, res) => {
    usersController.sendSMS()

    return res.send('ok')
})



module.exports = router