from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib, re, unicodedata

model = joblib.load("models/svm.joblib")
vectorization = joblib.load("models/vectorization.joblib")
app = FastAPI()

class InputText(BaseModel):
    text: str

def clean_text(text: str) -> str:
    text = text.lower() # Lowercase
    text = re.sub(r'https?://\S+|www\.\S+','',text) # Remove URLs
    text = re.sub('<.*?>+','',text) # Remove HTML tags

    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8', 'ignore')

    text = re.sub(r'[^a-zA-Z\s]', '', text) # Remove non-alphabetic characters
    text = re.sub(r'\s+', ' ', text).strip() # Remove extra spaces
    
    return text

@app.post("/predict")
async def predict(input_text: InputText):
    if not input_text.text:
        raise HTTPException(status_code=400, detail="Input 'text' cannot be empty")
    
    cleaned_text = clean_text(input_text.text)
    vectorized_text = vectorization.transform([cleaned_text])

    prediction = model.predict(vectorized_text)
    
    return {"prediction": int(prediction)}

@app.get("/")
async def root():
    return {"message": "Fake News Detector API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)