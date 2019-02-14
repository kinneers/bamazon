require('dotenv').config();
var mysql = require("mysql");
var inquirer = require('inquirer');
var PASSWORD = process.env.DB_PASSWORD;
const {table} = require('table');

//Global Variables
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
//Globals for initial lists of items for table display
var itemID = [];
var prod = [];
var itemPrice = [];
var inStock = [];

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
                listItems();
                break;
            case 'View Low Inventory':
                viewLow();
                break;
            case 'Add to Inventory':
                getProdList();
                break;
            case 'Add New Product':
                getDptList();
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

//Populates the customer's table
function listItems() {
    console.log('\nProducts Available Today: ');
    connection.query('SELECT item_id, product_name, price, stock_quantity FROM products;', function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            itemID.push(res[i].item_id);
            prod.push(res[i].product_name);
            itemPrice.push(res[i].price.toFixed(2).toString());
            inStock.push(res[i].stock_quantity);
        }
        //Initializes data array with column headings; data for each row will be populated and pushed to an array which will in turn be pushed to this array for display
        var data = [['Item ID', 'Product Name', 'Price', 'Number in Stock']];
        prepTable(data);
    }); 
}

//Sorts each array for proper table display
function prepTable(data) {
    for (var j = 0; j < itemID.length; j++) {
        var tempArray = [];
        tempArray.push(itemID[j]);
        tempArray.push(prod[j]);
        tempArray.push(itemPrice[j]);
        tempArray.push(inStock[j]);
        data.push(tempArray);
    }
    showTable(data);
}

//Function to populate table
function showTable(data) {
    var output = table(data);
    console.log(output);
    //Resets table to headings
    restart();
}

function restart() {
    itemID = [];
    prod = [];
    itemPrice = [];
    inStock = [];
    showMenu();
}

function viewLow() {
    console.log("\nProducts with Low Inventory: ");
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
        if (err) throw err;
        // Gathers data in table arrays
        for (var i = 0; i < res.length; i++) {
            itemID.push(res[i].item_id);
            prod.push(res[i].product_name);
            itemPrice.push(res[i].price.toFixed(2).toString());
            inStock.push(res[i].stock_quantity);
        }
        //Initializes data array with column headings; data for each row will be populated and pushed to an array which will in turn be pushed to this array for display
        var data = [['Item ID', 'Product Name', 'Price', 'Number in Stock']];
        prepTable(data);
    });
}

//Gets an array of products for use in validation later
function getProdList() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            allProducts.push(res[i].product_name.toLowerCase());
            itemID.push(res[i].item_id);
            prod.push(res[i].product_name);
        }
        //Initializes data array with column headings; data for each row will be populated and pushed to an array which will in turn be pushed to this array for display
        var data = [['Item ID', 'Product Name']];
        prepInventoryTable(data);
    }); 
}
    
//Sorts each array for proper table display
function prepInventoryTable(data) {
    for (var j = 0; j < itemID.length; j++) {
        var tempArray = [];
        tempArray.push(itemID[j]);
        tempArray.push(prod[j]);
        data.push(tempArray);
    }
    showInventoryTable(data);
}

//Function to populate table
function showInventoryTable(data) {
    var output = table(data);
    console.log(output);
    //Resets table to headings
    addInventory();
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
            productName = res[0].product_name;
            currentStock = res[0].stock_quantity;
            promptQuantity();
        });
    });
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

//Gets an array of departments for use in validation later
function getDptList() {
    connection.query("SELECT * FROM departments", function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            allDepartments.push(res[i].department_name.toLowerCase());
        }
        addProduct();
    })
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
                    console.log("\nExisting Departments: " + allDepartments);
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