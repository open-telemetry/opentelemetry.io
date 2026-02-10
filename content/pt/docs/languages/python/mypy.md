---
title: Usando o mypy
weight: 120
default_lang_commit: 1a135ec4b7a14bddd14b7d70dbf2986695b7a93d
cSpell:ignore: mypy
---

Se você estiver usando o [_mypy_](https://mypy-lang.org/), será necessário ativar os
[_namespace packages_](https://mypy.readthedocs.io/en/stable/command_line.html#cmdoption-mypy-namespace-packages);
caso contrário, o `mypy` não conseguirá executar corretamente.

Para ativar os _namespace packages_, faça uma das opções a seguir:

Adicione o seguinte conteúdo ao arquivo de configuração do seu projeto:

```toml
[tool.mypy]
namespace_packages = true
```

Ou use uma opção de linha de comando:

```shell
mypy --namespace-packages
```
