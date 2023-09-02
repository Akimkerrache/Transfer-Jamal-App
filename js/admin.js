const rateForm = document.getElementById("rate-form");
const ratesTable = document
  .getElementById("rates-table")
  .getElementsByTagName("tbody")[0];

// Function to add a new rate to the table
function addRateToTable(date, rate) {
  const newRow = ratesTable.insertRow(0);
  newRow.innerHTML = `<td>  ${date}</td><td>  ${rate}$</td>`;
}

// first -- working
rateForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const newRate = parseFloat(document.getElementById("new-rate").value);

  // send the new rate to the server
  const response = await fetch("/update-rate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newRate }),
  });

  // Clear the input field
  document.getElementById("new-rate").value = "";
  // Update the table with the new rate
  const currentDate = new Date().toLocaleDateString();
  addRateToTable(currentDate, newRate);
  //*
  const data = await response.json();
  alert(data.message);

  //
});

// Fetch archived rates from the server and populate the table
async function fetchArchivedRates() {
  const response = await fetch("/get-archived-rates");
  const archivedRates = await response.json();

  // sort rates
  const sortRates = archivedRates.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  // Add archived rates to the table
  sortRates.forEach((rate) => {
    addRateToTable(rate.date, rate.rate);
  });
}

// Call the function to fetch and display archived rates
fetchArchivedRates();

// JavaScript for admin.js (client-side code)

// Function to log out and redirect to index.html
function logout() {
  // Perform any necessary logout actions (e.g., clearing session data)

  // Redirect to index.html
  window.location.href = "/index.html"; // Use an absolute path
}

// Attach the logout function to the logout button
const logoutButton = document.getElementById("logout-btn");
if (logoutButton) {
  logoutButton.addEventListener("click", logout);
}
/*
// try working
// Function to check if the session has expired
let sessionExpiration = null;
const sessionDuration = 1 * 60 * 1000;
sessionExpiration = Date.now() + sessionDuration;

function checkSessionExpiration() {
  if (sessionStorage.getItem("sessionExpiration") < Date.now()) {
    alert("Your session has expired. Please log in again.");
    window.location.href = "/index.html";
  }
}

// Check session expiration every minute
setInterval(checkSessionExpiration, 10000);

// Initialize session expiration in sessionStorage
sessionStorage.setItem("sessionExpiration", sessionExpiration);
*/

// JavaScript for admin.js (client-side code)

// Function to check if the user is logged in and handle session expiration
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const sessionExpiration = localStorage.getItem("sessionExpiration");

  // Check if the user is logged in
  if (isLoggedIn && sessionExpiration) {
    const currentTime = Date.now();

    // Check if the session has expired
    if (currentTime < sessionExpiration) {
      setTimeout(function () {
        location.reload();
      }, 15000);
      // The user is logged in and the session is not expired
      // Continue to display the admin panel
    } else {
      alert("Time session has expired");
      // The session has expired, log the user out and redirect to index.html
      logoutAndRedirect();
    }
  } else {
    alert("Error in isLoggedin or SessionExpiration");
    // The user is not logged in, redirect to index.html
    logoutAndRedirect();
  }
}
checkLoginStatus();
// Function to log out and redirect to index.html
function logoutAndRedirect() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("sessionExpiration");
  window.location.href = "/index.html"; // Redirect to index.html
}

// Check the login status when the page loads
