const mysql = require('mysql');

const connection_pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'webcrux_test'
});

module.exports = connection_pool;