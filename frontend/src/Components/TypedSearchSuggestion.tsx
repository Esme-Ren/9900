import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Chip from '@mui/material/Chip';

const TypedSearchSuggestion = ({ search, iconType, onClick, isLast, type }: { search: string, iconType: string, onClick: () => void, isLast?: Boolean, type?: string }) => {

  const getIcon = () => {
    switch (iconType) {
      case 'search':
        return <SearchIcon />;
      case 'history':
        return <HistoryIcon />;
      case 'trending':
        return <TrendingUpIcon sx={{
          color: '#34A853',
          scale: '80%'
        }}/>;
    }
  };

  return (
    <List
      sx={{ 
        width: '100%', 
        bgcolor: 'white', 
        padding: 0 
      }}
    >
      <ListItemButton onClick={onClick} sx={isLast ? { borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px' } : {}}>
        <ListItemIcon>
          {getIcon()}
        </ListItemIcon>
        <ListItemText primary={search} />
        {type && <Chip label={type} size="small" sx={{ ml: 1, textTransform: 'capitalize' }} />}
      </ListItemButton>
    </List>
  )
}

export default TypedSearchSuggestion;