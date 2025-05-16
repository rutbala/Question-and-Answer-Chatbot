from flask import Flask, request, render_template, jsonify
import os 
from dotenv import load_dotenv
import google.generativeai as genai
import requests 


load_dotenv()
MY_API_KEY = os.getenv("API_KEY")

#storing uploaded pdf globably
context_text = ""

#creating a flask instance
app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    return render_template("base.html")

@app.route('/upload', methods=['POST'])
def uploadfile():
    global context_text
    pdf = request.files.get("PDF")
    if pdf:
        import fitz
        doc = fitz.open(stream=pdf.read(), filetype="pdf")
        context_text = " ".join([page.get_text() for page in doc])
        return "PDF uploaded and text extracted!"
    return "No file received"


@app.route('/ask', methods=['POST'])
def askquestion():
    global context_text
    question = request.form.get("question")

    if not context_text:
        return render_template("base.html", answer="Please upload a PDF first.")
    if not question:
        return render_template("base.html", answer="Please enter a question.")

    prompt = f"Based on the following document, answer this question:\n\nContext:\n{context_text}\n\nQuestion:\n{question}"

    try:
        # Construct API request to Gemini via REST
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={MY_API_KEY}"
        
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ]
        }

        headers = {"Content-Type": "application/json"}

        response = requests.post(url, headers=headers, json=payload)
        data = response.json()

        # Parse response
        if "candidates" in data:
            answer = data["candidates"][0]["content"]["parts"][0]["text"]
        else:
            answer = "No response from Gemini API."

        return render_template("base.html", answer=answer)

    except Exception as e:
        return render_template("base.html", answer=f"Error: {str(e)}")


if __name__ == "__main__":
    app.run(debug=True)