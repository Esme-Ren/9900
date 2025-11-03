import { Box } from '@mui/material';
import React, { FunctionComponent, PropsWithChildren } from 'react';

const Header: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return (
    <Box display={'flex'} sx={{
        background: 'linear-gradient(to bottom, #f1ebc7, #b9c691)',
        minWidth: '100vw',
        minHeight: '100vh'
    }}>
        {children}
    </Box>
  );
}

export default Header;
