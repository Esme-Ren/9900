import React from 'react';
import { Box, Typography } from '@mui/material';
import FormInput from '../../Components/FormInput';
import { Steps } from './FormInfo';

interface Props {
  inputs: Steps,
  onInputChange: (field: string, value: string) => void,
  step?: number,
}

const ImplementationSteps = ({ inputs, onInputChange, step }: Props) => {
  const keys = Object.keys(inputs) as (keyof Steps)[];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      <Typography variant='h6'>
        What are the implementation steps? Please illustrate
      </Typography>
      {step ? 
        <FormInput
          key={`input${step}`}
          subtitle={`Step ${step}`}
          placeholder='Enter your description here'
          description='description'
          maxWords={100}
          noRows={4}
          value={inputs[keys[step - 1]]}
          onChange={(e) => onInputChange(`input${step}`, e.target.value)}
        />
      :
      Array.from({ length: 6 }, (_, index) => {
        const fieldKey = `input${index + 1}`;
        return (
          <FormInput
            key={fieldKey}
            subtitle={`Step ${index + 1}`}
            placeholder='Enter your description here'
            description='description'
            maxWords={100}
            noRows={4}
            value={inputs[keys[index]]}
            onChange={(e) => onInputChange(fieldKey, e.target.value)}
          />
        );
      })}
    </Box>
  );
};

export default ImplementationSteps;

