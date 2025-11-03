import React from 'react';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Roles, ITeamRole, TeamRoles, roleToString } from './TeamRole'
import { createData, Data } from './TeamMembersTable';
import { apiCallPost } from '../../Utilities/ApiCalls';
import { useNavigate } from 'react-router-dom';

// Decorates with profile button on all users
const ProfileBtn = ({ username }: { username: string }) => {
  const navigate = useNavigate();
  return (
    <MenuItem onClick={() => {
      navigate('/userprofile/' + username);
    }}>
      Profile
    </MenuItem>
  )
}

// Decorates invite permissions if selfRole has permission to alter invite
// permissions of targetRole.
//
// Hierarchy: Owner > Admin > Invite-Allowed Member = Member
//
// Admins do not have invite permission check as they have the permission
// by default.
const InvitePermissions = ({ username, rows, targetRole, selfRole, update, teamId }:
  {username: string, rows: Data[], targetRole: ITeamRole, selfRole: ITeamRole,
  update: (rows: Data[]) => void, teamId: string}) => {
  if (targetRole.title !== TeamRoles.Member.title &&
    targetRole.title !== TeamRoles.InviteMember.title) {
    return null;
  }
  if (Roles[targetRole.title as keyof typeof Roles] >
    Roles[selfRole.title as keyof typeof Roles]) {
    const postInvite = async (canInvite: boolean) => {
      await apiCallPost('api/teams/' + teamId + '/invite-permissions/', {
        "can_invite": canInvite,
        "username": username,
      }, true);
    }
    return (
      <MenuItem onClick={() => {
        const a = rows
          .map((row) => {
            if (row.username !== username) {
              return row;
            };
            if (row.roleString === TeamRoles.Member.title) {
              postInvite(true);
              return createData(row.username, TeamRoles.InviteMember);
            } else {
              postInvite(false);
              return createData(row.username, TeamRoles.Member);
            }
          })
        update(a)
      }}>
        {
          targetRole.title === TeamRoles.Member.title ?
          "Allow Invite Permissions" : "Revoke Invite Permissions"
        }
        
      </MenuItem>
    )
  }
  return null;
}

// Decorates admin permissions if selfRole has permission to alter admin
// permissions of targetRole.
//
// Hierarchy: Owner > Admin > Invite-Allowed Member = Member
const AdminPermissions = ({ username, rows, targetRole, selfRole, update, teamId }:
  { username: string, rows: Data[], targetRole: ITeamRole,
  selfRole: ITeamRole, update: (rows: Data[]) => void, teamId: string }) => {
  if (targetRole.title === TeamRoles.PendingMember.title ||
    targetRole.title === TeamRoles.TeamOwner.title ||
    targetRole.title === TeamRoles.SiteAdmin.title) {
    return null;
  }
  if (Roles[targetRole.title as keyof typeof Roles] >
    Roles[selfRole.title as keyof typeof Roles]) {
    const postRole = async (role: ITeamRole) => {
      await apiCallPost('api/teams/' + teamId + '/update-role/', {
        "new_role": roleToString(role),
        "username": username,
      }, true);
    }
    // Retrieves the original invite permission of a user
    // Used when demoting an admin back to member/invite-allowed-member
    const getInvitePerm = async () => {
      const baseUrl = 'api/teams/' + teamId;
      const data = await apiCallPost(baseUrl + '/role/', {"username": username}, true);
      return data.can_invite;
    }
    return (
      <MenuItem onClick={() => {
        const a = rows
          .map(async (row) => {
            if (row.username !== username) {
              return row;
            };
            // Make a member an admin
            if (row.roleString !== TeamRoles.TeamAdmin.title) {
              postRole(TeamRoles.TeamAdmin);
              return createData(row.username, TeamRoles.TeamAdmin);
            } else {
              postRole(TeamRoles.Member);
              // If the admin was originally allowed to invite
              // Then they can still invite
              if (await getInvitePerm()) {
                return createData(row.username, TeamRoles.InviteMember);
              }
              // Else they will not be allowed to invite after demotion
              return createData(row.username, TeamRoles.Member);
            }
          })
        Promise.all(a).then((rows) => update(rows))
      }}>
        {
          targetRole.title !== TeamRoles.TeamAdmin.title ?
          "Elevate to Team Admin" : "Revoke Team Admin"
        }    
      </MenuItem>
    )
  }
  return null;
}

// Decorates owner permissions if selfRole is owner and targetRole is admin.
const OwnerPermissions = ({ username, rows, targetRole, selfRole, update, teamId }:
  { username: string, rows: Data[], targetRole: ITeamRole,
  selfRole: ITeamRole, update: (rows: Data[], permission: ITeamRole) => void, 
  teamId: string }) => {
  const [text, setText] = React.useState('Elevate to Team Owner');
  if (selfRole.title !== TeamRoles.TeamOwner.title ||
    targetRole.title !== TeamRoles.TeamAdmin.title) {
    return null;
  }
  const postRole = async () => {
    return await apiCallPost('api/teams/' + teamId + '/update-role/', {
      "new_role": roleToString(TeamRoles.TeamOwner),
      "username": username,
    }, true);
  }
  return (
    <MenuItem onClick={async () => {
      // Requires confirmation to hand over ownership of team
      if (text === 'Elevate to Team Owner') {
        setText('Confirm');
      } else {
        setText('Elevate to Team Owner');
        if ((await postRole()).statusCode !== 200) {
          return;
        }
        const a = rows
          .map(async (row) => {
            if (row.username !== username) {
              if (row.roleString === TeamRoles.TeamOwner.title) {
                return createData(row.username, TeamRoles.TeamAdmin);
              }
              return row;
            };
            return createData(row.username, TeamRoles.TeamOwner);
          })
        Promise.all(a).then((rows) => update(rows, TeamRoles.TeamAdmin));
      }
    }}>
      {text}
    </MenuItem>
  )
}

// Decorates kick button if selfRole has permission to kick targetRole.
//
// Hierarchy: Owner > Admin > Invite-Allowed Member = Member
const KickBtn = ({ username, rows, targetRole, selfRole, update, teamId } :
  { username: string, rows: Data[], targetRole: ITeamRole,
  selfRole: ITeamRole, update: (rows: Data[]) => void, teamId: string }) => {
  const [text, setText] = React.useState('Kick');
  if (targetRole.title === TeamRoles.TeamOwner.title ||
    targetRole.title === TeamRoles.SiteAdmin.title) {
    return null;
  }
  if (Roles[targetRole.title as keyof typeof Roles] >
    Roles[selfRole.title as keyof typeof Roles] &&
    Roles[TeamRoles.InviteMember.title as keyof typeof Roles] >
    Roles[selfRole.title as keyof typeof Roles]) {
    const postKick = async () => {
      return await apiCallPost('api/teams/' + teamId + '/kick/', {
        "username": username,
      }, true);
    }
    return (
      <MenuItem onClick={async () => {
        if (text === 'Kick') {
          setText('Confirm kick');
        } else {
          setText('Kick');
          let res = await postKick();
          if (res.statusCode !== 200) {
            return;
          }
          update(rows.filter((row: Data) => row.username !== username));
        }
      }}>
        {text}    
      </MenuItem>
    )
  }
  return null;
}

const TeamTableMoreActions = ({ username, rows, targetRole, selfRole, update, teamId }:
  { username: string, rows: Data[], targetRole: ITeamRole, selfRole: ITeamRole, 
    update: (rows: Data[], permission?: ITeamRole) => void, teamId: string }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Handlers for opening and closing the interactions menu
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <IconButton onClick={(handleClick)}>
        <MoreVertIcon/>
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <ProfileBtn username={username} />
        <InvitePermissions username={username} rows={rows} targetRole={targetRole}
          selfRole={selfRole} update={update} teamId={teamId} />
        <AdminPermissions username={username} rows={rows} targetRole={targetRole}
          selfRole={selfRole} update={update} teamId={teamId} />
        <OwnerPermissions username={username} rows={rows} targetRole={targetRole}
          selfRole={selfRole} update={update} teamId={teamId} />
        <KickBtn username={username} rows={rows} targetRole={targetRole}
          selfRole={selfRole} update={update} teamId={teamId} />
      </Menu>
    </Box>
  );
}

export default TeamTableMoreActions;