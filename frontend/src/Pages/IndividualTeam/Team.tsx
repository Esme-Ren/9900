import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, Alert } from '@mui/material';
import { apiCallGet, apiCallPost } from '../../Utilities/ApiCalls';
import TeamMembersTable from './TeamMembersTable';
import TeamInviteModal from './TeamInviteModal';
import TeamEmailInviteModal from './TeamEmailInviteModal';
import TeamDeleteModal from './TeamDeleteModal';
import TeamLeave from './TeamLeave';
import Page from '../../Components/Page';
import { ITeamRole, TeamRoles, roleFromString } from './TeamRole';

interface TeamData {
  id: number;
  name: string;
  description: string;
  max_members: number;
}

interface TeamProps {
  teamId: string;
}

const Team: React.FC<TeamProps> = ({ teamId }) => {
  const navigate = useNavigate();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [permission, setPermission] = useState<ITeamRole>(TeamRoles.Member);
  const [newMaxMembers, setNewMaxMembers] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [globalMaxMembers, setGlobalMaxMembers] = useState<number>(6);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const data = await apiCallGet(`api/teams/${teamId}/`, true);
        if (data) {
          setTeam(data);
        }
      } catch (error) {
        console.error('Failed to fetch team data');
      }
    };

    const fetchUserRole = async () => {
      try {
        const data = await apiCallPost(`api/teams/${teamId}/role/`, {}, true);
        if (data && data.role) {
          setPermission(roleFromString(data.role, data.can_invite || false, false));
        }
      } catch (error) {
        console.error('Failed to fetch user role');
      }
    };

    const fetchGlobalMaxMembers = async () => {
      try {
        const data = await apiCallGet('api/admin/teams/globalSettings/', true);
        if (data && data.default_max_members) {
          setGlobalMaxMembers(data.default_max_members);
      }
      } catch (error) {
        console.error('Failed to fetch global settings');
      }
    };

    fetchTeamData();
    fetchUserRole();
    fetchGlobalMaxMembers();
  }, [teamId]);

  const handleUpdateMaxMembers = async () => {
    if (!team || !newMaxMembers) {
      setMessage({ text: 'Please enter new max members', type: 'error' });
      return;
    }

    const maxMembers = parseInt(newMaxMembers);
    if (isNaN(maxMembers) || maxMembers < 1) {
      setMessage({ text: 'Please enter a valid positive number', type: 'error' });
      return;
    }

    try {
      const data = await apiCallPost(
        `api/teams/${teamId}/update-max-members/`,
        { max_members: maxMembers },
        true
      );

      if (data.statusCode === 200) {
        setMessage({ text: data.message, type: 'success' });
        setTeam(prev => prev ? { ...prev, max_members: maxMembers } : null);
        setNewMaxMembers('');
      } else {
        setMessage({ text: data.message || 'Failed to update max members', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to update max members', type: 'error' });
    }
  };

  if (!team) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Page>
      <Box>
        <Typography variant="h4" gutterBottom>
          {team.name}
        </Typography>

        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        {/* 团队所有者的最大成员数设置 - 移到更显眼的位置 */}
        {permission.title === TeamRoles.TeamOwner.title && (
          <Box sx={{ 
            mb: 3, 
            p: 3, 
            border: '1px solid #2196f3',
            borderRadius: 2,
            backgroundColor: '#f5f9ff'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#1976d2' }}>
                Team Settings
              </Typography>
              <Typography variant="body2" sx={{ ml: 2, color: '#666' }}>
                (Only visible to team owner)
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 4, 
              mb: 2,
              backgroundColor: '#fff',
              p: 2,
              borderRadius: 1
            }}>
              <Typography variant="body1">
                Current max members: <strong>{team.max_members}</strong>
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Global maximum limit: <strong>{globalMaxMembers}</strong>
              </Typography>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              alignItems: 'center',
              backgroundColor: '#fff',
              p: 2,
              borderRadius: 1
            }}>
              <TextField
                label="New Max Members"
                type="number"
                value={newMaxMembers}
                onChange={(e) => setNewMaxMembers(e.target.value)}
                sx={{ width: 150 }}
                inputProps={{ min: 1, max: globalMaxMembers }}
                helperText={`Enter a number between ${team.max_members} and ${globalMaxMembers}`}
              />
              <Button
                variant="contained"
                onClick={handleUpdateMaxMembers}
                disabled={!newMaxMembers}
                sx={{ height: 40 }}
              >
                Update Max Members
              </Button>
            </Box>
          </Box>
        )}

        <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
          {team.description}
        </Typography>

        <TeamMembersTable 
          teamId={teamId}
          permission={permission}
          groupName={team.name}
          setPermission={setPermission}
        />
        
        {/* 其他现有组件 */}
      </Box>
    </Page>
  );
};

export default Team;