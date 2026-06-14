"use strict";

const crypto = require("crypto");

const projects = {};

function createId() {
  return crypto.randomBytes(12).toString("hex");
}

function normalizeOpenValue(value) {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return value;
}

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      const project = req.params.project;
      const issues = projects[project] || [];
      const filters = req.query || {};

      const filteredIssues = issues.filter((issue) => {
        return Object.keys(filters).every((key) => {
          const filterValue = filters[key];

          if (key === "open") {
            return issue.open === normalizeOpenValue(filterValue);
          }

          return String(issue[key]) === String(filterValue);
        });
      });

      res.json(filteredIssues);
    })

    .post(function (req, res) {
      const project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: "required field(s) missing" });
      }

      const now = new Date();

      const newIssue = {
        assigned_to: assigned_to || "",
        status_text: status_text || "",
        open: true,
        _id: createId(),
        issue_title,
        issue_text,
        created_by,
        created_on: now,
        updated_on: now,
      };

      if (!projects[project]) {
        projects[project] = [];
      }

      projects[project].push(newIssue);

      res.json(newIssue);
    })

    .put(function (req, res) {
      const project = req.params.project;
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: "missing _id" });
      }

      const allowedFields = [
        "issue_title",
        "issue_text",
        "created_by",
        "assigned_to",
        "status_text",
        "open",
      ];

      const updates = {};

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined && req.body[field] !== "") {
          updates[field] =
            field === "open" ? normalizeOpenValue(req.body[field]) : req.body[field];
        }
      });

      if (Object.keys(updates).length === 0) {
        return res.json({ error: "no update field(s) sent", _id });
      }

      const issues = projects[project] || [];
      const issue = issues.find((item) => item._id === _id);

      if (!issue) {
        return res.json({ error: "could not update", _id });
      }

      Object.assign(issue, updates);
      issue.updated_on = new Date();

      res.json({ result: "successfully updated", _id });
    })

    .delete(function (req, res) {
      const project = req.params.project;
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: "missing _id" });
      }

      const issues = projects[project] || [];
      const index = issues.findIndex((item) => item._id === _id);

      if (index === -1) {
        return res.json({ error: "could not delete", _id });
      }

      issues.splice(index, 1);

      res.json({ result: "successfully deleted", _id });
    });
};