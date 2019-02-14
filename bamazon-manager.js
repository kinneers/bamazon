require('dotenv').config();
var mysql = require("mysql");
var inquirer = require('inquirer');
var PASSWORD = process.env.DB_PASSWORD;

//Global Variables
var displayProducts;
var divider = "\n-------------------------------------------------------------\n";
//Initializes an array of IDs of items in the database for validation purposes
var possibleIDs = [];
var idNum = 0;
var productName;
var addStock = 0;
var currentStock = 0;
//Regex to test if string contains only numbers
var numTest = /^[0-9]*$/
//Globals for product and dpt arrays
var allProducts= [];
var allDepartments = [];
//Regex to check for decimal value
var decCheck = /^\d+(\.\d{0,2})?$/
var query;

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
    showMenu();
});

function showMenu() {
    inquirer.prompt([
        {
            type: 'list',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Exit'],
            message: "What would you like to accomplish?",
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
                query = 'inventory';
                getProdList();
                break;
            case 'Add New Product':
                query = 'product';
                getProdList();
                break;
            case 'Exit':
                console.log("\nThanks for updating the store. Have a great day!\n");
                connection.end();
                break;
            default:
                console.log("This command was not recognized.");
        }
    })
}

function viewProducts() {     
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

//If a manager selects Add to Inventory, the app displays a prompt that will let the manager "add more" of any item currently in the store
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
            console.log(idNum);
            promptQuantity();
        });
    });
}

//Gets an array of products for use in validation later
function getProdList() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            allProducts.push(res[i].product_name.toLowerCase());
            allDepartments.push(res[i].department_name.toLowerCase());
            console.log(divider + "Item Id: " + res[i].item_id + "\nProduct Name: " + res[i].product_name + "\nPrice: $" + res[i].price + "\nQuantity: " + res[i].stock_quantity + divider);
        }
        if (query === 'inventory') {
            addInventory();
        } else if (query === 'product') {
            addProduct();
        }
    })
}

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

//Allows the manager to add a completely new product to the store
function addProduct() {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the name of the new product? ",
            name: "newName",
            validate: function(value) {    
                if (value === '') {
                    console.log("\nPlease enter a product name.");
                    return false;
                } else if (allProducts.includes(value.toLowerCase())) {
                    console.log("\nThis product is already in the database.")
                    return false;
                }
                else {
                    return true;
                }
            }
        },
        {
            type: "input",
            message: "To what department does the new product belong? ",
            name: "newDept",
            validate: function(value) {
                if (value === '') {
                    console.log("Please enter a department.");
                    return false;
                } else if (!allDepartments.includes(value.toLowerCase())) {
                    console.log("\nThis department does not exist. Please enter an existing department. If a department needs to be added, please press Control-C and seek out a supervisor.");
                    return false;
                } else {
                    return true;
                }
            }
        }, 
        {
            type: "input",
            message: "Enter the product price (no dollar sign): ",
            name: "newPrice",
            validate: function(value) {
                if (decCheck.test(value)) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        {
            type: "input",
            message: "Enter the number of product in stock: ",
            name: "newStock",
            validate: function(value) {
                if (numTest.test(value)) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    ]).then(function(res) {
        var prod = res.newName;
        var dept = res.newDept;
        var prodPrice = parseFloat(res.newPrice);
        var quant = parseInt(res.newStock);
        var beginSales = 0;
        connection.query('INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales) VALUES("' + prod + '", "' + dept + '", ' + prodPrice + ', ' + quant + ', ' + beginSales + ');', function(err, res) {
        if (err) throw err;
        console.log("\nStore Updated! \nProduct: " + prod + "\nDepartment: " + dept + "\nPrice: $" + prodPrice + "\nQuantity: " + quant + "\n");
        showMenu();
        });
    });      
}