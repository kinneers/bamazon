require('dotenv').config();
var mysql = require("mysql");
var inquirer = require('inquirer');
var PASSWORD = process.env.DB_PASSWORD;

var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "PASSWORD", //Retrieved from .env (in .gitignore)
    database: "bamazon_db"
  });

  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    listItems();
  });

  function listItems() {
      console.log('Welcome to the Bamazon store!  Here is a list of products available today:');
  }