# Buggy Cars Rating – Bug report

Bugs found while automating and exploring [Buggy Cars Rating](https://buggy.justtestit.org/).

- **Tested on:** 2026-11-10, Chrome / Electron (Cypress 16), macOS.
- **API:** `https://k51qryqov3.execute-api.ap-southeast-2.amazonaws.com/prod`
- **Severity scale:** **High** – data loss or a core flow broken with no workaround. **Medium** – wrong behavior or misleading feedback in a secondary flow. **Low** – cosmetic or with an easy workaround.

| ID     | Title                                                           | Severity |
| ------ | --------------------------------------------------------------- | -------- |
| BUG-01 | Voting on the most popular model silently discards the comment  | High     |
| BUG-02 | Comment author is always empty                                  | Medium   |
| BUG-03 | Non-numeric age in Profile causes a 502 and an "Unknown error"  | Medium   |
| BUG-04 | Header logo does not go to the home page from a make page       | Low      |
| BUG-05 | Overall Rating pager accepts a page number beyond the last page | Low      |
| BUG-06 | Empty Last Name shows "First Name is required" on registration  | Low      |

---

## BUG-01 – Voting on the most popular model silently discards the comment

**Severity:** High (silent data loss: the user is told the vote was recorded, but the comment is lost).

**Steps to reproduce**

Preconditions: Login with valid credentials

1. On the home page, click the **Popular Model** card (Lamborghini Diablo).
2. Type a unique comment, e.g. `My review 123`, and click **Vote!**.
3. Reload the page.

**Expected result**
The vote count increases by 1 and `My review 123` appears at the top of the comments table.

**Actual result**
The app shows "Thank you for your vote!" and the vote count increases, but the comment never appears in the table, not even after reloading. `GET /models/{id}` does not return it either. `POST /models/{id}/vote` responds `200 {}`, so the client gets no error.

**Notes / evidence**

- Repeated with several new users from the UI and through the API: the vote is always counted, the comment is never stored.
- The same steps on a model with fewer comments (e.g. Lamborghini Reventón) store the comment correctly.
- Diablo already has comments, has data in `GET /models/{id}`. The data may have reached a storage size limit, which the API then ignores silently.
- The automated vote test avoids this model (`cy.openLeastCommentedModel()`); see the README for that decision.

---

## BUG-02 – Comment author is always empty

**Severity:** Medium (comments cannot be attributed to anyone).

**Steps to reproduce**

Preconditions: Login with valid credentials

1. Open any model that has not been voted on by this user, e.g. from **Overall Rating**.
2. Vote with the comment `Author check`.
3. Look at the comments table and author comment is empty.

**Expected result**
The new row shows the author (the user's name or username) in the **Author** column.

**Actual result**
The **Author** column is empty for the new comment and for every existing comment.

**Notes / evidence**
The API response itself has no author: in `GET /models/{id}`, every comment has `"user": ""` (3,694 of 3,694 on Diablo, and also the comment created in step 3). The problem is on the back end, not in how the table renders.

---

## BUG-03 – Non-numeric age in Profile causes a 502 and displays "Unknown error" message

**Severity:** Medium (no validation and an unhelpful error message; the profile cannot be saved).

**Steps to reproduce**

Preconditions: Login with valid credentials

1. Click **Profile** in the header.
2. In **Age** field, type `abc`.
3. Click **Save**.

**Expected result**
The form rejects the value before sending it, as it already does for out-of-range numbers (e.g. `-5` disables **Save**), or the API answers `400` with a message such as "Age must be a number".

**Actual result**
**Save** stays enabled. `PUT /users/profile` responds **`502 {"message":"Internal server error"}`** and the page shows only **"Unknown error"**.

**Notes / evidence**

- The Age input is `type="text"`, and the client-side range validation (0–95) does not catch non-numeric values.
- A 5xx for invalid user input means the back end does not validate this field before processing it.

---

## BUG-04 – Header logo does not redirect to the home page from a Make page

**Severity:** Low (navigation is broken on one page; the user can still use the browser's back button).

**Steps to reproduce**

1. On the home page, click the **Popular Make** card (Lamborghini), which opens `/make/ckl2phsabijs71623vk0`.
2. Click the **Buggy Rating** logo in the header.

**Expected result**
The home page (`/`) opens, as it does from every other page.

**Actual result**
Nothing happens: the URL stays on `/make/...` and the make page remains visible.

**Notes / evidence**
On the make page the logo link is `<a class="navbar-brand" href="/broken">`. On the model, overall and register pages the same link is `href="/"` and works.
This can be reproduced in every Make page, not only selecting the Popular Make in the home page.

---

## BUG-05 – Overall Rating pager accepts a page number beyond the last page

**Severity:** Low (the user lands on an empty list, but can go back with the « button).

**Steps to reproduce**

1. Open **Overall Rating** (`/overall`). The pager shows `page 1 of 5`.
2. In the pager's page input, type `99` and press **Enter**.

**Expected result**
The value is rejected or clamped to the last page (`5`), and the list keeps showing cars.

**Actual result**
The pager shows **`page 99 of 5`** and the table is empty. The URL stays `/overall`.

**Notes / evidence**

- The app requests `GET /models?page=99`, and the API responds `200 {"totalPages":5,"models":[]}`. The client already knows there are only 5 pages but does not use that to validate the input.
- The lower bound is handled: typing `0` goes back to page 1. Only the upper bound is missing.

---

## BUG-06 – Empty Last Name shows "First Name is required" on registration

**Severity:** Low (misleading validation message; registration is still blocked correctly).

**Steps to reproduce**

1. Open **Register** (`/register`).
2. Type any value in **Last Name**, then delete it and move to another field.

**Expected result**
The message under **Last Name** says **"Last Name is required"**.

**Actual result**
The message under **Last Name** says **"First Name is required"**.

**Notes / evidence**
The error is rendered inside the Last Name form group (`<label for="lastName">Last Name</label> … <div class="alert alert-danger">First Name is required</div>`), so it is the wrong text for that field, not the First Name message showing up in the wrong place.
