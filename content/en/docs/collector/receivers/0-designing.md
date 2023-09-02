---
title: Designing a receiver
---

As with all tasks, the first step is to figure out what you want to build.

# Specify your requirements

First, you should think about how your requirements will shape the receiver you
want to build.  We'll dive into some common questions in each below section to help you determine
your requirements in an opentelemetry context.


## Signals: Traces, Metrics, Logs, or a combination thereof?

(See existing documentation for what each of these are. See existing guide for a tracing receiver)

- Are you trying to track the detailed call behavior of your functions?  You may wish to implement a trace receiver.
- Are you trying to monitor the health of your system for use in autoscaling or operational excellence?  You may wish to implement a metric receiver.
- Are you trying to capture information at a higher, less structured level? You may wish to implement a log receiver.

In general, traces will have the most coupling and integration to the monitored resource, metrics are a less coupled but still concretely structured, while logs require the least integration.

## When to receive
All signal consumers can be used in either a scraping (pull) or serving (push) receiver. 

When deciding on which to implement, consider

- How much information do you wish to ingest?
- How frequently does each observable change?
- Are you okay with missing intermediate observations in systems which lack full-fidelity or delta signal granularity?
- What proportion of observables change every second, minute, hour? 
- How critical is latency between an observable changing and you acting upon it?
- Can you modify the resource to send metrics external to itself?  How hard would it be to do so?

If you need low latency between observables, or if the data changes frequently and you cannot miss intermediate values, you may want a serving-style receiver.
If you cannot modify the code of the resource, or if you have a lot of frequently changing data but only need to sample signals instead of receiving every intermediate value, you may want a scraping-style receiver.

If your paradigm is more "data-flow" or "stream" programming, you may want a serving-style receiver.
If your paradigm is more like an "ETL" or "snapshot", you may want a scraping-style receiver.


- `Scraper`: [redisreceiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/redisreceiver)
- `Listener`: [statsd](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/statsdreceiver)



# Data model
### [Semantic conventions](https://github.com/open-telemetry/semantic-conventions)

As of March 2023, the ability to do metric translation and any "view layer"
changes in opentelemetry is still being developed. Consumers of opentelemetry
metrics often use them for dashboarding, alarming, and analytics, so any change,
divergence, or duplication in the meaning of a metric has a rather large blast
radius. Thus, care should be taken to ensure your namings and intents are both
semantically meaningful and complement the offerings from the rest of the
opentelemetry ecosystem.

If you wish to follow best practices, and increase the usability and compatibility
of your receiver, take a look at the [semantic conventions](https://github.com/open-telemetry/semantic-conventions)
to see if there is any prior art which exists. While most receivers are still
converging to these conventions, in the future we plan to be more strict about
adherence prior to acceptance. While you can always target a beta or alpha
release of your receiver, getting the ball rolling on semantic conventions is
wise, especially given how arduous it can be to gather consensus in a
distributed open-source project, of which opentelemetry is.


## Attributes

## Signals
