import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  ThemeProvider,
  createTheme,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('PDF', file);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData);
      setPdfUploaded(true);
      setError('');
    } catch (err) {
      setError('Failed to upload PDF. Please try again.');
      console.error('Error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('question', question);
      
      const response = await axios.post('http://localhost:5000/ask', formData);
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setAnswer(response.data.answer);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to get answer. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Question & Answer Chatbot
          </Typography>
          
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ mb: 3 }}>
              <input
                accept="application/pdf"
                style={{ display: 'none' }}
                id="pdf-upload"
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <label htmlFor="pdf-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadFileIcon />}
                  disabled={uploading}
                  fullWidth
                >
                  {uploading ? <CircularProgress size={24} /> : 'Upload PDF'}
                </Button>
              </label>
              {pdfUploaded && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  PDF uploaded successfully!
                </Alert>
              )}
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Ask your question"
                variant="outlined"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={loading || !pdfUploaded}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                endIcon={<SendIcon />}
                disabled={loading || !question.trim() || !pdfUploaded}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Send Question'}
              </Button>
            </form>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {answer && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Answer:
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {answer}
              </Typography>
            </Paper>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 