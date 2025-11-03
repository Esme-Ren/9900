import SearchIcon from '@mui/icons-material/Search';
import { Box, InputBase, Paper } from '@mui/material';

const TextBox = ({ onChange, placeholder, disableIcon, children, value, onBlur, onFocus, onKeyDown, disableWidthChange }:
  {onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> | undefined, placeholder: string, disableIcon?: boolean,
    children?: React.ReactNode, value?: string, onBlur?: () => void, onFocus?: () => void, 
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>, disableWidthChange?: boolean
  }) => {
  return (
    <Box sx={{
      flexGrow: 1
    }}>
      <Paper
        component="form"
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          maxWidth: '400px',
          flexGrow: 1,
          position: 'relative',
          ...disableWidthChange && {'@media (max-width: 805px)': {
            maxWidth: '757px',
            width: 'auto'
          }},
        }}
      >
        {
          !disableIcon && <SearchIcon />
        }
        <InputBase
          sx={{ ml: 1, flexGrow: 1 }}
          placeholder={placeholder}
          inputProps={{ 'aria-label': 'Search for people' }}
          onChange={onChange}
          value={value}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
        />
        {children}
      </Paper>
    </Box>
  );
}

export default TextBox