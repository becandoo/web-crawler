var mysql = require('mysql');

var pool  = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "H011@ndIT",
  database: "opencart"
});

module.exports = pool;