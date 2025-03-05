describe('GitHub Repositories Explorer', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://api.github.com/search/users*', {
      fixture: 'searchUsers.json',
    }).as('searchUsers');

    cy.intercept('GET', 'https://api.github.com/users/*/repos*', {
      fixture: 'userRepos.json',
    }).as('getUserRepos');

    cy.visit('/');
  });

  it('should search for users and display results', () => {
    // Type in search box
    cy.get('input[type="search"]')
      .type('test');

    // Wait for search request
    cy.wait('@searchUsers');

    // Check if users are displayed
    cy.get('button')
      .contains('testuser')
      .should('be.visible');
  });

  it('should handle empty search results', () => {
    cy.intercept('GET', 'https://api.github.com/search/users*', {
      body: {
        total_count: 0,
        items: [],
      },
    }).as('emptySearch');

    cy.get('input[type="search"]')
      .type('nonexistentuser');

    cy.wait('@emptySearch');

    cy.contains('No users found')
      .should('be.visible');
  });

  it('should display user repositories when user is selected', () => {
    cy.get('input[type="search"]')
      .type('test');

    cy.wait('@searchUsers');

    // Click on user
    cy.get('button')
      .contains('testuser')
      .click();

    // Wait for repositories request
    cy.wait('@getUserRepos');

    // Check if repositories are displayed
    cy.contains('test-repo')
      .should('be.visible');
  });

  it('should handle API errors gracefully', () => {
    cy.intercept('GET', 'https://api.github.com/search/users*', {
      statusCode: 500,
      body: {
        message: 'Internal Server Error',
      },
    }).as('searchError');

    cy.get('input[type="search"]')
      .type('test');

    cy.wait('@searchError');

    // Check if error message is displayed
    cy.contains('Failed to fetch users')
      .should('be.visible');

    // Check if retry button is present
    cy.contains('button', 'Retry')
      .should('be.visible');
  });

  it('should handle request cancellation when typing quickly', () => {
    // Type quickly
    cy.get('input[type="search"]')
      .type('t', { delay: 0 })
      .type('e', { delay: 0 })
      .type('s', { delay: 0 })
      .type('t', { delay: 0 });

    // Only the last request should complete
    cy.get('@searchUsers.all')
      .should('have.length', 1);
  });

  it('should maintain state after page reload', () => {
    cy.get('input[type="search"]')
      .type('test');

    cy.wait('@searchUsers');

    // Select user
    cy.get('button')
      .contains('testuser')
      .click();

    cy.wait('@getUserRepos');

    // Reload page
    cy.reload();

    // Check if state is maintained
    cy.get('input[type="search"]')
      .should('have.value', 'test');

    cy.contains('test-repo')
      .should('be.visible');
  });

  it('should be responsive across different viewport sizes', () => {
    // Test mobile viewport
    cy.viewport('iphone-6');
    cy.get('input[type="search"]')
      .should('be.visible')
      .type('test');

    cy.wait('@searchUsers');

    // Test tablet viewport
    cy.viewport('ipad-2');
    cy.get('button')
      .contains('testuser')
      .should('be.visible')
      .click();

    // Test desktop viewport
    cy.viewport(1920, 1080);
    cy.contains('test-repo')
      .should('be.visible');
  });
}); 