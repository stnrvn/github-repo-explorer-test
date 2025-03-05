// Custom command to select DOM element by data-cy attribute
Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-cy=${value}]`)
})

// Preserve cookies between tests
beforeEach(() => {
  cy.session('preserve_cookies', () => {
    // Session setup logic
  })
})

// Log failed requests
Cypress.on('fail', (error, runnable) => {
  // Log additional information about failed requests
  if (error.message.includes('request failed')) {
    console.error('Request failed:', error)
  }
  throw error
}) 