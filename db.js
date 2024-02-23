const { Client } = require('pg');
require('dotenv').config();

const db = new Client({
  user: process.env.user,
  host: process.env.host,
  database: process.env.database,
  password: process.env.password,
  port: process.env.port
})
db.connect(function(err) {
  if (err) {
    console.log("error occured! " + err.message);
    return;
  }
  console.log("Connected!");
});


module.exports = db;