
const STORAGE_KEY = "expenseTrackerTransactions";

// Get saved transactions from the browser
function getTransactions() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const transactions = savedData ? JSON.parse(savedData) : [];

    return Array.isArray(transactions) ? transactions : [];
  } catch (error) {
    console.error("Could not load transactions:", error);
    return [];
  }
}

// Save transactions to the browser
function saveTransactions(transactions) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(transactions)
  );
}

// Format amounts in Pakistani Rupees
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format date for the dashboard
function formatDate(dateString) {
  if (!dateString) return "-";

  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;

  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Get today's local date (not UTC)
function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ------------------------------------
// DASHBOARD
// ------------------------------------

function renderDashboard() {
  const list = document.getElementById("transaction-list");

  // If we're not on the dashboard, stop here
  if (!list) return;

  const transactions = getTransactions();

  const totalIncome = transactions
    .filter(item => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const totalExpense = transactions
    .filter(item => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  const balance = totalIncome - totalExpense;

  document.getElementById("income").textContent =
    formatCurrency(totalIncome);

  document.getElementById("expense").textContent =
    formatCurrency(totalExpense);

  document.getElementById("balance").textContent =
    formatCurrency(balance);

  document.getElementById("transaction-count").textContent =
    `${transactions.length} ${transactions.length === 1 ? "record" : "records"}`;

  // Read current search and filter values
  const search = document.getElementById("search").value
    .trim()
    .toLowerCase();

  const typeFilter = document.getElementById("type-filter").value;
  const categoryFilter = document.getElementById("category-filter").value;

  // Filter transactions
  const filteredTransactions = transactions
    .filter(item => {
      const matchesSearch = item.description
        .toLowerCase()
        .includes(search);

      const matchesType =
        typeFilter === "all" || item.type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        item.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      const dateComparison = b.date.localeCompare(a.date);

      if (dateComparison !== 0) return dateComparison;

      return Number(b.id) - Number(a.id);
    });

  // Clear old rows
  list.replaceChildren();

  // Show empty state if nothing matches
  const emptyState = document.getElementById("empty-state");
  const tableWrapper = document.querySelector(".table-wrapper");

  emptyState.hidden = filteredTransactions.length !== 0;
  tableWrapper.hidden = filteredTransactions.length === 0;

  // Create transaction rows
  filteredTransactions.forEach(item => {
    const row = document.createElement("tr");

    // Date
    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(item.date);
    row.appendChild(dateCell);

    // Description
    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = item.description;
    descriptionCell.className = "description-cell";
    row.appendChild(descriptionCell);

    // Category
    const categoryCell = document.createElement("td");
    const categoryBadge = document.createElement("span");

    categoryBadge.className = "category-badge";
    categoryBadge.textContent = item.category;

    categoryCell.appendChild(categoryBadge);
    row.appendChild(categoryCell);

    // Type
    const typeCell = document.createElement("td");
    const typeBadge = document.createElement("span");

    typeBadge.className = `type-badge type-${item.type}`;
    typeBadge.textContent =
      item.type === "income" ? "Income" : "Expense";

    typeCell.appendChild(typeBadge);
    row.appendChild(typeCell);

    // Amount
    const amountCell = document.createElement("td");

    amountCell.className =
      item.type === "income" ? "amount-income" : "amount-expense";

    const sign = item.type === "income" ? "+" : "-";
    amountCell.textContent = `${sign} ${formatCurrency(item.amount)}`;

    row.appendChild(amountCell);

    // Actions
    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");

    actions.className = "actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "action-btn edit-btn";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
      window.location.href =
        `./add-expense.html?id=${encodeURIComponent(item.id)}`;
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "action-btn delete-btn";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteTransaction(item.id);
    });

    actions.append(editButton, deleteButton);
    actionsCell.appendChild(actions);
    row.appendChild(actionsCell);

    list.appendChild(row);
  });
}

// Delete a transaction
function deleteTransaction(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this transaction?"
  );

  if (!confirmed) return;

  const transactions = getTransactions();
  const updatedTransactions = transactions.filter(
    item => String(item.id) !== String(id)
  );

  saveTransactions(updatedTransactions);
  renderDashboard();
}

// Search and filter events
const searchInput = document.getElementById("search");
const typeFilter = document.getElementById("type-filter");
const categoryFilter = document.getElementById("category-filter");

if (searchInput) {
  searchInput.addEventListener("input", renderDashboard);
}

if (typeFilter) {
  typeFilter.addEventListener("change", renderDashboard);
}

if (categoryFilter) {
  categoryFilter.addEventListener("change", renderDashboard);
}

// ------------------------------------
// ADD / EDIT TRANSACTION FORM
// ------------------------------------

const transactionForm = document.getElementById("transaction-form");

if (transactionForm) {
  const typeInput = document.getElementById("type");
  const amountInput = document.getElementById("amount");
  const descriptionInput = document.getElementById("description");
  const categoryInput = document.getElementById("category");
  const dateInput = document.getElementById("date");
  const message = document.getElementById("form-message");
  const formTitle = document.getElementById("form-title");
  const saveButton = document.getElementById("save-button");

  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");

  // Default date for a new transaction
  dateInput.value = getToday();

  // Load existing transaction when editing
  if (editId !== null) {
    const existingTransaction = getTransactions().find(
      item => String(item.id) === editId
    );

    if (existingTransaction) {
      formTitle.textContent = "Edit Transaction";
      saveButton.textContent = "Update Transaction";

      typeInput.value = existingTransaction.type;
      amountInput.value = existingTransaction.amount;
      descriptionInput.value = existingTransaction.description;
      categoryInput.value = existingTransaction.category;
      dateInput.value = existingTransaction.date;
    } else {
      message.textContent = "Transaction not found. You can add a new one.";
    }
  }

  // Save form data
  transactionForm.addEventListener("submit", function (event) {
    event.preventDefault();
    message.textContent = "";

    const type = typeInput.value;
    const amount = Number(amountInput.value);
    const description = descriptionInput.value.trim();
    const category = categoryInput.value;
    const date = dateInput.value;

    // Validate form values
    if (!["income", "expense"].includes(type)) {
      message.textContent = "Please select a valid transaction type.";
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      message.textContent = "Please enter an amount greater than zero.";
      return;
    }

    if (!description) {
      message.textContent = "Please enter a description.";
      return;
    }

    if (!category) {
      message.textContent = "Please select a category.";
      return;
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      message.textContent = "Please select a valid date.";
      return;
    }

    const transactions = getTransactions();

    // Edit existing transaction
    if (editId !== null) {
      const index = transactions.findIndex(
        item => String(item.id) === editId
      );

      if (index === -1) {
        message.textContent =
          "This transaction no longer exists. Please return to the dashboard.";
        return;
      }

      transactions[index] = {
        ...transactions[index],
        type,
        amount,
        description,
        category,
        date
      };
    } else {
      // Add a new transaction
      transactions.push({
        id: Date.now(),
        type,
        amount,
        description,
        category,
        date
      });
    }

    try {
      saveTransactions(transactions);
      window.location.href = "./index.html";
    } catch (error) {
      console.error("Could not save transactions:", error);
      message.textContent =
        "Could not save data. Check your browser storage and try again.";
    }
  });
}

// Render dashboard when the page opens
renderDashboard();
