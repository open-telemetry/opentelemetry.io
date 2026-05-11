---
title: mypyの使用
weight: 120
default_lang_commit: c3365f297f394baf10f5dba3473e13621ade4461
cSpell:ignore: mypy
---

[mypy](https://mypy-lang.org/) を使用している場合は、[名前空間パッケージ](https://mypy.readthedocs.io/en/stable/command_line.html#cmdoption-mypy-namespace-packages)を有効にする必要があります。
有効にしないと、`mypy` は正しく実行できません。

名前空間パッケージを有効にするには、次のいずれかを行います。

プロジェクト設定ファイルに次の内容を追加します。

```toml
[tool.mypy]
namespace_packages = true
```

または、コマンドラインオプションを使用します。

```shell
mypy --namespace-packages
```
