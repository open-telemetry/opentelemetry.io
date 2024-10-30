document.addEventListener('DOMContentLoaded', function () {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  document.querySelectorAll('.favorite-btn').forEach(function (button) {
    const registryId = button.getAttribute('data-registry-id');

    if (favorites.includes(registryId)) {
      button.innerHTML = '<i class="fa-solid fa-star"></i> Remove from Favorites';
      button.classList.add('btn-success');
      button.classList.remove('btn-outline-primary');
    }

    button.addEventListener('click', function () {
      if (favorites.includes(registryId)) {
        favorites = favorites.filter((id) => id !== registryId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        button.innerHTML =
          '<i class="fa-regular fa-star"></i> Add to favorites';
        button.classList.add('btn-outline-primary');
        button.classList.remove('btn-success');
      } else {
        favorites.push(registryId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        button.innerHTML = '<i class="fa-solid fa-star"></i> Remove from Favorites';
        button.classList.add('btn-success');
        button.classList.remove('btn-outline-primary');
      }
    });
  });
});
