import io
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from fastapi import FastAPI, File, UploadFile
import uvicorn

app = FastAPI()

def get_model():
    model = models.mobilenet_v2(weights=None) 
    model.classifier[1] = nn.Linear(model.last_channel, 3) 
    return model

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = get_model()

try:
    state_dict = torch.load("../training/seeflood_model.pth", map_location=device)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval() 
    print("✅ Seeflood PyTorch Model (MobileNetV2) loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    
    img_tensor = transform(image).unsqueeze(0).to(device)
    
    with torch.no_grad():
        outputs = model(img_tensor)
        _, predicted = torch.max(outputs, 1)
        
    classes = ["no flood", "light", "moderate", "severe"]
    result = classes[predicted.item()]
    
    return {"class": result}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)