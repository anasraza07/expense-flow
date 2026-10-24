
let form = document.getElementById("transaction-form");

let type = document.getElementById("type");
let amount = document.getElementById("amount");
let description = document.getElementById("description");
let category = document.getElementById("category");
let date = document.getElementById("date");

// Aaj ki date set karo
let today = new Date();

let year = today.getFullYear();
let month = String(today.getMonth() + 1).padStart(2, "0");
let day = String(today.getDate()).padStart(2, "0");

date.value = year + "-" + month + "-" + day;

// Form submit hone par
form.onsubmit = function (event) {
    event.preventDefault();

    let transactions = localStorage.getItem("transactions");

    if (transactions == null) {
        transactions = [];
    } else {
        transactions = JSON.parse(transactions);
    }

    let newTransaction = {
        id: Date.now(),
        type: type.value,
        amount: Number(amount.value),
        description: description.value,
        category: category.value,
        date: date.value
    };

    transactions.push(newTransaction);

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    alert("Transaction saved successfully!");

    window.location.href = "index.html";
};
