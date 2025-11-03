import { Dispatch, SetStateAction } from "react";
import FormInput from "../../Components/FormInput";
import { Content, IImpactTypes, Steps } from "./FormInfo";
import SDGList from "./SDGList";
import ImpactTypes from "./ImpactTypes";
import ImplementationSteps from "./ImplementationSteps";

const handleDesignerNames = (field: string, setContent: Dispatch<SetStateAction<Content>>) => {
  setContent(content => ({...content, name_of_designers: field}));
}

const handleRoleNames = (field: string, content: Content,
  setContent: Dispatch<SetStateAction<Content>>) => {
  const plan_content = {
    ...content.plan_content,
    role: field
  }
  setContent(content => ({
    ...content,
    plan_content: plan_content
  }));
  
}

const handleProjectName = (field: string, setContent: Dispatch<SetStateAction<Content>>) => {
  setContent(content => ({...content, impact_project_name: field}));
}

const handleProjectChallenge = (field: string, content: Content,
  setContent: Dispatch<SetStateAction<Content>>) => {
  const plan_content = {
    ...content.plan_content,
    challenge: field
  }
  setContent(content => ({
    ...content,
    plan_content: plan_content
  }));
}

const handleProjectDescription = (field: string, setContent: Dispatch<SetStateAction<Content>>) => {
  setContent(content => ({...content, description: field}));
}

const handleSelectedSDGs = (selected: string[], content: Content,
  setContent: Dispatch<SetStateAction<Content>>) => {
  const plan_content = {
    ...content.plan_content,
    SDGs: selected
  }
  setContent(content => ({
    ...content,
    plan_content: plan_content
  }));
}

const handleImpactTypes = (types: IImpactTypes, content: Content,
  setContent: Dispatch<SetStateAction<Content>>) => {
  const plan_content = {
    ...content.plan_content,
    impact_types: types
  }
  setContent(content => ({
    ...content,
    plan_content: plan_content
  }));
}

const handleProjectImportance = (field: string, content: Content,
  setContent: Dispatch<SetStateAction<Content>>) => {
  const plan_content = {
    ...content.plan_content,
    importance: field
  }
  setContent(content => ({
    ...content,
    plan_content: plan_content
  }));
}

const handleExistingExample = (field: string, content: Content,
  setContent: Dispatch<SetStateAction<Content>>) => {
  const plan_content = {
    ...content.plan_content,
    example: field
  }
  setContent(content => ({
    ...content,
    plan_content: plan_content
  }));
}

const handleImplementationSteps = (field: string, value: string, content: Content,
  setContent: Dispatch<SetStateAction<Content>>) => {
  const steps = {...content.plan_content.steps};
  steps[field as keyof Steps] = value;
  const plan_content = {
    ...content.plan_content,
    steps: steps
  }
  setContent(content => ({
    ...content,
    plan_content: plan_content
  }));
}

const handleResourcesPartnerships = (field: string, content: Content,
  setContent: Dispatch<SetStateAction<Content>>) => {
  const plan_content = {
    ...content.plan_content,
    resources: field
  }
  setContent(content => ({
    ...content,
    plan_content: plan_content
  }));
}

const handleImpactAvenues = (field: string, content: Content,
  setContent: Dispatch<SetStateAction<Content>>) => {
  const plan_content = {
    ...content.plan_content,
    impact: field
  }
  setContent(content => ({
    ...content,
    plan_content: plan_content
  }));
}

const handleRisksInhibitors = (field: string, content: Content,
  setContent: Dispatch<SetStateAction<Content>>) => {
  const plan_content = {
    ...content.plan_content,
    risk: field
  }
  setContent(content => ({
    ...content,
    plan_content: plan_content
  }));
}

const handleMitigationStrategies = (field: string, content: Content,
  setContent: Dispatch<SetStateAction<Content>>) => {
    const plan_content = {
      ...content.plan_content,
      mitigation: field
    }
    setContent(content => ({
      ...content,
      plan_content: plan_content
    }));
}

const FormInputByField = ({ field, content, setContent, step }:
  { field: string, content: Content, setContent: Dispatch<SetStateAction<Content>>,
    step?: number }) => {
  switch (field) {
    case 'name_of_designers':
      return (<FormInput 
        key={field}
        title='Name of Designer(s)' 
        placeholder='Enter name of designer(s), separated by commas'
        percentWidth={60}
        value={content.name_of_designers}
        onChange={(e) => handleDesignerNames(e.target.value, setContent)}
      />);
    case 'role':
      return (<FormInput 
        key={field}
        title='Current Role and Affiliation' 
        placeholder='Enter name of role and affiliation, separated by commas'
        percentWidth={60}
        value={content.plan_content.role}
        onChange={(e) => handleRoleNames(e.target.value, content, setContent)}
      />);
    case 'impact_project_name':
      return (<FormInput 
        key={field}
        title='Name of Impact Project' 
        placeholder='Enter name of Impact Project'
        description='Impact Project name'
        maxWords={10}
        percentWidth={60}
        value={content.impact_project_name}
        onChange={(e) => handleProjectName(e.target.value, setContent)}
      />);
      case 'challenge':
        return (<FormInput 
          key={field}
          title='What is the main challenge your Project tries to solve?' 
          placeholder='Enter main challenge'
          description='description'
          maxWords={50}
          noRows={4}
          value={content.plan_content.challenge}
          onChange={(e) => handleProjectChallenge(e.target.value, content, setContent)}
        />);
      case 'description':
        return (<FormInput 
          key={field}
          title='Provide a description of the Impact Project' 
          placeholder='Enter your description here'
          description='description'
          maxWords={200}
          noRows={6}
          value={content.description}
          onChange={(e) => handleProjectDescription(e.target.value, setContent)}
        />);
      case 'SDGs':
        return (<SDGList key={field} value={content.plan_content.SDGs}
          onSelectionChange={(selected) => {handleSelectedSDGs(selected, content, setContent)}}/>);
      case 'impact_types':
        return (<ImpactTypes key={field} value={content.plan_content.impact_types}
          onChange={(types) => {handleImpactTypes(types, content, setContent)}} />);
      case 'importance':
        return (<FormInput 
          key={field}
          title='Why is the Impact Project important? Please illustrate.' 
          placeholder='Enter your description here'
          description='description'
          maxWords={200}
          noRows={6}
          value={content.plan_content.importance}
          onChange={(e) => handleProjectImportance(e.target.value, content, setContent)}
        />);
      case 'example':
        return (<FormInput 
          key={field}
          title='Provide an existing example that shows a similar impact to the one you are
            working on. Please explain the similarities and differences between the example
            and your own project.' 
          placeholder='Enter your description here'
          description='description'
          maxWords={200}
          noRows={6}
          value={content.plan_content.example}
          onChange={(e) => handleExistingExample(e.target.value, content, setContent)}
        />);
      case 'steps':
      case 'input1':
      case 'input2':
      case 'input3':
      case 'input4':
      case 'input5':
      case 'input6':
        return (<ImplementationSteps key={field} inputs={content.plan_content.steps}
          onInputChange={(field, value) => handleImplementationSteps(field, value,
            content, setContent)} step={step}/>);
      case 'resources':
        return (<FormInput 
          key={field}
          title='What are the top three resources or partnerships required for the success of
            your Project? Please illustrate.' 
          placeholder='Enter your description here'
          description='description'
          maxWords={200}
          noRows={6}
          value={content.plan_content.resources}
          onChange={(e) => handleResourcesPartnerships(e.target.value, content, setContent)}
        />);
      case 'impact':
        return (<FormInput 
          key={field}
          title='What are the top three impact avenues to demonstrate your impact? Please
            illustrate' 
          placeholder='Enter your description here'
          description='description'
          maxWords={200}
          noRows={6}
          value={content.plan_content.impact}
          onChange={(e) => handleImpactAvenues(e.target.value, content, setContent)}
        />);
      case 'risk':
      case 'rank1':
      case 'rank2':
      case 'rank3':
        return (<FormInput 
          key={field}
          title='What are the top three risks or inhibitors that could prevent you from achieving
            impact? Please illustrate.' 
          placeholder='Enter your description here'
          description='description'
          maxWords={200}
          noRows={6}
          value={content.plan_content.risk}
          onChange={(e) => handleRisksInhibitors(e.target.value, content, setContent)}
        />);
      case 'mitigation':
        return (<FormInput 
          key={field}
          title='What are the mitigation strategies for the risks or inhibitors identified? Please
            illustrate.' 
          placeholder='Enter your description here'
          description='description'
          maxWords={200}
          noRows={6}
          value={content.plan_content.mitigation}
          onChange={(e) => handleMitigationStrategies(e.target.value, content, setContent)}
        />);
      default:
        return (<div>Invalid Case</div>)
  }
};

export default FormInputByField