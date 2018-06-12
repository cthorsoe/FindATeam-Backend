//  ------------ DATABASE CONNECTION ------------
const mysql = require('mysql')

const db = mysql.createConnection({
    host:"localhost",
    port:8889,
    user:"admin",
    password: "password",
    database:"find-a-team"
})

module.exports = db