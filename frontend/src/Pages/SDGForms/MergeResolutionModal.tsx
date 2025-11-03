import { Box, Typography } from "@mui/material";
import { Content, FlatContent, flattenFields, unflattenFields } from "./FormInfo";
import ModalBase from "../../Components/ModalBase";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import FormInputByField from "./FormInputByField";
import PageButton, { PageButtonColour } from "../../Components/PageButton";

interface InputFields {
  content: Content,
  remoteContent: Content,
  setContent: (content: Content) => void,
  conflicts: (keyof FlatContent)[],
  setConflicts: Dispatch<SetStateAction<(keyof FlatContent)[]>>,
}

const MergeResolutionModal = ({ content, remoteContent, setContent, conflicts, setConflicts }: InputFields) => {
  const [currContent, setCurrContent] = useState(content);
  const [currRemoteContent, setCurrRemoteContent] = useState(remoteContent);
  const [step, setStep] = useState<number | undefined>(undefined);
  let resolvedContent: FlatContent = {...flattenFields(content)};

  useEffect(() => {
    setCurrContent(content);
    setCurrRemoteContent(remoteContent);
  }, [content, remoteContent])

  useEffect(() => {
    if (conflicts.length === 0) {
      return;
    }
    const currConflict = conflicts[0];
    if (currConflict.includes("input")) {
      // Format: "input<1-6>"
      const stepNum = currConflict.match(/[0-9]+/);
      if (stepNum) {
        setStep(Number(stepNum[0]));
      } else {
        setStep(undefined);
      }
    } else {
      setStep(undefined);
    }
  }, [conflicts])

  const copyField = <K extends keyof FlatContent>(a: FlatContent, b: FlatContent, key: K): void => {
    a[key] = b[key];
  }

  const saveChange = (currFlag: boolean) => {
    if (currFlag) {
      copyField(resolvedContent, flattenFields(currContent), conflicts[0]);
    } else {
      copyField(resolvedContent, flattenFields(currRemoteContent), conflicts[0]);
    }
    if (conflicts.length === 1) {
      setContent(unflattenFields(resolvedContent));
      setConflicts([]);
    } else {
      setConflicts(conflicts.slice(1));
    }
  }

  return (
    <ModalBase open={conflicts.length > 0} handleClose={() => setConflicts([])}>
      {
        conflicts.length > 0 &&
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          rowGap: '20px'
        }}>
          <Typography textAlign='center' variant={'h6'} sx={{wordBreak: 'break-word'}}>
            Local changes
          </Typography>
          <FormInputByField field={conflicts[0]} content={currContent}
            setContent={setCurrContent} step={step} />
          <PageButton colour={PageButtonColour.Blue} onClick={() => saveChange(true)}>Choose Local</PageButton>
          <Typography textAlign='center' variant={'h6'} sx={{wordBreak: 'break-word'}}>
            Remote changes
          </Typography>
          <FormInputByField field={conflicts[0]} content={currRemoteContent}
            setContent={setCurrRemoteContent} step={step} />
          <PageButton colour={PageButtonColour.Blue} onClick={() => saveChange(false)}>Choose Remote</PageButton>
        </Box>
      }
    </ModalBase>
  );
};

export default MergeResolutionModal;