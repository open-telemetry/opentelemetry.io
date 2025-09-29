---
title: Introducing the new container log parser for OpenTelemetry Collector
linkTitle: Collector container log parser
date: 2024-05-22
author: '[Christos Markou](https://github.com/ChrsMark) (Elastic)'
cSpell:ignore: Christos containerd filelog Jaglowski kube Markou
---

[Filelog receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver)
is one of the most commonly used components of the
[OpenTelemetry Collector](/docs/collector), as indicated by the most recent
[survey](/blog/2024/otel-collector-survey/#otel-components-usage). According to
the same survey, it's unsurprising that
[Kubernetes is the leading platform for Collector deployment (80.6%)](/blog/2024/otel-collector-survey/#deployment-scale-and-environment).
Based on these two facts, we can realize the importance of seamless log
collection on Kubernetes environments.

Currently, the
[filelog receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.100.0/receiver/filelogreceiver/README.md)
is capable of parsing container logs from Kubernetes Pods, but it requires
[extensive configuration](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/aaa70bde1bf8bf15fc411282468ac6d2d07f772d/charts/opentelemetry-collector/templates/_config.tpl#L206-L282)
to properly parse logs according to various container runtime formats. The
reason is that container logs can come in various known formats depending on the
container runtime, so you need to perform a specific set of operations in order
to properly parse them:

1. Detect the format of the incoming logs at runtime.
2. Parse each format accordingly taking into account its format specific
   characteristics. For example, define if it's JSON or plain text and take into
   account the timestamp format.
3. Extract known metadata relying on predefined patterns.

Such advanced sequence of operations can be handled by chaining the proper
[stanza](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/pkg/stanza)
operators together. The end result is rather complex. This configuration
complexity can be mitigated by using the corresponding
[helm chart preset](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector#configuration-for-kubernetes-container-logs).
However, despite having the preset, it can still be challenging for users to
maintain and troubleshoot such advanced configurations.

The community has raised the issue of
[improving the Kubernetes Logs Collection Experience](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/25251)
in the past. One step towards achieving this would be to provide a simplified
and robust option for parsing container logs without the need for manual
specification or maintenance of the implementation details. With the proposal
and implementation of the new
[container parser](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/31959),
all these implementation details are encapsulated and handled within the
parser's implementation. Adding to this the ability to cover the implementation
with unit tests and various fail-over logic indicates a significant improvement
in container log parsing.

## How container logs look like

First of all let's quickly recall the different container log formats that can
be met out there:

- Docker container logs:

  `{"log":"INFO: This is a docker log line","stream":"stdout","time":"2024-03-30T08:31:20.545192187Z"}`

- cri-o logs:

  `2024-04-13T07:59:37.505201169-05:00 stdout F This is a cri-o log line!`

- Containerd logs:

  `2024-04-22T10:27:25.813799277Z stdout F This is an awesome containerd log line!`

We can notice that cri-o and containerd log formats are quite similar (both
follow the CRI logging format) but with a small difference in the timestamp
format.

To properly handle these 3 different formats you need 3 different routes of
[stanza](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/pkg/stanza)
operators as we can see in the
[container parser operator issue](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/31959).

In addition, the CRI format can provide partial logs which you would like to
combine them into one at first place:

```text
2024-04-06T00:17:10.113242941Z stdout P This is a very very long line th
2024-04-06T00:17:10.113242941Z stdout P at is really, really, long and spa
2024-04-06T00:17:10.113242941Z stdout F ns across multiple log entries
```

Ideally you would like our parser to be capable of automatically detecting the
format at runtime and properly parse the log lines. We will see later that the
container parser will do that for us.

## Attribute handling

Container log files follow a specific naming pattern from which you can extract
useful metadata information during parsing. For example, from
`/var/log/pods/kube-system_kube-scheduler-kind-control-plane_49cc7c1fd3702c40b2686ea7486091d3/kube-scheduler/1.log`,
you can extract the namespace, the name and UID of the pod, and the name of the
container.

After extracting this metadata, you need to store it properly using the
appropriate attributes following the
[Semantic Conventions](/docs/specs/semconv/resource/k8s/). This handling can
also be encapsulated within the parser's implementation, eliminating the need
for users to define it manually.

## Using the new container parser

With all these in mind, the container parser can be configured like this:

```yaml
receivers:
  filelog:
    include_file_path: true
    include:
      - /var/log/pods/*/*/*.log
    operators:
      - id: container-parser
        type: container
```

That configuration is more than enough to properly parse the log line and
extract all the useful Kubernetes metadata. It's quite obvious how much less
configuration is required now. Using a combination of operators would result in
about 69 lines of configuration as it was pointed out at the
[original proposal](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/31959).

A log line
`{"log":"INFO: This is a docker log line","stream":"stdout","time":"2024-03-30T08:31:20.545192187Z"}`
that is written at
`/var/log/pods/kube-system_kube-controller-kind-control-plane_49cc7c1fd3702c40b2686ea7486091d6/kube-controller/1.log`
will produce a log entry like the following:

```json
{
  "timestamp": "2024-03-30 08:31:20.545192187 +0000 UTC",
  "body": "INFO: This is a docker log line",
  "attributes": {
    "time": "2024-03-30T08:31:20.545192187Z",
    "log.iostream": "stdout",
    "log.file.path": "/var/log/pods/kube-system_kube-controller-kind-control-plane_49cc7c1fd3702c40b2686ea7486091d6/kube-controller/1.log"
  },
  "resource": {
    "attributes": {
      "k8s.pod.name": "kube-controller-kind-control-plane",
      "k8s.pod.uid": "49cc7c1fd3702c40b2686ea7486091d6",
      "k8s.container.name": "kube-controller",
      "k8s.container.restart_count": "1",
      "k8s.namespace.name": "kube-system"
    }
  }
}
```

You can notice that you don't have to define the format. The parser
automatically detects the format and parses the logs accordingly. Even partial
logs that cri-o or containerd runtimes can produce will be recombined properly
without the need of any special configuration.

This is really handy, because as a user you don't need to care about specifying
the format and even maintaining different configurations for different
environments.

## Implementation details

In order to implement that parser operator most of the code was written from
scratch, but we were able to re-use the recombine operator internally for the
partial logs parsing. To achieve this, some small refactoring was required but
this gave us the opportunity to re-use an already existent and well tested
component.

During the discussions around the implementation of this feature, a question
popped up: _Why to implement this as an operator and not as a processor?_

One basic reason is that the order of the log records arriving at processors is
not guaranteed. However we need to ensure this, so as to properly handle the
partial log parsing. That's why implementing it as an operator for now was the
way to go. Moreover, at the moment
[it is suggested](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/32080#issuecomment-2035301178)
to do as much work during the collection as possible and having robust parsing
capabilities allows that.

More information about the implementation discussions can be found at the
respective
[GitHub issue](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/31959)
and its related/linked PR.

Last but not least, we should mention that with the example of the specific
container parser we can notice the room for improvement that exists and how we
could optimize further for popular technologies with known log formats in the
future.

## Conclusion: container logs parsing is now easier with filelog receiver

Eager to learn more about the container parser? Visit the official
[documentation](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/container.md)
and if you give it a try let us know what you think. Don't hesitate to reach out
to us in the official CNCF [Slack workspace](https://slack.cncf.io/) and
specifically the `#otel-collector` channel.

## Acknowledgements

Kudos to [Daniel Jaglowski](https://github.com/djaglowski) for reviewing the
parser's implementation and providing valuable feedback!
