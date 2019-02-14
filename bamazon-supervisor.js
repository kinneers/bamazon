require('dotenv').config();
var mysql = require('mysql');
var inquirer = require('inquirer');
var PASSWORD = process.env.DB_PASSWORD;
const {table} = require('table');

//Global Variables for Table Data
var data = [];
var dptID = [];
var dptName = [];
var dptOverhead = [];
var dptProdSales = [];
var dptProfit = [];
//Regex to check for decimal value
var decCheck = /^\d+(\.\d{0,2})?$/
//Needed for dept name validation
var dptList = [];

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: PASSWORD,
    database: 'bamazon'
});

connection.connect(function(err) {
    if (err) throw err;
        showMenu();
    })

//Prompts supervisor action
function showMenu() {
    inquirer.prompt([
        {
            type: 'list',
            choices: ['View Product Sales by Department', 'Create New Department', 'Exit'],
            message: "What would you like to accomplish?",
            name: 'menu'
        }
    ]).then(function(res) {
        if (res.menu === 'View Product Sales by Department') {
            selectData();
        } else if (res.menu === 'Create New Department') {
            getDptList();
        } else {
            console.log("\nKeep up the good work!\n");
            connection.end();
        }
    })
}

//Populates the first 3 columns of the table
function selectData() {
    connection.query('SELECT department_id, department_name, over_head_costs FROM departments;', function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            dptID.push(res[i].department_id);
            dptName.push(res[i].department_name);
            dptOverhead.push(res[i].over_head_costs.toFixed(2).toString());
        }
        //Initializes data array with column headings; data for each row will be populated and pushed to an array which will in turn be pushed to this array for display
        data = [['department_id', 'department_name', 'over_head_costs', 'product_sales', 'total_profit']];
        getProdSales();
    }); 
}

//Many thanks to Billy Sterling "The SQL-izer" for helping me learn to utilize VIEW!
function getProdSales() {
    //Gets the product sums of each department
    connection.query('CREATE OR REPLACE VIEW productsums AS SELECT d.department_id, p.department_name, SUM(p.product_sales) AS sums FROM products p INNER JOIN departments d ON d.department_name = p.department_name GROUP BY p.department_name;', function(err, res) {
        if (err) throw err;
        });
    connection.query('SELECT sums FROM productsums ORDER BY department_id;', function(err, res) {
        if (err) throw err;
        for (var y = 0; y < res.length; y++) {
            dptProdSales.push(res[y].sums);
        }
        totalProfit();
    })
}

function totalProfit() {
    for (var t = 0; t < dptProdSales.length; t++) {
        var tempProd = dptProdSales[t] - dptOverhead[t];
        dptProfit.push(tempProd); 
    }
    calculateTotalSales();
}

//Function to calculate sales and place in arrays for display as table
function calculateTotalSales() {

    for (var j = 0; j < dptID.length; j++) {
        var tempArray = [];
        tempArray.push(dptID[j]);
        tempArray.push(dptName[j]);
        tempArray.push(dptOverhead[j]);
        tempArray.push(dptProdSales[j]);
        tempArray.push(dptProfit[j]);
        data.push(tempArray);
    }
    showTable(data);
}

//Function to populate table
function showTable(data) {
    var output = table(data);
    console.log(output);
    restart();
}

function restart() {
    dptID = [];
    dptName = [];
    dptOverhead = [];
    dptProdSales = [];
    dptProfit = [];
    dptList = [];
    showMenu();
}

//Gets an array of departments for use in validation later
function getDptList() {
    connection.query("SELECT * FROM departments", function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            dptList.push(res[i].department_name.toLowerCase());
        }
        createDept();
    })
}

//Prompts supervisor through steps to create new department
function createDept() {
    inquirer.prompt([
        {
            type: 'input',
            message: 'Enter the name of the new department: ',
            name: 'newDeptName',
            validate: function(value) {
                if (value === '') {
                    console.log("\nPlease enter a department name.");
                    return false;
                } else if (dptList.includes(value.toLowerCase())) {
                    console.log("\nThis department already exists.");
                    return false;
                } else {
                    return true;
                }
            }
        },
        {
            type: 'input',
            message: 'Enter the overhead costs for this department: ',
            name: 'overhead',
            validate: function(value) {
                if (decCheck.test(value)) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    ]).then(function(res) {
        dptName = res.newDeptName;
        overhead = res.overhead;
        connection.query('INSERT INTO departments (department_name, over_head_costs) VALUES ("' + dptName + '",' + overhead + ');', function(err, res) {
        if (err) throw err;
        console.log('\nDepartments Updated! \nDepartment: ' + dptName + '\nOverhead: ' + overhead);
        restart();
        })
    });
}