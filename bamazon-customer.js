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
    password: PASSWORD, //Retrieved from .env (which is hidden in repo by .gitignore)
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    listItems();
});

//Divider used for neater output in terminal
var divider = "\n-------------------------------------------------------------\n";

//Initializes an array of IDs of items in the database for validation purposes
var possibleIDs = [];

//Generates an initial list of items for sale in the store
function listItems() {
    console.log('Welcome to the Bamazon store!  Here is a list of products available today:');
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        // Log items for sale in readable format
        for (var i = 0; i < res.length; i++) {
            possibleIDs.push(res[i].item_id);
            console.log(divider + "Item Id: " + res[i].item_id + "\nProduct Name: " + res[i].product_name + "\nPrice: $" + res[i].price + divider);
        }
        promptUser();
    });
}


/* THIS IS WHERE I GOT TIRED AND PROBABLY NEED TO START OVER FROM
var chosenProduct;
var stock = 0;
//Prompts the user to enter the ID of product to be purchased
function promptUser() {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the ID of the product you would like to buy?",
            name: "buyID",
            validate: function(value) {
                if (possibleIDs.indexOf(parseInt(value)) === -1) {
                    return false;
                } else {
                    return true;
                }
            }
        }
    ]).then(function(res) {
        var itemNum = res.buyID;
        console.log(itemNum);
        
        connection.query("SELECT product_name FROM products WHERE item_id = " + itemNum, function(err, res) {
            if (err) throw err;
            //Finds the name of the chosen product
            chosenProduct = res[0].product_name;
            return chosenProduct;
        });
        connection.query("SELECT stock_quanitiy FROM products WHERE item_id = " + itemNum, function(err, res) {
            if (err) throw err;
            //Finds the stock available of chosen product
            stock = res[0].stock_quantity;
            return stock;
        });
        inquirer.prompt([
            {
                type: "input",
                message: "Please enter the number of " + chosenProduct + " you would like to purchase",
                name: "purchaseNum",
                validate: function(value) {
                    if (stock === NaN) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }
        ]).then(function(res) {
            var buyNumber = res.purchaseNum;
            console.log(buyNumber);
        //    connection.query("SELECT product_name FROM products WHERE item_id = " + itemNum, function(err, res) {
            //      if (err) throw err;
            //    chosenProduct = res[0].product_name;
                
        });
    
    });
}

//Prompts the user to enter how many of the product they would like to purchase
*/

//connection.end();
