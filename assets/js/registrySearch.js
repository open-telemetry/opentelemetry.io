const miniSearchOptions = {
  fields: [
    'title',
    'description',
    '_key',
    'tags',
    'package.name',
    'license',
    'language',
    'registryType',
  ], // fields to index for full-text search
  storeFields: ['title', '_key'], // fields to return with search results
  extractField: (document, fieldName) => {
    if (Array.isArray(document[fieldName])) {
      return document[fieldName].join(' ');
    }
    return fieldName.split('.').reduce((doc, key) => doc && doc[key], document);
  },
  searchOptions: {
    prefix: true,
    boost: {
      title: 4,
      tags: 3,
      description: 2,
    },
    fuzzy: 0.2,
  },
};

const originalDocumentTitle = document.title;

let fetched = false;
const miniSearch = new MiniSearch(miniSearchOptions);

// Get searchQuery for queryParams
let pathName = window.location.pathname;
let searchQuery = '';
let selectedLanguage = 'all';
let selectedComponent = 'all';

parseUrlParams();

if (pathName.includes('registry')) {
  // Run search or display default body
  if (searchQuery) {
    executeSearch(searchQuery);
  } else {
    showBody();
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

  document.addEventListener('DOMContentLoaded', (event) => {
    let searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', function (evt) {
      evt.preventDefault();
      let val = document.getElementById('input-s').value;
      setInput('s', val);
      parseUrlParams();
      executeSearch(searchQuery);
    });

    let searchInput = document.getElementById('input-s');
    searchInput.addEventListener('keyup', function (evt) {
      autoSuggest(evt.target.value);
    });

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

function showBody() {
  document.title = originalDocumentTitle;
  document.querySelector('#search-results').innerHTML = '';
  let defaultBody = document.querySelector('#default-body');
  if (defaultBody.style.display === 'none') {
    defaultBody.style.display = 'block';
  }
}

// Runs search through Fuse for fuzzy search
function executeSearch(searchQuery) {
  if (searchQuery === '') {
    showBody();
    return;
  }

  document.title = searchQuery + ' at ' + originalDocumentTitle;
  document.querySelector('#input-s').value = searchQuery;
  document.querySelector('#default-body').style.display = 'none';
  document.querySelector('#search-results').innerHTML = '';
  document.getElementById('search-loading').style.display = 'block';

  const run = function (searchQuery) {
    // The 0-timeout is here if search is blocking, such that the "search loading" is rendered properly
    setTimeout(() => {
      let results = miniSearch.search(searchQuery);
      document.getElementById('search-loading').style.display = 'none';

      if (results.length > 0) {
        populateResults(results);
      } else {
        document.querySelector('#search-results').innerHTML +=
          '<p>No matches found</p>';
      }
    }, 0);
  };

  if (fetched) {
    run(searchQuery);
  } else {
    fetch('/ecosystem/registry/index.json')
      .then((res) => res.json())
      .then((json) => {
        fetched = true;
        miniSearch.addAll(json);
        run(searchQuery);
      });
  }
}

function autoSuggest(value) {
  if (value === '') {
    return;
  }

  const run = function (value) {
    const suggestions = miniSearch.autoSuggest(value, {
      // we only use title, otherwise we get strange suggestions, especially with description
      fields: ['title'],
    });
    const list = document.getElementById('search-suggestions');
    list.innerHTML = suggestions
      .map(({ suggestion }) => `<option>${suggestion}</option>`)
      .join('');
  };

  if (fetched) {
    run(value);
  } else {
    fetch('/ecosystem/registry/index.json')
      .then((res) => res.json())
      .then((json) => {
        fetched = true;
        miniSearch.addAll(json);
        run(value);
      });
  }
}

// Populate the search results and render to the page
function populateResults(results) {
  document.querySelector('#search-results').innerHTML += results.reduce(
    (acc, result) => {
      return (
        acc +
        document.querySelector(`[data-registry-id="${result._key}"]`).outerHTML
      );
    },
    '',
  );
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
