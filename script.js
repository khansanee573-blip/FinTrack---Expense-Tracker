
// =====================================
// 1. SELECT HTML ELEMENTS
// =====================================

const totalBalance = document.getElementById("totalBalance");
const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");

const transactionList = document.getElementById("transactionList");
const transactionCount = document.getElementById("transactionCount");
const emptyMessage = document.getElementById("emptyMessage");

const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");

const modalOverlay = document.getElementById("modalOverlay");
const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");

const transactionForm = document.getElementById("transactionForm");

const monthlyChart = document.getElementById("monthlyChart");
const categoryChart = document.getElementById("categoryChart");
const categoryList = document.getElementById("categoryList");

const donutTotal = document.getElementById("donutTotal");


// =====================================
// 2. CURRENCY FORMAT
// =====================================

function formatMoney(amount) {

    return "৳ " + Number(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });

}


// =====================================
// 3. DATE FUNCTIONS
// =====================================

function getDateOffset(days) {

    const date = new Date();

    date.setDate(date.getDate() + days);

    return date.toISOString().split("T")[0];

}


function formatDate(dateString) {

    return new Date(dateString + "T00:00:00").toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}


// Show Current Date

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });


// =====================================
// 4. DEFAULT TRANSACTIONS
// =====================================

const defaultTransactions = [

    {
        id: 1,
        title: "Monthly Salary",
        category: "Salary",
        amount: 35000,
        type: "income",
        date: getDateOffset(-1)
    },

    {
        id: 2,
        title: "Grocery Shopping",
        category: "Food",
        amount: 2500,
        type: "expense",
        date: getDateOffset(-2)
    },

    {
        id: 3,
        title: "Freelance Project",
        category: "Salary",
        amount: 8000,
        type: "income",
        date: getDateOffset(-3)
    },

    {
        id: 4,
        title: "Electricity Bill",
        category: "Bills",
        amount: 1200,
        type: "expense",
        date: getDateOffset(-4)
    },

    {
        id: 5,
        title: "New Shoes",
        category: "Shopping",
        amount: 3200,
        type: "expense",
        date: getDateOffset(-5)
    },

    {
        id: 6,
        title: "Bus & Rickshaw",
        category: "Transport",
        amount: 650,
        type: "expense",
        date: getDateOffset(-6)
    }

];


// =====================================
// 5. LOAD DATA FROM LOCAL STORAGE
// =====================================

let transactions = defaultTransactions;

try {

    const savedData = localStorage.getItem("fintrack_transactions");

    if (savedData !== null) {

        const parsedData = JSON.parse(savedData);

        if (Array.isArray(parsedData)) {
            transactions = parsedData;
        }

    }

} catch (error) {

    console.error("Unable to load saved data:", error);

}


// =====================================
// 6. SAVE DATA
// =====================================

function saveData() {

    localStorage.setItem(
        "fintrack_transactions",
        JSON.stringify(transactions)
    );

}


// =====================================
// 7. UPDATE DASHBOARD
// =====================================

function updateDashboard() {

    let income = 0;
    let expense = 0;

    transactions.forEach(function (item) {

        if (item.type === "income") {

            income += Number(item.amount);

        } else {

            expense += Number(item.amount);

        }

    });


    // Calculate Balance

    const balance = income - expense;


    // Update Cards

    totalBalance.textContent = formatMoney(balance);
    totalIncome.textContent = formatMoney(income);
    totalExpense.textContent = formatMoney(expense);


    // Update Charts

    renderMonthlyChart();
    renderCategoryChart();

}


// =====================================
// 8. SAFE TEXT FOR HTML
// =====================================

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function (char) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];

    });

}


// =====================================
// 9. RENDER TRANSACTIONS
// =====================================

function renderTransactions() {

    const searchValue = searchInput.value.toLowerCase();

    const filterValue = filterSelect.value;


    // Search and Filter

    const filteredTransactions = transactions.filter(function (item) {

        const matchesSearch =
            item.title.toLowerCase().includes(searchValue) ||
            item.category.toLowerCase().includes(searchValue);

        const matchesFilter =
            filterValue === "all" || item.type === filterValue;

        return matchesSearch && matchesFilter;

    });


    // Sort by Latest Date

    filteredTransactions.sort(function (a, b) {

        return new Date(b.date) - new Date(a.date);

    });


    transactionList.innerHTML = "";


    // Empty Message

    if (filteredTransactions.length === 0) {

        emptyMessage.style.display = "block";

    } else {

        emptyMessage.style.display = "none";

    }


    // Generate Transaction Rows

    filteredTransactions.forEach(function (item) {

        const row = document.createElement("tr");

        const isIncome = item.type === "income";

        const amountClass = isIncome ? "amount-income" : "amount-expense";

        const typeClass = isIncome ? "type-income" : "type-expense";

        const sign = isIncome ? "+" : "-";

        row.innerHTML = `

            <td>${escapeHTML(item.title)}</td>

            <td>${escapeHTML(item.category)}</td>

            <td>${escapeHTML(formatDate(item.date))}</td>

            <td class="${amountClass}">
                ${sign} ${formatMoney(item.amount)}
            </td>

            <td>
                <span class="type-badge ${typeClass}">
                    ${isIncome ? "Income" : "Expense"}
                </span>
            </td>

            <td>
                <button class="delete-btn" data-id="${item.id}">
                    Delete
                </button>
            </td>

        `;

        transactionList.appendChild(row);

    });


    // Transaction Count

    transactionCount.textContent =
        `Showing ${filteredTransactions.length} of ${transactions.length} transactions`;

}


// =====================================
// 10. ADD NEW TRANSACTION
// =====================================

transactionForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const title = document.getElementById("title").value.trim();

    const amount = Number(document.getElementById("amount").value);

    const category = document.getElementById("category").value;

    const date = document.getElementById("date").value;

    const type = document.querySelector('input[name="type"]:checked').value;


    // Validation

    if (!title || !Number.isFinite(amount) || amount <= 0 || !date) {

        alert("Please enter valid transaction details.");

        return;

    }


    // New Transaction Object

    const newTransaction = {

        id: Date.now(),

        title: title,

        amount: amount,

        category: category,

        date: date,

        type: type

    };


    // Add to Array

    transactions.push(newTransaction);


    // Save and Update

    saveData();

    renderTransactions();

    updateDashboard();


    // Reset Form

    transactionForm.reset();

    document.getElementById("date").value = getDateOffset(0);


    // Close Modal

    modalOverlay.classList.remove("show");

});


// =====================================
// 11. DELETE TRANSACTION
// =====================================

transactionList.addEventListener("click", function (event) {

    if (event.target.classList.contains("delete-btn")) {

        const id = Number(event.target.dataset.id);

        const confirmDelete = confirm(
            "Are you sure you want to delete this transaction?"
        );

        if (confirmDelete) {

            transactions = transactions.filter(function (item) {

                return item.id !== id;

            });


            saveData();

            renderTransactions();

            updateDashboard();

        }

    }

});


// =====================================
// 12. SEARCH TRANSACTIONS
// =====================================

searchInput.addEventListener("input", function () {

    renderTransactions();

});


// =====================================
// 13. FILTER TRANSACTIONS
// =====================================

filterSelect.addEventListener("change", function () {

    renderTransactions();

});


// =====================================
// 14. CLEAR ALL TRANSACTIONS
// =====================================

document.getElementById("clearAll").addEventListener("click", function () {

    if (transactions.length === 0) {

        return;

    }

    const confirmClear = confirm(
        "Are you sure you want to delete all transactions?"
    );

    if (confirmClear) {

        transactions = [];

        saveData();

        renderTransactions();

        updateDashboard();

    }

});


// =====================================
// 15. OPEN AND CLOSE MODAL
// =====================================

openModal.addEventListener("click", function () {

    modalOverlay.classList.add("show");

    document.getElementById("date").value = getDateOffset(0);

});


closeModal.addEventListener("click", function () {

    modalOverlay.classList.remove("show");

});


modalOverlay.addEventListener("click", function (event) {

    if (event.target === modalOverlay) {

        modalOverlay.classList.remove("show");

    }

});


// =====================================
// 16. MONTHLY BAR CHART
// =====================================

function renderMonthlyChart() {

    const months = [];

    for (let i = 5; i >= 0; i--) {

        const date = new Date();

        date.setDate(1);

        date.setMonth(date.getMonth() - i);

        months.push({

            month: date.toLocaleDateString("en-US", {
                month: "short"
            }),

            year: date.getFullYear(),

            monthNumber: date.getMonth()

        });

    }


    // Calculate Monthly Income and Expenses

    const monthlyData = months.map(function (month) {

        let income = 0;

        let expense = 0;


        transactions.forEach(function (item) {

            const date = new Date(item.date + "T00:00:00");

            if (
                date.getMonth() === month.monthNumber &&
                date.getFullYear() === month.year
            ) {

                if (item.type === "income") {

                    income += Number(item.amount);

                } else {

                    expense += Number(item.amount);

                }

            }

        });


        return {

            month: month.month,

            income: income,

            expense: expense

        };

    });


    // Find Maximum Value

    const maxValue = Math.max(

        ...monthlyData.map(item => Math.max(item.income, item.expense)),

        1

    );


    monthlyChart.innerHTML = "";


    // Generate Bars

    monthlyData.forEach(function (item) {

        const incomeHeight = (item.income / maxValue) * 100;

        const expenseHeight = (item.expense / maxValue) * 100;


        const group = document.createElement("div");

        group.className = "chart-group";


        group.innerHTML = `

            <div class="bars">

                <div class="bar bar-income"
                    style="height: ${incomeHeight}%"
                    title="Income: ${formatMoney(item.income)}">
                </div>

                <div class="bar bar-expense"
                    style="height: ${expenseHeight}%"
                    title="Expenses: ${formatMoney(item.expense)}">
                </div>

            </div>

            <span class="chart-month">${item.month}</span>

        `;


        monthlyChart.appendChild(group);

    });

}


// =====================================
// 17. CATEGORY SPENDING CHART
// =====================================

function renderCategoryChart() {

    const categoryData = {};


    // Calculate Expense By Category

    transactions.forEach(function (item) {

        if (item.type === "expense") {

            if (!categoryData[item.category]) {

                categoryData[item.category] = 0;

            }

            categoryData[item.category] += Number(item.amount);

        }

    });


    const categories = Object.entries(categoryData);

    const total = categories.reduce(function (sum, item) {

        return sum + item[1];

    }, 0);


    donutTotal.textContent = formatMoney(total);


    const colors = [
        "#20c997",
        "#5b8def",
        "#f4b942",
        "#ef806d",
        "#9b85e8",
        "#36b9c8",
        "#e78ac3",
        "#8996a9"
    ];


    categoryList.innerHTML = "";


    // No Expense

    if (total === 0) {

        categoryChart.style.background = "#edf0f5";

        categoryList.innerHTML = `
            <p style="text-align:center; color:#9aa3b1; font-size:11px;">
                No expenses to display yet.
            </p>
        `;

        return;

    }


    // Generate Donut Chart

    let currentPercentage = 0;

    const gradientParts = [];


    categories.forEach(function (item, index) {

        const category = item[0];

        const amount = item[1];

        const percentage = (amount / total) * 100;

        const start = currentPercentage;

        currentPercentage += percentage;

        const color = colors[index % colors.length];


        gradientParts.push(
            `${color} ${start}% ${currentPercentage}%`
        );


        // Category List

        const categoryItem = document.createElement("div");

        categoryItem.className = "category-item";


        categoryItem.innerHTML = `

            <div class="category-name">

                <span class="category-dot" style="background:${color}"></span>

                <span>${escapeHTML(category)}</span>

            </div>

            <span class="category-value">${percentage.toFixed(1)}%</span>

        `;


        categoryList.appendChild(categoryItem);

    });


    categoryChart.style.background =
        `conic-gradient(${gradientParts.join(", ")})`;

}


// =====================================
// 18. INITIALIZE DASHBOARD
// =====================================

document.getElementById("date").value = getDateOffset(0);

renderTransactions();

updateDashboard();
