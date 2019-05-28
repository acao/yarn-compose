import { expect } from "chai";
import * as fs from "fs";

import { cloneProject, checkoutBranch } from "../lib";
import rimraf = require("rimraf");

describe("cloneProject", () => {
  it("should clone a project", () => {
    cloneProject("https://github.com/acao/yarn-compose", "/tmp/example");
    expect(fs.existsSync("/tmp/example/.git"));
    rimraf.sync("/tmp/example/");
  });
});

describe("checkoutBranch", () => {
  it("should checkout a branch in an existing repo", () => {
    cloneProject("https://github.com/acao/yarn-compose", "/tmp/example");
    checkoutBranch("/tmp/example", "d7674130d80c9396c8195101c69596a217c7cad9");
    expect(!fs.existsSync("/tmp/example/src/commands"));
    rimraf.sync("/tmp/example/");
  });
  it("should fail when a repository doesnt exist", () => {
    expect(() => checkoutBranch("/tmp/example", "d7674130d80c9396c8195101c69596a217c7cad9")).to.throw(
      "Cannot checkout d7674130d80c9396c8195101c69596a217c7cad9, /tmp/example is not a git repository"
    );
  });
});
