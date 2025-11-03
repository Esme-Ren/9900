import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import TextBox from "../../Components/TextBox";

export type FilterType = 'users' | 'teams' ;

interface Props {
  value: string;
  onChange: (value: string) => void;
  filter: FilterType;
  onFilterChange: (newFilter: FilterType) => void;
}

const UsersTeamsSearch = ({ value, onChange, filter, onFilterChange }: Props) => {
  const handleFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: FilterType | null
  ) => {
    if (newFilter !== null) {
      onFilterChange(newFilter);
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <TextBox
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search for users or teams"
      />
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={handleFilterChange}
        size="small"
      >
        <ToggleButton value="users">Users</ToggleButton>
        <ToggleButton value="teams">Teams</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default UsersTeamsSearch;
