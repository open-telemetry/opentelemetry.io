# Documentation Search and Discovery

## Background and description

As the OpenTelemetry documentation has grown to cover multiple languages,
components, and concepts, finding relevant information has become increasingly
challenging. Users often struggle to locate specific content, particularly in
large reference sections like the Semantic Conventions attribute registry.

This project aims to improve the findability and discoverability of
documentation content through enhanced search functionality and better
navigation patterns.

### Current challenges

The current documentation has several discoverability issues:

- **Semantic conventions attribute registry lacks search**: The attribute
  registry is extensive, spanning many namespaces, making it difficult for users
  to find specific attributes without knowing which namespace to look in.
- **General search limitations**: While the site has search functionality, it
  doesn't always surface the most relevant results, particularly for technical
  queries.
- **Navigation challenges**: Users may not know where to look for specific types
  of content, leading to frustration and potential abandonment.
- **Cross-referencing gaps**: Related content is not always well-linked, missing
  opportunities to guide users to relevant information.

**Existing search functionality verified in repository:**

The Registry already has search implemented (`assets/js/registrySearch.js`):

```javascript
// Uses MiniSearch library for fuzzy search
const miniSearchOptions = {
  fields: [
    'title',
    'description',
    '_key',
    'tags',
    'package.name',
    'flags',
    'license',
    'language',
    'registryType',
  ],
  searchOptions: {
    prefix: true,
    boost: { title: 4, tags: 3, description: 2 },
    fuzzy: 0.2,
  },
};
```

**Features:**

- ✅ Full-text search across registry entries
- ✅ Auto-suggest functionality
- ✅ Language filtering dropdown
- ✅ Component type filtering
- ✅ Flags filtering (first-party, third-party, etc.)
- ✅ URL parameter support for shareable searches

**What's missing:**

- ❌ Search for semantic conventions attributes (different from registry)
- ❌ Cross-site search with result categorization
- ❌ "Related content" suggestions on pages
- ❌ Search analytics to identify documentation gaps

If these challenges are not addressed:

- Users will continue to struggle finding the information they need.
- Support burden increases as users ask questions that could be answered by
  existing documentation.
- Adoption may suffer as potential users give up searching for answers.

### Goals, objectives, and requirements

The goal of this project is to:

1. **Add search to semantic conventions registry**: Implement search
   functionality specifically for the attribute registry.
2. **Improve overall site search**: Enhance search relevance and categorization.
3. **Better cross-referencing**: Improve links between related content.
4. **Enhanced navigation**: Add navigation aids like "related pages" sections.

**Motivations for starting now**:

- The semantic conventions documentation continues to grow with new namespaces.
- User feedback consistently highlights difficulty finding specific attributes.
- Better discoverability directly improves the user experience and adoption.

## Deliverables

### Semantic conventions search

- **Attribute registry search**: Search functionality that works across all
  semconv namespaces.
- **Filtering options**: Filter by namespace, stability level, or attribute
  type.
- **Quick lookup**: Fast lookup for known attribute names.

### Site search improvements

- **Search result categorization**: Group results by section (Languages,
  Collector, Concepts, etc.).
- **Search result snippets**: Better context in search results.
- **Search analytics**: Track common searches to identify documentation gaps.

### Navigation enhancements

- **Related content sections**: "See also" or "Related pages" on relevant pages.
- **Improved breadcrumbs**: Clear location indicators throughout the site.
- **Quick navigation**: Jump-to-section functionality for long pages.

## Timeline

- **Month 1**: Research and design search implementation options.
- **Month 2-3**: Implement semantic conventions attribute registry search.
- **Month 4**: Improve overall site search.
- **Month 5**: Add related content sections and navigation improvements.
- **Month 6**: Testing, refinement, and launch.

## Labels

- `docs:CI/infra`
- `sig:semconv`
- `sig:comms`

## Related issues

- [#6569 - Support search over semconv attributes registry](https://github.com/open-telemetry/opentelemetry.io/issues/6569)
  (open) - Primary issue for registry search.

## Project Board

To be created upon project approval.

## SIG Meetings and Other Info

This project will be coordinated through SIG Communications meetings with input
from SIG Semconv.

- **Slack channel**: `#otel-comms`
- **Meeting notes**: To be linked upon project start.
