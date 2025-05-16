# Question-and-Answer-Chatbot

This is a full-stack web application that lets users:

1. Upload a PDF file

2. Ask English-language questions about its contents

3. Get intelligent answers powered by Google Gemini Pro (via REST API)

The app is built with a Flask backend and a React frontend, communicating over REST.


| Layer         | Technology                            |
| ------------- | ------------------------------------- |
| Frontend      | React, JavaScript                     |
| Backend       | Flask (Python)                        |
| PDF Parsing   | PyMuPDF (`fitz`)                      |
| LLM API       | Google Gemini (`gemini-pro` via REST) |
| Communication | REST APIs (`/upload`, `/ask`)         |
| Environment   | `dotenv`, `flask-cors`                |


## Setup

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at http://localhost:3000

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

4. Start the Flask server:
```bash
python app.py
```

The backend will be available at http://localhost:5000

## Usage

1. Open your browser and go to http://localhost:3000
2. Upload a PDF file using the file upload component
3. Once the file is uploaded, you can ask questions about its contents
4. The answers will be displayed below the question input

## API Endpoints
1. POST /upload: Uploads and parses the PDF.
2. POST /ask: Sends a question to Gemini with the extracted PDF context.

