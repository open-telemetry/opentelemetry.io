---
title: SIG practices for approver and maintainers
linkTitle: SIG practices
description:
  Learn how approvers and maintainers manage issues and contributions.
weight: 999
cSpell:ignore: chalin Comms docsy onboarded
---

This pages includes guidelines and some common practices used by approvers and
maintainers.

## Onboarding

If a contributor steps up to take on a role with more responsibility towards the
documentation (approver, maintainer) they will be onboarded by existing
approvers and maintainers:

- They are added to the `docs-approvers` (or `docs-maintainers`) group.
- They are added to the `#otel-comms` and `#otel-maintainers` and private
  in-team slack channels.
- They are asked to enroll for the calendar invites for
  [SIG Comms meeting](https://groups.google.com/a/opentelemetry.io/g/calendar-comms)
  and
  [maintainers meeting](https://groups.google.com/a/opentelemetry.io/g/calendar-maintainer-meeting).
- They are asked to verify that the current meeting time for SIG Comms works for
  them and if not to collaborate with existing approvers and maintainers to find
  a time that suits everyone.
- They are asked to review the different resources available for contributors:
  - [Community Resources](https://github.com/open-telemetry/community/),
    especially the document around
    [Community Membership](https://github.com/open-telemetry/community/blob/main/community-membership.md)
    and the
    [social media guide](https://github.com/open-telemetry/community/blob/main/social-media-guide.md).
  - [Contributing Guidelines](/docs/contributing) As part of this, they will
    review those documents and provide feedback for improving them via issues or
    pull requests.

Additional valuable resources to review are

- [Hugo documentation](https://gohugo.io/documentation/)
- [Docsy documentation](https://www.docsy.dev/docs/)
- [Marketing guidelines](/community/marketing-guidelines/), including the Linux
  Foundation’s branding and
  [trademark usage guidelines](https://www.linuxfoundation.org/legal/trademark-usage).
  Those are especially valuable when reviewing entries to the registry,
  integrations, vendors, adopters or distributions.

## Collaboration

- Approvers and maintainers have different work schedules and circumstances.
  That's why all communication is assumed to be asynchronous and they should not
  feel obligated to reply outside of their normal schedule.
- When an approver or maintainer won't be available to contribute for an
  extended period of time (more than a few days or a week) or won't be available
  in that period of time, they should communicate this using the
  [#otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) channel and
  updating the GitHub status.
- Approver and maintainer adhere to the
  [OTel Code of Conduct](https://github.com/open-telemetry/community/?tab=coc-ov-file#opentelemetry-community-code-of-conduct)
  and the [Community Values](/community/mission/#community-values). They are
  friendly and helpful towards contributors. In the case of a conflict,
  misunderstanding or any other kind of situation that makes an
  approver/maintainer feel uncomfortable they can step back from a conversation,
  issue or PR and ask another approver/maintainer to step in.

## Code reviews

### General

- If the PR branch is `out-of-date with the base branch`, they do not need to be
  updated continuously: every update triggers all the PR CI checks to be run!
  It's often enough to update them before merging.
- A PR by non-maintainers should **never** update git sub modules. This happens
  by accident from time to time. Let the PR author know that they should not
  worry about it, we will fix this before merging, but in the future they should
  make sure that they work from an up-to-date fork.
- If the contributor is having trouble signing the CLA or used the wrong email
  by mistake in one of their commits, ask them to fix the issue or rebase the
  pull request. Worst case scenario, close and re-open the PR to trigger a new
  CLA check.
- Words unknown to cspell should be added to the cspell ignore list per page by
  PR authors. Only approvers and maintainers will add commonly used terms to the
  global list.

### Co-owned PRs

PRs with changes to documentation co-owned by a SIG (collector, demo,
language-specific...) should aim for two approvals: one by a docs approver and
one by a SIG approver:

- Doc approver label such PRs with `sig:<name>` and tag the SIG `-approvers`
  group on that PR.
- After a doc approver has reviewed and approved the PR, they can add the label
  [`sig-approval-missing`](https://github.com/open-telemetry/opentelemetry.io/labels/sig-approval-missing).
  This signals to the SIG that they need to handle the PR.
- If no SIG approval is given within a certain grace period (two weeks in
  general, but may be less in urgent cases), docs maintainer may use their own
  judgement to merge that PR.

### PRs from bots

PRs created by bots can be merged by the following practice:

- PRs that auto-update versions in the registry can be fixed, approved and
  merged immediately.
- PRs that auto-update the versions of SDKs, zero-code instrumentations or the
  collector can be approved and merged except the corresponding SIG signals that
  merging should be postponed.
- PRs that auto-update the version of any specification often require updates to
  scripts for the CI checks to pass. In that case
  [@chalin](https://github.com/chalin/) will handle the PR. Otherwise those PRs
  can as well be approved and merged except the corresponding SIG signals that
  merging should be postponed.

### Translation PRs

PRs with changes to translations should aim for two approvals: one by a docs
approver and one by a translation approver. Similar practices apply as suggested
for the co-owned PRs.

### Merging PRs

The following workflow can be applied by maintainers to merge PRs:

- Make sure that a PR has all approvals and all CI checks pass.
- If the branch is out-of-date, rebase update it via the GitHub UI.
- The update will trigger all CI checks to run again, wait for them to pass or
  execute a script like the following to make it happen in the background:

  ```shell
  export PR=<ID OF THE PR>; gh pr checks ${PR} --watch && gh pr merge ${PR} --squash
  ```
