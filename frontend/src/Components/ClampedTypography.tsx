import { Typography, TypographyProps } from "@mui/material";

const ClampedTypography: React.FC<TypographyProps> = ({children, sx, variant}) => {
  return (
    <Typography
      variant={variant}
      sx={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: '-webkit-box',
        WebkitLineClamp: '2',
        WebkitBoxOrient: 'vertical',
        maxWidth: '100%',
        ...sx
      }}
    >
      {children}
    </Typography>
  );
};

export default ClampedTypography;