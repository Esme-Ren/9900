import { Button } from '@mui/material';
import React from 'react';

export enum PageButtonColour {
    Green = '#9CCC92',
    Red = '#ed4431',
    White = 'white',
    Blue = '#4285F4'
}

const PageButton = ({ children, colour, textColour = 'white', startIcon, onClick, disabled }:
  {children?: React.ReactNode, colour: PageButtonColour, textColour?: string, startIcon?: React.ReactNode, onClick: () => void, disabled?: boolean}) => {
  let variant: "contained" | "outlined" = "contained";
  if (textColour !== 'white') {
    variant = "outlined";
  }
  return (
    <Button 
      variant={variant} 
      onClick={onClick} 
      disabled={disabled}
      sx={{
        background: colour,
        color: textColour,
        fontSize: '16px',
        borderRadius: '8px',
        textTransform: 'none',
        borderColor: 'black',
        '&:disabled': {
          background: '#cccccc',
          color: '#666666'
        }
      }}
      startIcon={startIcon}
    >
      {children}
    </Button>
  );
}

export default PageButton;
