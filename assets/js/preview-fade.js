// assets/js/preview-fade.js
console.log('Preview fade script loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  
  const previewFades = document.querySelectorAll('.preview-fade');
  console.log('Found preview fades:', previewFades.length);
  
  previewFades.forEach(container => {
    const button = container.querySelector('.expand-button');
    const buttonText = button.querySelector('.expand-text');
    
    if (!button) {
      console.error('Button not found in container:', container);
      return;
    }
    
    if (!buttonText) {
      console.error('Button text element not found in button:', button);
      return;
    }
    
    button.addEventListener('click', () => {
      console.log('Button clicked');
      const currentState = container.getAttribute('data-state');
      const newState = currentState === 'collapsed' ? 'expanded' : 'collapsed';
      console.log('State changing from', currentState, 'to', newState);
      container.setAttribute('data-state', newState);
      buttonText.textContent = newState === 'expanded' ? 'Show Less' : 'Show More';
    });
  });
});