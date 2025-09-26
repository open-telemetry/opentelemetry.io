---
title: Retrospective of September 25th go.opentelemetry.io incident
linkTitle: Retrospective of go.opentelemetry.io incident
date: 2025-09-26
author: >-
  [Damien Mathieu](https://github.com/dmathieu) (Elastic) [Pablo
  Baeyens](https://github.com/mx-psi) (Datadog)
cSpell:ignore: baeyens goog
---

On September 25th, at 10:35 UTC, we were notified that the
`go.opentelemetry.io`’s SSL certificate had expired.

This endpoint is the canonical URL for most Go modules within the OpenTelemetry
organization. As a result, downloading any modules from that endpoint was
impossible.

## What happened?

This endpoint currently runs on the Google App Engine platform, and its SSL
certificate is managed by Google. This is the only endpoint under the
[opentelemetry.io](/) domain that runs on this platform.

Last July, we were alerted by a security researcher that the root OpenTelemetry
domain ([opentelemetry.io](/)) lacked
[CAA DNS records](https://en.wikipedia.org/wiki/DNS_Certification_Authority_Authorization).
We therefore added one with LetsEncrypt as the sole issuer, since that’s
[the authority used for the root domain’s certificate](https://docs.netlify.com/manage/domains/secure-domains-with-https/https-ssl/#netlify-managed-certificates).

Since Google's CA was not listed as an issuer in the CAA record,the AppEngine
platform couldn’t renew the [go.opentelemetry.io](https://go.opentelemetry.io)
certificate. So on September 25th at 10:08:10 UTC, when it expired, every
request returned an error with the expired certificate. This caused issues on
build systems and when viewing the documentation of
[go.opentelemetry.io](https://go.opentelemetry.io) packages.

Since this is the only app we maintain that runs on that platform, only a few
people based in the US have experience with it, so until they were awake we had
difficulties operating efficiently. At 12:03 UTC, we were able to get access to
the Google Cloud console, and at 12:14 UTC, we identified the issue as being
with the
[CAA record](https://cloud.google.com/load-balancing/docs/ssl-certificates/google-managed-certs#caa).

At 12:16 UTC, we deployed a new CAA record so Google could properly generate
certificates. We assumed the platform would regenerate new SSL certificates once
it noticed the DNS changes. This assumption appears to be valid, but it can take
up to a day for the platform to refresh the CAA records.

By 13:58 UTC, we were seeing the DNS record as being propagated, but no
certificate was generated. Unfortunately, the folks involved in the incident had
little knowledge of the platform, and we didn’t know how to force-regenerate the
certificate.

At 14:54 UTC, we disabled and reenabled managed security on the SSL certificate,
which force regenerated a certificate. A few minutes later, we started seeing
requests succeeding again.

## Detailed timeline

- 10:08 UTC – SSL certificate for
  [go.opentelemetry.io](https://go.opentelemetry.io) expired
- 10:35 UTC – First notification from users about the issue
- 11:31 UTC – Created
  [public issue tracking this incident](https://github.com/open-telemetry/opentelemetry-go-vanityurls/issues/81)
- 12:03 UTC – Got access to the Google Cloud Console for the golang-imports
  project
- 12:14 UTC – Identified the CAA record was missing the "pki.goog" issuer
- 12:16 UTC – Deployed a new CAA record with the correct set of issuers
- 13:58 UTC – Confirmed the CAA record had propagated but the SSL certificate
  had not been renewed
- 14:54 UTC – Disabled and enabled managed security on the SSL certificate
- 15:16 UTC – Confirmed a new SSL certificate had been issued for
  [go.opentelemetry.io](https://go.opentelemetry.io)

## Lessons learned

As we discovered this incident, we had several people jump in and try to figure
out what was happening. For an Open Source project where people are scattered
across the globe, this was a positive thing to notice.

We are lacking knowledge of the platform this application runs on, which caused
this incident to last much longer than it needed to. However, we were glad that
[a little over a year ago](/blog/2024/go-opentelemetry-io/), we changed the
Google account this app runs on, as we previously wouldn’t even have been able
to fix this issue ourselves.

## Action items

We have started
[improving our playbooks](https://github.com/open-telemetry/community/pull/3021)
to access the AppEngine console, so we can get access more quickly.

We need to ensure this application is not a snowflake anymore, so we can operate
it the same way we operate every other public website OpenTelemetry maintains.
We are therefore
[going to look](https://github.com/open-telemetry/opentelemetry-go-vanityurls/issues/83)
into moving away from the AppEngine platform and into Netlify, the platform that
runs the [opentelemetry.io](/) website.

We also identified with the help of a user a number of unused subdomains of
[opentelemetry.io](/) that are serving an expired certificate. While these have
no impact for our users, we are going to
[look into removing them](https://github.com/open-telemetry/community/issues/3022).
