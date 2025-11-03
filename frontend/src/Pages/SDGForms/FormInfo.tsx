import { Box } from '@mui/material';
import FormInput from '../../Components/FormInput';
import { useState, useEffect } from 'react';
import SDGList from './SDGList';
import ImpactTypes from './ImpactTypes'
import ImplementationSteps from './ImplementationSteps'
import PageButton, { PageButtonColour } from '../../Components/PageButton';
import { useParams } from 'react-router-dom';
import { apiCallGet, apiCallPut} from '../../Utilities/ApiCalls';
import { useNavigate } from 'react-router-dom';
import DeleteFormModal from './DeleteFormModal';
import MergeResolutionModal from './MergeResolutionModal';

export interface IImpactTypes {
  "rank1": string,
  "rank2": string,
  "rank3": string
}

export interface Steps {
  "input1": string,
  "input2": string,
  "input3": string,
  "input4": string,
  "input5": string,
  "input6": string
}

interface PlanContent {
  "SDGs": string[],
  "risk": string,
  "role": string,
  "steps": Steps,
  "impact": string,
  "example": string,
  "challenge": string,
  "resources": string,
  "importance": string,
  "mitigation": string,
  "impact_types": IImpactTypes
}

export interface Content {
  "team": string,
  "name_of_designers": string,
  "impact_project_name": string,
  "description": string,
  "plan_content": PlanContent
}

export interface FlatContent {
  "team": string,
  "name_of_designers": string,
  "impact_project_name": string,
  "description": string,
  "SDGs": string[],
  "risk": string,
  "role": string,
  "input1": string,
  "input2": string,
  "input3": string,
  "input4": string,
  "input5": string,
  "input6": string,
  "impact": string,
  "example": string,
  "challenge": string,
  "resources": string,
  "importance": string,
  "mitigation": string,
  "rank1": string,
  "rank2": string,
  "rank3": string,
}

const emptyPlanContent: Content = {
  team: '',
  name_of_designers: '',
  impact_project_name: '',
  description: '',
  plan_content: {
    SDGs: [],
    risk: '',
    role: '',
    steps: {
      input1: '',
      input2: '',
      input3: '',
      input4: '',
      input5: '',
      input6: ''
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
      rank3: ''
    }
  }
}

const createPlanContent = (response: any) => {
  const keys: (keyof Content)[] = ['team', 'name_of_designers', 'impact_project_name',
    'description', 'plan_content'];
  const newPlan = {} as Content;
  for (const key of keys) {
    if (key in response) {
      newPlan[key] = response[key]
    }
  }
  return newPlan;
}

export const flattenFields = (content: Content): FlatContent => {
  const obj: FlatContent = {
    team: content.team,
    name_of_designers: content.name_of_designers,
    impact_project_name: content.impact_project_name,
    description: content.description,
    SDGs: content.plan_content.SDGs,
    risk: content.plan_content.risk,
    role: content.plan_content.role,
    input1: content.plan_content.steps.input1,
    input2: content.plan_content.steps.input2,
    input3: content.plan_content.steps.input3,
    input4: content.plan_content.steps.input4,
    input5: content.plan_content.steps.input5,
    input6: content.plan_content.steps.input6,
    impact: content.plan_content.impact,
    example: content.plan_content.example,
    challenge: content.plan_content.challenge,
    resources: content.plan_content.resources,
    importance: content.plan_content.importance,
    mitigation: content.plan_content.mitigation,
    rank1: content.plan_content.impact_types.rank1,
    rank2: content.plan_content.impact_types.rank2,
    rank3: content.plan_content.impact_types.rank3,
  }
  return obj;
}

export const unflattenFields = (content: FlatContent): Content => {
  const obj: Content = {
    team: content.team,
    name_of_designers: content.name_of_designers,
    impact_project_name: content.impact_project_name,
    description: content.description,
    plan_content: {
      SDGs: content.SDGs,
      risk: content.risk,
      role: content.role,
      steps: {
        input1: content.input1,
        input2: content.input2,
        input3: content.input3,
        input4: content.input4,
        input5: content.input5,
        input6: content.input6,
      },
      impact: content.impact,
      example: content.example,
      challenge: content.challenge,
      resources: content.resources,
      importance: content.importance,
      mitigation: content.mitigation,
      impact_types: {
        rank1: content.rank1,
        rank2: content.rank2,
        rank3: content.rank3,
      }
    }
  }
  return obj;
}

const copyField = <K extends keyof FlatContent>(a: FlatContent, b: FlatContent, key: K): void => {
  a[key] = b[key];
}

const differenceCheck = (remoteContent: FlatContent, content: FlatContent,
  initContent: FlatContent) => {
  // Check which fields require merge resolution
  const differingFields: (keyof FlatContent)[] = [];
  let updatedContent: FlatContent = {...content}
  for (const key of Object.keys(remoteContent)) {
    // If the specific field on remote has not been updated, skip
    let local = content[key as keyof FlatContent];
    let remote = remoteContent[key as keyof FlatContent];
    let init = initContent[key as keyof FlatContent];

    if (key === 'SDGs') {
      local = local.toString();
      remote = remote.toString();
      init = init.toString();
    }

    if (remote === init || remote === local) {
      continue;
    }
    // If the specific field has not been changed by the user locally, skip
    if (local === init) {
      copyField(updatedContent, remoteContent, key as keyof FlatContent);
      continue;
    }

    // If the specific field has been updated after the local changes were
    // initially retrieved, and the user has updated locally as well, then
    // a merge resolution on the field has to occur.
    differingFields.push(key as keyof FlatContent);
  }
  return {
    differingFields: differingFields,
    updatedContent: updatedContent,
  };
}

const FormInfo = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  // Values retrieved from get API call
  const [initialContent, setInitialContent] = useState<Content>(emptyPlanContent);
  // Values that are updated by changes to form fields
  const [content, setContent] = useState<Content>(emptyPlanContent);
  const [updatedAt, setUpdatedAt] = useState(new Date(0));
  const [tempUpdatedAt, setTempUpdatedAt] = useState(new Date(0));
  const [remoteContent, setRemoteContent] = useState<FlatContent>(flattenFields(emptyPlanContent));
  const [conflicts, setConflicts] = useState<(keyof FlatContent)[]>([]);

  useEffect(() => {
    const fetchFormData = async () => {
      const response = await apiCallGet(`api/sdg-action-plan/${id}/`, true);
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        setUpdatedAt(new Date(response.updated_at));
        setInitialContent(createPlanContent(response));
        setContent(createPlanContent(response));
      } else {
        console.error('Failed to load form data:', response);
      }
    };

    fetchFormData();
  }, [id]);

  const sendUpdate = async (data: Content) => {
    const response = await apiCallPut(`api/sdg-action-plan/${id}/update/`, data, true);

    if (response?.statusCode === 200 || response?.statusCode === 204) {
      console.log('Form saved successfully');
      navigate('/sdg-form');
    } else {
      console.error('Failed to save form:', response);
    }
  }

  const saveForm = async () => {
    // Check against remote data
    const remoteContent = await apiCallGet(`api/sdg-action-plan/${id}/`, true);
    if (remoteContent?.statusCode !== 200 && remoteContent?.statusCode !== 201) {
      console.error('Failed to load form data:', remoteContent);
      return;
    }

    // Merge resolution if remote data is newer than local data
    if ((new Date(remoteContent.updated_at)).getTime() > updatedAt.getTime()) {
      const flatRemoteContent = flattenFields(remoteContent);
      setRemoteContent(flatRemoteContent);
      const flatContent = flattenFields(content);
      const flatInitContent = flattenFields(initialContent);
      const { differingFields, updatedContent } = differenceCheck(flatRemoteContent, flatContent, flatInitContent);
      
      // If some fields require merge resolution, then navigate to manual resolution page
      if (differingFields.length > 0) {
        setTempUpdatedAt(new Date(remoteContent.updated_at));
        setConflicts(differingFields);
        setContent(unflattenFields(updatedContent));
      } else {
        sendUpdate(unflattenFields(updatedContent));
      }
    } else {
      sendUpdate(content);
    }
  };

  const handleDesignerNames = (field: string) => {
    setContent(content => ({...content, name_of_designers: field}));
  }

  const handleRoleNames = (field: string) => {
    setContent(content => ({
      ...content,
      plan_content: {
        ...content.plan_content,
        role: field
      }
    }));
  }

  const handleProjectName = (field: string) => {
    setContent(content => ({...content, impact_project_name: field}));
  }

  const handleProjectChallenge = (field: string) => {
    setContent(content => ({
      ...content,
      plan_content: {
        ...content.plan_content,
        challenge: field
      }
    }));
  }

  const handleProjectDescription = (field: string) => {
    setContent(content => ({...content, description: field}));
  }

  const handleSelectedSDGs = (selected: string[]) => {
    setContent(content => ({
      ...content,
      plan_content: {
        ...content.plan_content,
        SDGs: selected
      }
    }));
  }

  const handleImpactTypes = (types: IImpactTypes) => {
    setContent(content => ({
      ...content,
      plan_content: {
        ...content.plan_content,
        impact_types: types
      }
    }));
  }

  const handleProjectImportance = (field: string) => {
    setContent(content => ({
      ...content,
      plan_content: {
        ...content.plan_content,
        importance: field
      }
    }));
  }

  const handleExistingExample = (field: string) => {
    setContent(content => ({
      ...content,
      plan_content: {
        ...content.plan_content,
        example: field
      }
    }));
  }

  const handleImplementationSteps = (field: string, value: string) => {
    const steps = {...content.plan_content.steps};
    steps[field as keyof Steps] = value;
    setContent(content => ({
      ...content,
      plan_content: {
        ...content.plan_content,
        steps: steps
      }
    }));
  }

  const handleResourcesPartnerships = (field: string) => {
    setContent(content => ({
      ...content,
      plan_content: {
        ...content.plan_content,
        resources: field
      }
    }));
  }

  const handleImpactAvenues = (field: string) => {
    setContent(content => ({
      ...content,
      plan_content: {
        ...content.plan_content,
        impact: field
      }
    }));
  }

  const handleRisksInhibitors = (field: string) => {
    setContent(content => ({
      ...content,
      plan_content: {
        ...content.plan_content,
        risk: field
      }
    }));
  }

  const handleMitigationStrategies = (field: string) => {
    setContent(content => ({
      ...content,
      plan_content: {
        ...content.plan_content,
        mitigation: field
      }
    }));
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: '10px',
      width: '80%',
      background: 'white',
      padding: '30px',
    }}>
      <FormInput 
        key={`name_of_designers-${updatedAt}`}
        title='Name of Designer(s)' 
        placeholder='Enter name of designer(s), separated by commas'
        percentWidth={60}
        value={content.name_of_designers}
        onChange={(e) => handleDesignerNames(e.target.value)}
      />
      <FormInput 
        key={`role-${updatedAt}`}
        title='Current Role and Affiliation' 
        placeholder='Enter name of role and affiliation, separated by commas'
        percentWidth={60}
        value={content.plan_content.role}
        onChange={(e) => handleRoleNames(e.target.value)}
      />
      <FormInput
        key={`impact_project_name-${updatedAt}`}
        title='Name of Impact Project' 
        placeholder='Enter name of Impact Project'
        description='Impact Project name'
        maxWords={10}
        percentWidth={60}
        value={content.impact_project_name}
        onChange={(e) => handleProjectName(e.target.value)}
      />
      <FormInput
        key={`challenge-${updatedAt}`}
        title='What is the main challenge your Project tries to solve?' 
        placeholder='Enter main challenge'
        description='description'
        maxWords={50}
        noRows={4}
        value={content.plan_content.challenge}
        onChange={(e) => handleProjectChallenge(e.target.value)}
      />
      <FormInput
        key={`description-${updatedAt}`}
        title='Provide a description of the Impact Project' 
        placeholder='Enter your description here'
        description='description'
        maxWords={200}
        noRows={6}
        value={content.description}
        onChange={(e) => handleProjectDescription(e.target.value)}
      />
      <SDGList key={`sdg_list-${updatedAt}`} value={content.plan_content.SDGs}
        onSelectionChange={handleSelectedSDGs}/>
      <ImpactTypes key={`impact_types-${updatedAt}`} value={content.plan_content.impact_types}
        onChange={handleImpactTypes} />
      <FormInput
        key={`importance-${updatedAt}`}
        title='Why is the Impact Project important? Please illustrate.' 
        placeholder='Enter your description here'
        description='description'
        maxWords={200}
        noRows={6}
        value={content.plan_content.importance}
        onChange={(e) => handleProjectImportance(e.target.value)}
      />
      <FormInput
        key={`example-${updatedAt}`}
        title='Provide an existing example that shows a similar impact to the one you are
          working on. Please explain the similarities and differences between the example
          and your own project.' 
        placeholder='Enter your description here'
        description='description'
        maxWords={200}
        noRows={6}
        value={content.plan_content.example}
        onChange={(e) => handleExistingExample(e.target.value)}
      />
      <ImplementationSteps key={`steps-${updatedAt}`} inputs={content.plan_content.steps}
        onInputChange={handleImplementationSteps}/>
      <FormInput
        key={`resources-${updatedAt}`}
        title='What are the top three resources or partnerships required for the success of
          your Project? Please illustrate.' 
        placeholder='Enter your description here'
        description='description'
        maxWords={200}
        noRows={6}
        value={content.plan_content.resources}
        onChange={(e) => handleResourcesPartnerships(e.target.value)}
      />
      <FormInput
        key={`impact-${updatedAt}`}
        title='What are the top three impact avenues to demonstrate your impact? Please
          illustrate' 
        placeholder='Enter your description here'
        description='description'
        maxWords={200}
        noRows={6}
        value={content.plan_content.impact}
        onChange={(e) => handleImpactAvenues(e.target.value)}
      />
      <FormInput
        key={`risk-${updatedAt}`}
        title='What are the top three risks or inhibitors that could prevent you from achieving
          impact? Please illustrate.' 
        placeholder='Enter your description here'
        description='description'
        maxWords={200}
        noRows={6}
        value={content.plan_content.risk}
        onChange={(e) => handleRisksInhibitors(e.target.value)}
      />
      <FormInput
        key={`mitigation-${updatedAt}`}
        title='What are the mitigation strategies for the risks or inhibitors identified? Please
          illustrate.' 
        placeholder='Enter your description here'
        description='description'
        maxWords={200}
        noRows={6}
        value={content.plan_content.mitigation}
        onChange={(e) => handleMitigationStrategies(e.target.value)}
      />
      <Box sx={{ alignSelf: 'flex-end', display: 'flex', gap: 2 }}>
        <PageButton colour={PageButtonColour.Blue} onClick={() => saveForm()}>
          Save Form
        </PageButton>
        {id && content.impact_project_name &&
          <DeleteFormModal name={content.impact_project_name} formId={id} />}
      </Box>
      <MergeResolutionModal content={content} remoteContent={unflattenFields(remoteContent)}
        setContent={(content: Content) => {
          setContent(content);
          setInitialContent(content);
          setUpdatedAt(tempUpdatedAt);
        }} conflicts={conflicts} setConflicts={setConflicts}
      />
    </Box>
  );
}
  
export default FormInfo;