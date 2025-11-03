import { useEffect, useState } from 'react';
import { apiCallGet } from '../../Utilities/ApiCalls';
import { FilterType } from './AdminAnalytics';

interface User {
  id: number;
  username: string;
  email: string;
}

interface Team {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

const useAdminData = (filter: FilterType, query: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (filter === 'users') {
        const res = await apiCallGet('api/admin/users/', true);
        if (res?.statusCode === 200) {
          const userList = Object.values(res).filter(
            (item): item is User => item !== null && typeof item === 'object' && 'username' in item
          );
          setUsers(userList);
        } else {
          setUsers([]);
        }
        setTeams([]);
      } else if (filter === 'teams') {
        const res = await apiCallGet('api/admin/teams/', true);
        if (res?.statusCode === 200) {
          const teamList = Object.values(res).filter(
            (item): item is Team => item !== null && typeof item === 'object' && 'name' in item
          );
          setTeams(teamList);
        } else {
          setTeams([]);
        }
        setUsers([]);
      }
    };

    fetchData();
  }, [filter]);

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.description.toLowerCase().includes(query.toLowerCase())
  );

  return { users: filteredUsers, teams: filteredTeams };
};

export default useAdminData;
