---
default_lang_commit: e35c8a3652c3c937a1323822c85f7db2fc6862fb
drifted_from_default: true
---

<i class="fa-solid fa-triangle-exclamation" style="margin-left: -1.9rem; padding-right: 0.5rem;"></i>
O conteúdo desta página pode estar <b>desatualizado</b> e alguns links podem ser
inválidos.

{{ if $show_details }}

Uma <b>versão mais recente</b> desta página existe em
<a href="{{$default_lang_page_url}}">Inglês</a>.

<details class="mt-2">
  <summary>Mais informações ...</summary>
  <p>
    Para visualizar as alterações na página em inglês desde a última atualização: visite
    <a href="{{$compare_url}}" class="external-link" target="_blank" rel="noopener" data-proofer-ignore>
      GitHub compare {{$default_lang_commit_short}}..{{$default_lang_hash_short}}
    </a>
    e procure por <code>{{$def_lang_path}}</code>.
  </p>
</details>
{{ end }}

{{ if $no_default_lang_page }}

Esta página não possui uma página correspondente em inglês.

{{ end }}
