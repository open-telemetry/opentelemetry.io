A [Status](/docs/concepts/signals/traces/#span-status) can be set on a
[Span](/docs/concepts/signals/traces/#spans), typically used to specify that a
Span has not completed successfully - `Error`. By default, all spans are
`Unset`, which means a span completed without error. The `Ok` status is reserved
for when you need to explicitly mark a span as successful rather than stick with
the default of `Unset` (i.e., "without error").

The status can be set at any time before the span is finished.
