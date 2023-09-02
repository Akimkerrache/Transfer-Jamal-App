const express = require("express");
const bodyParser = require("body-parser");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 5000;
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files from the current directory
const http = require("http");
const WebSocket = require("ws");

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Define the path to the archive folder
//const archiveFolderPath = path.join(__dirname, "archive");

// Serve the admin page and send archived rates to the client
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Read the archive folder
const archivePath = path.join(__dirname, "archive");
const archiveFiles = fs.readdirSync(archivePath);

// Find the most recent date file
const mostRecentFile = archiveFiles.reduce((mostRecent, file) => {
  const fileDate = new Date(file.split(".")[0]);
  if (!isNaN(fileDate)) {
    return fileDate > mostRecent ? fileDate : mostRecent;
  }
  return mostRecent;
}, new Date(0));

// Read the rate from the most recent date file
if (!isNaN(mostRecentFile)) {
  const rateFilePath = path.join(
    archivePath,
    `${mostRecentFile.toISOString().slice(0, 10)}.json`
  );
  const rateData = fs.readFileSync(rateFilePath, "utf-8");
  const savedRate = JSON.parse(rateData).rate;

  // Use the saved rate in your app
  exchangeRate = savedRate;
}

// Handle rate update and archiving
app.post("/update-rate", (req, res) => {
  const newRate = parseFloat(req.body.newRate);
  exchangeRate = newRate; // Update the rate
  console.log(newRate);
  //*
  // Archive the rate with the current date
  // Get current date in the format YYYY-MM-DD
  const currentDay = new Date().toISOString().slice(0, 10);
  const currentDate = new Date().toLocaleDateString();
  // Write the rate to the archive folder
  const archivePath = path.join(__dirname, "archive", `${currentDay}.json`);
  fs.writeFileSync(
    archivePath,
    JSON.stringify({ date: currentDate, rate: newRate })
  );
  /*
  const rateData = { date: currentDate, rate: newRate };
  const rateFileName = `rate${timeString}.json`;
  fs.writeFileSync(
    path.join(archiveFolderPath, rateFileName),
    JSON.stringify(rateData)
  );
*/
  res.status(200).json({ message: "Rate updated and archived successfully" });
});

//*
// Serve archived rates
app.get("/get-archived-rates", (req, res) => {
  // Read archived rates from files in the archive folder
  const archivedRates = [];
  fs.readdirSync(archivePath).forEach((file) => {
    const rate = JSON.parse(
      fs.readFileSync(path.join(archivePath, file), "utf8")
    );
    archivedRates.push(rate);
  });
  res.json(archivedRates);
});

// Store the authentication status

/*
// Serve main page if authenticated, else redirect to login
app.get("/", (req, res) => {
  if (isAuthenticated) {
    res.sendFile(__dirname + "/admin.html");
  } else {
    res.redirect("/login");
  }
});


// Handle login form submission
app.post("/login", (req, res) => {
  const providedPassword = req.body.password;
  // Compare with your actual password
  if (providedPassword === "1234") {
    isAuthenticated = true;
    res.redirect("/admin");
  } else {
    res.redirect("/login");
  }
});
*/

// send PDF ////////////////
app.post("/send-pdf-email", async (req, res) => {
  const { data } = req.body;

  try {
    // Convert amount to DZA
    const amountInUSD = parseFloat(data.amount);
    const amountInDZA = amountInUSD * exchangeRate;

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont("Helvetica");

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 14;
    let pdfContent = "Jamal Pay Transfer Details\n";
    for (const [key, value] of Object.entries(data)) {
      pdfContent += `\n- ${key}: ${value}`;
    }
    pdfContent += `\n- Amount in DZA: ${amountInDZA.toFixed(2)}`;
    pdfContent += `\n- Rate: ${exchangeRate.toFixed(2)}\n`;

    // add current date and time
    const now = new Date();
    const currentDateTime = now.toLocaleDateString();

    pdfContent += `\nThe transfer made on: ${currentDateTime}`;
    pdfContent += `\nThank you for using Jamal Pay! Your transfer has been successfully
    submitted. Transfers are normally completed within 1-3 business
    days. You will receive an email once your transfer
    has been processed.`;
    page.drawText(pdfContent, {
      x: 50,
      y: height - 4 * fontSize,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0.2, 0.106),
    });

    const pdfBytes = await pdfDoc.save();

    // Send PDF via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "g.cosmosweb@gmail.com",
        pass: "etrybmxwskylumbq",
      },
    });

    const mailOptions = {
      from: "g.cosmosweb@gmail.com",
      to: data.email,
      subject: "Form Data PDF test pay 01",
      text: "Attached is the PDF containing the form data.",
      attachments: [
        {
          filename: `Transfer-data-${currentDateTime}.pdf`,
          content: pdfBytes,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Error sending email" });
      } else {
        console.log("Transfer sent:", info.response);
        res.status(200).json({ message: "Email sent successfully" });
      }
    });
  } catch (error) {
    console.error("Error generating Transfer or sending email:", error);
    res
      .status(500)
      .json({ error: "Error generating Transfer or sending email" });
  }
});

// handle login data from login.html
// Define a session token and expiration time (5 minutes)
let sessionToken = null;
let sessionExpiration = null;
const sessionDuration = 1 * 60 * 1000; // 5 minutes in milliseconds

// handle login data from index.html
const bcrypt = require("bcrypt");

// Sample user data (replace with your actual user data)
const users = [
  {
    username: "jamal",
    // Hashed password for "ijpay23200"
    passwordHash:
      "$2a$04$ioDzZPDmegpK2qiqoI8XwOTYK0kpEQW09ieNoYWeA0F1U5T1rf8Vy",
  },
  // Add more user data as needed
];

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  console.log(user);

  if (!user) {
    res.status(401).json({ message: "01 Invalid username or password" });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  console.log(isPasswordValid);

  if (isPasswordValid) {
    sessionToken = generateSessionToken();
    sessionExpiration = Date.now() + sessionDuration;

    // send isLoggedIn to the client
    res.status(200).json({ isLoggedIn: true });
    //res.redirect("/admin.html");
  } else {
    res.status(401).json({ message: " 02 Invalid username or password" });
  }
});

// Function to generate a session token
function generateSessionToken() {
  return Math.random().toString(36).substring(2);
}

// Middleware function to check if the user is authenticated
function requireAuthentication(req, res, next) {
  const now = Date.now();

  if (sessionToken && now < sessionExpiration) {
    // User is authenticated and the session is not expired
    next();
  } else {
    alert("from app.js Error in session expiration");
    // Unauthorized or session expired
    res.redirect("/index.html");
  }
}

// handle the login request
app.post("/login", async (req, res) => {
  await login(req, res);
});

// Protect the admin panel route with authentication
app.get("/admin.html", requireAuthentication, (req, res) => {
  res.sendFile(__dirname + "/admin.html");
});
/*
// Start your Express server
const PORT = process.env.PORT || port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
*/
// Listen on port 5000
app.listen(process.env.PORT || port, () =>
  console.log(`Listening on port ${port}`)
);
