// Define jsAnnouncement object with initialization and utility methods
window.jsAnnouncement = {
  init: function($section) {
    // Initialize Flickity slider
    const $AnnounceSlider = $section.querySelector('[data-flickity]');
    
    if (!$AnnounceSlider) {
      console.warn('Slideshow slider not found in section', $section);
      return;
    }

    // Destroy existing Flickity instance if it exists
    if ($section.flickityInstance) {
      this.unload($section); // Ensure existing instance is properly cleaned up
    }

    let sliderOptions;
    try {
      sliderOptions = JSON.parse($AnnounceSlider.getAttribute('data-flickity'));
    } catch (error) {
      console.error('Failed to parse Flickity options:', error);
      return;
    }

    const flkty = new Flickity($AnnounceSlider, sliderOptions);

    // Resize Flickity when the slider is settled
    flkty.on('settle', function() {
      flkty.resize();
    });

    // Store Flickity instance for later use
    $section.flickityInstance = flkty;

    // Add flickity-enabled class manually after initialization
    $AnnounceSlider.classList.add('flickity-enabled');
    console.log('Flickity initialized for section:', $section);
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
  },

  unload: function($section) {
    // Destroy Flickity instance and remove event listeners
    if ($section.flickityInstance) {
      $section.flickityInstance.destroy();
      delete $section.flickityInstance;

      // Remove flickity-enabled class when instance is destroyed
      const $AnnounceSlider = $section.querySelector('[data-flickity]');
      if ($AnnounceSlider) {
        $AnnounceSlider.classList.remove('flickity-enabled');
      }

      console.log('Flickity instance destroyed for section:', $section);
    }
  },
};

// Function to initialize Flickity for all relevant sections
function initializeAllSliders() {
  const SlideshowSections = document.querySelectorAll('.announcement_bar');
  SlideshowSections.forEach(section => {
    window.jsAnnouncement.init(section);
  });
}

// Function to observe DOM changes and initialize Flickity for new sections
function observeDOMChanges() {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
        mutation.removedNodes.forEach(function(node) {
          if (node.nodeType === 1 && node.classList.contains('announcement_bar')) {
            window.jsAnnouncement.unload(node);
          }
        });
      }
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
  if (section.classList.contains('announcement_bar')) {
    setTimeout(() => window.jsAnnouncement.init(section), 100); // Add a delay
  }
});

document.addEventListener('shopify:section:unload', function(event) {
  const section = event.target;
  if (section.classList.contains('announcement_bar')) {
    window.jsAnnouncement.unload(section);
  }
});

document.addEventListener('shopify:section:select', function(event) {
  const section = event.target;
  if (section.classList.contains('announcement_bar')) {
    const blockId = section.dataset.id;
    window.jsAnnouncement.blockSelect(section, blockId);
  }
});

document.addEventListener('shopify:block:select', function(event) {
  const section = event.target.closest('.announcement_bar');
  if (section) {
    const blockId = event.detail.blockId;
    window.jsAnnouncement.blockSelect(section, blockId);
  }
});

document.addEventListener('shopify:block:deselect', function(event) {
  const section = event.target.closest('.announcement_bar');
  if (section) {
    const blockId = event.detail.blockId;
    window.jsAnnouncement.blockSelect(section, blockId);
  }
});

// Trigger a resize event once the window is loaded to refresh the Flickity slider
window.onload = function() {
  window.dispatchEvent(new Event('resize'));
};
