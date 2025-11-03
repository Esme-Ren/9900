import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FormsList from '../FormsList';
import FormSearch from '../FormSearch';
import CreateFormModal from '../CreateFormModal';
import DeleteFormModal from '../DeleteFormModal';
import { apiCallGet, apiCallDelete } from '../../../Utilities/ApiCalls';

// Mock the API calls
jest.mock('../../../Utilities/ApiCalls', () => ({
  apiCallGet: jest.fn(),
  apiCallPost: jest.fn(),
  apiCallDelete: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock window.location.reload
const mockReload = jest.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});

// Helper function to render with router
const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('Forms Components', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('FormsList component', () => {
    beforeEach(() =>
      (apiCallGet as jest.Mock).mockResolvedValue({
        statusCode: 200,
        0: { id: 1, impact_project_name: 'A' },
      })
    );
    
    // Check if FormList produces cards which are clickable
    it('renders and clicks card', async () => {
      renderWithRouter(<FormsList />);
      const card = await screen.findByText('A');
      expect(card).toBeInTheDocument();
      fireEvent.click(card);
    });
  });

  describe('FormSearch component', () => {
    // Check if the FormSearch component can be typed into
    it('renders and types', () => {
      const handle = jest.fn();
      renderWithRouter(
        <FormSearch placeholder="Search" onChange={handle} />
      );
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
      fireEvent.change(screen.getByPlaceholderText('Search'), {
        target: { value: 'X' },
      });
      expect(handle).toHaveBeenCalled();
    });
  });

  describe('CreateFormModal component', () => {
    beforeEach(() =>
      (apiCallGet as jest.Mock).mockResolvedValue({
        statusCode: 200,
        teams: [{ id: 1, name: 'team1' }],
      })
    );

    // Check if the CreateFormModal can be opened and displays the right info
    it('opens modal and validates', async () => {
      renderWithRouter(<CreateFormModal />);
      fireEvent.click(
        await screen.findByRole('button', { name: /Create a Form/i })
      );
      expect(
        await screen.findByText('Create a New Blank Form')
      ).toBeInTheDocument();
      fireEvent.click(
        screen.getByRole('button', { name: /Create Form/i })
      );
      expect(
        await screen.findByText('Project name and team are required.')
      ).toBeInTheDocument();
    });

    // Checks if teams can be selected in the dropdown 
    it('should allow selecting a team', async () => {
      (apiCallGet as jest.Mock).mockResolvedValue({
        statusCode: 200,
        teams: [
          { id: 1, name: 'team1' },
          { id: 2, name: 'team2' }
        ],
      });
    
      renderWithRouter(<CreateFormModal />);
    
      fireEvent.click(
        await screen.findByRole('button', { name: /Create a Form/i })
      );
      await waitFor(() =>
        expect(screen.getByText('Create a New Blank Form')).toBeInTheDocument()
      );
    
      const combo = screen.getByRole('combobox');
      fireEvent.mouseDown(combo);
    
      const listbox = await screen.findByRole('listbox');
    
      const option = within(listbox).getByRole('option', { name: 'team1' });
      fireEvent.click(option);
    
      expect(combo).toHaveTextContent('team1');
    });
  });

  describe('DeleteFormModal component', () => {
    const name = 'T';
    const formId = '99';

    beforeEach(() => jest.clearAllMocks());

    // Check if the DeleteFormModal can be opened and displays the right info
    it('opens and prompts', async () => {
      renderWithRouter(<DeleteFormModal name={name} formId={formId} />);
      fireEvent.click(
        screen.getByRole('button', { name: /Delete Form/i })
      );
      expect(
        await screen.findByText(`Delete Form "${name}"`)
      ).toBeInTheDocument();
    });

    // Checks if an error pops up if the user enters the wrong string
    it('shows mismatch error', async () => {
      renderWithRouter(<DeleteFormModal name={name} formId={formId} />);
      fireEvent.click(
        screen.getByRole('button', { name: /Delete Form/i })
      );
      const inp = await screen.findByPlaceholderText(`DELETE ${name}`);
      fireEvent.change(inp, { target: { value: 'no' } });
      fireEvent.click(
        screen.getByRole('button', { name: /Delete this Form/i })
      );
      expect(
        await screen.findByText(
          `Input "no" does not match required "DELETE ${name}".`
        )
      ).toBeInTheDocument();
    });

    // Checks that deletion of the form is successful 
    it('navigates on success', async () => {
      (apiCallDelete as jest.Mock).mockResolvedValue(undefined);
      renderWithRouter(<DeleteFormModal name={name} formId={formId} />);
      fireEvent.click(
        await screen.findByRole('button', { name: /Delete Form/i })
      );
      const inp = await screen.findByPlaceholderText(`DELETE ${name}`);
      fireEvent.change(inp, { target: { value: `DELETE ${name}` } });
      fireEvent.click(
        screen.getByRole('button', { name: /Delete this Form/i })
      );
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/sdg-form')
      );
    });

    // Checks if an error pops up if there is a server side error
    it('displays server error', async () => {
      (apiCallDelete as jest.Mock).mockResolvedValue({ statusCode: 500 });
      renderWithRouter(<DeleteFormModal name={name} formId={formId} />);
      fireEvent.click(
        await screen.findByRole('button', { name: /Delete Form/i })
      );
      const inp = await screen.findByPlaceholderText(`DELETE ${name}`);
      fireEvent.change(inp, { target: { value: `DELETE ${name}` } });
      fireEvent.click(
        screen.getByRole('button', { name: /Delete this Form/i })
      );
      expect(
        await screen.findByText(/Error deleting form: 500/)
      ).toBeInTheDocument();
    });

    // Checks if there is an error that could have occured when deleting the form
    it('displays unexpected error', async () => {
      (apiCallDelete as jest.Mock).mockRejectedValue(new Error('Err'));
      renderWithRouter(<DeleteFormModal name={name} formId={formId} />);
      fireEvent.click(
        await screen.findByRole('button', { name: /Delete Form/i })
      );
      const inp = await screen.findByPlaceholderText(`DELETE ${name}`);
      fireEvent.change(inp, { target: { value: `DELETE ${name}` } });
      fireEvent.click(
        screen.getByRole('button', { name: /Delete this Form/i })
      );
      expect(
        await screen.findByText(
          /An unexpected error occurred while deleting the form/
        )
      ).toBeInTheDocument();
    });
  });
});
