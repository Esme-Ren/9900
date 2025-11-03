import { Box, Chip, Typography, Alert } from '@mui/material';
import PageButton, { PageButtonColour } from '../../Components/PageButton';
import PageModal from '../../Components/PageModal';
import React from 'react';
import TextBox from '../../Components/TextBox';
import { apiCallPost } from '../../Utilities/ApiCalls';

const TeamEmailInviteModal = ({ name, teamId, addInvitee }:
  { name: string, teamId: string, addInvitee: (emails: string[]) => void }) => {
  const [submissionMsg, setSubmissionMsg] = React.useState("");
  const [submissionType, setSubmissionType] = React.useState<'success' | 'error'>('success');
  const [emailInput, setEmailInput] = React.useState("");
  const [selectedEmails, setSelectedEmails] = React.useState<string[]>([]);
  const [invitationResults, setInvitationResults] = React.useState<any[]>([]);

  // 验证邮箱格式
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 处理添加邮箱
  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (email && isValidEmail(email) && !selectedEmails.includes(email)) {
      setSelectedEmails([...selectedEmails, email]);
      setEmailInput("");
      setSubmissionMsg("");
    } else if (!isValidEmail(email)) {
      setSubmissionMsg("Please enter a valid email address");
      setSubmissionType('error');
    } else if (selectedEmails.includes(email)) {
      setSubmissionMsg("This email is already in the list");
      setSubmissionType('error');
    }
  };

  // 处理移除邮箱
  const handleRemoveEmail = (email: string) => {
    setSelectedEmails(selectedEmails.filter((e) => e !== email));
  };

  // 处理回车键
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  // 发送邮件邀请
  const submitEmailInviteRequest = async () => {
    if (selectedEmails.length === 0) {
      setSubmissionMsg("Please add at least one email address");
      setSubmissionType('error');
      return;
    }

    try {
      const data = await apiCallPost(
        'api/teams/' + teamId + '/email-invite/', 
        {'emails': selectedEmails}, 
        true
      );
      
      if (data.statusCode === 200) {
        setSubmissionMsg("Email invitations sent successfully!");
        setSubmissionType('success');
        setInvitationResults(data.invitations || []);
        addInvitee(selectedEmails);
        setSelectedEmails([]);
      } else {
        const errorMessage = data.message || "Failed to send email invitations";
        setSubmissionMsg(errorMessage);
        setSubmissionType('error');
        // 如果有详细的邀请结果，也显示出来
        if (data.invitations) {
          setInvitationResults(data.invitations);
        }
      }
    } catch (error) {
      console.error('Sending email invitations error:', error);
      setSubmissionMsg("Failed to send email invitations, please try again later.");
      setSubmissionType('error');
    }
  };

  return (
    <PageModal buttonColour={PageButtonColour.Blue} buttonText='Email Invite'>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        rowGap: '20px',
        minWidth: '400px'
      }}>
        <Typography textAlign='center' variant={'h6'} sx={{wordBreak: 'break-word'}}>
          Send Email Invitations to "{name}"
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextBox
            onChange={(e) => setEmailInput(e.target.value)}
            value={emailInput}
            placeholder='Enter email address'
            onKeyDown={handleKeyPress}
          />
          <PageButton 
            colour={PageButtonColour.Blue} 
            onClick={handleAddEmail}
          >
            Add
          </PageButton>
        </Box>

        {/* 显示已选择的邮箱 */}
        {selectedEmails.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {selectedEmails.map((email) => (
              <Chip
                key={email}
                label={email}
                onDelete={() => handleRemoveEmail(email)}
                sx={{ backgroundColor: "#e3f2fd" }}
              />
            ))}
          </Box>
        )}

        {/* 显示邀请结果 */}
        {invitationResults.length > 0 && (
          <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Invitation Results:</Typography>
            {invitationResults.map((result, index) => (
              <Alert 
                key={index} 
                severity={result.status.includes('successfully') ? 'success' : 'warning'}
                sx={{ mb: 1 }}
              >
                {result.email}: {result.status}
              </Alert>
            ))}
          </Box>
        )}

        {/* 显示消息 */}
        {submissionMsg.length > 0 && (
          <Alert severity={submissionType} sx={{wordBreak: 'break-word'}}>
            {submissionMsg}
          </Alert>
        )}

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-around',
          gap: 2
        }}>
          <PageButton 
            colour={PageButtonColour.Blue} 
            onClick={() => submitEmailInviteRequest()}
            disabled={selectedEmails.length === 0}
          >
            Send Invitations
          </PageButton>
        </Box>
      </Box>
    </PageModal>
  );
};

export default TeamEmailInviteModal; 