// Define jsSlideshow object with initialization and utility methods
window.jsSlideshow = {
  init: function($section) {
    // Initialize Flickity slider
    const $SlideshowSlider = $section.querySelector('[data-flickity]');

    if (!$SlideshowSlider) {
      console.warn('Slideshow slider not found in section', $section);
      return;
    }

    let sliderOptions;
    try {
      sliderOptions = JSON.parse($SlideshowSlider.getAttribute('data-flickity'));
    } catch (error) {
      console.error('Failed to parse Flickity options:', error);
      return;
    }

    const flkty = new Flickity($SlideshowSlider, sliderOptions);

    // Resize Flickity when the slider is settled
    flkty.on('settle', function() {
      flkty.resize();
    });

    // Store Flickity instance for later use
    $section.flickityInstance = flkty;

    // Add flickity-enabled class manually after initialization
    $SlideshowSlider.classList.add('flickity-enabled');
    console.log('Flickity initialized for section:', $section);
  },

  reinit: function($section) {
    // Destroy existing Flickity instance if it exists
    if ($section.flickityInstance) {
      $section.flickityInstance.destroy();
      delete $section.flickityInstance;

      const $SlideshowSlider = $section.querySelector('[data-flickity]');
      if ($SlideshowSlider) {
        $SlideshowSlider.classList.remove('flickity-enabled');
      }

      console.log('Flickity instance destroyed for reinitialization:', $section);
    }

    // Re-initialize Flickity
    this.init($section);
  },

  blockSelect: function($section, blockId) {
    // Ensure Flickity instance is initialized before selecting a block
    if (!$section.flickityInstance) {
      console.log('Flickity instance not found, initializing...');
      this.init($section);
    }

    // Select a specific slide based on block ID
    const slideIndex = document.querySelector('#shopify-section-' + blockId).dataset.announceIndex;

    if ($section.flickityInstance) {
      $section.flickityInstance.select(slideIndex);
      console.log('Flickity slide selected:', slideIndex);
    } else {
      console.warn('Flickity instance not found in section', $section);
    }
  }
};

// Function to initialize Flickity for all relevant sections
function initializeAllSliders() {
  const SlideshowSections = document.querySelectorAll('.slideshow');
  SlideshowSections.forEach(section => {
    window.jsSlideshow.init(section);
  });
}

// Function to observe DOM changes and initialize Flickity for new sections
function observeDOMChanges() {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1 && node.classList.contains('slideshow')) {
          window.jsSlideshow.init(node);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize SlideshowSections on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  initializeAllSliders();
  observeDOMChanges();
});

// Reinitialize Flickity when Shopify Customizer events occur
document.addEventListener('shopify:section:load', function(event) {
  const section = event.target;
  if (section.classList.contains('slideshow')) {
    setTimeout(() => window.jsSlideshow.init(section), 100); // Add a delay
  }
});

document.addEventListener('shopify:section:unload', function(event) {
  // Do nothing
});

document.addEventListener('shopify:section:select', function(event) {
  const section = event.target;
  if (section.classList.contains('slideshow')) {
    const blockId = section.dataset.id;
    window.jsSlideshow.blockSelect(section, blockId);
  }
});

document.addEventListener('shopify:block:select', function(event) {
  const section = event.target.closest('.slideshow');
  if (section) {
    const blockId = event.detail.blockId;
    window.jsSlideshow.blockSelect(section, blockId);
  }
});

document.addEventListener('shopify:block:deselect', function(event) {
  const section = event.target.closest('.slideshow');
  if (section) {
    const blockId = event.detail.blockId;
    window.jsSlideshow.blockSelect(section, blockId);
  }
});

// Reinitialize Flickity on section setting change
document.addEventListener('shopify:section:select', function(event) {
  const section = event.target;
  if (section.classList.contains('slideshow')) {
    setTimeout(() => window.jsSlideshow.reinit(section), 100); // Add a delay
  }
});

document.addEventListener('shopify:section:load', function(event) {
  const section = event.target;
  if (section.classList.contains('slideshow')) {
    setTimeout(() => window.jsSlideshow.reinit(section), 100); // Add a delay
  }
});

// Trigger a resize event once the window is loaded to refresh the Flickity slider
window.onload = function() {
  window.dispatchEvent(new Event('resize'));
};
