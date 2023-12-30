let summaryInclude = 60;

let miniSearchOptions = {
  fields: ['title', 'description'], // fields to index for full-text search
  prefix: true,
  boost: { 
    title: 2 
  },
  fuzzy: 0.2
}

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
      let miniSearch = new MiniSearch(miniSearchOptions);
      miniSearch.addAll(json)

      let results = miniSearch.search(searchQuery)

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
  results.forEach((result) => {
    console.log(result)
    // fetch existing entry and copy to search results
    let output = document.querySelector(
      `[data-registry-id="${result._key}"]`,
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
