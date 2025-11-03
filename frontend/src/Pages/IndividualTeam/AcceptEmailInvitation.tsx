import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { apiCallPost } from '../../Utilities/ApiCalls';
import Page from '../../Components/Page';

const AcceptEmailInvitation = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const acceptInvitation = async () => {
      try {
        const response = await apiCallPost(
          `api/teams/accept-invitation/${token}/`,
          {},
          true
        );

        if (response.statusCode === 200) {
          setStatus('success');
          setMessage(response.message);
          // 成功后3秒跳转到团队页面
          setTimeout(() => {
            navigate(`/teams/${response.team_id}`);
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.message || '接受邀请失败');
        }
      } catch (error) {
        setStatus('error');
        setMessage('处理邀请时发生错误');
      }
    };

    acceptInvitation();
  }, [token, navigate]);

  return (
    <Page>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2
        }}
      >
        {status === 'loading' && (
          <>
            <CircularProgress />
            <Typography>正在处理邀请...</Typography>
          </>
        )}

        {status === 'success' && (
          <Alert severity="success" sx={{ width: '100%', maxWidth: 400 }}>
            {message}
            <Typography variant="body2" sx={{ mt: 1 }}>
              即将跳转到团队页面...
            </Typography>
          </Alert>
        )}

        {status === 'error' && (
          <Alert severity="error" sx={{ width: '100%', maxWidth: 400 }}>
            {message}
          </Alert>
        )}
      </Box>
    </Page>
  );
};

export default AcceptEmailInvitation; 