---
title: Exponential Histograms
date: 2023-05-22
author: '[Daniel Dyla](https://github.com/dyladan)'
cSpell:ignore: Ganesh Ruslan subsetting Vernekar Vovalov
canonical_url: https://dyladan.me/histograms/2023/05/04/exponential-histograms/
---

Previously, in [Why Histograms?][] and [Histograms vs Summaries][], I went over
the basics of histograms and summaries, explaining the tradeoffs, benefits, and
limitations of each. Because they're easy to understand and demonstrate, those
posts focused on so-called explicit bucket histograms. The exponential bucket
histogram, also referred to as native histogram in Prometheus, is a low-cost,
efficient alternative to explicit bucket histograms. In this post, I go through
what they are, how they work, and the problems they solve that explicit bucket
histograms struggle with.

## Types of histograms

For the purposes of this blog post, there are two major types of histograms:
explicit bucket histograms and exponential bucket histograms. In previous posts,
I've focused on what OpenTelemetry calls explicit bucket histograms and
Prometheus simply refers to as histograms. As the name implies, an explicit
bucket histogram has each bucket configured explicitly by either the user or
some default list of buckets. Exponential histograms work by calculating bucket
boundaries using an exponential growth function. This means each consecutive
bucket is larger than the previous bucket and ensures a constant relative error
for every bucket.

## Exponential histograms

In OpenTelemetry exponential histograms, buckets are calculated automatically
from an integer _scale factor_, with larger scale factors offering smaller
buckets and greater precision. It is important to select a scale factor that is
appropriate for the distribution of values you are collecting in order to
minimize error, maximize efficiency, and ensure the values being collected fit
in a reasonable number of buckets. In the next few sections, I'll go over the
scale and error calculations in detail.

## Scale factor

The most important and most fundamental part of an exponential histogram is also
one of the trickiest to understand, the scale factor. From the scale factor,
bucket boundaries, and by extension resolution, range, and error rates, are
derived. The first step is to calculate the histogram base.

The base is a constant derived directly from the scale using the equation
`2 ^ (2 ^ -scale)`. For example, given a scale of 3, the base can be calculated
as `2^(2^-3) ~= 1.090508`. Because the calculation depends on the power of the
negative scale, as the scale grows, the base shrinks and vice versa. As will be
shown later, this is the fundamental reason that a greater scale factor results
in smaller buckets and a higher resolution histogram.

## Bucket calculation

Given a scale factor and its resulting base, we can calculate every possible
bucket in the histogram. From the base, the upper bound of each bucket at index
`i` is defined to be `base ^ (i + 1)`, with the first bucket lower boundary
of 1. Because of this, the upper boundary of the first bucket at index 0 is also
exactly the base. For now, we will only consider nonnegative indices, but
negative indexed buckets are also possible and define all buckets between 0
and 1. Keeping with our example using a scale of 3 and resulting base of
1.090508, the third bucket at index 2 has an upper bound of
`1.090508^(2+1) = 1.29684`. The following table shows upper bounds for the first
10 buckets of a few different scale factors:

| index | scale -1 | scale 0 | scale 1 | scale 3 |
| ----- | -------- | ------- | ------- | ------- |
| -1    | **1**    | **1**   | **1**   | **1**   |
| 0     | **4**    | 2       | 1.4142  | 1.0905  |
| 1     | **16**   | **4**   | 2       | 1.1892  |
| 2     | 64       | 8       | 2.8284  | 1.2968  |
| 3     | 256      | **16**  | **4**   | 1.4142  |
| 4     | 1024     | 32      | 5.6569  | 1.5422  |
| 5     | 4096     | 64      | 8       | 1.6818  |
| 6     | 16384    | 128     | 11.3137 | 1.8340  |
| 7     | 65536    | 256     | **16**  | 2       |
| 8     | 262144   | 512     | 22.6274 | 2.1810  |
| 9     | 1048576  | 1024    | 32      | 2.3784  |

I've bolded some of the values here to show an important property of exponential
histograms called _perfect subsetting_.

## Perfect subsetting

In the chart above, some of the bucket boundaries are shared between histograms
with differing scale factors. In fact, each time the scale factor increases by
1, exactly 1 boundary is inserted between each existing boundary. This feature
is called perfect subsetting because each set of boundaries for a given scale
factor is a perfect subset of the boundaries for any histogram with a greater
scale factor.

Because of this, histograms with differing scale factors can be normalized to
whichever has the lesser scale factor by combining neighboring buckets. This
means that histograms with different scale factors can still be combined into a
single histogram with exactly the precision of the least precise histogram being
combined. For example, histogram _A_ with scale 3 and histogram _B_ with scale 2
can be combined into a single histogram _C_ with scale 2 by first summing each
pair of neighboring buckets in _A_ to form histogram _A'_ with scale 2. Then,
each bucket in _A'_ is summed with the corresponding bucket of the same index in
_B_ to make _C_.

## Relative Error

A histogram does not store exact values for each point, but represents each
point as a bucket consisting of a range of possible points. This can be thought
of as being similar to lossy compression. In the same way the it is impossible
to recover an exact source image from a compressed JPEG, it is impossible to
recover the exact input data set from a histogram. The difference between the
input data and the estimated reconstruction of the data is the error of the
histogram. It is important to understand histogram errors because it affects
φ-quantile estimation and may affect how you define your SLOs.

The relative error for a histogram is defined as half the bucket width divided
by the bucket midpoint. Because the relative error is the same across all
buckets, we can use the first bucket with the upper bound of the base to make
the math easy. An example is shown below using a scale of 3.

```
scale = 3
# For base calculation, see above
base  = 1.090508

relative error = (bucketWidth / 2) / bucketMidpoint
               = ((upper - lower) / 2) / ((upper + lower) / 2)
               = ((base - 1) / 2) / ((base + 1) / 2)
               = (base - 1) / (base + 1)
               = (1.090508 - 1) / (1.090508 + 1)
               = 0.04329
               = 4.329%
```

For more information regarding histogram errors, see [OTEP 149][] and the
[specification for exponential histogram aggregations][].

## Choosing a scale

Because increasing the scale factor increases the resolution and decreases the
relative error, it may be tempting to choose a large scale factor. After all,
why would you want to introduce error? The answer is that there is a positive
relationship between the scale factor and the number of buckets required to
represent values within a specified range. For example, with 160 buckets (the
OpenTelemetry default), histogram _A_ with a scale factor of 3 can represent
values between 1 and about 1 million; histogram _B_ with a scale of 4 the same
number of buckets would only be able to represent values between about 1 and
about 1000, albeit at half the relative error. To represent the same range of
values as _A_ with _B_, twice as many buckets are required; in this case 320.

This brings me to the first most important point of choosing a scale, _data
contrast_. Data contrast is how you describe the difference in scale between the
smallest possible value x and the largest possible value y in your dataset and
is calculated as the constant multiple c such that `y = c * x`. For example, if
your data is between 1 and 1000 milliseconds, your data contrast is 1000. If
your data is between 1 kilobyte and 1 terabyte, your data contrast is
1,000,000,000. Data contrast, scale, and the number of buckets are all
interlinked such that if you have 2, you can calculate the third.

Fortunately, if you are using OpenTelemetry, scale choice is largely done for
you. In OpenTelemetry, you configure a maximum scale (default 20) and a maximum
size (default 160), or number of buckets, in the histogram. The histogram is
initially assumed have the maximum scale. As additional data points are added,
the histogram will rescale itself down such that the data points always fit
within your maximum number of buckets. The default of 160 buckets was chosen by
the OpenTelemetry authors to be able to cover typical web requests between 1ms
and 10s with less than 5% relative error. If your data has less contrast, your
error will be even less.

## Negative or zero values

For the bulk of this post we have ignored zero and negative values, but negative
buckets work much the same way, growing larger as the buckets get further from
zero. All of the math and explanation above applies in the same way to negative
values, but they should be substituted for their absolute values, and upper
bounds for buckets are lower bounds (or upper absolute value bounds). Zero
values, or values with an absolute value less than a configurable threshold, go
into a special zero bucket. When merging histograms with differing zero
thresholds, the larger threshold is taken and any buckets with absolute value
upper bounds within the zero threshold are added to the zero bucket and
discarded.

## OpenTelemetry and Prometheus

Compatibility between OpenTelemetry and Prometheus is probably a topic large
enough for its own post. For now I will just say that for all practical
purposes, OpenTelemetry exponential histograms are 1:1 compatible with
Prometheus native histograms. Scale calculations, bucket boundaries, error
rates, zero buckets, etc are all the same. For more information, I recommend you
watch this talk given by Ruslan Vovalov and Ganesh Vernekar: [Using
OpenTelemetry’s Exponential Histograms in Prometheus][]

_A version of this article was [originally posted][] to the author's blog._

<!-- prettier-ignore-start -->
[Using OpenTelemetry’s Exponential Histograms in Prometheus]:
  https://www.youtube.com/watch?v=W2_TpDcess8
[OTEP 149]: https://github.com/open-telemetry/oteps/blob/976c9395e4cbb3ea933d3b51589eba94b87a17bd/text/0149-exponential-histogram.md
[specification for exponential histogram aggregations]: /docs/specs/otel/metrics/sdk/#base2-exponential-bucket-histogram-aggregation
[Why Histograms?]: {{% relref "why-histograms" %}}
[Histograms vs Summaries]: {{% relref "histograms-vs-summaries" %}}
[originally posted]: {{% param canonical_url %}}
<!-- prettier-ignore-end -->
