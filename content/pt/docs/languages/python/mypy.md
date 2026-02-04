---
title: Usando o mypy
weight: 120
cSpell:ignore: mypy
default_lang_commit: 1a135ec4b7a14bddd14b7d70dbf2986695b7a93d
---

Se você estiver usando o [mypy](https://mypy-lang.org/), precisará ativar os
[namespace packages](https://mypy.readthedocs.io/en/stable/command_line.html#cmdoption-mypy-namespace-packages),
caso contrário o `mypy` não conseguirá executar corretamente.

Para ativar os _namespace packages_, faça uma das seguintes opções:

Adicione o seguinte ao arquivo de configuração do seu projeto:

```toml
[tool.mypy]
namespace_packages = true
```

Ou use uma opção de linha de comando:

```shell
mypy --namespace-packages
```
