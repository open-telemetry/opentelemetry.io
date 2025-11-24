---
default_lang_commit: 2f850a610b5f7da5730265b32c25c9226dc09e5f
---

可以在一个 [Span](/docs/concepts/signals/traces/#spans) 上设置一个
[Status](/docs/concepts/signals/traces/#span-status)，通常用于指明某个
Span 没有成功完成 —— 即标记为 `Error`。默认情况下，所有的 Span 状态都是
`Unset`，意味着该操作完成但未明确表示是否出错。
如果你想显式地标记某个操作是成功的，而不是依赖默认的 `Unset`，就可以使用 `Ok` 状态。

状态可以在 Span 结束前的任何时候设置。
