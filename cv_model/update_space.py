#!/usr/bin/env python3
"""
Script to update the Hugging Face Space with the corrected app.py
"""

import os
from huggingface_hub import HfApi
from pathlib import Path

def update_space():
    # Configuration
    space_name = "simisai-cv-model"
    username = "spizzray"
    space_id = f"{username}/{space_name}"
    
    try:
        # Initialize Hugging Face API
        api = HfApi()
        
        print(f"Updating Space: {space_id}")
        
        # Upload the updated app.py
        print("Uploading updated app.py...")
        api.upload_file(
            path_or_fileobj="app.py",
            path_in_repo="app.py",
            repo_id=space_id,
            repo_type="space"
        )
        
        print("✅ Space updated successfully!")
        print(f"🌐 Your Space will rebuild automatically")
        print(f"📝 Check the status at: https://huggingface.co/spaces/{space_id}")
        print(f"🔗 API endpoint will be: https://{username}-{space_name}.hf.space/run/predict")
        
        print("\n⏳ Wait a few minutes for the rebuild to complete...")
        
    except Exception as e:
        print(f"❌ Error updating Space: {e}")
        raise

if __name__ == "__main__":
    update_space()

