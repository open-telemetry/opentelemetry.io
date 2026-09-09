---
default_lang_commit: e76ca67d0f5b6906f7a9c90cde82380fc31e6e85
---

<i class="fa-solid fa-triangle-exclamation" style="margin-left: -1.9rem; padding-right: 0.5rem;"></i>
このページの内容は<b>古くなっている</b>可能性があり、一部のリンクが無効になっている場合があります。

{{ if $show_details }}

このページの<b>より新しいバージョン</b>が
<a href="{{$default_lang_page_url}}">英語版</a>にあります。

<details class="mt-2">
  <summary>詳細情報 ...</summary>
  <p>
    このページが最後に更新されてからの英語ページの変更を確認するには、
    <a href="{{$compare_url}}" class="external-link" target="_blank" rel="noopener" data-proofer-ignore>
      GitHub compare {{$default_lang_commit_short}}..{{$default_lang_hash_short}}
    </a>
    にアクセスし、<code>{{$def_lang_path}}</code> を検索してください。
  </p>
</details>
{{ end }}

{{ if $no_default_lang_page }}

このページに対応する英語ページはもう存在しません。

{{ end }}
