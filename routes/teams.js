const router = express.Router()
const teamsController = require('../controllers/teams')

router.get('/get-team/:id', (req, res) => {
    const iTeamId = req.params.id;
    teamsController.getTeam(iTeamId, (err, jTeam) => {
        if(err){
            console.log('err', err)
        }
        return res.send(jTeam)
    })
  });
  
router.get('/get-listed-teams', (req, res) => {
    teamsController.getListedTeams((err, ajTeams) => {
        if(err){

        }
        return res.send(ajTeams)
    })
});

router.post('/create-team', (req, res) => {
    if(req.body.members.length > 0){
        const sTeamName = req.body.name
        const iCreaterId = req.body.members[0].id
        teamsController.createTeam(sTeamName, iCreaterId, (err, jResult) => {
            if(err){

            }
            return res.send(jResult)
        })
    }

});
  
router.put('/edit-team', (req, res) => {
    return res.send('OK')
});

router.delete('/delete-team/:id', (req, res) => {
    return res.send('OK')
});
  
router.post('/list-team', (req, res) => {
    console.log('req.body', req.body)
    const iTeamId = req.body.id
    console.log(req.body)
    teamsController.listTeam(iTeamId, (err, jResult) => {
        if(err){
            console.log('err', err)
        }
        console.log('jResult', jResult)
        return res.send(jResult)
    })
});

module.exports = router