import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FormsCard from './FormsCard';
import { apiCallGet } from '../../Utilities/ApiCalls';

interface FormData {
  id: number;
  impact_project_name: string;
}

const FormsList = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormData[]>([]);

  useEffect(() => {

    const fetchForms = async () => {
      const response = await apiCallGet('api/sdg-action-plan/', true);
      if (response?.statusCode === 200) {
        const extractedForms = Object.values(response).filter(
          (item): item is FormData =>
            item !== null &&
            typeof item === 'object' &&
            'id' in item &&
            'impact_project_name' in item
        );
        setForms(extractedForms);
      } else {
        console.error('failed to load forms');
      }
    };
    fetchForms();

  }, []);

  const handleFormClick = (formId: number) => {
    navigate(`/sdg-form/${formId}`);
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, padding: 2 }}>
      {forms.map((form) => (
        <FormsCard
          key={form.id}
          title={form.impact_project_name}
          onClick={() => handleFormClick(form.id)}
        />
      ))}
    </Box>
  );
};

export default FormsList;

