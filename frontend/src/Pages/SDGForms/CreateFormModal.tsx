import {Box, Typography, FormControl, MenuItem, Select, SelectChangeEvent, TextField} from '@mui/material';
import PageButton, { PageButtonColour } from '../../Components/PageButton';
import PageModal from '../../Components/PageModal';
import React, { useState } from 'react';
import { apiCallGet, apiCallPost } from '../../Utilities/ApiCalls';
import { TeamData } from '../GroupTeam/Teams';
import { useNavigate } from 'react-router-dom';

const CreateFormModal = () => {
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState('');
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [message, setMessage] = useState(<></>);

  React.useEffect(() => {
    const getTeams = async () => {
      const data = await apiCallGet('api/auth/teams/', true);
      if (data.statusCode === 200) {
        setTeams(data.teams);
      }
    };
    getTeams();
  }, []);

  const handleChange = (event: SelectChangeEvent) => {
    const selectedName = event.target.value;
    setSelectedTeam(selectedName);

    const matchedTeam = teams.find((team) => team.name === selectedName);
    if (matchedTeam) {
      setSelectedTeamId(matchedTeam.id);
    }
  };

  const createForm = async () => {
    setMessage(<></>);
    if (!projectName || !selectedTeamId) {
      setMessage(
        <Typography textAlign='center' color='error' sx={{wordBreak: 'break-word'}}>
          Project name and team are required.
        </Typography>
      )
      return;
    }

    const requestBody = {
      "name_of_designers": '',
      "impact_project_name": projectName,
      "description": '',
      "plan_content": {
        "role": '',
        "challenge": '',
        "SDGs": [],
        "impact_types": {
          "rank1": '',
          "rank2": '',
          "rank3": '',
        },
        "importance": '',
        "example": '',
        "steps": {
          "input1": '',
          "input2": '',
          "input3": '',
          "input4": '',
          "input5": '',
          "input6": '',
        },
        "resources": '',
        "impact": '',
        "risk": '',
        "mitigation": ''
      }, 
      "team": selectedTeamId,
    };
    
    const data = await apiCallPost('api/sdg-action-plan/create/', requestBody, true);

    if (data?.statusCode === 201 && data?.id) {
      navigate(`/sdg-form/${data.id}`);
    } else {
      console.error('Form creation failed:', data);
    }
  };

  return (
    <PageModal buttonColour={PageButtonColour.Blue} buttonText='Create a Form'>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          padding: '10px',
        }}
      >
        <Typography variant='h5'>Create a New Blank Form</Typography>
        {message}
        <Box>
          <Typography variant='body1'>Select a project name.</Typography>
          <TextField
            fullWidth
            placeholder='Enter the name of your project'
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </Box>
        <Box>
          <Typography variant='body1'>Select team to join.</Typography>
          <FormControl fullWidth>
            <Select
              fullWidth
              labelId='team-select-label'
              aria-label='Select team to join.'
              value={selectedTeam}
              onChange={handleChange}
              displayEmpty
            >
              <MenuItem disabled value=''>
                Select a team
              </MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.name}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <PageButton colour={PageButtonColour.Blue} onClick={createForm}>
          Create Form
        </PageButton>
      </Box>
    </PageModal>
  );
};

export default CreateFormModal;
