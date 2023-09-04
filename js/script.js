//pdf- lib
document.addEventListener("DOMContentLoaded", function () {
  const amountInput = document.getElementById("amount_usd");
  const convertedAmountDisplay = document.getElementById("converted-amount");
  const modal = document.getElementById("myModal");
  const confirmButton = document.getElementById("confirmButton");
  const closeButton = document.querySelector(".closeButton");
  const span = document.querySelector(".close");
  const modalContent = document.getElementById("modal-content");
  const transferForm = document.getElementById("transfer-form");

  /*
  // get rate from admin with WS didn't work
  const socket = new WebSocket("ws://localhost:3000");

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.exchangeRate !== undefined) {
      const rateDisplay = document.getElementById("rate-display");
      rateDisplay.textContent = data.exchangeRate.toFixed(2);

      // Populate the rate field in the transfer form
      const rateField = document.getElementById("rate");
      rateField.value = data.exchangeRate;
    }
  });
*/
  // new try

  // Function to fetch and display the latest rate
  async function getLatestRate() {
    try {
      const response = await fetch("/get-archived-rates");
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        // Sort the data array by date in descending order
        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        const latestRate = data[0].rate;

        const rateDisplay = document.getElementById("rate-display");
        rateDisplay.textContent = latestRate.toFixed(2);

        amountInput.addEventListener("input", function () {
          const amountInUSD = parseFloat(amountInput.value);
          const amountInDZA = amountInUSD * latestRate;
          convertedAmountDisplay.textContent = `Amount in DZA: ${amountInDZA.toFixed(
            2
          )}`;
        });
      }
    } catch (error) {
      console.error("Error fetching the latest rate:", error);
    }
  }

  // Call the function to get the latest rate
  getLatestRate();

  //
  /*
  // calulate rate
  amountInput.addEventListener("input", function () {
    const amountInUSD = parseFloat(amountInput.value);
    const amountInDZA = amountInUSD * exchangeRate;
    convertedAmountDisplay.textContent = `Amount in DZA: ${amountInDZA.toFixed(
      2
    )}`;
  });
*/
  /*
  // new working
  // Fetch archived rates from the server and populate the table
  async function fetchArchivedRates() {
    const response = await fetch("/get-archived-rates");
    const archivedRates = await response.json();

    // Add archived rates to the table
    archivedRates.forEach((rate) => {
      //addRateToTable(rate.date, rate.rate);
      const exchangeRate = rate.rate;
      console.log(exchangeRate);
      const rateDisplay = document.getElementById("rate-display");
      rateDisplay.textContent = exchangeRate.toFixed(2);
    });
  }
  fetchArchivedRates();
*/
  //

  //const rate = parseFloat(document.getElementById("rate").value);

  // Display the modal when "Checkout" is clicked
  transferForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get form data

    const formData = new FormData(transferForm);
    const formDataObject = {};
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });
    console.log(formData);
    // Create a string with formatted form data
    let formDataText = "<h2>Transfer Details</h2>";
    for (const [key, value] of Object.entries(formDataObject)) {
      formDataText += `<p><strong>${key}:</strong> ${value}</p>`;
    }

    // Set modal content with form data
    modalContent.innerHTML = formDataText;

    modal.style.display = "block";
  });

  // Close the modal when the close button or "Back" button is clicked
  span.addEventListener("click", function () {
    modal.style.display = "none";
  });

  closeButton.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // Proceed with sending the PDF when "Confirm" is clicked
  confirmButton.addEventListener("click", async function () {
    // Gather form data
    const formData = new FormData(transferForm);
    const formDataObject = {};
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });

    // Send form data to the server for processing
    const response = await fetch("/send-pdf-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: formDataObject }),
    });

    if (response.ok) {
      alert("Transfer sent successfully! Thank you)");
      setTimeout(function () {
        location.reload();
      }, 1500);
    } else {
      alert("Error submitting the transfer. Please try again!");
    }
  });
});

// login

// Function to display the login popup
const loginBtn = document.getElementById("login-btn");
loginBtn.addEventListener("click", function (event) {
  event.preventDefault();
  const loginPopup = document.getElementById("login-popup");
  loginPopup.style.display = "block";
});

// Function to close the login popup
function closeLoginPopup() {
  const loginPopup = document.getElementById("login-popup");
  loginPopup.style.display = "none";
}

// handle the login and send to the server
let sessionExpiration = null;
const sessionDuration = 1 * 60 * 1000;
sessionExpiration = Date.now() + sessionDuration;

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Send a POST request to the server for authentication
  const response = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  }).then((response) => {
    if (response.status === 200) {
      // Set the isLoggedIn status in localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("sessionExpiration", `${sessionExpiration} `);
      // Redirect to the admin panel (admin-functionality.html) upon successful login
      window.location.href = "/admin.html";
    } else {
      alert("Authentication failed. Please try again.");
    }
  });
}
