import Page from '../../Components/Page';
import TeamsHeader from './TeamsHeader';
import TeamsList from './TeamsList';
import InvitationsList from './InvitationsList';
import React from 'react';

export interface TeamData {
  id: number,
  name: string,
  description: string,
  role?: string,
  invited_by?: string,
}

const Teams = () => {
  const [teams, setTeams] = React.useState<TeamData[]>([]);
  // List of teams must be accessible by both TeamsList and InvitationsList
  // so is supplied by parent container
  const addTeam = (team: TeamData) => {
    setTeams([...teams, team]);
  }

  return (
    <Page>
      <TeamsHeader />
      <TeamsList teams={teams} setTeams={setTeams} />
      <InvitationsList addTeam={addTeam} />
    </Page>
  );
  }
  
export default Teams;