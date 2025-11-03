import React from 'react';
import PageButton, { PageButtonColour } from './PageButton';
import ModalBase from './ModalBase';

const PageModal = ({ children, buttonColour, buttonText }:
  { children?: React.ReactNode, buttonColour: PageButtonColour, buttonText: string}) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <PageButton onClick={handleOpen} colour={buttonColour}>
        {buttonText}
      </PageButton>
      <ModalBase open={open} handleClose={handleClose}>
        {children}
      </ModalBase>
    </div>
  );
}

export default PageModal;
