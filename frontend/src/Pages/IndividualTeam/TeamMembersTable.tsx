import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TeamRole, { TeamRoles, ITeamRole, roleFromString } from './TeamRole';
import TeamTableMoreActions from './TeamTableMoreActions';
import TextBox from '../../Components/TextBox';
import { Roles } from './TeamRole';
import { Box, Container } from '@mui/material';
import TeamInviteModal from './TeamInviteModal';
import TeamEmailInviteModal from './TeamEmailInviteModal';
import TeamDeleteModal from './TeamDeleteModal';
import { apiCallGet } from '../../Utilities/ApiCalls';
import TeamLeave from './TeamLeave';
import TeamFormsModal from './TeamFormsModal';

// Table's columns
interface Column {
  id: 'username' | 'role';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: 'username', label: 'Username', minWidth: 160 },
  { id: 'role', label: 'Role', minWidth: 160 },
];

export interface Data {
  username: string;
  role: React.ReactNode;
  roleString: string;
}

// Helper function to create data for each row of the column
export const createData = (
  username: string,
  targetRole: ITeamRole,
): Data => {
  const role: React.ReactNode = <TeamRole role={targetRole}/>;
  const roleString: string = targetRole.title;
  return { username, role, roleString };
}

interface Props {
  permission: ITeamRole;
  teamId: number | string;
  groupName: string;
  setPermission: React.Dispatch<React.SetStateAction<ITeamRole>>;
}

const TeamMembersTable = ({ permission, teamId, groupName, setPermission }: Props) => {
  const baseUrl = 'api/teams/' + teamId;
  
  // 确保teamId是字符串类型
  const stringTeamId = String(teamId);

  const [rows, setRows] = React.useState<Data[]>([]);
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  // Initial retrieval of members in the team
  React.useEffect(() => {
    const fetchData = async () => {
      const data = await apiCallGet(baseUrl + '/members/', true);
      let temp = [];
      for (const member of data.members) {
        const username = member.user.username;
        const role = roleFromString(member.role, member.can_invite, member.is_pending);
        if (username && role) {
          temp.push(createData(username, role));
        }
      }
      setRows(temp);
    }
    fetchData();
  }, [baseUrl]);

  // Used to create a state based on window size
  // State can then dynamically change component behaviour/styling
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // States for table viewing options
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Handler for changing table page
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Checks if a row matches a query
  const checkQuery = (query: string, row: Data) => {
    return row.username.toLowerCase().includes(query.toLowerCase()) ||
      row.roleString.toLowerCase().includes(query.toLowerCase());
  }

  // Sort by role, then by name, then by username
  const compareFn = (a: Data, b: Data) => {
    const roleValA: number = Roles[a.roleString as keyof typeof Roles]
    const roleValB: number = Roles[b.roleString as keyof typeof Roles]
    if (roleValA !== roleValB) {
      return roleValA - roleValB;
    }
    if (a.username !== b.username) {
      return a.username.localeCompare(b.username);
    }
    return 0
  }

  const updateRowsFn = (rows: Data[], permission?: ITeamRole) => {
    if (permission) {
      setPermission(permission);
    }
    setRows(rows);
  }

  // Handler for adding invitees to the table
  // Prevents having to call the API again
  const addInvitees = (usernames: string[]) => {
    let tempRows = rows;
    for (const username of usernames) {
      tempRows = [...tempRows, createData(username, TeamRoles.PendingMember)];
    }
    setRows(tempRows);
  }

  return (
    <Box>
      <Container sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: '10px',
        marginBottom: '20px'
      }}>
        {/* Displays list of forms associated with team */}
        <TeamFormsModal teamId={stringTeamId}/>
        {/* Displays invite modal if you have invite permissions */}
        { permission.title !== TeamRoles.Member.title &&
          <TeamInviteModal name={groupName} teamId={stringTeamId} addInvitee={addInvitees} />
        }
        {/* Displays email invite modal if you have email invite permissions */}
        { permission.title === TeamRoles.SiteAdmin.title ||
          permission.title === TeamRoles.TeamOwner.title ?
          <TeamEmailInviteModal name={groupName} teamId={stringTeamId} addInvitee={addInvitees} /> : null
        }
        {/* Displays delete modal if you have delete team permissions */}
        { (permission.title === TeamRoles.SiteAdmin.title ||
          permission.title === TeamRoles.TeamOwner.title) &&
          <TeamDeleteModal name={groupName} teamId={stringTeamId} />
        }
        {/* Team leave options */}
        <TeamLeave teamId={stringTeamId} selfRole={permission} />
      </Container>
    {/* Table container */}
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 680 }}>
        <Table stickyHeader aria-label="sticky table">
          {/* Table header: user, roles, more actions menu */}
          <TableHead>
            <TableRow>
              {windowWidth > 522 ? columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              )) :
                <TableCell
                  key={columns[0].id}
                  align={columns[0].align}
                  style={{ minWidth: columns[0].minWidth }}
                >
                  {columns[0].label + ' | ' + columns[1].label}
                </TableCell>
              }
              <TableCell
                key={'more-menu'}
                align={'center'}
                style={{ width: 60 }}
              />
            </TableRow>
          </TableHead>
          {/* Each row is composed of user, role, and more actions menu */}
          <TableBody>
            {rows
              .filter(row => checkQuery(searchQuery, row))
              .sort((a, b) => compareFn(a, b)!)
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                    {windowWidth > 522 ? columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {value}
                        </TableCell>
                      );
                    }) : 
                      <TableCell key={columns[0].id} align={columns[0].align}>
                        <Box sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          rowGap: '12px'
                        }}>
                          {row[columns[0].id]}
                          {row[columns[1].id]}
                        </Box>
                      </TableCell>
                    }
                    <TableCell key={index} align={'right'}>
                      {/*
                        Displays more interactions with each user
                        e.g., promoting, demoting user, kicking user, viewing profile
                      */}
                      <TeamTableMoreActions
                        username={row.username}
                        rows={rows} 
                        targetRole={TeamRoles.Map(Roles[row.roleString as keyof typeof Roles])}
                        selfRole={permission} 
                        update={(rows: Data[], permission?: ITeamRole) => updateRowsFn(rows, permission)}
                          teamId={stringTeamId}/>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Handles viewing options for table */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        {...windowWidth < 388 && {labelRowsPerPage: 'Rows'}}
      />
    </Paper>
    </Box>
  );
}

export default TeamMembersTable