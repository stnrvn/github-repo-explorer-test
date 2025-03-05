import { render, screen } from '@testing-library/react';
import { RepositoryItem } from '../RepositoryItem';
import { mockRepo } from '@/test/mocks/handlers';

describe('RepositoryItem', () => {
  it('renders repository information correctly', () => {
    render(<RepositoryItem repository={mockRepo} />);
    
    // Check repository name
    const nameLink = screen.getByText(mockRepo.name);
    expect(nameLink).toBeInTheDocument();
    expect(nameLink.closest('a')).toHaveAttribute('href', mockRepo.html_url);
    
    // Check repository description
    if (mockRepo.description) {
      expect(screen.getByText(mockRepo.description)).toBeInTheDocument();
    }
    
    // Check repository language
    if (mockRepo.language) {
      expect(screen.getByText(mockRepo.language)).toBeInTheDocument();
    }
    
    // Check star count
    expect(screen.getByText(mockRepo.stargazers_count.toString())).toBeInTheDocument();
    
    // Check update date
    const formattedDate = new Date(mockRepo.updated_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    expect(screen.getByText(new RegExp(`Updated.*${formattedDate}`))).toBeInTheDocument();
  });
  
  it('handles missing optional fields', () => {
    const repoWithoutOptionalFields = {
      ...mockRepo,
      description: null,
      language: null
    };
    
    render(<RepositoryItem repository={repoWithoutOptionalFields} />);
    
    // Description should not be present
    if (mockRepo.description) {
      expect(screen.queryByText(mockRepo.description)).not.toBeInTheDocument();
    }
    
    // Language should not be present
    if (mockRepo.language) {
      expect(screen.queryByText(mockRepo.language)).not.toBeInTheDocument();
    }
    
    // But other fields should still be there
    expect(screen.getByText(mockRepo.name)).toBeInTheDocument();
    expect(screen.getByText(mockRepo.stargazers_count.toString())).toBeInTheDocument();
  });
}); 