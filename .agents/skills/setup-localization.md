# Skill: `setup-localization`

Automate the "New localizations" onboarding process for `opentelemetry.io`.

## Parameters

- `language_name`: The name of the language (e.g., "Hindi").
- `language_code`: ISO 639-1 language code (e.g., "hi").
- `mentor_handle`: GitHub handle of the localization mentor.
- `contributor_handles`: List of GitHub handles for initial contributors.

## Steps

1.  **Prepare Hugo config**:
    - Update `config/_default/hugo.yaml`: Add the new language to the
      `languages` block.
    - Update `config/_default/module-template.yaml`: Add a content mount for the
      new language.
2.  **Setup spelling support**:
    - Check for an available `@cspell/dict-<language_code>` NPM package.
    - If available, install as a dev dependency
      (`npm install --save-dev @cspell/dict-<language_code>`).
    - Create `.cspell/<language_code>-words.txt` for site-local words.
    - Update `.cspell.yml` to import the new dictionary and define the local
      word file.
3.  **Localize homepage**:
    - Create `content/<language_code>/_index.md`.
    - Scaffold the file with basic frontmatter including `title` and
      `description` in the target language.
4.  **Draft initial localization issue**:
    - Use the template from `content/en/docs/contributing/localization.md`
      section "Localization kickoff".
    - Populate fields: Language info, Locale team info, and OTel maintainer
      checklist.
5.  **Verify**:
    - Build the site locally (`npm run build`) to ensure Hugo configuration is
      valid.
    - Run `npm run check:i18n -- content/<language_code>` to check
      synchronization status.
