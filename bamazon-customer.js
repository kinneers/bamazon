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
});

//Welcomes the user to the app before initially listing items
function welcome () {
    console.log("\nWelcome to the Bamazon Store!\n");
    inquirer.prompt([
        {
            type: 'list',
            choices: ["See Today's Product List", 'Exit'],
            message: "What would you like to do today?",
            name: 'show'
        }
    ]).then(function(res) {
        if (res.show === "See Today's Product List") {
            listItems();
        } else {
            console.log('\nWe are sad to see you go and hope to see you again soon!\n');
            connection.end();
        }
    })
}
welcome();

//Divider used for neater output in terminal
var divider = "\n-------------------------------------------------------------\n";

//Initializes an array of IDs of items in the database for validation purposes
var possibleIDs = [];

//Generates an initial list of items for sale in the store
function listItems() {
    console.log('\nHere is a list of products available today: ');
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

//Initialize global variables
var chosenProduct;
var stock = 0;
var itemNum = 0;
var price = 0;
var newQuantity;

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
        itemNum = res.buyID;
        console.log(itemNum);
        //Uses the id to gather the name of the chosen product, current number in stock, and price
        connection.query("SELECT product_name, stock_quantity, price FROM products WHERE item_id = " + itemNum, function(err, res) {
        if (err) throw err;
        chosenProduct = res[0].product_name;
        stock = res[0].stock_quantity;
        price = res[0].price;
        promptAmount(chosenProduct);
        });
    })
}

//Regex to test if string contains only numbers
var numTest = /^[0-9]*$/
//Initializes quantity to buy globally
var buyNumber = 0;

//Gathers the amount of the chosen product the buyer would like to purchase
function promptAmount(chosenProduct) {
    inquirer.prompt([
        {
            type: "NumberPrompt",
            message: "Please enter the number of " + chosenProduct + " you would like to purchase: ",
            name: "purchaseNum",
            validate: function(value) {
                if (numTest.test(value)) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    ]).then(function(res) {
        buyNumber = parseInt(res.purchaseNum);
        if (buyNumber <= stock) {
            newQuantity = stock - buyNumber;
            fulfill();
        } else {
            inquirer.prompt([
                {
                    type: 'list',
                    choices: ['Try Again', 'Exit'],
                    message: "Insufficient quantity in store.  Would you like to try again?",
                    name: 'again'
                }
            ]).then(function(res) {
                if (res.again === 'Try Again') {
                    listItems();
                } else {
                    console.log('\nWe are sad to see you go and hope to see you again soon!\n');
                    connection.end();
                }
            })
        }
    });
}

//Updates the SQL database to show stock remaining when customer order is fulfilled
function fulfill() {
    console.log("\nProcessing Your Order.......\n");
    connection.query("UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: newQuantity
            },
            {
                item_id: itemNum
            }
        ],
        function(err, res) {
            var total = buyNumber * price;
            //Gets the product_sales amount prior to the transaction
            connection.query("SELECT product_sales FROM products WHERE item_id = " + itemNum, function(err, res) {
                if (err) throw err;
                var currentSales = res[0].product_sales;
                completeSale(itemNum, currentSales, total);
            });
            //Displays the total cost of the customer's purchase
            console.log("Thank you for your order! \nYour total comes to: $" + total + "\n");
        }
    );
}

//
function completeSale(itemNum, currentSales, total) {
    var newSales = currentSales + total;
    connection.query("UPDATE products SET ? WHERE ?",
        [
            {
                product_sales: newSales
            },
            {
                item_id: itemNum
            }
        ],
        function(err, res) {
            buyAgain();
        }
    );
}

//Prompts for customer who has made a purchase
function buyAgain() {
    inquirer.prompt([
        {
            type: 'list',
            choices: ["Yes, please", 'No, thanks'],
            message: "Would you like to make another purchase?",
            name: 'show'
        }
    ]).then(function(res) {
        if (res.show === "Yes, please") {
            listItems();
        } else {
            console.log('\nThank you for shopping with us, have a lovely day!\n');
            connection.end();
        }
    })
}
