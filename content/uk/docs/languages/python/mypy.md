---
title: Використання mypy
weight: 120
cSpell:ignore: mypy
---

Якщо ви використовуєте [mypy](https://mypy-lang.org/), вам потрібно увімкнути [пакунок простору імен](https://mypy.readthedocs.io/en/stable/command_line.html#cmdoption-mypy-namespace-packages), інакше `mypy` не зможе працювати правильно.

Щоб увімкнути пакунки простору імен, виконайте одну з наступних дій:

Додайте наступне до файлу конфігурації вашого проєкту:

```toml
[tool.mypy]
namespace_packages = true
```

Або використовуйте параметр командного рядка:

```shell
mypy --namespace-packages
```
