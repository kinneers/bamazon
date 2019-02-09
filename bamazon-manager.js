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

function showMenu() {
    inquirer.prompt([
        {
            type: 'list',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'],
            message: "Welcome! What would you like to accomplish?",
            name: 'menu'
        }
    ]).then(function(res) {
        command = res.menu;
        switch (command)  {
            case 'View Products for Sale':
                viewProducts();
                break;
            case 'View Low Inventory':
                viewLow();
                break;
            case 'Add to Inventory':
                addInventory();
                break;
            case 'Add New Product':
                addProduct();
                break;
            default:
                console.log("This command was not recognized.");
        }
    })
}
showMenu();

var divider = "\n-------------------------------------------------------------\n";

function viewProducts() {
    console.log('\nList of all products: ');
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        // Log products in readable format
        for (var i = 0; i < res.length; i++) {
            console.log(divider + "Item Id: " + res[i].item_id + "\nProduct Name: " + res[i].product_name + "\nPrice: $" + res[i].price + "\nQuantity: " + res[i].stock_quantity + divider);
        }
        showMenu();
    });
}

function viewLow() {
    console.log("\nProducts with Low Inventory: ");
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
        if (err) throw err;
        // Log products in readable format
        for (var i = 0; i < res.length; i++) {
            console.log(divider + "Item Id: " + res[i].item_id + "\nProduct Name: " + res[i].product_name + "\nPrice: $" + res[i].price + "\nQuantity: " + res[i].stock_quantity + divider);
        }
        showMenu();
    });
}

//Initializes an array of IDs of items in the database for validation purposes
var possibleIDs = [];
//Initializes globals
var idNum = 0;
var productName;
var addStock = 0;
var currentStock = 0;

//If a manager selects Add to Inventory, the app displays a prompt that will let the manager "add more" of any item currently in the store.
function addInventory() {
    //Gather an array or all possible IDs for validation purposes
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            possibleIDs.push(res[i].item_id);
        }   
    });
    promptID();
}

//Prompts manager to enter a valid product ID in order to update stock
function promptID() {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the ID of the product you would like to update?",
            name: "updateID",
            validate: function(value) {
                if (possibleIDs.indexOf(parseInt(value)) === -1) {
                    return false;
                } else {
                    return true;
                }
            }
        }
    ]).then(function(res) {
        idNum = res.updateID;
        //Uses the id to gather the name of the chosen product and current number in stock
        connection.query("SELECT product_name, stock_quantity FROM products WHERE item_id = " + idNum, function(err, res) {
            if (err) throw err;
            console.log(res);
            productName = res[0].product_name;
            console.log(productName);
            currentStock = res[0].stock_quantity;
            console.log(currentStock);
            });
        console.log(idNum);
        promptQuantity();
    });    
}

//Regex to test if string contains only numbers
var numTest = /^[0-9]*$/

//Prompt user for the quantity of stock to add
function promptQuantity() {
    inquirer.prompt([
        {
            type: "input",
            message: "How many of " + productName + " will be added to the inventory?",
            name: "numToAdd",
            validate: function(value) {
                if (numTest.test(value)) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    ]).then(function(res) {
        addStock = res.numToAdd;
        var newQuantity = parseInt(currentStock) + parseInt(addStock);
        //Updates the database to reflect the added stock
        connection.query("UPDATE products SET stock_quantity = " + newQuantity + " WHERE item_id = " + idNum, function(err, res) {
        if (err) throw err;
        console.log("\nThere are now " + newQuantity + " " + productName + "\n");
        showMenu();
        });
    });    
}

function addProduct() {
    console.log("Make addProduct Function Here");
    //If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.
}