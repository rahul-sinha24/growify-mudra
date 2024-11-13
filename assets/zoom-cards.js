document.addEventListener('DOMContentLoaded', function() {
  const zoomItems = document.querySelectorAll('.zoom-list__item'); // corrected the querySelectorAll to target the right elements
  const zoomList = document.querySelector('.zoom-list'); // select the parent element

  // Initial scaling setup: Scale the first item to 1.1 and others progressively smaller
  function applyInitialScaling() {
    zoomItems.forEach((item, index) => {
      item.classList.remove('scaled-0', 'scaled-1', 'scaled-2', 'scaled-3', 'scaled-4');
      const scaleClass = 'scaled-' + (Math.min(4, index));
      item.classList.add(scaleClass);
    });
  }

  applyInitialScaling();

  // Hover effect
  zoomItems.forEach(item => {
    item.addEventListener('mouseover', function() {
      zoomItems.forEach(i => i.classList.remove('hovered'));
      this.classList.add('hovered');
      zoomItems.forEach((i, index) => {
        i.classList.remove('scaled-0', 'scaled-1', 'scaled-2', 'scaled-3', 'scaled-4');
        const hoveredIndex = Array.from(zoomItems).indexOf(this);
        const scaleClass = 'scaled-' + (4 - Math.abs(hoveredIndex - index));
        i.classList.add(scaleClass);
      });
      zoomList.classList.add("hovered_added"); // add the class to the parent element
    });

    item.addEventListener('mouseout', function() {
      zoomList.classList.remove("hovered_added"); // remove the class when the mouse is out
    });
  });
});
