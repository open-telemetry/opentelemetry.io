---
title: 'End-User Q&A Series: Migrating to OTel at Lightstep'
linkTitle: 'End-User Q&A: Migrating to OTel at Lightstep'
date: 2023-07-14
author: '[Reese Lee](https://github.com/reese-lee) (New Relic)'
body_class: otel-with-contributions-from
---

With contributions from [Adriana Villela](https://github.com/avillela) 
(Lightstep from ServiceNow).

For the OpenTelemetry (OTel) End User Working Group's fourth 
[End User Q&A session](/community/end-user/interviews-feedback/) of 2023, we 
spoke with [Jacob Aronoff](https://www.linkedin.com/in/jaronoff97), Staff 
Software Engineer at [Lightstep from ServiceNow](https://lightstep.com/) and an 
OpenTelemetry Operator Maintainer. Read on if you are interested in learning 
how a vendor is using OTel in-house! 

This series of interviews is a monthly casual discussion with a team that's 
using OpenTelemetry in production. The goal is to share with the community what 
we've learned about how they are doing this, along with their successes and 
challenges, so that we can help improve OpenTelemetry together. 

## Overview

In this session, Jacob shared:

- How he approached migrating to OpenTelemetry from OpenTracing and OpenCensus
- What the [`TargetAllocator`](https://github.com/open-telemetry/opentelemetry-operator/blob/main/cmd/otel-allocator/README.md) 
- is, and how he's using it today
- Why you might not want to deploy your Collector as a sidecar 

## The interview 

### The backstory

Jacob has been on the Telemetry Pipeline Team at Lightstep from ServiceNow for 
almost two years now. He spent the first year solely focused on OTel migrations, 
internally as well as making it easier for their customers. 

When he joined the team, he says "we were still on OpenTracing for tracing, and 
a mix of OpenCensus and some hand-rolled Statsd stuff for metrics." This meant 
they had to run a proxy on every single Kubernetes pod (where a proxy sits as a 
sidecar on every pod, which means that you have to run another application that's 
going to read from Statsd and then forward the metrics). 

This was around the time OpenTelemetry metrics release candidates were just 
announced, and he saw it as an opportunity: "We have an internal OTel team that 
has been working on it a lot and wanted some immediate feedback on how to 
improve it, so I spun the migration for us," he says.

### The OpenCensus metrics migration

Having done similar migrations previously, he initially planned it to be as safe 
as possible. They could have done it all in one go since they were in a monorepo, 
but that would have risked a bug being pushed up. 

Jacob says, "This is app data which we use for alerting to understand how our 
workloads are functioning in all of our environments, so it's important to not 
take that down since it’d be disastrous. Same story for users, they want to know 
if they move to OTel they won’t lose their alerting capabilities. You want a safe 
and easy migration."

His team did the feature flag-based part of the configuration in Kubernetes. He 
says, "It would disable the sidecar and enable some code that would then swap 
the OTel for metrics and forward it to where it’s supposed to go. So that was 
the path there."

However, along the way, he noticed some "pretty large performance issues" as he 
tested it in the environment they use to monitor their public environment. He 
worked with the OTel team to alleviate some of these concerns, and found that 
one of the big blockers was their heavy use of attributes on metrics.

"It was tedious to go in and figure out which metrics are using them and getting 
rid of them. I had a theory that one codepath was the problem, where we’re doing 
the conversion from our internal tagging implementation to OTel tags, which came 
with a lot of other logic and [is] expensive to do, and it was on almost every 
call," he says. "No better time than now to begin another migration from 
OpenCensus to OTel."

He saw this as another opportunity: "While we wait for the OTel folks on the 
metrics side to push out more performant code and implementations, we could also 
test out the theory of, if we migrate to OTel entirely, we’re going to see more 
performance benefits." Thus, they paused the metrics work and began on migrating 
their tracing. 

### The OpenTracing migration 

For tracing, Jacob decided to try the "all-or-nothing approach." The path from 
OpenTracing to OTel was better known, with some documentation and examples they 
could refer to. Additionally, "they are backwards-compatible, you are able to 
use them in conjunction with each other," he says, "as long as you have 
propagators set up correctly."

After setting up the propagators correctly, they made sure all their plugins 
(which are now open source) worked. They had to revert a few times from their 
staging environment, but didn't encounter any major problems aside from a bug 
that he missed. 

"I had to implement a custom sampler, which is ten times easier with OTel than 
it was with OpenTracing," he says. "I was able to get rid of a thousand lines of 
code and some dangerous hacks, so that was a really good thing." 

### How to start a migration

"I started with really small services my team owned with really low traffic, but 
enough for it to be constant," Jacob says. "The reason you want to pick a service 
like this is that if it's too low traffic, like one request every 10 minutes, you 
have to worry about sample rates, [and] you may not have a lot of data to compare 
against – that’s the big thing: you need to have some data to compare against."

He had written a script early on for their metrics migration that queried 
different build tags that were on all their metrics. If the standard deviation 
for the newer build tag is greater than 1 compared to the previous release, that 
could signal an issue with your instrumentation library. 

"Another thing I had to check was that all the attributes were still present 
before and after migration, which is another thing that matters," Jacob notes. 
Sometimes they weren't, as in the case of Statsd automatically adding something 
they didn't care about; those could be safely ignored.

For tracing, Jacob says, "I picked a service that had both internal-only traces 
(stayed within a single service) and traces that spanned multiple services with 
different types of instrumentation, so from Envoy to OTel to OpenTracing." 

He explains, "What you want to see is that the trace before has the same 
structure as the trace after. So I made another script that checked that those 
structures were relatively the same and that they all had the same attributes as 
well... That’s the point of the tracing migration – what matters is that all the 
attributes stayed the same."

### When data goes missing

"The ‘why it’s missing’ stories are the really complicated ones," says Jacob. 
Sometimes, it's as simple as forgetting "to add something somewhere," but other 
times, there could be an upstream library that doesn't emit what you expected 
for OTel. 

He tells a story about the time he  migrated their grpc util package (which is 
now in Go contrib) and found an issue with propagation. 

"I was trying to understand what’s going wrong here. When I looked at the code – 
this tells you how early I was doing this migration – where there was supposed to 
be a propagator, there was just a 'TODO' from Alex Boten," he shares. "It just 
took down our entire services’ traces in staging." 

He spent some time working on it, but they in turn were waiting on something 
else, and so on and so forth -- Jacob says there are "endless cycles of that 
type of thing." Once he resolved the problem, he upstreamed it so that it was 
available to the community. 

"A lot of the metrics work resulted in big performance boosts for OTel metrics," 
he says. "Like OTel Go metrics. It also has given the Stats folks some ideas 
about how descriptive the API should be for various features. 
So things like Views and the use of Views is something we used heavily early in 
the migration."

### Metrics Views

"A Metrics View is something that is run inside of your Meter Provider in OTel," 
Jacob explains. There are many configuration options, such as dropping 
attributes, which is one of the most common use cases. "For example, you’re a 
centralized SRE and you don't want anyone to instrument code with any user ID 
attribute, because that’s a high cardinality thing and it’s going to explode 
your metrics cost. You can make a View that gets added to your instrumentation 
and tell it to not record it, to deny it."

There are also more advanced use cases, for example, dynamically changing the 
temporality or aggregation of your metrics. Temporality refers to whether a 
metric incorporates the previous measurement or not (cumulative and delta), 
and aggregation refers to how you send off the metrics. 

"It’s most useful for histograms," says Jacob. "When you record histograms, 
there are a few different kinds – DataDog and Statsd histograms are not true 
histograms because what they’re recording is like aggregation samples. They give 
you a min, max, count, average, and P95 or something. The problem with that is, 
in distributed computing, if you have multiple applications that are reporting a 
P95, there’s no way you can get a true P95 from that observation with that 
aggregation," he continues. 

"The reason for that is, if you have five P95 observations, there’s not an 
aggregation to say, give me the overall P95 from that. You need to have something 
about the original data to recalculate it. You can get the average of the P95s 
but it’s not a great metric, it doesn't really tell you much. It's not really 
accurate. If you’re going to alert on something and page someone at night, you 
should be paging on accurate measurements."

Initially, they did have a few people who relied on the min, max, sum, count 
instrument, so they used the View in the Metrics SDK to configure custom 
aggregation or histograms to emit a distribution, or, in OpenTelemetry, an 
exponential histogram. "We were dual emitting; this worked because they were 
different metric names, so there was no overlap."

After they completed the migration, they were able to go back to any dashboard 
or alert that was using min, max, sum, count and change it to a distribution 
instead. "And because we had enough data in the past few weeks, months of running 
OTel metrics in our public env, that was possible to do," says Jacob. "That was 
one of the key features, because we had it, it was ten times easier and we were 
able to do it from the application, we didn't have to introduce any other 
components, which was really neat."

### Logs and span events

When Jacob started the OTel migration, it was still too early for logs. 
"The thing we would change," he says, "is how we collect those logs, potentially; 
we previously did it using Google’s log agent, basically running fluentbit on 
every node in a GKE cluster and then they send it off to GCP and we tail it 
there." He notes that there may have been recent changes to this that he's not 
aware of at this time. 

"For a long time, we’ve used span events and logs for a lot of things 
internally," he says. "I’m a big fan of them." He is not as big a fan of 
logging, sharing that he thinks they are "cumbersome and expensive." He suggests 
that users opt for tracing and trace logs whenever possible, although he does 
like logging for local development, and tracing for distributed development." 

### Telemetry collection in Kubernetes

Kubernetes now has the ability to emit OTel traces natively, and Jacob is 
interested in seeing if the traces they get from those are sufficient for 
generating better Kubernetes metrics using the span-to-metrics processor. 

"I'm very focused on infrastructure metrics, like Kubernetes infrastructure 
metrics, and I find them to be very painful in their current form," he says. 
Currently, he is using the Prometheus APIs to collect them, which is the 
ubiquitous way in the observability community since Kubernetes already emits 
these natively.  

"That's what we do right now, and I use an OTel component that I work on called 
the target allocator to distribute those targets, which is a pretty efficient way 
of getting all that data," says Jacob. 

"We also use daemonsets that we run in our clusters to get that data in 
addition, so that works pretty effectively. The thing that's frustrating is just 
Prometheus. Prometheus scrape values can be a super common problem and it gets 
really annoying when you have to worry about metrics cardinality as well because 
it can explode."

### The Target Allocator

"The Target Allocator is a component that's part of the Kubernetes operator in 
OTel that does something that Prometheus can't do, which is: dynamically shard 
targets amongst a pool of scrapers," shares Jacob. Using the Target Allocator 
requires running a Prometheus instance. 

He goes on to explain that while Prometheus has some experimental function for 
sharding, you still have a problem for querying, since Prometheus is also a 
database and not just a scraper. You have to do some amount of coordination 
within these Prometheus instances, which can get expensive, or use a Prometheus 
scaling solution such as Thanos or Cortex -- however, this would involve running 
more components that you'll need to monitor. 

"In OTel, we tack on this Prometheus receiver to get all this data, but because 
we want to be more efficient than Prometheus, because we don’t need to store the 
data, we have this component called the Target Allocator, which goes to do the 
service discovery from Prometheus," says Jacob. "It says give me all the targets 
I need to scrape. Then the Target Allocator says: with these targets, distribute 
them evenly among the set of collectors that’s running."

That's the main thing this component does, and it also helps with job discovery. 
If you're using Prometheus service monitors, which is part of the Prometheus 
operator, a popular way of running Prometheus in your cluster, "the Target 
Allocator can also pull those service monitors and pop monitors and update the 
monitors and scrape configurations to do that." 

Jacob's team doesn't run any Prometheus instances -- they just have the 
collector running the Prometheus receiver and sending the data off to Lightstep. 
"It is nice," he says. 

His team used to run a Prometheus sidecar, which ran as part of their Prometheus 
installation. This would then sit on the same pod as their Prometheus instance 
and read the write-ahead log that Prometheus has for persistence and batching. 
However, if your Prometheus instance is noisy, it can be inefficient. "It can 
get really noisy and not the best," says Jacob. "The collector is the best way 
to run this."

### The Collector setup

Jacob's team runs a lot of different types of Collectors over at Lightstep. "We 
run metrics things, tracing things, internal ones, external ones – there’s a lot 
of different collectors that are running at all times", he shares.

"It’s all very in-flux." They're changing things around a lot to run experiments, 
since the best way for them to create features for customers and end users is to 
make sure they work internally first. 

"We're running in a single path where there could be two collectors in two 
environments that could be running two different images and two different versions. 
It gets really meta and really confusing to talk about," he says. "And then, if 
you’re sending Collector A across an environment to Collector B, Collector B also
 emits telemetry about itself, which is then collected by Collector C, so it just 
 chains."

In a nutshell, you need to make sure that the collector is actually working. 
"That’s like the problem when we’re debugging this stuff. When there’s a problem 
you have to think up where the problem actually is -- is it in how we collect the 
data, is it in how we emit the data, is it in the source of how the data was 
generated? One of a bunch of things." 

### Kubernetes modes on OTel

There are four deployment modes for running Kubernetes on OTel: 
[Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), 
[DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/), 
[StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/), 
and [Sidecar](). Which ones you should use depends on what you need to do, such 
as how you like to run applications for reliability. 

"Sidecar is the one we use the least and is probably used the least across the 
industry if I had to make a bet," Jacob says. "They’re expensive. If you don’t 
really need them, then you shouldn’t use them." An example of something run as a 
sidecar is Istio, "which makes a lot of sense to run as a sidecar because it 
does traffic proxy and it hooks into your container network to change how it 
all does its thing."

You will get a cost hit if you sidecar your Collectors for all your services, 
and you also have limited capabilities. He says, "If you’re making Kubernetes 
APIs calls or attribute enrichment, that’s the thing that would get exponentially 
expensive if you’re running as a sidecar." He shares an example: "...if you have 
sidecar on 10k pods, then that’s 10k API calls made to the K8s API. That's 
expensive."

On the other hand, if you have five pods deployed on StatefulSets, "that's not 
that expensive." When you run in StatefulSet mode, you get an exact number of 
replicas that should exist at all times, each with a predictable name -- which 
is "a really valuable thing when you want consistent IDs." 

Due to the consistent IDs, you can do some extra work with the Target Allocator, 
which is why it's required. Another thing that StatefulSets guarantee is 
something called in-place deployment, which is also available with DaemonSets; 
this is where you take the pod down before you create a new one. 

"In a deployment you usually do a 1-up, 1-down, or what’s called a rolling 
deployment, or rolling update," Jacob says. If you were doing this with the 
Target Allocator, you are likely to get much more unreliable scrapes. This is 
because you have to redistribute all the targets when a new replica comes up, 
because the hash ring you place these on has changed, requiring a recalculation 
of all the hashes you've assigned. 

Whereas with StatefulSets, this isn't necessary, since you get a consistent ID 
range. "So when you do 1-down 1 up, it keeps the same targets each time. So like 
a placeholder for it – you don’t have to recalculate the ring," he exaplins. 

He notes that this is really only useful as a  metrics use case, where you're 
scraping Prometheus. He notes that they'd probably run it as a Deployment for 
anything else, since that mode gives you most everything you would need. 
Collectors are stateless, so there is no need for them to hold on to anything, 
and Deployments are leaner as a result. "You can just run and roll out and 
everyone’s happy," he says. "That’s how we run most of our collectors, is just 
as a Deployment."

For per-node scraping, DaemonSets come in handy. "This allows you to scrape the 
kubelet that’s run on every node, it allows you to scrape the node exporter 
that’s also run on every node, which is another Prometheus daemonset that most 
people run," he expalins.

DaemonSets are useful for scaling out, since they guarantee that you've got pods 
running on every node that matches its selector. "If you have a cluster of 800+ 
nodes, it’s more reliable to run a bunch of little collectors that get those tiny 
metrics, rather than a few bigger stateful set pods because your blast radius is 
much lower," he says. 

"If one pod goes down, you lose just a tiny bit of data, but remember, with all 
this cardinality stuff, that’s a lot of memory. So if you’re doing a StatefulSet, 
scraping all these nodes, that’s a lot of targets, that’s a lot of memory, it 
can go down much more easily and you can lose more data." 

If a Collector goes down, it comes back up quickly, since it is stateless, which 
means "usually the blip is low," says Jacob. However, if you're past the point of 
saturation, the blip "is more flappy, where it could go up and down pretty 
quickly." Thus, it's a good idea to have a horizontal pod autoscaler, or HPA.

This is useful from a metrics standpoint, but you could also do it for tracing 
using tracing workloads. Since it's all push-based, they are much easier to 
scale on, and you can distribute targets and load-balance. 

"Pull-based is like the reason that Prometheus is so ubiquitous... because it 
makes local development really easy, where you can just scrape your local 
endpoint, that’s what most backend development is anyway," he says. "You can hit 
endpoint A and then hit your metrics endpoint. Then hit endpoint A again and 
then metrics endpoint, and check that, so it’s an easy developer loop. It also 
means you don’t have to reach outside of the network so if you have really 
strict proxy requirements to send data, local dev is much easier for that. That's 
why OTel now has a really good Prometheus exporter, so it can do both." 

### The centralized gateway

There is a centralized gateway in-flight, which is part of the Collector chain 
Jacob mentioned earlier. The effort is centered around [Arrow](https://arrow.apache.org/). 
Lightstep has done some work around improving "the processing speed and ingress 
costs of OTel data by using Apache Arrow, which is a project for columnar-based 
data representations," Jacob explains. 

They are currently doing some proof of implementation to investigate its 
performance, and to confirm that things work as expected. 

### Keeping telemetry up-to-date

Jacob notes that is it important to keep your telemetry up-to-date, since 
library authors and maintainers are always working on new performance features 
and improvements to the software. 

"It makes migration easy as well. Trying to migrate from an early version of 
something to the latest version of something, you miss a lot of breaking changes 
potentially, and you have to be careful of that," he says. 

He recommends using Dependabot, which they use in OTel. OTel packages update in 
lockstep, which means you have to update "a fair amount of packages at once, but 
it does do it all for you, which is nice," he says. However, you should be doing 
this with all your dependencies, as "CVEs happen in the industry constantly. If 
you're not staying up to date with vulnerability fixes then you’re opening 
yourself up to security attacks, which you don’t want. 'Do something about it' 
is my recommendation."

## Final Thoughts

OpenTelemetry is all about community, and we wouldn’t be where we are without
our contributors, maintainers, and users. Sharing stories of how OpenTelemetry
is being implemented in real life is only part of the picture. We value user
feedback, and encourage all of our users to share your experiences with us, so
that we can continue to improve OpenTelemetry. ❣️

If you have a story to share about how you use OpenTelemetry at your
organization, we’d love to hear from you! Ways to share:

- Join the [#otel-endusers channel](/community/end-user/slack-channel/) on the
  [CNCF Community Slack](https://communityinviter.com/apps/cloud-native/cncf)
- Join our monthly
  [End Users Discussion Group calls](/community/end-user/discussion-group/)
- Join our [OTel in Practice sessions](/community/end-user/otel-in-practice/)
- Sign up for one of our
  [monthly interview/feedback sessions](/community/end-user/interviews-feedback/)
- Join the
  [OpenTelemetry group on LinkedIn](https://www.linkedin.com/groups/14081251)
- Share your stories on the
  [OpenTelemetry blog](https://github.com/open-telemetry/opentelemetry.io/blob/main/README.md#submitting-a-blog-post)

Be sure to follow OpenTelemetry on
[Mastodon](https://fosstodon.org/@opentelemetry) and
[Twitter](https://twitter.com/opentelemetry), and share your stories using the
**#OpenTelemetry** hashtag!
