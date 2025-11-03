import { Box } from '@mui/material';

export enum Roles {
  'Team Owner',
  'Site Admin',
  'Team Admin',
  'Invite Member',
  'Member',
  'Invited',
}

export interface ITeamRole {
  title: string,
  colour: string,
  invite: boolean,
  border?: string,
}

export class TeamRoles {
  static TeamOwner: ITeamRole = {
    title: 'Team Owner',
    colour: '#9CCC92',
    invite: true,

  }
  static SiteAdmin: ITeamRole = {
    title: 'Site Admin',
    colour: '#E8DDEF',
    invite: true,
  }
  static TeamAdmin: ITeamRole = {
    title: 'Team Admin',
    colour: '#EBD0CF',
    invite: true,
  }
  static InviteMember: ITeamRole = {
    title: 'Invite Member',
    colour: '#CFE1EB',
    invite: true,
  }
  static Member: ITeamRole = {
    title: 'Member',
    colour: '#CFE1EB',
    invite: false,
  }
  static PendingMember: ITeamRole = {
    title: 'Invited',
    colour: 'white',
    invite: false,
    border: '1px solid black',
  }

  static Map = (role: Roles) => {
    switch (role) {
      case Roles['Team Owner']:
        return this.TeamOwner;
      case Roles['Site Admin']:
        return this.SiteAdmin;
      case Roles['Team Admin']:
        return this.TeamAdmin;
      case Roles['Invite Member']:
        return this.InviteMember;
      case Roles.Member:
        return this.Member;
      case Roles.Invited:
        return this.PendingMember;
    }
  }
}

const TeamRole = ({ role }: { role: ITeamRole }) => {
  return (
    <Box sx={{
      background: role.colour,
      display: 'flex',
      padding: '5px 15px 5px 15px',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '12px',
      height: '30px',
      width: '150px',
      border: role.border,
    }}>
      {role.title}
    </Box>
  );
}

export const roleFromString = (role: string, canInvite: boolean, pending: boolean) => {
  if (pending) {
    return TeamRoles.PendingMember;
  }
  switch (role) {
    case "owner":
      return TeamRoles.TeamOwner;
    case "admin":
      return TeamRoles.TeamAdmin;
    case "member":
      if (canInvite) {
        return TeamRoles.InviteMember;
      }
      return TeamRoles.Member;
    default:
      return TeamRoles.Member;
  }
}

export const roleToString = (role: ITeamRole) => {
  switch (role) {
    case TeamRoles.TeamOwner:
      return "owner";
    case TeamRoles.TeamAdmin:
      return "admin";
    default:
      return "member";
  }
}

export default TeamRole;
