let teamsController = {}
let sQuery
let aParams

teamsController.getTeam = (iTeamId, fCallback) => {
    sQuery =   `SELECT teams.id AS teamId, teams.name, users.id AS userId, users.firstname, users.lastname, users.username, users.dateofbirth, users.email, users.playerrole, users.avatar, users.phone 
                FROM teams 
                INNER JOIN teamusers ON teamusers.team = teams.id
                INNER JOIN users ON users.id = teamusers.user
                WHERE teamusers.useraccepted = true AND teams.id = ?
                ORDER BY teams.id`
    db.query(sQuery, iTeamId, (err, ajTeams) => {
        if(err){
            return fCallback(true)
        }
        ajPreparedTeams = global.functions.prepareTeamsWithMembers(ajTeams);
        if(ajPreparedTeams.length == 1){
            const jPreparedTeam = ajPreparedTeams[0];
            return fCallback(false, jPreparedTeam)
        }
        return fCallback(true)
    })
}

teamsController.getListedTeams = fCallback => {
    sQuery =   `SELECT teams.id AS teamId, teams.name, users.id AS userId, users.firstname, users.lastname, users.username, users.dateofbirth, users.email, users.playerrole, users.avatar, users.phone 
                FROM teams 
                INNER JOIN teamusers ON teamusers.team = teams.id
                INNER JOIN users ON users.id = teamusers.user
                WHERE teams.recruiting = true && teamusers.useraccepted = true
                ORDER BY teams.id`
    db.query(sQuery, (err, ajTeams) => {
        if(err){
            return fCallback(true)
        }
        ajPreparedTeams = global.functions.prepareTeamsWithMembers(ajTeams);
        return fCallback(false, ajPreparedTeams)
    })
}

teamsController.createTeam = (sTeamName, iUserId, fCallback) => {
    sQuery = 'INSERT INTO teams SET name = ?'
    db.query(sQuery, sTeamName, (err, jResult) => {
        if(err){
            console.log('ERR', err)
            return fCallback(true)
        }
        if(jResult.affectedRows == 1){
            aParams = [jResult.insertId, iUserId, true];
            sQuery = 'INSERT INTO teamusers SET team = ?, user = ?, useraccepted = ?'
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
        }else{
            return fCallback(true)
        }
    })

}

teamsController.updateTeam = (jTeam, fCallback) => {
    // TODO
}

teamsController.deleteTeam = (iTeamId, fCallback) => {
    // TODO
}

teamsController.listTeam = (iTeamId, fCallback) => {
    aParams = [true, parseInt(iTeamId)];
    sQuery = 'UPDATE teams SET teams.recruiting = ? WHERE id = ?'
    db.query(sQuery, aParams, (err, jResult) => {
        if(err){
            console.log('err', err)
            return fCallback(true)
        }
        if(jResult.affectedRows == 1){
            return fCallback(false, jResult)
        }
        return fCallback(true)
    })  
}

module.exports = teamsController