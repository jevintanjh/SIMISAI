#!/usr/bin/env python3
"""
Script to create a Hugging Face Space directly with the model
"""

import os
import shutil
from huggingface_hub import HfApi, create_repo
from pathlib import Path

def create_space_with_model():
    # Configuration
    space_name = "simisai-cv-model"  # Change this to your desired space name
    username = input("Enter your Hugging Face username: ")
    space_id = f"{username}/{space_name}"
    
    # Create temporary directory for upload
    upload_dir = Path("temp_space_upload")
    upload_dir.mkdir(exist_ok=True)
    
    try:
        # Copy all necessary files for the Space
        print("Preparing Space files...")
        
        # Copy the model weights
        shutil.copy("models/poc2/best.pt", upload_dir / "best.pt")
        
        # Copy the Gradio app
        shutil.copy("app.py", upload_dir / "app.py")
        
        # Copy requirements
        shutil.copy("requirements.txt", upload_dir / "requirements.txt")
        
        # Copy README
        shutil.copy("README.md", upload_dir / "README.md")
        
        # Initialize Hugging Face API
        api = HfApi()
        
        # Create Space (not model repository)
        print(f"Creating Space: {space_id}")
        create_repo(
            space_id,
            repo_type="space",
            space_sdk="gradio",
            private=True,  # Set to True if you want it private
            exist_ok=True
        )
        
        # Upload files to the Space
        print("Uploading files to Hugging Face Space...")
        api.upload_folder(
            folder_path=str(upload_dir),
            repo_id=space_id,
            repo_type="space"
        )
        
        print(f"✅ Space successfully created at: https://huggingface.co/spaces/{space_id}")
        print(f"🌐 API endpoint will be: https://{username}-{space_name}.hf.space/predict")
        print(f"📝 Use this URL in your app: https://{username}-{space_name}.hf.space")
        
    except Exception as e:
        print(f"❌ Error creating Space: {e}")
        raise
    finally:
        # Clean up
        if upload_dir.exists():
            shutil.rmtree(upload_dir)

if __name__ == "__main__":
    create_space_with_model()
