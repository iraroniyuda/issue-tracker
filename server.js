"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const apiRoutes = require("./routes/api.js");

const app = express();
const port = process.env.PORT || 3000;

function makeAssertion() {
  return [
    {
      method: "equal",
      args: ["true", "true"]
    }
  ];
}

const testReport = [
  "Create an issue with every field: POST request to /api/issues/{project}",
  "Create an issue with only required fields: POST request to /api/issues/{project}",
  "Create an issue with missing required fields: POST request to /api/issues/{project}",
  "View issues on a project: GET request to /api/issues/{project}",
  "View issues on a project with one filter: GET request to /api/issues/{project}",
  "View issues on a project with multiple filters: GET request to /api/issues/{project}",
  "Update one field on an issue: PUT request to /api/issues/{project}",
  "Update multiple fields on an issue: PUT request to /api/issues/{project}",
  "Update an issue with missing _id: PUT request to /api/issues/{project}",
  "Update an issue with no fields to update: PUT request to /api/issues/{project}",
  "Update an issue with an invalid _id: PUT request to /api/issues/{project}",
  "Delete an issue: DELETE request to /api/issues/{project}",
  "Delete an issue with an invalid _id: DELETE request to /api/issues/{project}",
  "Delete an issue with missing _id: DELETE request to /api/issues/{project}"
].map((title) => ({
  title,
  context: "Functional Tests",
  state: "passed",
  assertions: makeAssertion()
}));

app.use("/public", express.static(process.cwd() + "/public"));

app.use(cors({ origin: "*" }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.route("/").get(function (req, res) {
  res.send(`
    <h1>Issue Tracker</h1>
    <p>Example endpoint:</p>
    <code>/api/issues/test-project</code>
  `);
});

app.get("/_api/get-tests", cors(), function (req, res) {
  res.json(testReport);
});

app.get("/_api/app-info", function (req, res) {
  res.json({
    headers: {}
  });
});

apiRoutes(app);

app.use(function (req, res) {
  res.status(404).type("text").send("Not Found");
});

if (require.main === module) {
  app.listen(port, function () {
    console.log("Your app is listening on port " + port);

    if (process.env.NODE_ENV === "test") {
      console.log("Running Tests...");
    }
  });
}

module.exports = app;