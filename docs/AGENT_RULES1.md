# AGENT_EXECUTION_RULES

These are mandatory execution rules for any AI/Coder Agent generating or modifying code in this repository.

- Repository awareness & non-destructive behavior
- Locator strategy & live exploration
- Architecture & code organization
- Quality gates & reliability
- Configuration & test data
- Network, permissions & resilience
- A11y & UX checks
- Reporting & CI
- Documentation & discoverability
- Security & compliance
- Change policy
- Output requirements

Repository awareness & non-destructive behavior

Detect project context: Inspect the workspace for package.json, playwright.config.*, src/tests, tests, src/page-objects, eslint/prettier/tsconfig, CI files, and any CONTRIBUTING/README/guardrails docs.

Follow existing conventions: Match language (TS/JS), test runner, file layout, naming, lint rules, and reporters already present.

Enhance, don’t duplicate: If an equivalent utility/fixture/config already exists, reuse it. Add capabilities incrementally behind feature flags or new helpers.

Idempotent changes: Only create files that are missing. If a file exists, append clearly delimited sections or extend via new exports.

Locator strategy & live exploration
5. Prefer live DOM exploration (Playwright inspector/MCP) to discover stable, semantic locators: getByRole, getByLabel, getByPlaceholder, getByAltText, getByTestId.
6. Avoid brittle CSS/XPath; use them only as a last resort with an explanation and centralize them in a locators.ts map or Page Object.
7. Propose data-testid hooks when the app lacks stable attributes; never hard-code volatile text unless explicitly required.

Architecture & code organization
8. Use (or extend) Page Object Model with small, focused methods; keep assertions in tests.
9. Keep structure consistent: src/page-objects, src/tests, src/fixtures, src/utils, src/data. If different paths exist, mirror that scheme.
10. Implement custom fixtures only if missing (auth, geolocation, consent banner, network controls).
11. Group tests with tags (e.g., @smoke, @regression, @content, @a11y, @links) to enable selective runs.

Quality gates & reliability
12. Enforce existing ESLint/Prettier/TypeScript configs; if absent, add standard minimal configs.
13. Use Playwright auto-waiting, expect.poll, explicit timeouts for dynamic UI, and test.step for readable reports.
14. Make video/audio or popup-heavy specs serial; keep others parallel. Stabilize flakiness with retries limited to CI if policy permits.

Configuration & test data
15. Keep environment in config + .env (baseURL, creds, geocoords, feature flags). No secrets in code.
16. Use data-driven tests where appropriate; store test data in versioned JSON under src/data/.
17. Implement seeded randomness (e.g., SEED env) for reproducible “random link/image” sampling.

Network, permissions & resilience
18. Control permissions (e.g., geolocation, clipboard, notifications) per test via fixtures.
19. Add utilities for network throttling (Slow 3G) and fault injection (e.g., stub YouTube/unreliable externals) only when assertions require them.
20. External links/new tabs: capture page.waitForEvent('popup') and assert destination hostnames.
21. Images: verify naturalWidth > 0 and/or 2xx status via request interception when feasible.

A11y & UX checks (lightweight)
22. Add a light a11y smoke: primary landmarks present, key interactive elements have roles/names, focusable items reachable. Keep it fast.

Reporting & CI
23. Honor existing reporters; otherwise enable HTML and Allure. Attach trace/video/screenshot on failure.
24. Ensure tests are CI-ready: shardable, retry policy defined, artifacts stored to standard CI paths.

Documentation & discoverability
25. Update or create a short README section: how to run (local/CI), tags, env vars, reports, and troubleshooting (e.g., handling consent banners).
26. Inline code should include JSDoc/TSDoc for fixtures and page objects; meaningful test titles with clear preconditions.

Security & compliance
27. Never commit secrets/tokens. Respect org guardrails and skip generating code that violates them.
28. Log PII only when masked and only if required for assertions.

Change policy
29. When in doubt, ask for or infer project guardrails from existing docs; if missing, use conservative defaults.
30. Produce a diff summary of files added/modified and why (at the end of generation).

Output requirements
31. Generate runnable code with zero lint/types errors.
32. If something cannot be implemented due to missing app hooks or policies, stub the helper, mark with TODO: and document the expected contract.
