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
  Card,
  CardContent,
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
  const [fileName, setFileName] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setFileName(file.name);
    
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

  const handleSubmit = async (e) => {
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
    } catch (err) {
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
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 4 
            }}
          >
            PDF Question & Answer Chatbot
          </Typography>
          
          <Card elevation={3} sx={{ mb: 4 }}>
            <CardContent>
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
                    sx={{ mb: 2 }}
                  >
                    {uploading ? <CircularProgress size={24} /> : 'Upload PDF'}
                  </Button>
                </label>
                {fileName && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    Selected file: {fileName}
                  </Typography>
                )}
                {pdfUploaded && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    PDF uploaded successfully! You can now ask questions.
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
                  multiline
                  rows={3}
                  placeholder={pdfUploaded ? "Type your question here..." : "Please upload a PDF first..."}
                />
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<SendIcon />}
                  disabled={loading || !question.trim() || !pdfUploaded}
                  fullWidth
                  size="large"
                >
                  {loading ? <CircularProgress size={24} /> : 'Get Answer'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {answer && (
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Answer:
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    fontSize: '1.1rem'
                  }}
                >
                  {answer}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
