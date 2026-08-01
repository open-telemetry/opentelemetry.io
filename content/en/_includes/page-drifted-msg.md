---
---

<i class="fa-solid fa-triangle-exclamation" style="margin-left: -1.9rem; padding-right: 0.5rem;"></i>
The content of this page may be <b>outdated</b> and some links may be invalid.

{{ if $show_details }}

A <b>newer version</b> of this page exists in
<a href="{{$default_lang_page_url}}">English</a>.

<details class="mt-2">
  <summary>More information ...</summary>
  <p>
    To see the changes to the English page since this page was last updated: visit
    <a href="{{$compare_url}}" class="external-link" target="_blank" rel="noopener" data-proofer-ignore>
      GitHub compare {{$default_lang_commit_short}}..{{$default_lang_hash_short}}
    </a>
    and search for <code>{{$def_lang_path}}</code>.
  </p>
</details>
{{ end }}

{{ if $no_default_lang_page }}

This page no longer has a corresponding English page.

{{ end }}
