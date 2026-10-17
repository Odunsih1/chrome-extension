function safeText(value) {
  const text = String(value ?? "");
  const formulaSafe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return formulaSafe.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[character]));
}

function list(value) {
  return Array.isArray(value) ? value.join("\n") : "";
}

export function reportRows(report) {
  return report.results.flatMap(({ target, body }) => {
    const findings = Array.isArray(body.findings) && body.findings.length
      ? body.findings
      : [{ message: list(body.failures) || (body.status === "passed" ? "No failures detected." : "No diagnostic was returned.") }];
    return findings.map((finding) => ({
      component: target.label || target.component,
      selector: target.selector,
      status: finding.status || body.status,
      level: finding.level || "",
      rule: finding.rule || finding.assertion || "",
      scenario: finding.scenario || finding.phase || "",
      message: finding.message || list(body.failures),
      expected: finding.expected === undefined ? "" : JSON.stringify(finding.expected),
      actual: finding.actual === undefined ? "" : JSON.stringify(finding.actual)
    }));
  });
}

export function buildExcelReport(report) {
  const rows = reportRows(report);
  const passed = report.results.filter(({ body }) => body.status === "passed").length;
  const failed = report.results.length - passed;
  const headers = ["Component", "Selector", "Status", "Level", "Rule", "Scenario", "Why it failed", "Expected", "Actual"];
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:Calibri,Arial,sans-serif;color:#172033}table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #cbd5e1;padding:7px;vertical-align:top;white-space:pre-wrap}
    th{background:#1d4ed8;color:#fff;font-weight:700}.summary th{background:#e8eefc;color:#172033}
    .passed{background:#dcfce7;color:#166534}.failed,.fail{background:#fee2e2;color:#991b1b}.warn{background:#fef3c7;color:#92400e}
  </style></head><body>
    <h1>Aria-Ease accessibility audit</h1>
    <table class="summary">
      <tr><th>Page URL</th><td colspan="3">${safeText(report.url)}</td></tr>
      <tr><th>Generated</th><td>${safeText(report.generatedAt)}</td><th>Components</th><td>${report.results.length}</td></tr>
      <tr><th>Passed</th><td class="passed">${passed}</td><th>Failed</th><td class="failed">${failed}</td></tr>
    </table>
    <h2>Detailed findings</h2>
    <table><thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>
      ${rows.map((row) => `<tr>${Object.values(row).map((value, index) => `<td${index === 2 ? ` class="${safeText(value)}"` : ""}>${safeText(value)}</td>`).join("")}</tr>`).join("")}
    </tbody></table>
  </body></html>`;
}

export function reportFilename(report) {
  const date = new Date(report.generatedAt).toISOString().replace(/[:.]/g, "-");
  return `aria-ease-audit-${date}.xls`;
}
