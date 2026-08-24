# Tarifé Attär Revenue Bridge Marketing OS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved 30-day Revenue Bridge command center and create the complete execution structure in the existing Tarifé Attär ClickUp Marketing folder.

**Architecture:** Shopify remains the commerce source of truth. An inline command-center visualization presents the reconciled inventory, revenue targets, weekly plan, channel readiness, and paid-spend gate. ClickUp stores campaign execution in the existing Campaigns, Lifecycle Automations, and Operational Notifications lists without duplicating software-build tasks.

**Tech Stack:** Shopify Admin GraphQL API, ClickUp connector, inline HTML visualization, Markdown specifications, Git.

**Spec:** `docs/specs/2026-08-24-revenue-bridge-marketing-os-design.md`

## Global Constraints

- Shopify is the authoritative source for products, variants, inventory, orders, and revenue.
- Etsy is historical context only and is excluded from current-channel execution.
- ClickUp owns marketing and operations work; software implementation remains in the software-build lane.
- No customer PII may be copied into the plan, visualization, ClickUp descriptions, or attachments.
- No paid Meta campaign may launch until the approved measurement, merchandising, policy, and revenue gates pass.
- Existing ClickUp tasks and lists must be preserved.
- Existing uncommitted repository work must remain untouched.
- Use `Tarifé Attär` for the brand and avoid em dashes in new copy.

---

### Task 1: Verify the execution baseline

**Files:**
- Read: `docs/specs/2026-08-24-revenue-bridge-marketing-os-design.md`
- Read: `.env.local` through process environment only

**Interfaces:**
- Consumes: Shopify Admin API access already configured in `.env.local`.
- Produces: A verified aggregate-only baseline for the visual and ClickUp task descriptions.

- [ ] **Step 1: Query aggregate inventory by size**

Run a read-only Shopify Storefront GraphQL query for active products, variant titles, quantities, and prices. Aggregate the results without outputting credentials or customer data.

Expected totals:

```text
846 sellable units
$27,432 full-price value
3ml: 444 units / $10,744
6ml: 195 units / $5,851
12ml: 194 units / $9,712
Traveler Sets: 11 units / $1,045
Other: 2 units / $80
```

- [ ] **Step 2: Query aggregate August order performance**

Run a read-only Shopify Admin GraphQL query for non-cancelled paid or partially refunded orders processed from `2026-08-01` through the current timestamp.

Expected baseline as of the approved spec:

```text
64 paid orders
$4,172.35 revenue
$65.19 AOV
```

- [ ] **Step 3: Stop if the live totals materially differ**

If unit count or retail value differs by more than 2%, update the visualization inputs and ClickUp descriptions to the new timestamped values before proceeding. Do not overwrite Shopify.

### Task 2: Inspect and deduplicate the ClickUp destination

**Files:**
- Read: `docs/specs/2026-08-24-revenue-bridge-marketing-os-design.md`

**Interfaces:**
- Consumes: Existing ClickUp list IDs from the approved workspace audit.
- Produces: Confirmed list metadata and a duplicate-safe creation map.

- [ ] **Step 1: Retrieve the existing lists**

Retrieve these list IDs:

```text
Campaigns: 901419339579
Lifecycle Automations: 901419339581
Operational Notifications: 901419339582
```

Expected: each list resolves inside the Tarifé Attär Marketing folder.

- [ ] **Step 2: Search for existing implementation items**

Search the Tarifé Attär space and the three lists for:

```text
30-Day Revenue Bridge
First Coordinates
Merchant Center
Win-back
Meta catalog
UTM
```

Expected: a list of existing task IDs, if any, that must be updated or preserved instead of recreated.

- [ ] **Step 3: Resolve the owner**

Resolve `Jordan Richter` or the authenticated user to a ClickUp member ID. If resolution fails, create tasks unassigned rather than guessing.

### Task 3: Create the Revenue Bridge campaign hierarchy

**Files:**
- Read: `docs/specs/2026-08-24-revenue-bridge-marketing-os-design.md`

**Interfaces:**
- Consumes: Campaigns list ID and resolved owner from Task 2.
- Produces: Parent task ID `revenueBridgeTaskId` and four weekly subtask IDs.

- [ ] **Step 1: Create or update the parent campaign**

Create in list `901419339579`:

```text
Name: 30-Day Revenue Bridge | $8K Goal
Start: 2026-08-25
Due: 2026-09-21
Priority: urgent
```

The Markdown description must include:

```markdown
## Goal
$8,000 revenue from approximately 123 orders at a $65 AOV.

## Baseline
- Shopify inventory: 846 units / $27,432 full-price value
- August 1-24: $4,172.35 revenue / 64 orders / $65.19 AOV
- Largest monetization gap: 444 units of 3ml inventory worth $10,744

## Weekly targets
- Week 1: $1,500
- Week 2: $1,750
- Week 3: $2,250
- Week 4: $2,500

## Paid gate
Meta spend remains locked until tracking, the 3ml offer, public policies, and $1,500 attributable owned-channel revenue are verified.

## Source of truth
Shopify for commerce. ClickUp for execution. Etsy excluded.
```

- [ ] **Step 2: Create Week 1 subtask**

```text
Name: Week 1 | Clear blockers + reactivate | $1,500
Start: 2026-08-25
Due: 2026-08-31
Priority: urgent
```

Description requirements: campaign readiness, reintroduction email, UTM QA, Merchant Center connection, and actual revenue field in the closing comment.

- [ ] **Step 3: Create Week 2 subtask**

```text
Name: Week 2 | Launch First Coordinates | $1,750
Start: 2026-09-01
Due: 2026-09-07
Priority: high
```

Description requirements: BIG SUR 3ml, TOBAGO 3ml, SAMARKAND 3ml, proposed $65 offer, inventory-safe bundle confirmation, launch email, and organic Meta support.

- [ ] **Step 4: Create Week 3 subtask**

```text
Name: Week 3 | Win-back + organic amplification | $2,250
Start: 2026-09-08
Due: 2026-09-14
Priority: high
```

Description requirements: win-back audience, one search-first guide, Google free-listing review, three organic short-form posts, and actual revenue.

- [ ] **Step 5: Create Week 4 subtask**

```text
Name: Week 4 | Scale winner + Meta unlock review | $2,500
Start: 2026-09-15
Due: 2026-09-21
Priority: high
```

Description requirements: winning offer, winning creative, full-price revenue percentage, paid-gate checklist, and the decision to keep Meta locked or release the capped $300 test.

### Task 4: Create campaign readiness and channel tasks

**Files:**
- Read: `docs/specs/2026-08-24-revenue-bridge-marketing-os-design.md`

**Interfaces:**
- Consumes: `revenueBridgeTaskId` from Task 3.
- Produces: Actionable campaign subtasks with inventory, revenue, URL, UTM, and measurement requirements.

- [ ] **Step 1: Create the 3ml offer readiness gate**

Create a subtask under the parent:

```text
Revenue Gate | First Coordinates ready for campaign
```

The description must include the three component variants, 79-bundle maximum, $5,135 revenue capacity, $65 proposed price, Shopify component-inventory verification, landing URL, UTM template, and a note that code work is tracked outside ClickUp.

- [ ] **Step 2: Create the attribution readiness gate**

Create:

```text
Revenue Gate | Attribution verified across storefront + checkout
```

The description must require GA4, Search Console, Meta ViewContent, AddToCart, InitiateCheckout, Purchase, Shopify order matching, and a documented test transaction or equivalent safe event validation.

- [ ] **Step 3: Create the Google free-distribution task**

Create:

```text
Google | Activate Merchant Center free listings
```

The description must require Google and YouTube channel connection, product-image remediation, SEO-field remediation, brand and MPN treatment, shipping and return data, and a clean `Needs attention` review.

- [ ] **Step 4: Create the SEO publishing task**

Create:

```text
SEO | Publish four search-first commercial guides
```

The description must list the first four guide topics: perfume oils, attar perfume oils, alcohol-free fragrance, and musk or oud perfume oils. Each guide requires in-stock product links, a Search Console query target, and reuse in email and Meta.

- [ ] **Step 5: Create the organic Meta sprint**

Create:

```text
Meta | Four-week organic content sprint
```

The description must require three short-form posts, one carousel, campaign-supporting stories, and one proof or educational post per week using existing assets first.

- [ ] **Step 6: Create the creative audit task**

Create:

```text
Creative | Index priority Google Drive assets
```

The description must prioritize BIG SUR, TOBAGO, SAMARKAND, SICILY, SERENGETI, and First Coordinates and record product, format, dimensions, funnel stage, channel, usage status, quality, campaign history, and Drive link.

- [ ] **Step 7: Create the paid unlock decision task**

Create:

```text
Paid Gate | Decide whether to release the $300 Meta test
```

The description must list every approved unlock condition, the 3.0x interim ROAS guardrail, three-purchase scaling minimum, 20% budget-change limit, and the explicit outcome `LOCKED` or `RELEASED`.

### Task 5: Create lifecycle automation work

**Files:**
- Read: `docs/specs/2026-08-24-revenue-bridge-marketing-os-design.md`

**Interfaces:**
- Consumes: Lifecycle Automations list ID `901419339581`.
- Produces: Lifecycle tasks linked by name and description to the Revenue Bridge.

- [ ] **Step 1: Preserve live automations**

Search for existing welcome and abandoned-checkout tasks. Do not recreate them if they exist. Add a Revenue Bridge context comment only if needed.

- [ ] **Step 2: Create or update win-back**

Create or update:

```text
Win-back | Previous buyers and legacy-name customers
```

Require audience eligibility, consent, exclusions, send-frequency compliance, legacy-to-current name mapping, UTM, attributable revenue, unsubscribes, and spam complaints.

- [ ] **Step 3: Create post-purchase education**

Create or update:

```text
Post-purchase | Application, layering, and second scent
```

Require a value-first sequence, no blanket discount, product recommendation logic, UTM, and repeat-order revenue.

- [ ] **Step 4: Create the review-request eligibility task**

Create or update:

```text
Review request | Confirm Google Business eligibility first
```

Require confirmation that the showroom qualifies for a Business Profile before requesting Google reviews. No incentive is permitted.

### Task 6: Create operational health tasks

**Files:**
- Read: `docs/specs/2026-08-24-revenue-bridge-marketing-os-design.md`

**Interfaces:**
- Consumes: Operational Notifications list ID `901419339582`.
- Produces: Weekly exception and health-review tasks.

- [ ] **Step 1: Create Merchant Center health review**

Create or update:

```text
Weekly | Merchant Center needs-attention review
```

- [ ] **Step 2: Create Meta catalog and event health review**

Create or update:

```text
Weekly | Meta catalog + commerce event health
```

- [ ] **Step 3: Create low-stock campaign guardrail review**

Create or update:

```text
Weekly | Campaign inventory and low-stock guardrails
```

The description must exclude DAMASCUS, KANDY, Musk Gazelle, and Traveler Set from broad acquisition unless live Shopify quantities support the campaign.

- [ ] **Step 4: Create campaign URL QA**

Create or update:

```text
Weekly | Campaign URL + UTM QA
```

The required UTM convention is:

```text
utm_source=<platform>
utm_medium=<email|organic_social|paid_social|organic_search|free_listing>
utm_campaign=revenue_bridge_2026_08
utm_content=<asset_or_message_slug>
```

### Task 7: Build the command-center visualization

**Files:**
- Create: `/Users/jordanrichter/.codex/visualizations/2026/08/24/01a035e5-dcca-7f33-94bf-36dd3698a2d8/tarife-revenue-command-center.html`
- Create: `/Users/jordanrichter/.codex/visualizations/2026/08/24/01a035e5-dcca-7f33-94bf-36dd3698a2d8/tarife-revenue-command-center-standalone.html`

**Interfaces:**
- Consumes: Verified aggregate baseline from Task 1 and weekly plan from Task 3.
- Produces: An inline visualization fragment and a standalone attachment-safe rendering.

- [ ] **Step 1: Create the fragment**

Create a responsive, theme-aware wide command center with:

```text
Revenue progress and four weekly targets
Inventory size allocation
Top-five inventory concentration
3ml monetization gap
Channel readiness
Paid unlock gate
```

Use no customer data, remote API calls, decorative filler, or hard-coded light/dark palette.

- [ ] **Step 2: Add one useful interaction**

Add a native range input labeled `Revenue achieved` from `$0` to `$8,000`. Updating it must change the revenue progress, amount remaining, pace state, and paid-gate state when the threshold is crossed. The initial value is `$4,172`.

- [ ] **Step 3: Render a standalone copy**

Run:

```bash
python3 /Users/jordanrichter/.codex/plugins/cache/openai-bundled/visualize/1.0.22/skills/visualize/scripts/render.py \
  /Users/jordanrichter/.codex/visualizations/2026/08/24/01a035e5-dcca-7f33-94bf-36dd3698a2d8/tarife-revenue-command-center.html \
  /Users/jordanrichter/.codex/visualizations/2026/08/24/01a035e5-dcca-7f33-94bf-36dd3698a2d8/tarife-revenue-command-center-standalone.html
```

Expected: exit 0 and a non-empty standalone HTML file.

- [ ] **Step 4: Inspect at supported widths**

Render or inspect the command center at 1,024px, 736px, and 360px. Verify there is no overlap, clipping, horizontal overflow, undefined JavaScript identifier, or unreadable text.

### Task 8: Link the command center to ClickUp

**Files:**
- Read: `/Users/jordanrichter/.codex/visualizations/2026/08/24/01a035e5-dcca-7f33-94bf-36dd3698a2d8/tarife-revenue-command-center-standalone.html`

**Interfaces:**
- Consumes: `revenueBridgeTaskId` and standalone visual from Tasks 3 and 7.
- Produces: A ClickUp parent-task attachment and command-center context comment.

- [ ] **Step 1: Attach the standalone command center**

Attach the standalone HTML as:

```text
tarife-revenue-command-center.html
```

Expected: ClickUp returns an attachment associated with the Revenue Bridge parent task.

- [ ] **Step 2: Add the operating comment**

Add a parent-task comment that states:

```text
Command center baseline: Shopify reconciled inventory as of 2026-08-24. Update revenue, orders, AOV, size sell-through, and paid-gate status weekly. Shopify remains authoritative; this task is the execution view.
```

### Task 9: Verify the ClickUp implementation

**Files:**
- Read: `docs/specs/2026-08-24-revenue-bridge-marketing-os-design.md`

**Interfaces:**
- Consumes: All ClickUp task IDs created or updated in Tasks 3 through 8.
- Produces: A verified implementation inventory for the final handoff.

- [ ] **Step 1: Retrieve the parent with subtasks**

Expected: four weekly subtasks, seven channel or gate subtasks, and the command-center attachment.

- [ ] **Step 2: Retrieve lifecycle tasks**

Expected: live welcome and abandoned-checkout work is preserved; win-back, post-purchase, and review eligibility are present without duplicates.

- [ ] **Step 3: Retrieve operational tasks**

Expected: Merchant Center, Meta health, inventory guardrail, and UTM QA tasks are present without duplicates.

- [ ] **Step 4: Verify acceptance criteria**

Confirm:

```text
No customer PII was written
No Etsy execution task was created
No paid campaign was launched
No software task was duplicated into ClickUp
Every campaign task identifies offer, inventory, target, UTM, or measurement where relevant
```

### Task 10: Verify and commit the implementation record

**Files:**
- Modify: `docs/superpowers/plans/2026-08-24-revenue-bridge-marketing-os-implementation.md`

**Interfaces:**
- Consumes: Verified results from Task 9.
- Produces: A committed implementation plan and a final user handoff with the inline command center and ClickUp task links or IDs.

- [ ] **Step 1: Run repository verification**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors in files created by this implementation. Pre-existing unrelated changes may remain.

- [ ] **Step 2: Confirm the plan file is the only staged repository change**

Run:

```bash
git diff --cached --name-only
```

Expected: only this plan file is staged for its documentation commit.

- [ ] **Step 3: Commit the implementation plan**

Run:

```bash
git add docs/superpowers/plans/2026-08-24-revenue-bridge-marketing-os-implementation.md
git commit -m "docs: plan Revenue Bridge marketing OS implementation"
```

- [ ] **Step 4: Provide the handoff**

The final response must include the inline visualization reference, ClickUp implementation summary, verified Shopify baseline timestamp, paid-gate status, and any remaining external access requirement such as Google Drive.
