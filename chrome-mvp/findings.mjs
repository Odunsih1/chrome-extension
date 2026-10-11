function valueKey(value) {
  if (value === undefined) return "undefined";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[character]));
}

export function findingKey(finding) {
  const identity = finding.id || `${finding.phase || "execution"}:${finding.rule || "finding"}`;
  return [
    identity,
    finding.status || "",
    finding.target || "",
    valueKey(finding.expected)
  ].join("|");
}

export function groupFindings(findings) {
  const groups = new Map();
  for (const finding of Array.isArray(findings) ? findings : []) {
    const key = findingKey(finding);
    const group = groups.get(key) || { ...finding, occurrences: [] };
    group.occurrences.push(finding);
    groups.set(key, group);
  }
  return [...groups.values()];
}

export function summarizeResult(body) {
  const findings = Array.isArray(body?.findings) ? body.findings : [];
  return {
    passed: Array.isArray(body?.passes) ? body.passes.length : 0,
    failed: Array.isArray(body?.failures) ? body.failures.length : 0,
    warnings: Array.isArray(body?.warnings) ? body.warnings.length : 0,
    skipped: Array.isArray(body?.skipped) ? body.skipped.length : 0,
    findingGroups: groupFindings(findings).length,
    findingOccurrences: findings.length
  };
}

export function renderFindingsHtml(body) {
  return groupFindings(body?.findings).map((finding) => {
    const scenarios = [...new Set(finding.occurrences.map((item) => item.scenario).filter(Boolean))];
    const title = finding.rule || finding.assertion || finding.target || "Contract finding";
    const details = finding.occurrences.map((item) => `
      <li>
        <strong>${escapeHtml(item.scenario || item.phase || "Observation")}</strong>
        ${item.target ? `<div>Target: ${escapeHtml(item.target)}</div>` : ""}
        ${item.expected !== undefined ? `<div>Expected: ${escapeHtml(JSON.stringify(item.expected))}</div>` : ""}
        ${item.actual !== undefined ? `<div>Actual: ${escapeHtml(JSON.stringify(item.actual))}</div>` : ""}
        ${item.message ? `<div>${escapeHtml(item.message)}</div>` : ""}
      </li>
    `).join("");
    return `<article class="finding severity-${escapeHtml(finding.status)}">
      <p class="finding-title">${escapeHtml(title)}</p>
      <div class="finding-meta">${escapeHtml(finding.status)} · ${escapeHtml(finding.level)} · ${finding.occurrences.length} occurrence(s)</div>
      ${finding.target ? `<div>Target: ${escapeHtml(finding.target)}</div>` : ""}
      ${finding.assertion ? `<div>Assertion: ${escapeHtml(finding.assertion)}</div>` : ""}
      ${finding.expected !== undefined ? `<div>Expected: ${escapeHtml(JSON.stringify(finding.expected))}</div>` : ""}
      ${finding.actual !== undefined ? `<div>Actual: ${escapeHtml(JSON.stringify(finding.actual))}</div>` : ""}
      ${scenarios.length ? `<div>Scenarios: ${escapeHtml(scenarios.join(", "))}</div>` : ""}
      <details><summary>Scenario details (${finding.occurrences.length})</summary><ul>${details}</ul></details>
    </article>`;
  }).join("");
}
