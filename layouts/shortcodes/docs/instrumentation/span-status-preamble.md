A [Status](/docs/concepts/signals/traces/#span-status) can be set on a
[Span](/docs/concepts/signals/traces/#spans), typically used to specify that a
Span has not completed successfully - `ERROR`. In rare scenarios, you could
override the Error status with `OK`, but don’t set `OK` on
successfully-completed spans.

The status can be set at any time before the span is finished.
