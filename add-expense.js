const STORAGE_KEY = "expenseTrackerTransactions";

const form = document.getElementById("transaction-form");
const amountInput = document.getElementById("amount");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const message = document.getElementById("form-message");

// Set today's date automatically
function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

dateInput.value = getToday();

// Load existing transactions
function getTransactions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const transactions = data ? JSON.parse(data) : [];

    if (!Array.isArray(transactions)) {
      throw new Error("Invalid transaction data");
    }

    return transactions;
  } catch (error) {
    console.error("Error loading transactions:", error);
    throw new Error("Saved data could not be loaded.");
  }
}

// Display an error or success message
function showMessage(text, type) {
  message.textContent = text;
  message.className = type;
}

// Save expense
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const amount = Number(amountInput.value);
  const description = descriptionInput.value.trim();
  const category = categoryInput.value;
  const date = dateInput.value;

  // Validate amount
  if (!Number.isFinite(amount) || amount <= 0) {
    showMessage("Please enter an amount greater than zero.", "error");
    amountInput.focus();
    return;
  }

  // Validate description
  if (!description) {
    showMessage("Please enter an expense description.", "error");
    descriptionInput.focus();
    return;
  }

  // Validate category
  const validCategories = [
    "Food",
    "Transport",
    "Bills",
    "Shopping",
    "Health",
    "Education",
    "Other"
  ];

  if (!validCategories.includes(category)) {
    showMessage("Please select a valid category.", "error");
    categoryInput.focus();
    return;
  }

  // Validate date, including impossible calendar dates
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!dateMatch) {
    showMessage("Please select a valid date.", "error");
    dateInput.focus();
    return;
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const parsedDate = new Date(`${date}T00:00:00`);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() + 1 !== month ||
    parsedDate.getDate() !== day
  ) {
    showMessage("Please select a valid calendar date.", "error");
    dateInput.focus();
    return;
  }

  try {
    const transactions = getTransactions();

    const newExpense = {
      id: Date.now(),
      type: "expense",
      amount: amount,
      description: description,
      category: category,
      date: date
    };

    transactions.push(newExpense);

    // Save to localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(transactions)
    );

    showMessage("Expense saved successfully!", "success");

    // Open dashboard after saving
    window.location.href = "./index.html";
  } catch (error) {
    console.error("Error saving expense:", error);

    showMessage(
      "Expense save nahi hua. Browser storage check karo.",
      "error"
    );
  }
});
