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
  storeFields: ['title', '_key'],
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
let selectedTag = 'all';

parseUrlParams();

if (pathName.includes('registry')) {
  // Run search or display default body
  if (searchQuery) {
    alert("Executing initial search with query: " + searchQuery);
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
    applyFilterTag();
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

function applyFilterTag() {
  document.querySelectorAll('[data-filter-value]').forEach((element) => {
    element.addEventListener('click', (evt) => {
      selectedTag = evt.target.getAttribute('data-filter-value');

      executeSearch(selectedTag);
      parseUrlParams();
    });
  });
}

// Runs search through Fuse for fuzzy search
function executeSearch(searchQuery) {
  if (searchQuery === '' && selectedTag === 'all') {
    showBody();
    return;
  }

  document.title = searchQuery + ' at ' + originalDocumentTitle;
// update the input field if the search query is coming from the user input
  if (searchQuery !== selectedTag) {
    document.querySelector('#input-s').value = searchQuery;
  }


  document.querySelector('#default-body').style.display = 'none';
  document.querySelector('#search-results').innerHTML = '';
  document.getElementById('search-loading').style.display = 'block';


  const runSearch = function (searchQuery) {
    // The 0-timeout is here if search is blocking, such that the "search loading" is rendered properly
    setTimeout(() => {
      // Perform search with filters based on language, component, and selected tag
      let results = miniSearch.search(searchQuery, {
        filter: (result) => {
          const tagMatch = selectedTag === 'all' || (result.flags && result.flags.includes(selectedTag));
          const languageMatch = selectedLanguage === 'all' || result.language === selectedLanguage;
          const componentMatch = selectedComponent === 'all' || result.registryType === selectedComponent;

          return tagMatch && languageMatch && componentMatch;
        }
      });

      document.getElementById('search-loading').style.display = 'none';

      if (results.length > 0) {
        populateResults(results);
      } else {
        document.querySelector('#search-results').innerHTML += '<p>No matches found</p>';
      }
    }, 0);
  };

  if (fetched) {
    runSearch(searchQuery);
  } else {
    fetch('/ecosystem/registry/index.json')
      .then((res) => res.json())
      .then((json) => {
        fetched = true;
        miniSearch.addAll(json);
        runSearch(searchQuery);
      })
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
  // Clear previous search results before populating new results
  document.querySelector('#search-results').innerHTML = '';

  // Filter results based on the selected filter tag before populating
  const filteredResults = results.filter(result => {
    return selectedTag === 'all' || (result.flags && result.flags.includes(selectedTag));
  });

  // Populate results
  if (filteredResults.length > 0) {
    document.querySelector('#search-results').innerHTML += filteredResults.reduce((acc, result) => {
      // Find the corresponding registry entry by _key and append its outerHTML
      const registryElement = document.querySelector(`[data-registry-id="${result._key}"]`);
      return acc + (registryElement ? registryElement.outerHTML : '');
    }, '');
  } else {
    document.querySelector('#search-results').innerHTML += '<p>No matches found for the selected filter tag.</p>';
  }

  applyFilterTag();
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
  if (selectedComponent === 'all' && selectedLanguage === 'all' && selectedTag === 'all') {
    allItems.forEach((element) => element.classList.remove('d-none'));
  } else {
    allItems.forEach((element) => {
      const dc = element.dataset.registrytype;
      const dl = element.dataset.registrylanguage;
      const flags = element.dataset.flags ? element.dataset.flags.split(' ') : [];

      const matchesComponent = (dc === selectedComponent || selectedComponent === 'all');
      const matchesLanguage = (dl === selectedLanguage || selectedLanguage === 'all');
      const matchesTag = (selectedTag === 'all' || flags.includes(selectedTag));

      if (matchesComponent && matchesLanguage && matchesTag) {
        element.classList.remove('d-none');
      } else {
        element.classList.add('d-none');
      }
    });
  }
}

function parseUrlParams() {
  let urlParams = new URLSearchParams(window.location.search);
  searchQuery = urlParams.get('s') || '';
  selectedLanguage = urlParams.get('language') || 'all';
  selectedComponent = urlParams.get('component') || 'all';
  selectedTag = urlParams.get('flag') || 'all';
}
