import { Box, Typography, TextField, useMediaQuery, useTheme } from "@mui/material";

interface InputFields {
  title?: string;
  subtitle?: string;
  placeholder: string;
  description?: string;
  maxWords?: number;
  percentWidth?: number;
  noRows?: number;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

const FormInput = ({
  title,
  subtitle,
  placeholder,
  description,
  maxWords,
  percentWidth = 100,
  noRows = 1,
  value,
  onChange,
}: InputFields) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const adjustedPercentWidth = isMobile ? 100 : percentWidth;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        width: `${adjustedPercentWidth}%`,
      }}
    >
      {title && <Typography variant="h6">{title}</Typography>}
      {subtitle && <Typography variant="body1">{subtitle}</Typography>}
      <TextField
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        variant="outlined"
        multiline
        rows={noRows}
      />
      {description && maxWords && (
        <Typography variant="caption">
          Your {description} must be max. {maxWords} words
        </Typography>
      )}
    </Box>
  );
};

export default FormInput;