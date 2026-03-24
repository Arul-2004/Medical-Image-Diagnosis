import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import io
import numpy as np
import cv2
import base64

# Define the classes
CLASSES = ['Normal', 'Pneumonia', 'Tumor', 'Fracture']

class MedicalImageClassifier:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_id = "openai/clip-vit-base-patch32"
        
        # Load CLIP model and processor
        print(f"Loading CLIP model {self.model_id} on {self.device}...")
        self.model = CLIPModel.from_pretrained(self.model_id).to(self.device)
        self.processor = CLIPProcessor.from_pretrained(self.model_id)
        
        # We craft descriptive prompts to help CLIP perform zero-shot classification accurately
        self.text_prompts = [
            "a normal medical scan",
            "a chest x-ray showing pneumonia or lung opacity",
            "a brain mri scan showing a clearly visible tumor",
            "an x-ray showing a fractured, broken, cracked bone"
        ]

    def predict(self, image_bytes):
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        inputs = self.processor(text=self.text_prompts, images=image, return_tensors="pt", padding=True).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits_per_image = outputs.logits_per_image # this is the image-text similarity score
            probs = logits_per_image.softmax(dim=1).cpu().numpy()[0] # get probabilities
            
        pred_idx = np.argmax(probs)
        confidence = float(probs[pred_idx])
        probs_dict = {CLASSES[i]: float(probs[i]) for i in range(len(CLASSES))}
            
        return {
            "prediction": CLASSES[pred_idx],
            "confidence": confidence,
            "probabilities": probs_dict
        }

    def generate_gradcam(self, image_bytes):
        # We keep the same mock Grad-CAM visualization for demonstration purposes 
        # since CLIP attention mapping requires complex hook injections and is mostly for visual flair here.
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_array = np.array(image)
        img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        
        h, w, _ = img_array.shape
        heatmap = np.zeros((h, w), dtype=np.float32)
        
        np.random.seed(int(np.sum(img_array) % 1000))
        center_x = np.random.randint(w//4, 3*w//4)
        center_y = np.random.randint(h//4, 3*h//4)
        radius = np.random.randint(min(h, w)//8, min(h, w)//3)
        
        cv2.circle(heatmap, (center_x, center_y), radius, (1.0,), -1)
        heatmap = cv2.GaussianBlur(heatmap, (51, 51), 0)
        
        heatmap = np.uint8(255 * heatmap)
        colored_heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        
        alpha = 0.4
        superimposed_img = cv2.addWeighted(colored_heatmap, alpha, img_array, 1 - alpha, 0)
        
        superimposed_image_rgb = cv2.cvtColor(superimposed_img, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(superimposed_image_rgb)
        
        img_byte_arr = io.BytesIO()
        pil_img.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)
        
        encoded = base64.b64encode(img_byte_arr.read()).decode('utf-8')
        return encoded

classifier = MedicalImageClassifier()
