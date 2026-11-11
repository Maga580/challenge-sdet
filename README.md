# challenge-sdet

End-to-end test suite built with **Cypress + TypeScript**:

- **Part 1 – API:** pet lifecycle and negative cases against [Swagger Petstore](https://petstore.swagger.io/) (`/pet`), with Zod contract validation.
- **Part 2 – UI:** registration, login, voting and logout on [Buggy Cars Rating](https://buggy.justtestit.org/).
- **Part 3 – CI:** GitHub Actions running lint, formatting, type checks and both suites on every push, with Mochawesome reports as artifacts.

## Local setup

Requirements: Node.js 22+ and npm. Chrome is used by the test scripts.

```sh
npm ci
cp .env.example .env
```

`.env` holds the environment configuration (no secrets are needed, every test creates its own data):

| Variable         | Used for                                  |
| ---------------- | ----------------------------------------- |
| `BUGGY_BASE_URL` | Buggy Cars web app (`baseUrl`)            |
| `BUGGY_API_URL`  | Buggy Cars API (user setup and API login) |
| `PETSTORE_URL`   | Petstore API                              |

If a variable is missing, the tests fail immediately with a message naming it.

### Commands

```sh
npm test                 # API and UI suites (both always run; fails if either fails)
npm run test:api         # API suite only
npm run test:ui          # UI suite only
npm run cy               # Cypress interactive runner
npm run lint             # ESLint
npm run format           # Prettier (write)
npm run format:check     # Prettier (check only)
npm run typecheck        # TypeScript, no emit
```

Reports: `cypress/reports/api/api.html` and `cypress/reports/ui/ui.html`. Failed tests have their screenshot embedded in the report; videos are kept only for failed UI specs.

> Running from the VS Code integrated terminal? If Cypress fails with `bad option: --smoke-test`, the terminal inherited `ELECTRON_RUN_AS_NODE`. Run `unset ELECTRON_RUN_AS_NODE` first.

## Project structure

```
cypress/
├── e2e/
│   ├── api/                  # Petstore specs (lifecycle, negative cases)
│   └── ui/                   # Buggy Cars specs (registration, login, vote, logout)
├── pages/                    # Page Objects: HomePage, NavBarPage, RegisterPage, ModelPage
└── support/
    ├── e2e.ts                # Support file: reporter hooks + custom commands
    ├── commands.ts           # Custom commands (login, voting flow)
    ├── config.ts             # Reads exposed config and fails fast if missing
    ├── buggyCars/            # Buggy Cars API helpers: user factory, API login (cy.session)
    └── petstoreApi/          # Petstore requests, test data factory, Zod schemas
.github/workflows/ci.yml      # Lint/format/typecheck job + API and UI jobs
```

## Patterns and why

**Page Object Model (UI).** Each page class owns its selectors and the user actions on that page (`login`, `register`, `vote`). Specs keep the business assertions, so a selector change touches one file and the specs read as the scenario.

**Custom commands for multi-step flows.** Flows reused across specs, or that would otherwise put logic inside a test, are Cypress commands, typed in `Cypress.Chainable`:

| Command                               | What it does                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| `cy.loginAsNewUser()`                 | Registers a user through the API, logs in with `cy.session`, opens the home page |
| `cy.openLeastCommentedModel()`        | Opens the model with the fewest comments (see the voting decision below)         |
| `cy.voteOnModel(comment)`             | Votes on the open model, waits for the request, yields the previous vote count   |
| `cy.verifyVoteRegistered(comment, n)` | Checks success message, vote count and the comment in the comments table         |

**Plain API helpers (API suite and test data).** Petstore requests (`petApi.ts`) and data factories are plain functions: they are imported explicitly by the specs that need them, which keeps the API suite independent from UI concerns.

**Contract validation with Zod.** Every Petstore response is parsed with a schema (`petSchemas.ts`) in addition to checking the status code and the relevant fields. The `Pet` type is inferred from the same schema, so payloads and validation stay in sync.

### Selectors

Buggy Cars exposes no `data-testid` attributes. In order of preference the Page Objects use:

1. `id` / `name` attributes (`#comment`, `#username`, `input[name="login"]`).
2. Accessible text of buttons and links (`cy.contains('button', 'Login')`).
3. Route-based links (`a[href^="/model/"]`).

No CSS classes or DOM positions are used, so styling changes do not break the tests.

### Waiting

There are no fixed waits. Cypress waits on intercepted requests (`cy.wait('@submitVote')`) and on retried assertions about visible state.

## Technical decisions and trade-offs

- **Test isolation on shared public environments.** Petstore ids are generated from a timestamp plus a random suffix, and the lifecycle test deletes its pet in `afterEach` even if a step fails. Every Buggy Cars test registers its own user, so specs run alone and in any order.
- **One lifecycle test.** Create → read → update → delete → 404 is one sequential scenario, because each step depends on the previous one and it keeps traffic to the shared service low. The trade-off is that a failure in an early step hides the later ones.
- **API login for non-login specs.** Vote and logout log in through the API and `cy.session`, since the login form is not what they test. Login itself is tested through the UI in `login.cy.ts`.
- **Voting on the least-commented model.** The most popular model (Diablo) accepts the vote but silently drops the comment (BUG-01 in [BUGS.md](BUGS.md)). Voting there would make the test fail for a reason unrelated to the flow under test, so `cy.openLeastCommentedModel()` picks a model from the last page of the ranking through the API. The vote count is asserted as "at least +1" because other users can vote concurrently; the unique comment proves the vote is ours.
- **Empty login fields.** The form uses native `required` validation, so the app shows no message of its own. The tests assert the field is `:invalid`, that the browser's `validationMessage` is present, and that no login request was sent. The message text is not compared because it depends on browser and locale.
- **Negative API tests pin the observed behavior.** Where Petstore differs from its Swagger documentation, the test asserts what the API actually returns and the title states what Swagger documents (e.g. `returns 500 for a non-numeric id (Swagger: 405)`). The test then works as a regression check and the divergence is listed under _API findings_. The alternative, asserting the documented code, would keep the pipeline permanently red.
- **One retry in CI.** `retries.runMode: 1` absorbs transient errors from the public services. It is limited to one retry and disabled in interactive mode, so a consistently failing test still fails.
- **Configuration outside the code.** URLs live in `.env` / CI variables and reach the specs through `Cypress.expose()`. There are no hardcoded fallbacks.

## Test strategy (Buggy Cars)

What I would test next, and at which level. The guiding rule: push each check to the lowest level that can catch the problem, and keep the UI suite for the flows a user must be able to complete.

**API – most of the new tests.** Business rules that today are only visible through the UI are faster and more stable to check against the API:

- Voting rules: a user cannot vote twice on the same model (`400 "Cannot vote more than once"`), cannot vote without a token, and the comment and its author are stored ([BUG-01](BUGS.md), [BUG-02](BUGS.md)).
- Profile validation: required fields, age range and type ([BUG-03](BUGS.md)), password change with a wrong current password.
- Registration: duplicate username, password policy.
- Pagination limits on `/models` ([BUG-05](BUGS.md)).

**Contract.** Zod schemas for `/models`, `/models/{id}`, `/users/current` and `/users/profile`, as already done for Petstore. A change in response shape then fails a fast API test instead of breaking the UI in a less obvious way.

**UI – few tests, critical flows only.** Besides the current flows: profile editing, password change, and navigation (header logo, ranking, pager), which is where [BUG-04](BUGS.md) lives. UI tests would not repeat validations already covered by the API; they check that the screen shows the result and the right message.

**Performance.** A light load test (k6) on `GET /models`, `GET /models/{id}` and `POST /models/{id}/vote`. The most popular model already returns about 335 KB with ~3,700 comments in one response, because comments are not paginated; response time and payload size of that endpoint are the first things I would track.

**Left out of automation**

- Visual and layout review, and exploratory testing: exploration is what found BUG-04, BUG-05 and BUG-06, and it does not translate well into scripted checks.
- Exact native validation texts, which depend on browser and locale.
- In-depth security testing (injection, token handling), which belongs to a dedicated security review rather than this suite.

## CI

`.github/workflows/ci.yml` runs on every push and pull request:

- **lint job:** `npm run lint`, `npm run format:check`, `npm run typecheck`.
- **cypress job:** a matrix runs the API and UI suites in parallel. Each uploads its Mochawesome report, screenshots and videos as an artifact (`cypress-api-results`, `cypress-ui-results`), even when tests fail.

## API findings (Petstore vs. Swagger)

| Case                                           | Documented by Swagger               | Observed                           |
| ---------------------------------------------- | ----------------------------------- | ---------------------------------- |
| GET `/pet/{petId}` with a malformed id         | `400` Invalid ID supplied           | `404` with `NumberFormatException` |
| POST `/pet` with a non-numeric id              | `405` Invalid input                 | `500` "something bad happened"     |
| DELETE `/pet/{petId}` for a non-existent pet   | `404`, response body not documented | `404` with an empty body           |
| GET `/pet/findByStatus` with an invalid status | `400` Invalid status value          | `200` with an empty list           |

## Future improvements

- Run against a controlled environment (a local Petstore container, seeded Buggy Cars data) to remove public-service variability.
- Split the lifecycle into granular tests with their own API setup, once the environment allows it.
- Add API-level tests for Buggy Cars (voting rules, profile validation) and contract tests for its endpoints.
- Cross-browser runs in CI and historical reporting (Allure).
- Accessibility checks (axe) on the main pages.
