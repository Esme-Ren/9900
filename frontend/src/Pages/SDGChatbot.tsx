import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Card,
  CardContent,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Storage as DatabaseIcon,
  Language as LanguageIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import Page from '../Components/Page';
import { apiCallPost, apiCallGet } from '../Utilities/ApiCalls';
import activityTracker from '../Utilities/ActivityTracker';

interface Message {
  id?: number;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

interface ChatResponse {
  response: string;
  session_id: string;
  database_used: boolean;
  metadata: any;
}

const SDGChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [databaseUsed, setDatabaseUsed] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化聊天会话
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const response = await apiCallPost('api/chatbot/session/', {}, false);
        if (response.session_id) {
          setSessionId(response.session_id);
          // 加载聊天历史
          await loadChatHistory(response.session_id);
        }
      } catch (error) {
        console.error('Failed to initialize chat session:', error);
        setError('Failed to initialize chat session, please refresh the page and try again.');
      }
    };

    initializeChat();
  }, []);

  // 加载聊天历史
  const loadChatHistory = async (sessionId: string) => {
    try {
      const response = await apiCallGet(`api/chatbot/history/?session_id=${sessionId}`, false);
      if (response.history && response.history.length > 0) {
        const historyMessages = response.history.map((msg: any) => ({
          type: msg.type,
          content: msg.content,
          timestamp: msg.timestamp,
          metadata: msg.metadata || {}
        }));
        setMessages(historyMessages);
      } else {
        // 如果没有历史记录，显示欢迎消息
        setMessages([
          {
            type: 'assistant',
            content: `Hello! I am the SDG Expert Assistant. I can help you query SDG (Sustainable Development Goals) related information.

I can:
• Search our SDG keywords, actions, and education databases
• Provide professional SDG advice and guidance
• If there's no relevant information in the database, I'll inform you clearly

Please tell me what SDG-related content you'd like to know about?`,
            timestamp: new Date().toISOString(),
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // 如果加载历史失败，显示欢迎消息
      setMessages([
        {
          type: 'assistant',
          content: `Hello! I am the SDG Expert Assistant. I can help you query SDG (Sustainable Development Goals) related information.

I can:
• Search our SDG keywords, actions, and education databases
• Provide professional SDG advice and guidance
• If there's no relevant information in the database, I'll inform you clearly

Please tell me what SDG-related content you'd like to know about?`,
          timestamp: new Date().toISOString(),
        }
      ]);
    }
  };

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      // 记录用户活动
      activityTracker.trackSearch(inputMessage, 'chatbot');

      const response: ChatResponse = await apiCallPost('api/chatbot/chat/', {
        message: inputMessage,
        session_id: sessionId,
      }, false);

      const assistantMessage: Message = {
        type: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        metadata: response.metadata,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setDatabaseUsed(response.database_used);

    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message, please try again.');
      
      const errorMessage: Message = {
        type: 'assistant',
        content: 'Sorry, I am temporarily unable to process your request. Please try again later.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理回车键
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // 清空聊天记录
  const clearChat = () => {
    setMessages([
      {
        type: 'assistant',
        content: `Hello! I am the SDG Expert Assistant. I can help you query SDG (Sustainable Development Goals) related information.

I can:
• Search our SDG keywords, actions, and education databases
• Provide professional SDG advice and guidance
• If there's no relevant information in the database, I'll inform you clearly

Please tell me what SDG-related content you'd like to know about?`,
        timestamp: new Date().toISOString(),
      }
    ]);
    setDatabaseUsed(false);
    setError('');
  };

  // 重新加载聊天历史
  const reloadHistory = async () => {
    if (sessionId) {
      await loadChatHistory(sessionId);
    }
  };

  // 渲染消息
  const renderMessage = (message: Message, index: number) => {
    const isUser = message.type === 'user';
    const isAssistant = message.type === 'assistant';

    return (
      <ListItem
        key={index}
        sx={{
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start',
          padding: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            maxWidth: '80%',
            flexDirection: isUser ? 'row-reverse' : 'row',
          }}
        >
          <Avatar
            sx={{
              bgcolor: isUser ? '#4285F4' : '#34A853',
              width: 32,
              height: 32,
            }}
          >
            {isUser ? 'U' : 'A'}
          </Avatar>
          <Paper
            sx={{
              padding: 2,
              backgroundColor: isUser ? '#4285F4' : '#f5f5f5',
              color: isUser ? 'white' : 'black',
              borderRadius: 2,
              maxWidth: '100%',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {message.content}
            </Typography>
            
            {isAssistant && message.metadata && (
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                 {message.metadata.database_used && (
                   <Chip
                     icon={<DatabaseIcon />}
                     label="Database Info"
                     size="small"
                     color="primary"
                     variant="outlined"
                   />
                 )}
                {message.metadata.search_results_count > 0 && (
                                     <Chip
                     label={`Found ${message.metadata.search_results_count} results`}
                     size="small"
                     color="success"
                     variant="outlined"
                   />
                )}
              </Box>
            )}
            
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1,
                opacity: 0.7,
                textAlign: 'right',
              }}
            >
              {new Date(message.timestamp).toLocaleTimeString()}
            </Typography>
          </Paper>
        </Box>
      </ListItem>
    );
  };

  return (
    <Page>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* 头部 */}
        <Paper
          elevation={2}
          sx={{
            padding: 2,
            backgroundColor: '#4285F4',
            color: 'white',
            borderRadius: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'white', color: '#4285F4' }}>
                <InfoIcon />
              </Avatar>
              <Box>
                                 <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                   SDG Expert Assistant
                 </Typography>
                 <Typography variant="body2" sx={{ opacity: 0.9 }}>
                   Intelligent Q&A System Based on SDG Database
                 </Typography>
              </Box>
            </Box>
                         <Box sx={{ display: 'flex', gap: 1 }}>
               <Tooltip title="Reload History">
                 <IconButton
                   onClick={reloadHistory}
                   sx={{ color: 'white' }}
                   size="small"
                 >
                   <HistoryIcon />
                 </IconButton>
               </Tooltip>
               <Tooltip title="Clear Chat">
                 <IconButton
                   onClick={clearChat}
                   sx={{ color: 'white' }}
                   size="small"
                 >
                   <RefreshIcon />
                 </IconButton>
               </Tooltip>
             </Box>
          </Box>
        </Paper>

        {/* 聊天区域 */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#fafafa',
            padding: 2,
          }}
        >
          <List sx={{ padding: 0 }}>
            {messages.map((message, index) => renderMessage(message, index))}
            {isLoading && (
              <ListItem sx={{ justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                                     <Typography variant="body2" color="text.secondary">
                     Thinking...
                   </Typography>
                </Box>
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ margin: 2 }}>
            {error}
          </Alert>
        )}

        {/* 输入区域 */}
        <Paper
          elevation={3}
          sx={{
            padding: 2,
            backgroundColor: 'white',
            borderRadius: 0,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
                             placeholder="Enter your question..."
              variant="outlined"
              size="small"
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              sx={{
                minWidth: 48,
                height: 40,
                borderRadius: 2,
                backgroundColor: '#4285F4',
                '&:hover': {
                  backgroundColor: '#3367D6',
                },
              }}
            >
              <SendIcon />
            </Button>
          </Box>
          
                     {/* 提示信息 */}
           <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
             <Chip
               icon={<DatabaseIcon />}
               label="SDG Database"
               size="small"
               color="primary"
               variant="outlined"
             />
             <Chip
               icon={<LanguageIcon />}
               label="AI Q&A"
               size="small"
               color="secondary"
               variant="outlined"
             />
             <Chip
               icon={<HistoryIcon />}
               label="Chat History"
               size="small"
               color="info"
               variant="outlined"
             />
             <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
               Press Enter to send, Shift + Enter for new line
             </Typography>
           </Box>
        </Paper>
      </Box>
    </Page>
  );
};

export default SDGChatbot; 