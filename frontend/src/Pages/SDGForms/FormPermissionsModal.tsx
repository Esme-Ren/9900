import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Autocomplete,
  Divider,
  Alert,
  CircularProgress,
  FormGroup,
  Checkbox,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { apiCallGet, apiCallPost } from '../../Utilities/ApiCalls';

interface TeamMember {
  id: number;
  email: string;
  role: string;
}

interface FormPermissions {
  allow_team_edit: boolean;
  allow_team_view: boolean;
  require_explicit_permissions: boolean;
}

interface FormPermissionsModalProps {
  open: boolean;
  onClose: () => void;
  formId: string;
  initialPermissions?: FormPermissions;
}

const FormPermissionsModal: React.FC<FormPermissionsModalProps> = ({
  open,
  onClose,
  formId,
  initialPermissions = {
    allow_team_edit: true,
    allow_team_view: true,
    require_explicit_permissions: false,
  },
}) => {
  const [permissions, setPermissions] = useState<FormPermissions>(initialPermissions);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedEditors, setSelectedEditors] = useState<number[]>([]);
  const [selectedViewers, setSelectedViewers] = useState<number[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    setPermissions(initialPermissions);
    if (open && formId) {
      console.log('Loading data for form:', formId);
      loadData();
    }
  }, [initialPermissions, open, formId]);

  const loadData = async () => {
    setDataLoading(true);
    try {
      // 获取团队成员列表
      console.log('Fetching team members...');
      const teamMembersResponse = await apiCallGet(`api/sdg-action-plan/${formId}/team-members/`, true);
      console.log('Team members response:', teamMembersResponse);
      if (teamMembersResponse?.statusCode === 200 && teamMembersResponse.data) {
        setTeamMembers(teamMembersResponse.data);
      }

      // 获取当前编辑者列表
      console.log('Fetching editors...');
      const editorsResponse = await apiCallGet(`api/sdg-action-plan/${formId}/editors/`, true);
      console.log('Editors response:', editorsResponse);
      if (editorsResponse?.statusCode === 200 && editorsResponse.data) {
        const editorIds = editorsResponse.data.map((editor: TeamMember) => editor.id);
        console.log('Editor IDs:', editorIds);
        setSelectedEditors(editorIds);
      }

      // 获取当前查看者列表
      console.log('Fetching viewers...');
      const viewersResponse = await apiCallGet(`api/sdg-action-plan/${formId}/viewers/`, true);
      console.log('Viewers response:', viewersResponse);
      if (viewersResponse?.statusCode === 200 && viewersResponse.data) {
        const viewerIds = viewersResponse.data.map((viewer: TeamMember) => viewer.id);
        console.log('Viewer IDs:', viewerIds);
        setSelectedViewers(viewerIds);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load team members and permissions' });
    }
    setDataLoading(false);
  };

  const handleChange = (name: keyof FormPermissions) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPermissions(prev => ({
      ...prev,
      [name]: event.target.checked,
    }));
  };

  const handleEditorChange = (userId: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedEditors(prev => [...prev, userId]);
    } else {
      setSelectedEditors(prev => prev.filter(id => id !== userId));
    }
  };

  const handleViewerChange = (userId: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedViewers(prev => [...prev, userId]);
    } else {
      setSelectedViewers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('Saving permissions:', permissions);
      // Save basic permissions
      const permissionsResponse = await apiCallPost(`api/sdg-action-plan/${formId}/permissions/`, permissions, true);
      console.log('Permissions response:', permissionsResponse);
      if (permissionsResponse.statusCode !== 200) {
        throw new Error('Failed to update permissions');
      }

      console.log('Saving editors:', selectedEditors);
      // Save editors
      const editorsResponse = await apiCallPost(`api/sdg-action-plan/${formId}/editors/`, {
        action: 'set',
        user_ids: selectedEditors
      }, true);
      console.log('Editors response:', editorsResponse);
      if (editorsResponse.statusCode !== 200) {
        throw new Error('Failed to update editors');
      }

      console.log('Saving viewers:', selectedViewers);
      // Save viewers
      const viewersResponse = await apiCallPost(`api/sdg-action-plan/${formId}/viewers/`, {
        action: 'set',
        user_ids: selectedViewers
      }, true);
      console.log('Viewers response:', viewersResponse);
      if (viewersResponse.statusCode !== 200) {
        throw new Error('Failed to update viewers');
      }

      setMessage({ type: 'success', text: 'Permissions updated successfully' });
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1500);
    } catch (error) {
      console.error('Error saving permissions:', error);
      setMessage({ type: 'error', text: 'Failed to update permissions' });
    }
    setLoading(false);
  };

  console.log('Current state:', {
    teamMembers,
    selectedEditors,
    selectedViewers,
    permissions,
    dataLoading
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Permission Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Team Permission Settings
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={permissions.allow_team_edit}
                onChange={handleChange('allow_team_edit')}
              />
            }
            label="Allow team members to edit"
          />
          <FormControlLabel
            control={
              <Switch
                checked={permissions.allow_team_view}
                onChange={handleChange('allow_team_view')}
              />
            }
            label="Allow team members to view"
          />
          <FormControlLabel
            control={
              <Switch
                checked={permissions.require_explicit_permissions}
                onChange={handleChange('require_explicit_permissions')}
              />
            }
            label="Require explicit permissions for team members"
          />

          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            Team owners and form creators always have full access. When explicit permissions are enabled, only selected members can edit the form.
          </Alert>

          {permissions.require_explicit_permissions && (
            <>
              {dataLoading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : teamMembers.length > 0 ? (
                <>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Select Editors
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Choose team members who can edit this form:
                    </Typography>
                    <FormGroup>
                      {teamMembers.map((member) => (
                        <FormControlLabel
                          key={member.id}
                          control={
                            <Checkbox
                              checked={selectedEditors.includes(member.id)}
                              onChange={handleEditorChange(member.id)}
                            />
                          }
                          label={`${member.email} (${member.role})`}
                        />
                      ))}
                    </FormGroup>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Select Viewers
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Choose team members who can view this form:
                    </Typography>
                    <FormGroup>
                      {teamMembers.map((member) => (
                        <FormControlLabel
                          key={member.id}
                          control={
                            <Checkbox
                              checked={selectedViewers.includes(member.id)}
                              onChange={handleViewerChange(member.id)}
                            />
                          }
                          label={`${member.email} (${member.role})`}
                        />
                      ))}
                    </FormGroup>
                  </Box>
                </>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No team members available to assign permissions.
                </Alert>
              )}
            </>
          )}

          {message && (
            <Alert severity={message.type} sx={{ mt: 2 }}>
              {message.text}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormPermissionsModal; 