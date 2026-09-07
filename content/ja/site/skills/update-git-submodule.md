---
title: git サブモジュールの更新
description: >-
  リポジトリの1つ以上の git サブモジュールをターゲットバージョンに更新する方法。
default_lang_commit: d5226a763e8d2f8a04ad16927d4e5961686a3b5e
cSpell:ignore: gitlink
---

各サブモジュールは [.gitmodules][] 内の `*-pin` フィールドを介してタグまたはコミットに固定されています。
以下のプロセスに従って、1つ以上のサブモジュールをターゲットバージョンに更新してください。

## 引数 {#arguments}

1. 更新する1つ以上のサブモジュール（パスまたは名前）。
   更新可能なサブモジュールは [.gitmodules][] で宣言されており、以下が含まれます。
   - `themes/docsy`、Docsy テーマ
   - `content-modules/*`、OpenTelemetry サブモジュール

2. ターゲットバージョン指定子（各サブモジュールまたはすべてに対して）：
   - 特定のタグまたはコミット
   - 最新のタグ付きリリースの場合は `latest`
   - デフォルトブランチの先頭の場合は `HEAD`

## プロセス {#process}

1. `npm run update:submodule` を実行します。

   > タグを取得し、各サブモジュールをリモートのデフォルトブランチの先頭に切り替えます。
   > これにより、次のステップでピン値をローカルに決定できるようになります。

2. 各サブモジュールについて、サブモジュール内から git コマンドを実行し、ターゲットバージョンから新しいピン値を決定します。
   - **特定のタグまたはコミット**: そのまま使用しますが、`git rev-parse --verify <tag-or-commit>` で存在を検証してください。
     有効な場合、対応する SHA が出力されます。

     > 有効なタグの一覧を確認するには、`git tag --list` を実行してください。

   - **最新リリース**: `git describe --tags --abbrev=0`
   - **HEAD**: `HEAD` の SHA[^sha]

   `HEAD` を含むコミットのピンの場合：
   - [`git describe --tags`][git-describe] `<commit>` が成功した場合、その出力をピンとして使用します。
     これは最も近いリリースを伝えるためです。
     たとえば、`ca090204` ではなく `v1.23.0-11-gca090204` となります。
   - それ以外の場合は、`<commit>` の SHA[^sha] を使用します。

3. [.gitmodules][] 内のサブモジュールの `*-pin` 値を編集します。
4. `npm run pin:submodule` を実行してサブモジュールを新しいピンに切り替え、報告されたリビジョン（`git submodule` でも確認可能）がピンと一致することを確認します。
5. `.gitmodules` とサブモジュールの gitlink への変更をコミットします。
   単一モジュールの更新の場合は「Update `<submodule>` to `<version>`」のようなコミットメッセージを使用し、それ以外の場合は同様のメッセージを使用します。
   ここでコミットしておくことで、次のステップでサブモジュールが以前にコミットされた gitlink にリセットされるのを防ぎます。
6. `npm run prepare` を実行してサブモジュールの依存関係を更新します。
   結果として生じた変更をコミットし、必要に応じて前のコミットにアメンドしてください。

検証：

- 簡易的な検証には、`npm run build` を実行し、エラーや（予期しない）警告なしに成功することを確認します。
- 包括的な検証には、`npm run test` を実行し、エラーなしにパスすることを確認します。

[^sha]: 完全な SHA が必要な場合もありますが、通常は短い SHA で十分です。

[.gitmodules]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.gitmodules
[git-describe]: https://git-scm.com/docs/git-describe
