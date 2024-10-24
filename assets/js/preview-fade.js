document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.preview-fade').forEach(container => {
      const button = container.querySelector('.expand-button');
      const buttonText = container.querySelector('.expand-text');

      button.addEventListener('click', () => {
        const isCollapsed = container.dataset.state === 'collapsed';
        container.dataset.state = isCollapsed ? 'expanded' : 'collapsed';
        buttonText.textContent = isCollapsed ? 'Show Less' : 'Show More';
      });
    });
  });