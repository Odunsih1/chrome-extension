import assert from "node:assert/strict";
import { test } from "node:test";
import { buildExcelReport, reportFilename, reportRows } from "../chrome-mvp/excel-report.mjs";

const report = {
  url: "https://example.test/menu",
  generatedAt: "2026-10-17T12:34:56.000Z",
  results: [{
    target: { component: "menu", label: "Menu", selector: "#mega-menu-trigger" },
    body: {
      status: "failed",
      failures: ["Execution error: Component not found on page"],
      findings: [{ status: "fail", level: "required", rule: "contract-runner", scenario: "Contract runner execution", message: "Execution error: Component not found on page" }]
    }
  }]
};

test("normalizes actionable spreadsheet rows", () => {
  assert.deepEqual(reportRows(report)[0], {
    component: "Menu",
    selector: "#mega-menu-trigger",
    status: "fail",
    level: "required",
    rule: "contract-runner",
    scenario: "Contract runner execution",
    message: "Execution error: Component not found on page",
    expected: "",
    actual: ""
  });
});

test("builds a formatted Excel-compatible report and safe filename", () => {
  const workbook = buildExcelReport(report);
  assert.match(workbook, /Aria-Ease accessibility audit/);
  assert.match(workbook, /Why it failed/);
  assert.match(workbook, /Component not found on page/);
  assert.match(workbook, /class="failed"/);
  assert.equal(reportFilename(report), "aria-ease-audit-2026-10-17T12-34-56-000Z.xls");
});
