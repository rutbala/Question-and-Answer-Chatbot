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


Getting Started:

1. Clone the Repository:
   
git clone https://github.com/rutbala/Question-and-Answer-Chatbot.git


2. Setup Backend (Flask):
   
cd backend

python -m venv venv

venv\Scripts\activate


3. Create a .env file:

API_KEY=your_gemini_api_key_here


4. Start the server:

python app.py


5. Setup Frontend (React)

cd ../frontend

npm install

npm start



API Endpoints:

POST /upload: Uploads and parses the PDF.


POST /ask: Sends a question to Gemini with the extracted PDF context.


