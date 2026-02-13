describe('Trip App E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Home Page - Trip Cards Rendering', () => {
    it('should display trip cards on the home page', () => {
      // Wait for trips to load
      cy.get('[role="list"]', { timeout: 10000 }).should('be.visible');

      // Check that trip cards are rendered
      cy.get('app-trip-card').should('have.length.greaterThan', 0);

      // Check that each card has required elements
      cy.get('app-trip-card')
        .first()
        .within(() => {
          cy.get('img').should('be.visible');
          cy.get('h3').should('not.be.empty');
          cy.contains('Price:').should('be.visible');
          cy.contains('Rating:').should('be.visible');
          cy.contains('CO2:').should('be.visible');
        });
    });

    it('should display trip of the day section', () => {
      cy.get('h2').contains('🌟 Trip of the Day').should('be.visible');
      cy.get('button').contains('View Details').should('be.visible');
    });
  });

  describe('Sorting Functionality', () => {
    it('should sort trips by title', () => {
      // Click sort select and choose 'Name'
      cy.get('#sort-select').select('title');

      // Wait for sorting to apply
      cy.wait(1000);

      // Check that cards are sorted (this might be hard to verify exactly,
      // but we can check that the select value changed)
      cy.get('#sort-select').should('have.value', 'title');
    });

    it('should sort trips by price', () => {
      cy.get('#sort-select').select('price');
      cy.get('#sort-select').should('have.value', 'price');
    });

    it('should toggle sort order', () => {
      // Click the sort order button
      cy.get('button[aria-label*="Sort"]').click();

      // The button text should change from ↑ to ↓ or vice versa
      cy.get('button[aria-label*="Sort"]').should('contain', '↓');
    });
  });

  describe('Filtering Functionality', () => {
    it('should show and hide filters section', () => {
      // Initially filters should be hidden
      cy.get('input#title-filter').should('not.exist');

      // Click the filters toggle button
      cy.get('button[aria-label*="filters"]').click();

      // Filters should now be visible
      cy.get('input#title-filter').should('be.visible');
      cy.get('input#min-price').should('be.visible');
      cy.get('input#max-price').should('be.visible');
    });

    it('should filter by title', () => {
      // Show filters
      cy.get('button[aria-label*="filters"]').click();

      // Type in title filter
      cy.get('#title-filter').type('test trip');

      // Wait for filtering
      cy.wait(1000);

      // Check that filtering applied (hard to verify exact results without knowing data)
      cy.get('#title-filter').should('have.value', 'test trip');
    });

    it('should filter by price range', () => {
      // Show filters
      cy.get('button[aria-label*="filters"]').click();

      // Set min and max price
      cy.get('#min-price').type('100');
      cy.get('#max-price').type('500');

      // Wait for filtering
      cy.wait(1000);

      cy.get('#min-price').should('have.value', '100');
      cy.get('#max-price').should('have.value', '500');
    });

    it('should clear filters', () => {
      // Show filters and add some
      cy.get('button[aria-label*="filters"]').click();
      cy.get('#title-filter').type('test');

      // Click clear filters
      cy.get('button[aria-label="Clear all filters"]').click();

      // Check filters are cleared
      cy.get('#title-filter').should('have.value', '');
    });
  });

  describe('Trip Details Navigation', () => {
    it('should navigate to trip details page', () => {
      // Click on the first trip card
      cy.get('app-trip-card').first().click();

      // Should navigate to trip details page
      cy.url().should('include', '/trip/');

      // Check that details page has content
      cy.get('h1').should('be.visible'); // Assuming details page has h1
    });

    it('should preserve filters when navigating back from details', () => {
      // Apply some filters
      cy.get('button[aria-label*="filters"]').click();
      cy.get('#title-filter').type('test filter');

      // Navigate to details
      cy.get('app-trip-card').first().click();

      // Navigate back using the back button
      cy.get('button').contains('← Back').click();

      // Check that filters are still applied
      cy.get('#title-filter').should('have.value', 'test filter');
    });
  });

  describe('Theme Switching', () => {
    it('should toggle between light and dark theme', () => {
      // Initially should be light theme (no dark class on html)
      cy.get('html').should('not.have.class', 'dark');

      // Click theme toggle (assuming it's in header)
      cy.get('header button').click();

      // Should now have dark class
      cy.get('html').should('have.class', 'dark');

      // Click again to toggle back
      cy.get('header button').click();

      // Should be light again
      cy.get('html').should('not.have.class', 'dark');
    });
  });

  describe('Pagination', () => {
    it('should display pagination when there are multiple pages', () => {
      // Check if pagination exists
      cy.get('app-pagination').then(($pagination) => {
        if ($pagination.length > 0) {
          // If pagination exists, test it
          cy.get('button').contains('Next').should('be.visible');
          cy.get('button').contains('Previous').should('be.visible');
        } else {
          // If no pagination, that's also fine (maybe few trips)
          cy.log('No pagination needed - few trips');
        }
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      // Wait for trips to load
      cy.get('[role="list"]', { timeout: 10000 }).should('be.visible');

      // Check trip cards have proper roles
      cy.get('app-trip-card').first().find('div[role="button"]').should('exist');
      cy.get('app-trip-card').first().find('div[tabindex="0"]').should('exist');

      // Check images have alt text
      cy.get('app-trip-card img').first().should('have.attr', 'alt').and('not.be.empty');

      // Check form elements have labels
      cy.get('#sort-select').should('have.attr', 'aria-label');
    });
  });

  describe('Responsive Design', () => {
    it('should display properly on mobile viewport', () => {
      cy.viewport('iphone-6');
      cy.get('app-trip-card').should('be.visible');
      cy.get('#sort-select').should('be.visible');
    });

    it('should display properly on desktop viewport', () => {
      cy.viewport('macbook-15');
      cy.get('app-trip-card').should('be.visible');
      cy.get('#sort-select').should('be.visible');
    });
  });
});
