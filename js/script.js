//pdf- lib
document.addEventListener("DOMContentLoaded", function () {
  const amountInput = document.getElementById("amount_usd");
  const convertedAmountDisplay = document.getElementById("converted-amount");
  const toPayAmount = document.getElementById("to-amount-usd");
  const modal = document.getElementById("myModal");
  const confirmButton = document.getElementById("confirmButton");
  const closeButton = document.querySelector(".closeButton");
  const span = document.querySelector(".close");
  const modalContent = document.getElementById("modal-content");
  const transferForm = document.getElementById("transfer-form");

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

  // display the payment methosdes
  document
    .getElementById("confirm-button")
    .addEventListener("click", function () {
      document.getElementById("payment-popup").style.display = "block";
      // display the amount to pay in usd
      const amountInUSD = parseFloat(amountInput.value);
      toPayAmount.textContent = `Zelle exact amount in USD: ${amountInUSD.toFixed(
        2
      )}`;
      modal.style.display = "none";
    });

  document.getElementById("card-button").addEventListener("click", function () {
    document.getElementById("card-details").classList.remove("hidden");
    document.getElementById("cash-details").classList.add("hidden");
    document.getElementById("card-button").classList.add("active");
    document.getElementById("cash-button").classList.remove("active");
  });

  document.getElementById("cash-button").addEventListener("click", function () {
    document.getElementById("cash-details").classList.remove("hidden");
    document.getElementById("card-details").classList.add("hidden");
    document.getElementById("cash-button").classList.add("active");
    document.getElementById("card-button").classList.remove("active");
  });

  document
    .getElementById("close-button")
    .addEventListener("click", function () {
      document.getElementById("payment-popup").style.display = "none";
      modal.style.display = "block";
    });

  // Display the modal when "Checkout" is clicked
  transferForm.addEventListener("submit", function (event) {
    event.preventDefault();
    // hide the form
    transferForm.style.opacity = 0;

    // Get form data

    const formData = new FormData(transferForm);
    const formDataObject = {};
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });

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
    transferForm.style.opacity = 1;
  });

  closeButton.addEventListener("click", function () {
    modal.style.display = "none";
    transferForm.style.opacity = 1;
  });

  // Proceed with sending the PDF when "Confirm" is clicked
  confirmButton.addEventListener("click", async function () {
    // hide modal form
    confirmButton.disabled = true;
    confirmButton.style.background = "#283e2bd6";
    modal.style.opacity = 0;
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
      location.reload();
      window.location.href = "http://jamalpay.com/dashboard";
    } else {
      alert("Error submitting the transfer. Please try again!");
      location.reload();
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
