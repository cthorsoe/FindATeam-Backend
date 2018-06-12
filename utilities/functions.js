const crypto = require('crypto')
const moment = require('moment')

var jFunctions = {}
const jError = {} // ??

jFunctions.formatDate = (date, format = 'DD-MM-YYYY') => {
    return moment(date).format(format);
}
  
jFunctions.genRandomString = function(iLength, bUpperCase = false){
    let = sRandomString = crypto.randomBytes(Math.ceil(iLength/2)).toString('hex').slice(0,iLength);
    if(bUpperCase){
        sRandomString = sRandomString.toUpperCase();
    }
    return sRandomString
};
  
jFunctions.sha512 = function(sInput, sSalt){
    var hash = crypto.createHmac('sha512', sSalt); /** Hashing algorithm sha512 */
    hash.update(sInput);
    var sHash = hash.digest('hex');
    return {
        salt:sSalt,
        hash:sHash
    };
};
  
jFunctions.createSaltHash = function(sInput) {
    var sSalt = jFunctions.genRandomString(16) /** Returns salt of length 16 */
    var jSaltHash = jFunctions.sha512(sInput, sSalt)
    return jSaltHash
}

jFunctions.prepareTeamsWithMembers = ajTeams => {
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

jFunctions.createError = (sCode, sDescription, sMessage, jError = {}) => {
    jError = {
        status: 'ERROR',
        errorCode: sCode,
        errorDescription: sDescription,
        errorMsg: sMessage,
        errorObj: jError
    }
    return jError
}

module.exports = jFunctions;