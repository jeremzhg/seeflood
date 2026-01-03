import io
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from fastapi import FastAPI, File, UploadFile
import uvicorn

app = FastAPI()

def get_model():
    model = models.efficientnet_b0(weights=None)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, 3)
    return model

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = get_model()

try:
    state_dict = torch.load("../training/seeflood_model.pth", map_location=device)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    print("model loaded successfully")
except Exception as e:
    print(f"error: {e}")

transform = transforms.Compose([
    transforms.Resize((320, 320)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    
    img_tensor = transform(image).unsqueeze(0).to(device)
    
    with torch.no_grad():
        logits = model(img_tensor)
        probs = torch.sigmoid(logits)
        expected_val = probs.sum(dim=1)
        predicted_idx = expected_val.round().long().clamp(0, 3)
        
    classes = ["none", "light", "moderate", "severe"]
    result = classes[predicted_idx.item()]
    
    return {"class": result}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)