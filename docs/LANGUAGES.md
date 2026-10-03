# Interface languages

OpenDots supports English and Russian. Open **Settings & setup → Interface language** to switch. The choice applies immediately and stays in the current browser (`opendots.locale` in local storage). On first use, Russian browser locales choose Russian; other locales choose English. A blocked storage still allows switching for the current session. Other tabs on the same origin follow saved changes.

This controls application labels, controls, editor block commands, dates and page counts. User-created names, page contents, conversation messages, provider output, technical environment-variable names and keyboard key values are preserved. Model responses use the model's instructions and the language of your request.

## Maintaining translations

- English interface text is the message key and fallback in `src/client/i18n.ts`.
- Russian messages are in `src/client/locales/ru.ts`. Keep `{placeholder}` names identical.
- In a component, subscribe with `useLocale()` and render interface text through `t()`. Translate user-independent labels only, never state identifiers or arbitrary document text.
- Keep API/state identifiers in English. Translate their displayed labels at render time.
- Use `formatDate()` for dates and `pageCount()` for Russian plural forms.
- New upstream messages without translations remain readable in English.

The fork retains upstream Git history; updates are ordinary merges from `CopilotKit/OpenDots`. Resolve source conflicts deliberately rather than regenerating or overwriting a whole translated file. Run `npm run typecheck`, `npm test`, `npm run lint` and `npm run build` after merging.
