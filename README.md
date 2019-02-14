# Bamazon!
Bamazon is an interactive storefront app that utilizes Node.js and MySQL to create customer, manager, and supervisor level views and interactions with the items in the store's database.

### Developed by: Sarah Kinneer
#### February, 2019

## Technologies Used:
mySQL, JavaScript, Node.js, Inquirer, Table

### Demo:

#### Customer View:
![Demonstration GIF](./bamazon-customer.gif)

#### Manager View:
![Demonstration GIF](./bamazon-manager.gif)

#### Supervisor View:
![Demonstration GIF](./bamazon-supervisor.gif)

### Link to Full Demonstration Video
- [Check out the demonstration video here!](https://drive.google.com/file/d/19iTQOkkfAoxg3gHNc22y4XEzUa0raZlF/view)

## You may clone this repository to download the app:
If they are not already installed, you will need to install the inquirer, mysql, dotenv, and table npm modules using the npm install command in order for the app to work properly.  You will also need access to a MySQL connection and will need to create a .env file containing:
DB_PASSWORD="[enter your own MySQL root password here]"

## Use:
1. Initialize the database with the bamazon.sql file
2. In your terminal, navigate to the bamazon directory and run one of the following commands: node bamazon-customer, node bamazon-manager, node bamazon-supervisor
3. Follow the inquirer prompts in the terminal to navigate through each view
