let summaryInclude = 60;
let fuseOptions = {
  shouldSort: true,
  includeMatches: true,
  threshold: 0.1,
  tokenize: true,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    { name: 'title', weight: 0.8 },
    { name: 'description', weight: 0.5 },
    { name: 'tags', weight: 0.3 },
    { name: 'categories', weight: 0.3 }
  ],
};

// Get searchQuery for queryParams
let pathName = window.location.pathname;
let searchQuery = '';
let selectedLanguage = 'all';
let selectedComponent = 'all';

parseUrlParams();

if (pathName.includes('registry')) {
  // Run search or display default body
  if (searchQuery) {
    document.title = searchQuery + ' at ' + document.title;
    document.querySelector('#search-query').value = searchQuery;
    document.querySelector('#default-body').style.display = 'none';
    executeSearch(searchQuery);
  } else {
    let defaultBody = document.querySelector('#default-body');
    if (defaultBody.style.display === 'none') {
      defaultBody.style.display = 'block';
    }
  }

  if (selectedLanguage !== 'all' || selectedComponent !== 'all') {
    if (selectedLanguage !== 'all') {
      document.getElementById('languageDropdown').textContent =
        document.getElementById(
          `language-item-${selectedLanguage}`,
        ).textContent;
    }
    if (selectedComponent !== 'all') {
      document.getElementById('componentDropdown').textContent =
        document.getElementById(
          `component-item-${selectedComponent}`,
        ).textContent;
    }
    updateFilters();
  }
}

// Runs search through Fuse for fuzzy search
function executeSearch(searchQuery) {
  fetch('/ecosystem/registry/index.json')
    .then((res) => res.json())
    .then((json) => {
      let fuse = new Fuse(json, fuseOptions);
      let results = fuse.search(searchQuery);

      if (results.length > 0) {
        populateResults(results);
      } else {
        document.querySelector('#search-results').innerHTML +=
          '<p>No matches found</p>';
      }
    });
}

// Populate the search results and render to the page
function populateResults(results) {
  results.forEach((result, key) => {
    let contents = result.item.description;
    let snippet = '';
    let snippetHighlights = [];

    if (fuseOptions.tokenize) {
      snippetHighlights.push(searchQuery);
    } else {
      result.matches.forEach((match) => {
        if (match.key === 'tags' || match.key === 'categories') {
          snippetHighlights.push(match.value);
        } else if (match.key === 'description') {
          start =
            match.indices[0][0] - summaryInclude > 0
              ? match.indices[0][0] - summaryInclude
              : 0;
          end =
            match.indices[0][1] + summaryInclude < contents.length
              ? match.indices[0][1] + summaryInclude
              : contents.length;
          snippet += contents.substring(start, end);
          snippetHighlights.push(
            match.value.substring(
              match.indices[0][0],
              match.indices[0][1] - mvalue.indices[0][0] + 1,
            ),
          );
        }
      });
    }

    if (snippet.length < 1 && contents.length > 0) {
      snippet += contents.substring(0, summaryInclude * 2);
    }

    // fetch existing entry and copy to search results
    let output = document.querySelector(
      `[data-registry-id="${result.item._key}"]`,
    ).outerHTML;
    document.querySelector('#search-results').innerHTML += output;
  });
}

if (pathName.includes('registry')) {
  document.addEventListener('DOMContentLoaded', (event) => {
    let languageList = document
      .getElementById('languageFilter')
      .querySelectorAll('.dropdown-item');
    let typeList = document
      .getElementById('componentFilter')
      .querySelectorAll('.dropdown-item');
    languageList.forEach((element) =>
      element.addEventListener('click', function (evt) {
        let val = evt.target.getAttribute('value');
        selectedLanguage = val;
        document.getElementById('languageDropdown').textContent =
          evt.target.textContent;
        setInput('language', val);
        updateFilters();
      }),
    );
    typeList.forEach((element) =>
      element.addEventListener('click', function (evt) {
        let val = evt.target.getAttribute('value');
        selectedComponent = val;
        document.getElementById('componentDropdown').textContent =
          evt.target.textContent;
        setInput('component', val);
        updateFilters();
      }),
    );
  });
}

function setInput(key, value) {
  document.getElementById(`input-${key}`).value = value;
  var queryParams = new URLSearchParams(window.location.search);
  queryParams.set(key, value);
  history.replaceState(null, null, '?' + queryParams.toString());
}

// Filters items based on language and component filters
function updateFilters() {
  let allItems = [...document.getElementsByClassName('registry-entry')];
  if (selectedComponent === 'all' && selectedLanguage === 'all') {
    allItems.forEach((element) => element.classList.remove('d-none'));
  } else {
    allItems.forEach((element) => {
      const dc = element.dataset.registrytype;
      const dl = element.dataset.registrylanguage;
      if (
        (dc === selectedComponent || selectedComponent === 'all') &&
        (dl === selectedLanguage || selectedLanguage === 'all')
      ) {
        element.classList.remove('d-none');
      } else if (dc === selectedComponent && dl !== selectedLanguage) {
        element.classList.add('d-none');
      } else if (dl === selectedLanguage && dc !== selectedComponent) {
        element.classList.add('d-none');
      } else {
        element.classList.add('d-none');
      }
    });
  }
}

function parseUrlParams() {
  let urlParams = new URLSearchParams(window.location.search);
  searchQuery = urlParams.get('s');
  selectedLanguage = urlParams.get('language') || 'all';
  selectedComponent = urlParams.get('component') || 'all';
}
