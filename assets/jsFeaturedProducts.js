window.jsFeatured = {
    init: function($section) {
      const $FeaturedSlider = $section.querySelector('[data-flickity]');
  
      if (!$FeaturedSlider) {
        console.warn('Slideshow slider not found in section', $section);
        return;
      }
  
      if ($section.flickityInstance) {
        this.unload($section); // Ensure existing instance is properly cleaned up
      }
  
      let sliderOptions;
      try {
        sliderOptions = JSON.parse($FeaturedSlider.getAttribute('data-flickity'));
      } catch (error) {
        console.error('Failed to parse Flickity options:', error);
        return;
      }
  
      const flkty = new Flickity($FeaturedSlider, sliderOptions);
  
      flkty.on('settle', function() {
        flkty.resize();
      });
  
      $section.flickityInstance = flkty;
      $FeaturedSlider.classList.add('flickity-enabled');
      console.log('Flickity initialized for section:', $section);
    },
  
    blockSelect: function($section, forloopIndex) {
      if (!$section.flickityInstance) {
        console.log('Flickity instance not found, initializing...');
        this.init($section);
      }
  
      const slideIndex = parseInt(forloopIndex, 10);
  
      if ($section.flickityInstance) {
        $section.flickityInstance.select(slideIndex);
        console.log('Flickity slide selected:', slideIndex);
      } else {
        console.warn('Flickity instance not found in section', $section);
      }
    },
  
    unload: function($section) {
      if ($section.flickityInstance) {
        $section.flickityInstance.destroy();
        delete $section.flickityInstance;
  
        const $FeaturedSlider = $section.querySelector('[data-flickity]');
        if ($FeaturedSlider) {
          $FeaturedSlider.classList.remove('flickity-enabled');
        }
  
        console.log('Flickity instance destroyed for section:', $section);
      }
    },
  };
  
  function initializeAllSliders() {
    const SlideshowSections = document.querySelectorAll('.featured_product');
    SlideshowSections.forEach(section => {
      window.jsFeatured.init(section);
    });
  }
  
  function observeDOMChanges() {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
          mutation.removedNodes.forEach(function(node) {
            if (node.nodeType === 1 && node.classList.contains('featured_product')) {
              window.jsFeatured.unload(node);
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
  
  document.addEventListener('DOMContentLoaded', function() {
    initializeAllSliders();
    observeDOMChanges();
  });
  
  document.addEventListener('shopify:section:load', function(event) {
    const section = event.target;
    if (section.classList.contains('featured_product')) {
      setTimeout(() => window.jsFeatured.init(section), 100); // Add a delay
    }
  });
  
  document.addEventListener('shopify:section:unload', function(event) {
    const section = event.target;
    if (section.classList.contains('featured_product')) {
      window.jsFeatured.unload(section);
    }
  });
  
  document.addEventListener('shopify:section:select', function(event) {
    const section = event.target;
    if (section.classList.contains('featured_product')) {
      const forloopIndex = section.dataset.featuredIndex;
      window.jsFeatured.blockSelect(section, forloopIndex);
    }
  });
  
  document.addEventListener('shopify:block:select', function(event) {
    const section = event.target.closest('.featured_product');
    if (section) {
      const forloopIndex = event.detail.index;
      window.jsFeatured.blockSelect(section, forloopIndex);
    }
  });
  
  document.addEventListener('shopify:block:deselect', function(event) {
    const section = event.target.closest('.featured_product');
    if (section) {
      const forloopIndex = event.detail.index;
      window.jsFeatured.blockSelect(section, forloopIndex);
    }
  });
  
  window.onload = function() {
    window.dispatchEvent(new Event('resize'));
  };
  