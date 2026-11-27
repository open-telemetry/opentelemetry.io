{{/* The schedule is rendered in the browser; the Markdown output links the
  feed it is read from. */ -}}
[{{ i18n "meetings_feed" }}]({{ .Get "src" | default (.Page.Param "meetings_calendar") }})
