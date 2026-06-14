const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  const project = "test-project";
  let firstIssueId;
  let secondIssueId;

  test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .post(`/api/issues/${project}`)
      .send({
        issue_title: "Full issue title",
        issue_text: "Full issue text",
        created_by: "Tester One",
        assigned_to: "Roni",
        status_text: "In progress",
      })
      .end(function (err, res) {
        if (err) return done(err);

        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, "Full issue title");
        assert.equal(res.body.issue_text, "Full issue text");
        assert.equal(res.body.created_by, "Tester One");
        assert.equal(res.body.assigned_to, "Roni");
        assert.equal(res.body.status_text, "In progress");
        assert.equal(res.body.open, true);
        assert.property(res.body, "_id");
        assert.property(res.body, "created_on");
        assert.property(res.body, "updated_on");

        firstIssueId = res.body._id;
        done();
      });
  });

  test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .post(`/api/issues/${project}`)
      .send({
        issue_title: "Required only title",
        issue_text: "Required only text",
        created_by: "Tester Two",
      })
      .end(function (err, res) {
        if (err) return done(err);

        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, "Required only title");
        assert.equal(res.body.issue_text, "Required only text");
        assert.equal(res.body.created_by, "Tester Two");
        assert.equal(res.body.assigned_to, "");
        assert.equal(res.body.status_text, "");
        assert.equal(res.body.open, true);
        assert.property(res.body, "_id");

        secondIssueId = res.body._id;
        done();
      });
  });

  test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .post(`/api/issues/${project}`)
      .send({
        issue_title: "Missing fields",
        created_by: "Tester Three",
      })
      .end(function (err, res) {
        if (err) return done(err);

        assert.deepEqual(res.body, { error: "required field(s) missing" });
        done();
      });
  });

  test("View issues on a project: GET request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .get(`/api/issues/${project}`)
      .end(function (err, res) {
        if (err) return done(err);

        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 2);

        const foundIssue = res.body.find((issue) => issue._id === firstIssueId);
        assert.exists(foundIssue);

        done();
      });
  });

  test("View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .get(`/api/issues/${project}`)
      .query({ created_by: "Tester Two" })
      .end(function (err, res) {
        if (err) return done(err);

        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);
        assert.equal(res.body[0].created_by, "Tester Two");

        done();
      });
  });

  test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .get(`/api/issues/${project}`)
      .query({
        created_by: "Tester One",
        assigned_to: "Roni",
      })
      .end(function (err, res) {
        if (err) return done(err);

        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);
        assert.equal(res.body[0].created_by, "Tester One");
        assert.equal(res.body[0].assigned_to, "Roni");

        done();
      });
  });

  test("Update one field on an issue: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .put(`/api/issues/${project}`)
      .send({
        _id: firstIssueId,
        issue_text: "Updated issue text",
      })
      .end(function (err, res) {
        if (err) return done(err);

        assert.deepEqual(res.body, {
          result: "successfully updated",
          _id: firstIssueId,
        });

        done();
      });
  });

  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .put(`/api/issues/${project}`)
      .send({
        _id: firstIssueId,
        status_text: "Closed",
        open: false,
      })
      .end(function (err, res) {
        if (err) return done(err);

        assert.deepEqual(res.body, {
          result: "successfully updated",
          _id: firstIssueId,
        });

        done();
      });
  });

  test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .put(`/api/issues/${project}`)
      .send({
        issue_text: "No id update",
      })
      .end(function (err, res) {
        if (err) return done(err);

        assert.deepEqual(res.body, { error: "missing _id" });
        done();
      });
  });

  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .put(`/api/issues/${project}`)
      .send({
        _id: secondIssueId,
      })
      .end(function (err, res) {
        if (err) return done(err);

        assert.deepEqual(res.body, {
          error: "no update field(s) sent",
          _id: secondIssueId,
        });

        done();
      });
  });

  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .put(`/api/issues/${project}`)
      .send({
        _id: "invalidid",
        issue_title: "Invalid update",
      })
      .end(function (err, res) {
        if (err) return done(err);

        assert.deepEqual(res.body, {
          error: "could not update",
          _id: "invalidid",
        });

        done();
      });
  });

  test("Delete an issue: DELETE request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .delete(`/api/issues/${project}`)
      .send({
        _id: secondIssueId,
      })
      .end(function (err, res) {
        if (err) return done(err);

        assert.deepEqual(res.body, {
          result: "successfully deleted",
          _id: secondIssueId,
        });

        done();
      });
  });

  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .delete(`/api/issues/${project}`)
      .send({
        _id: "invalidid",
      })
      .end(function (err, res) {
        if (err) return done(err);

        assert.deepEqual(res.body, {
          error: "could not delete",
          _id: "invalidid",
        });

        done();
      });
  });

  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .delete(`/api/issues/${project}`)
      .send({})
      .end(function (err, res) {
        if (err) return done(err);

        assert.deepEqual(res.body, { error: "missing _id" });
        done();
      });
  });
});