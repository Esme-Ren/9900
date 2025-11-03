import SearchIcon from '@mui/icons-material/Search';
import { InputBase, Paper } from '@mui/material';

const FormSearch = ({ onChange, placeholder, disableIcon, children, value, onBlur, onFocus }:
  {onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> | undefined, placeholder: string, disableIcon?: boolean
    children?: React.ReactNode, value?: string, onBlur?: () => void, onFocus?: () => void
  }) => {
  return (
  <Paper
    component="form"
    sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400, position: 'relative' }}
  >
    {
      !disableIcon && <SearchIcon />
    }
    <InputBase
      sx={{ ml: 1, flex: 1 }}
      placeholder={placeholder}
      inputProps={{ 'aria-label': 'Search for forms' }}
      onChange={onChange}
      value={value}
      onBlur={onBlur}
      onFocus={onFocus}
    />
    {children}
  </Paper>
  );
}

export default FormSearch