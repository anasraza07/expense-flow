
function getTransactions() {
    let data = localStorage.getItem("transactions");

    if (data == null) {
        return [];
    }

    return JSON.parse(data);
}

function saveTransactions(transactions) {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function renderDashboard() {
    let list = document.getElementById("transaction-list");

    // Dashboard page par hi table update hoga
    if (list == null) {
        return;
    }

    let transactions = getTransactions();

    let income = 0;
    let expense = 0;

    // Total income aur expense calculate karo
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].type == "income") {
            income = income + transactions[i].amount;
        } else {
            expense = expense + transactions[i].amount;
        }
    }

    let balance = income - expense;

    document.getElementById("income").textContent =
        "Rs. " + income.toFixed(2);

    document.getElementById("expense").textContent =
        "Rs. " + expense.toFixed(2);

    document.getElementById("balance").textContent =
        "Rs. " + balance.toFixed(2);

    document.getElementById("transaction-count").textContent =
        transactions.length + " records";

    let search = document.getElementById("search").value.toLowerCase();
    let type = document.getElementById("type-filter").value;
    let category = document.getElementById("category-filter").value;

    list.innerHTML = "";

    let count = 0;

    // Har transaction ko check karo
    for (let i = 0; i < transactions.length; i++) {
        let item = transactions[i];

        if (!item.description.toLowerCase().includes(search)) {
            continue;
        }

        if (type != "all" && item.type != type) {
            continue;
        }

        if (category != "all" && item.category != category) {
            continue;
        }

        let row = document.createElement("tr");

        let date = document.createElement("td");
        date.textContent = item.date;
        row.appendChild(date);

        let description = document.createElement("td");
        description.textContent = item.description;
        row.appendChild(description);

        let categoryCell = document.createElement("td");
        let categoryBadge = document.createElement("span");
        categoryBadge.className = "category-badge";
        categoryBadge.textContent = item.category;
        categoryCell.appendChild(categoryBadge);
        row.appendChild(categoryCell);

        let typeCell = document.createElement("td");
        let typeBadge = document.createElement("span");
        typeBadge.className = "type-badge type-" + item.type;
        typeBadge.textContent = item.type;
        typeCell.appendChild(typeBadge);
        row.appendChild(typeCell);

        let amountCell = document.createElement("td");

        if (item.type == "income") {
            amountCell.className = "amount-income";
            amountCell.textContent = "+ Rs. " + item.amount.toFixed(2);
        } else {
            amountCell.className = "amount-expense";
            amountCell.textContent = "- Rs. " + item.amount.toFixed(2);
        }

        row.appendChild(amountCell);

        let actionCell = document.createElement("td");
        let deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "action-btn delete-btn";

        deleteButton.onclick = function () {
            deleteTransaction(item.id);
        };

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        list.appendChild(row);
        count++;
    }

    // Agar koi transaction na mile
    document.getElementById("empty-state").hidden = count > 0;
    document.querySelector(".table-wrapper").hidden = count == 0;
}

function deleteTransaction(id) {
    let answer = confirm("Do you want to delete this transaction?");

    if (answer == false) {
        return;
    }

    let transactions = getTransactions();
    let newTransactions = [];

    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].id != id) {
            newTransactions.push(transactions[i]);
        }
    }

    saveTransactions(newTransactions);
    renderDashboard();
}

// Search aur filters
document.getElementById("search").oninput = renderDashboard;
document.getElementById("type-filter").onchange = renderDashboard;
document.getElementById("category-filter").onchange = renderDashboard;

// Page khulte hi dashboard update karo
renderDashboard();
