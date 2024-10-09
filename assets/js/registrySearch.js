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


// Initialize pagination
let currentPage = 1;
let resultsPerPage = 20;
const results = document.querySelectorAll('#default-body li');
let totalPages = Math.ceil(results.length / resultsPerPage);
const pagesToShow = 5;

console.log("Results Length:", results.length);
console.log("Current Page:", currentPage);
console.log("Total Pages:", totalPages);

// Function to update total pages and re-render based on resultsPerPage
function updateTotalPages() {
  totalPages = Math.ceil(results.length / resultsPerPage);
  if (totalPages === 0) totalPages = 1;
  showPage(currentPage);

}

// Function to display results for the current page
function showPage(page) {
  if (page < 1 || page > totalPages) {
    document.getElementById('page-error').textContent = 'Page not found';
    return;
  }

  // Hide all results and clear any error message
  results.forEach((result) => result.style.display = 'none');
  document.getElementById('page-error').textContent = '';

  // Show only the results for the current page
  const start = (page - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  for (let i = start; i < end; i++) {
    if (results[i]) {
      results[i].style.display = 'block';
    }
  }


  // Update pagination buttons
  updateVisiblePages(page);
  // Disable/enable prev/next buttons
  document.getElementById('prev-page').disabled = page === 1;
  document.getElementById('next-page').disabled = page === totalPages;

  // Update total entries displayed
  document.getElementById('pagination-numbers').textContent = `Page ${page} of ${totalPages}`;
}

// Function to update visible pages in pagination
// Function to update visible pages in pagination
function updateVisiblePages(currentPage) {
  const paginationNumbers = document.getElementById('pagination-numbers');
  paginationNumbers.innerHTML = ''; // Clear the current page numbers

  const pagesToShow = 5; // Number of pages to display at a time
  let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2)); // Calculate start page
  let endPage = Math.min(totalPages, startPage + pagesToShow - 1); // Calculate end page

  // Adjust the start and end page to maintain 5 pages if we're at the start or end
  if (endPage - startPage < pagesToShow - 1) {
    startPage = Math.max(1, endPage - pagesToShow + 1);
  }

  // Loop through the calculated page range and create buttons
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.classList.add('btn', 'btn-outline-secondary', 'mx-1');

    // Add a click event listener to navigate to the clicked page
    pageButton.addEventListener('click', () => {
      currentPage = i;
      showPage(currentPage);
    });

    // Highlight the current page button
    if (i === currentPage) {
      pageButton.classList.add('active');
    }

    paginationNumbers.appendChild(pageButton);
  }
}



// Add event listeners for pagination buttons
document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    showPage(currentPage);
  }
});

document.getElementById('next-page').addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    showPage(currentPage);
  }
});

// Function to handle "Go to Page" input
function goToPage() {
  const pageInput = document.getElementById('page-input').value;
  const page = parseInt(pageInput);
  if (!isNaN(page) && page >= 1 && page <= totalPages) {
    currentPage = page;
    showPage(currentPage);
  } else {
    document.getElementById('page-error').textContent = 'Invalid page number';
  }
}


function updateCurrentPageDisplay(currentPage, totalPages) {
  const pageDisplay = document.getElementById('page-display');
  pageDisplay.textContent = `Page ${currentPage} of ${totalPages}`;
}
// Function to handle results per page selection
function changeResultsPerPage() {
  const selectedValue = document.getElementById('results-per-page').value;
  resultsPerPage = parseInt(selectedValue);
  currentPage = 1;
  updateTotalPages();
}

// Event listeners for previous/next buttons
document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    showPage(currentPage);
  }
});

document.getElementById('next-page').addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    showPage(currentPage);
  }
});

// Initialize and show first page
updateTotalPages();
showPage(currentPage);


