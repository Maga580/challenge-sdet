# challenge-sdet

API testing for Swagger Petstore and UI automation for Buggy Cars Rating, built with Cypress.

## Local Setup

Requirements: Node.js 22 or later and npm. Install dependencies and configure the public service URLs:

```sh
npm ci
cp .env.example .env
```

Available commands:

```sh
npm test                 # API + UI tests
npm run test:api         # API tests
npm run test:ui          # UI tests
npm run cy               # Open Cypress
npm run lint             # ESLint
npm run format           # Prettier
npm run format:check     # Check formatting
```

Each suite combines all of its specs into one HTML report: `cypress/reports/api/api.html` and `cypress/reports/ui/ui.html`. Cypress saves failure screenshots in `cypress/screenshots/` and UI videos in `cypress/videos/`.

## Structure and Patterns

- `cypress/e2e/api/` and `cypress/e2e/ui/`: specs organized by suite type.
- `cypress/support/petsoreApi/`: Petstore API operations, test data, and Zod schemas.
- `cypress/support/buggyCarsApi/`: API-based registration and authentication for UI test setup.
- `cypress/pages/`: Page Objects for Buggy Cars navigation, registration, login, and voting.
- `.github/workflows/ci.yml`: CI validation and automated execution of both suites.

The UI tests use the Page Object Model (POM) to centralize selectors and repeated actions while keeping business assertions in the specs.
API support functions organize requests, and Zod validates responses.
The suites remain independent so each system can be run and diagnosed separately.

## Decisions and Trade-offs

The pet lifecycle is tested as one sequential scenario because each step depends on the previous one, and to avoid multiplying requests against a shared public service. Negative cases are independent tests. With more time, I would add granular tests for each operation with their own setup and cleanup.
Buggy cars tests that require authentication create unique users and obtain tokens through the API. This reduces shared-state dependencies and speeds up setup, but does not replace testing registration through the UI. The services under test are public and may have variable availability or behavior.

## CI and Artifacts

GitHub Actions runs ESLint and executes the API and UI suites in separate jobs on every push and pull request. Each job uploads its Mochawesome report, failure screenshots, and available videos as an artifact, even if tests fail. No credentials are stored in the repository; the workflow uses the public endpoints listed in the example environment file.

## Future Improvements

With more time, I would use isolated test data or a controlled environment to avoid public-service variability, improve cleanup after network failures, and add historical reporting with Allure. I would also expand accessibility checks and UI state coverage.

## API Negative Test Findings

Tests against Swagger Petstore found differences between the OpenAPI contract and actual responses:

| Case | Expected by OpenAPI | Observed |
| --- | --- | --- |
| GET `/pet/{petId}` with a malformed ID | `400` (invalid ID) | `404` |
| POST `/pet` with a non-numeric ID | `405` (invalid input) | `500` |
| DELETE `/pet/{petId}` for a non-existent pet | Contract documents `400`/`404` but does not define the response body schema | `404` with a text body instead of an `ApiResponse` object |
| GET `/pet/findByStatus` with an invalid status | `400` | `200` with an empty list |

## Buggy Cars Rating UI Automation

The UI flows use the Page Object Model: `HomePage` handles navigation and opening models, `RegisterPage` handles registration, `NavBarPage` handles login/logout, and `ModelPage` handles voting. `createBuggyUser` generates a new username and password for each test, so flows do not depend on shared accounts and can run in any order.

Selectors use the fields' existing `name` and `id` attributes and the accessible text of buttons; the site does not expose `data-testid` attributes. No fixed waits are used: Cypress synchronizes through assertions on visible states and content.

The application URL, Buggy Cars API URL, and Petstore URL are configured through `BUGGY_BASE_URL`, `BUGGY_API_URL`, and `PETSTORE_URL`. Locally, copy `.env.example` to `.env`; in CI, the workflow sets these variables. Each test generates a new username and password, so no preconfigured credentials or manually created users are required. Run the UI suite with:

```sh
npm run test:ui
```

The logout and voting tests create accounts with `createBuggyUserViaApi` and authenticate with `loginViaApi`. It obtains a fresh `access_token` from `POST /oauth/token`, verifies the Bearer token through `/users/current`, and stores the token in `localStorage` before opening the application. If `BUGGY_API_URL` is missing, the helper throws an explicit error. UI registration is tested separately.

The site displays `Invalid username/password` for incorrect credentials. When the form is submitted empty, the `required` fields block submission through native browser validation, and the app does not show its own text message. The test checks the invalid field state and verifies that no session is started.
