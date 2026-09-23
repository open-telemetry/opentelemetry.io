---
default_lang_commit: 624a5ad2ea3c8f07660370aab626532469f946a3
---

<i class="fa-solid fa-triangle-exclamation" style="margin-left: -1.9rem; padding-right: 0.5rem;"></i>
Дана сторінка може бути <b>застарілою</b> і деякі посилання можуть бути недійсними.

{{ if $show_details }}

<b>Новіша версія</b> цієї сторінки існує
<a href="{{$default_lang_page_url}}">англійською</a>.

<details class="mt-2">
  <summary>Більше інформації …</summary>
  <p>
    Щоб побачити зміни на англійській сторінці з моменту останнього оновлення цієї сторінки: відвідайте
    <a href="{{$compare_url}}" class="external-link" target="_blank" rel="noopener" data-proofer-ignore>
      GitHub compare {{$default_lang_commit_short}}..{{$default_lang_hash_short}}
    </a>
    і шукайте <code>{{$def_lang_path}}</code>.
  </p>
</details>
{{ end }}

{{ if $no_default_lang_page }}

Ця сторінка більше не має відповідної англомовної сторінки.

{{ end }}
