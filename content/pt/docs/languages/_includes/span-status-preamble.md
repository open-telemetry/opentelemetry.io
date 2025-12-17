---
default_lang_commit: c651bbf2a61f1ea643ae1d2ae89d496c58dbb56d
---

Um [estado](/docs/concepts/signals/traces/#span-status) pode ser definido em um
[Trecho](/docs/concepts/signals/traces/#spans), sendo tipicamente utilizado para
indicar que um Trecho não foi concluído com sucesso - `Error`. Por padrão, todos
os trechos possuem estado `Unset`, o que significa que o trecho foi concluído
sem erros. O estado `Ok` é reservado para quando você precisa definir
explicitamente um trecho como bem-sucedido, em vez de manter o padrão `Unset`
(ou seja, "sem erro").

O estado pode ser definido a qualquer momento antes que o trecho seja
finalizado.
