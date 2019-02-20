var mysql = require("mysql");
var chalk = require("chalk");
var inquirer = require("inquirer");
require("console.table");
var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) {
        console.error("error connecting: " + err.stack);
    }
    showInventory();
});


function showInventory() {

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        console.table(res);
        // console.log(chalk.blue("Testing"));


        promptCustomer(res);
    });
}


function promptCustomer(inventory) {

    inquirer
        .prompt([
            {
                type: "input",
                name: "choice",
                message: "What is the ID of the item you would you like to purchase? [Quit with Q]",
                validate: function (val) {
                    return !isNaN(val) || val.toLowerCase() === "q";
                }
            }
        ])
        .then(function (val) {

            Exit(val.choice);
            var choiceId = parseInt(val.choice);
            var product = Inventory(choiceId, inventory);


            if (product) {
                HowMuch(product);
            }
            else {

                console.log("\nThat item is not in the inventory.");
                showInventory();
            }
        });
}


function HowMuch(product) {
    inquirer
        .prompt([
            {
                type: "input",
                name: "quantity",
                message: "How many would you like? [Quit with Q]",
                validate: function (val) {
                    return val > 0 || val.toLowerCase() === "q";
                }
            }
        ])
        .then(function (val) {

            Exit(val.quantity);
            var quantity = parseInt(val.quantity);
            // if(product.stock_quantity < 5){
            //     console.log(chalk.red.bold("\nRunning Low!"));
            // }


            if (quantity > product.stock_quantity) {
                console.log(chalk.red("\nInsufficient quantity!"));
                showInventory();
            }
            else {

                BuyItems(product, quantity);
                //  if(product.stock_quantity<5){
                //      console.log(chalk.red.bold("\nRunning Low!"));
            }
        });

}


function BuyItems(product, quantity) {
    connection.query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
        [quantity, product.item_id],
        function (err, res) {
            // if(product.stock_quantity < 5){
            //  console.log(chalk.red.bold("\nRunning Low!"));

            console.log("\nSuccessfully purchased " + quantity + " " + product.product_name + "'s!");
            connection.query(
                "SELECT price FROM products WHERE item_id=" + product.item_id,
                function (err, res) {
                    console.log("\nTotal Cost: " + (parseInt(quantity) * parseInt(res[0].price)))
                }
            )

            showInventory();
          
            
        }
    );
}

function Inventory(choiceId, inventory) {
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].item_id === choiceId) {

            return inventory[i];
        }
    }

    return null;
}


function Exit(choice) {
    if (choice.toLowerCase() === "q") {
        console.log("Goodbye!");
        process.exit(0);
    }
}




