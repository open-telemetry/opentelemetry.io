# CSpell dictionary files / word lists

Words listed here are only for spelling.

- Add cross-locale/common terms to `all-words.txt`.
- Keep language-specific terms in their locale file (for example,
  `en-words.txt`).
- Generally, if capitalization matters, add capitalization rules in
  `.textlintrc.yml`. If you are sure that a word will only ever appear in a
  specific case, it is ok to add it to a word list.

## Guidelines for maintainers

- Move words that are clearly non-locale specific (such as proper names,
  product/framework names, and OTel ecosystem terms) to `all-words.txt`.
