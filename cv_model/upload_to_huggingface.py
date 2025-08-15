#!/usr/bin/env python3
"""
Script to upload the YOLOv8 model to Hugging Face Hub
"""

import os
import shutil
from huggingface_hub import HfApi, create_repo
from pathlib import Path

def upload_model_to_hf():
    # Configuration
    model_name = "simisai1.0"  # Change this to your desired model name
    username = input("Enter your Hugging Face username: ")
    repo_name = f"{username}/{model_name}"
    
    # Create temporary directory for upload
    upload_dir = Path("temp_upload")
    upload_dir.mkdir(exist_ok=True)
    
    try:
        # Copy model files
        print("Preparing model files...")
        
        # Copy the model weights
        shutil.copy("models/poc1/weights/best.pt", upload_dir / "best.pt")
        
        # Copy config files
        shutil.copy("config.json", upload_dir / "config.json")
        shutil.copy("README.md", upload_dir / "README.md")
        
        # Copy training args if available
        if os.path.exists("models/poc1/args.yaml"):
            shutil.copy("models/poc1/args.yaml", upload_dir / "args.yaml")
        
        # Initialize Hugging Face API
        api = HfApi()
        
        # Create repository
        print(f"Creating repository: {repo_name}")
        create_repo(
            repo_name,
            repo_type="model",
            private=True,  # Set to True if you want it private
            exist_ok=True
        )
        
        # Upload files
        print("Uploading files to Hugging Face Hub...")
        api.upload_folder(
            folder_path=str(upload_dir),
            repo_id=repo_name,
            repo_type="model"
        )
        
        print(f"✅ Model successfully uploaded to: https://huggingface.co/{repo_name}")
        print(f"📝 You can now use this model in your app with the ID: {repo_name}")
        
    except Exception as e:
        print(f"❌ Error uploading model: {e}")
        raise
    finally:
        # Clean up
        if upload_dir.exists():
            shutil.rmtree(upload_dir)

if __name__ == "__main__":
    upload_model_to_hf()
