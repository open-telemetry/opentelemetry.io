{{ with site.GetPage "announcements" -}}
{{ range .RegularPages -}}

{{ $title := .Title | strings.TrimSpace | replaceRE "\n" " " -}}
{{ $body := .RenderShortcodes |
    strings.TrimSpace |
    replaceRE `(utm_content)=[-\w]+` "$1=community-events" |
    replaceRE "(?m)^" "> " -}}

> [!NOTE] {{ $title }}
>
{{ $body | safeHTML }}

{{ end -}}
{{ end -}}
