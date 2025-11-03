import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FormInfo from '../FormInfo';

// Mocks
jest.mock('../../../Utilities/ApiCalls', () => ({
  apiCallGet: jest.fn(),
  apiCallPut: jest.fn(),
  apiCallDelete: jest.fn(),
}));

jest.mock('../../../Components/DownloadForm', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../CreateFormModal', () => () => <div>CreateFormModal Mock</div>);
jest.mock('../FormsCard', () => ({ title, onClick }: { title: string, onClick: () => void }) => (
  <div onClick={onClick}>{title}</div>
));

// Mock window.location.reload
const mockReload = jest.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});

// Helper to render with router
const renderWithRouter = (component: React.ReactNode) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

// Load mocks after jest.mock
const { apiCallGet, apiCallPut, apiCallDelete } = require('../../../Utilities/ApiCalls');
const mockedApiCallGet = apiCallGet as jest.MockedFunction<typeof apiCallGet>;
const mockedApiCallPut = apiCallPut as jest.MockedFunction<typeof apiCallPut>;

// Mocked plan content
const fakePlanContent = {
  SDGs: [],
  risk: '',
  role: '',
  steps: {
    input1: '',
    input2: '',
    input3: '',
    input4: '',
    input5: '',
    input6: '',
  },
  impact: '',
  example: '',
  challenge: '',
  resources: '',
  importance: '',
  mitigation: '',
  impact_types: {
    rank1: '',
    rank2: '',
    rank3: '',
  },
};

describe('FormInfo page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Snapshot Test
  it("should match snapshot", async () => {
    const { asFragment } = renderWithRouter(<FormInfo />);
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // Checks that the initial form content loaded as expected
  it('fetches initial form content on load', async () => {
    mockedApiCallGet.mockResolvedValueOnce({
      statusCode: 200,
      updated_at: new Date().toISOString(),
      plan_content: fakePlanContent,
      name_of_designers: 'Test Designer',
    });

    renderWithRouter(<FormInfo />);
    await waitFor(() => {
      expect(mockedApiCallGet).toHaveBeenCalled();
    });
  });

  // Checks if all fields in the form can be filled in
  it('fills in all fields correctly', async () => {
    mockedApiCallGet.mockResolvedValueOnce({
      statusCode: 200,
      updated_at: new Date().toISOString(),
      plan_content: fakePlanContent,
      name_of_designers: '',
      impact_project_name: '',
    });

    renderWithRouter(<FormInfo />);

    const designerInput = await screen.findByPlaceholderText('Enter name of designer(s), separated by commas');
    fireEvent.change(designerInput, { target: { value: 'Designer Name' } });

    const roleInput = await screen.findByPlaceholderText('Enter name of role and affiliation, separated by commas');
    fireEvent.change(roleInput, { target: { value: 'Role Name' } });

    const projectNameInput = await screen.findByPlaceholderText('Enter name of Impact Project');
    fireEvent.change(projectNameInput, { target: { value: 'Impact Project' } });

    const challengeInput = await screen.findByPlaceholderText('Enter main challenge');
    fireEvent.change(challengeInput, { target: { value: 'Challenge Description' } });

    const allDescriptionInputs = await screen.findAllByPlaceholderText('Enter your description here');
    fireEvent.change(allDescriptionInputs[0], { target: { value: 'Detailed project description' } });
    fireEvent.change(allDescriptionInputs[1], { target: { value: 'Importance of project' } });
    fireEvent.change(allDescriptionInputs[2], { target: { value: 'Example project' } });
    fireEvent.change(allDescriptionInputs[3], { target: { value: 'Resource partnerships' } });
    fireEvent.change(allDescriptionInputs[4], { target: { value: 'Impact avenues' } });
    fireEvent.change(allDescriptionInputs[5], { target: { value: 'Potential risks' } });
    fireEvent.change(allDescriptionInputs[6], { target: { value: 'Mitigation strategies' } });
    fireEvent.change(allDescriptionInputs[7], { target: { value: 'Step 1 description' } });
    fireEvent.change(allDescriptionInputs[8], { target: { value: 'Step 2 description' } });
    fireEvent.change(allDescriptionInputs[9], { target: { value: 'Step 3 description' } });
    fireEvent.change(allDescriptionInputs[10], { target: { value: 'Step 4 description' } });
    fireEvent.change(allDescriptionInputs[11], { target: { value: 'Step 5 description' } });
    fireEvent.change(allDescriptionInputs[12], { target: { value: 'Step 6 description' } });

    const sdgText = await screen.findByText('SDG 1: No Poverty');
    fireEvent.click(sdgText);

    const checkboxes = await screen.findAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();

    async function selectImpactRanks(rank1: string, rank2: string, rank3: string) {
      const allDropdowns = await screen.findAllByText('Dropdown option');
      fireEvent.mouseDown(allDropdowns[0]);
      fireEvent.click(await screen.findByText(rank1));
      fireEvent.mouseDown(allDropdowns[1]);
      fireEvent.click(await screen.findByText(rank2));
      fireEvent.mouseDown(allDropdowns[2]);
      fireEvent.click(await screen.findByText(rank3));
    }

    await selectImpactRanks('Education Impact', 'Research Impact', 'Social Impact');

    expect(screen.getByDisplayValue('Education Impact')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Research Impact')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Social Impact')).toBeInTheDocument();
  });

  // Checks that there is no merge resolution if there are no conflicts when saving
  it('saves form without conflicts', async () => {
    mockedApiCallGet
      .mockResolvedValueOnce({
        statusCode: 200,
        updated_at: new Date().toISOString(),
        plan_content: fakePlanContent,
        name_of_designers: 'Test Designer',
      })
      .mockResolvedValueOnce({
        statusCode: 200,
        updated_at: new Date().toISOString(),
        plan_content: fakePlanContent,
        name_of_designers: 'Test Designer',
      });

    mockedApiCallPut.mockResolvedValueOnce({ statusCode: 200 });

    renderWithRouter(<FormInfo />);
    const saveButton = screen.getByText(/Save Form/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockedApiCallPut).toHaveBeenCalled();
    });
  });

  // Check that an error is thrown if a fetch fails
  it('logs error if fetch fails during save', async () => {
    console.error = jest.fn();

    mockedApiCallGet.mockResolvedValueOnce({
      statusCode: 200,
      updated_at: new Date().toISOString(),
      plan_content: fakePlanContent,
      name_of_designers: 'Test Designer',
    });

    mockedApiCallGet.mockResolvedValueOnce({
      statusCode: 400,
    });

    renderWithRouter(<FormInfo />);
    const saveButton = screen.getByText(/Save Form/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Failed to load form data:', expect.anything());
    });
  });

  // Check that an error is thrown if saving the form fails
  it('logs error if saving form fails', async () => {
    console.error = jest.fn();

    mockedApiCallGet
      .mockResolvedValueOnce({
        statusCode: 200,
        updated_at: new Date().toISOString(),
        plan_content: fakePlanContent,
        name_of_designers: 'Test Designer',
      })
      .mockResolvedValueOnce({
        statusCode: 200,
        updated_at: new Date().toISOString(),
        plan_content: fakePlanContent,
        name_of_designers: 'Test Designer',
      });

    mockedApiCallPut.mockResolvedValueOnce({ statusCode: 400 });

    renderWithRouter(<FormInfo />);
    const saveButton = screen.getByText(/Save Form/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Failed to save form:', expect.anything());
    });
  });
});