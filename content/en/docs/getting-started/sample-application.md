---
title: Sample Application
description:
weight: 10
---

The sample application is a “dice game”: a game coordinator service will ask two
(or more) player services for a random number between 1 and 6. The player with
the highest number wins.

The first few chapters of this tutorial will focus on the player service, which
is a basic HTTP application, that has an API endpoint `/rolldice` which returns
a random number between 1 and 6 on request.
