---
title: Histograms vs Summaries
date: 2023-05-15
author: '[Daniel Dyla](https://github.com/dyladan)'
cSpell:ignore: aggregatable Björn Ganesh Kovalov Rabenstein Ruslan Vernekar
canonical_url: https://dyladan.me/histograms/2023/05/03/histograms-vs-summaries/
---

In many ways, histograms and summaries appear quite similar. They both roll up
many data points into a data structure for efficient processing, transmission,
and storage. They can also both be used to track arbitrary quantiles such as the
median or p99 of your data. So how do they differ? Let's dive in.

## Histograms

Since I just published a post about
[histograms and when they are useful](../why-histograms), I will only provide a
quick summary here. A histogram is a data structure which describes the
distribution of a set of data points. For example, one may collect all response
times to an HTTP endpoint and describe them as a histogram with 10 bins ranging
from 0 to 1000 milliseconds. Each bin counts the number of requests that fall
within its range.

![Response Time Histogram](response-times-histogram.png "A histogram titled 'Response Time (1260 requests).' The y-axis is the request count and there are 12 buckets ranging from less than 10 milliseconds to greater than 1000 milliseconds. The distribution appears to be a normal bell curve with a mode in the 'less than 75 milliseconds' bucket. The 'greater than 1000' bucket shows a slight bump to indicate a long tail captured by a single bucket.")

From this we can estimate φ-quantiles like the 90th percentile. We know there
are 1260 requests, so the 1134th-ranked (`1260 * .90`) request represents the
90th percentile. We can then calculate that the request would fall in the 8th
bucket (`300 <= x < 500`) by summing the bucket counts until we exceed that
rank. Finally, using relative rank within the bucket of 24 (`1134 - 1110`), we
can estimate the p90 value to be 360ms (`300 + ((24 / 80) * (500 - 300))`) using
linear interpolation. It is important to know that this is an _estimation_ and
could be off by as much as 60ms (`360 - 300`), a relative error of 17%
(`60 / 360`). This error can be mitigated by configuring more and smaller
buckets around your SLO values, but never eliminated.

One important property of histograms is that they are _aggregatable_, meaning
that as long as the bucket boundaries line up, an arbitrary number of histograms
can be combined into a single histogram with no loss of data or precision. This
means that an arbitrary number of hosts can report histogram data structures to
a server, which can aggregate and compute quantiles from all of them as if they
were reported by a single host. By collecting histograms from 1 or more hosts
over a long period of time, developers can gain a strong understanding of how
their data is distributed and how that distribution changes over time.

## Summaries

Summaries work in almost the opposite manner. When a summary is configured it is
given a φ-quantile to track, an acceptable error range, and a decay rate. For
example, a summary may track p99 ± 0.5% with a decay rate of 5 minutes. The math
is more complex so it won't be discussed here, but one important distinction is
that the value is calculated on the client before it is sent to the server. The
most important consequence of this is that summaries from multiple clients
_cannot be aggregated_. Another disadvantage is that if you cannot query
arbitrary φ-quantiles, only those which you have configured and collected in
advance.

Given these disadvantages, summaries do have some advantages. First, they trade
off a small performance penalty on the client for a significant reduction in
transmission, storage, and server processing cost. In our histogram example
above, the distribution is represented as 12 separate time series: 1 counter for
each bucket + 1 bucket for out of range values + a total sum of all values. That
is for a single, relatively modest, histogram with no attributes to multiply
cardinality. By comparison, the summary is only a single time series for the
precomputed `p99` value. Second, they have very low and configurable relative
error rates. In the histogram example above, we had a potential relative error
of 17% where our summary is guaranteed to be within ± 0.5% accuracy.

## So which should you choose?

The disappointing answer is "it depends," and there is no one-size-fits-all
solution. If you need to aggregate data from many sources, then histograms may
be the right choice. If you are collecting a large number of separate metrics
with very strict SLOs, or your Prometheus server is particularly resource
constrained, then maybe summaries are the right choice for you. Maybe your ideal
solution is a hybrid with some histograms for flexible querying and some
summaries for high-accuracy, low-cost alerting. Only you can know the ins and
outs of your own system and design an observability solution around it that is
accurate and flexible and fits your particular needs. The key is knowing the
strengths and limitations of the available tools so you can make informed
decisions.

## Bonus round: native/exponential histograms

I'm planning a longer post on this so I'll keep this short, but many of the key
disadvantages of histograms are mitigated by exponential histograms, called
native histograms in Prometheus. They are available in Prometheus as an
experimental feature since v2.40.0, and stable in the OpenTelemetry
specification as of v1.17.0. Exponential histograms come with several
advantages:

- Very efficient data collection and transmission
- A constant number of time series created (and fewer of them) per histogram
- Very low relative error rates
- Automatic bucket boundaries, making them simpler to configure and use

These advantages are accomplished by defining bucket boundaries according to a
scale factor, intelligently resizing buckets as your distribution evolves,
instead of the traditional method of defining explicit buckets. If you're not
happy with the state of your current histograms and summaries, I encourage you
to give exponential histograms a try. As of this writing there are no official
Prometheus docs on native histograms, but if you stay tuned I plan to add a
thorough explanation of them in the coming days.

Until then, here are some talks I found helpful:

- [PromCon EU 2022 - Native Histograms in Prometheus - Ganesh Vernekar](https://promcon.io/2022-munich/talks/native-histograms-in-prometheus/)
- [KubeCon EU 2023 - Prometheus Native Histograms in Production - Björn Rabenstein, Grafana Labs](https://www.youtube.com/watch?v=TgINvIK9SYc)
- [Using OpenTelemetry’s Exponential Histograms in Prometheus - Ruslan Kovalov & Ganesh Vernekar](https://www.youtube.com/watch?v=W2_TpDcess8)

_A version of this article was [originally posted][] to the author's blog._

[originally posted]: {{% param canonical_url %}}
