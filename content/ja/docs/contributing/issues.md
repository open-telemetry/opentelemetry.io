---
title: イシュー
description: 既存イシューの修正方法、またはバグ、セキュリティ、潜在的な改善の報告方法
weight: 10
_issues: https://github.com/open-telemetry/opentelemetry.io/issues
_issue: https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A
default_lang_commit: 8eda3ad35e6fbeea601a033023f694c8750fd1b9
---

<style>
  /* Force all list to be compact. */
  li > p {
    margin-bottom: 0;
  }

  /* Style "first time" alert */
  .alert--first-timer {
    margin: 0.5rem 0 !important;

    > blockquote {
      margin-top: 1rem;
      margin-bottom: 0;
      border-left-color: var(--bs-warning);
      background-color: var(--bs-danger-bg-subtle);
      > *:last-child {
        margin-bottom: 0;
      }
    }
  }
</style>

## 既存のイシューの修正 {#fixing-an-existing-issue}

OTel を改善するための最も良い方法の 1 つは、既存のイシューを修正することです。

1. [issues]({{% param _issues %}}) のリストを参照してください。
2. 作業したいイシューを選択してください。短時間で修正できるものが理想です。

   <a name="first-issue"></a>
   {{% alert title="最初のコントリビュートですか？" color="primary alert--first-timer" %}}

   以下のラベルのイシューを選択してください。
   - [Good first issue](<{{% param _issue %}}%22good+first+issue%22>)
   - [Help wanted](<{{% param _issue %}}%3A%22help+wanted%22>)

   > **NOTE**: メンターシップやオンボーディングプロセスの一部でない限り、私たちは、[OpenTelemetry organization][org] にまだコントリビュートしたことがない人に**イシューをアサインしません**。
   >
   > [org]: https://github.com/open-telemetry

   {{% /alert %}}

3. イシューにコメントがある場合、内容を読んでください。
4. このイシューがまだ関係あるかをメンテナーに尋ね、明らかにしたい質問がある場合はイシューにコメントを投稿して質問してください。
5. この旨のコメントを追加して、問題に取り組む意向を共有してください。
6. イシューの修正に取り組みましょう。問題が発生した場合は、メンテナーに知らせてください。
7. 準備ができれば、[プルリクエストを通じてあなたの作業を提出してください](../pull-requests)。

## イシューの報告 {#reporting-an-issue}

エラーに気が付いたり既存の内容に改善を提案したい場合は、イシューを開いてください。

1. 任意のドキュメントの**ドキュメントのissueを作成**のリンクをクリックしてください。これにより、ヘッダーがあらかじめ入力された GitHub のイシューページにリダイレクトされます。
2. 問題点または改善の提案を説明してください。できるだけ多くの詳細を提供してください。
3. **作成** をクリックしてください。

提出した後に、あなたのイシューを時々確認するか、GitHub の通知をオンにしてください。
メンテナーと承認者が反応するまで、数日かかる場合があります。
レビュアーやほかのコミュニティメンバーがイシューに対処する前に質問する場合があります。

## 新しいコンテンツや機能の提案 {#suggesting-new-content-or-features}

新しいコンテンツや機能のアイデアを持っているが、どこに配置すべきかわからない場合、イシューに提出できます。
バグとセキュリティの脆弱性も同様に報告できます。

1. [GitHub](https://github.com/open-telemetry/opentelemetry.io/issues/new/) に行って **Issues** タブ内の **New issue** を選択してください。
2. 要望または疑問に最も適したイシューの種類を選択してください。
3. テンプレートに入力してください。
4. イシューを提出してください。

### 優れたイシューの作成方法 {#how-to-file-great-issues}

イシューを作成する際には、以下の点に注意してください。

- 明確な説明を提供してください。何が欠けていて、古くなっていて、間違っていて改善を必要としているのか説明してください。
- ユーザーへの具体的な影響を説明してください。
- イシューの範囲は合理的な範囲に制限してください。問題の範囲が大きい場合は、小さなイシューに分割してください。たとえば、「セキュリティドキュメントを修正する」は広すぎますが、「『ネットワークアクセスの制限』のトピックに詳細を追加する」は具体的で実行しやすいです。
- 新しいイシューに関連していて似たようなイシューが存在していないか探してください。
- 新しいイシューがほかのイシューやプルリクエストに関連している場合は、該当する URL 全文を記載するか、`#` をつけてイシュー番号やプルリクエスト番号を記述してください。たとえば、`Introduced by #987654` です。
- [Code of Conduct](https://github.com/open-telemetry/community/blob/main/code-of-conduct.md) に従ってください。ほかのコントリビューターを尊重しましょう。「このドキュメントはひどい」のような発言は、有益でも礼儀正しくもありません。
