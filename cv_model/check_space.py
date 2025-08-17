#!/usr/bin/env python3
"""
Script to check the contents of your Hugging Face Space
"""

from huggingface_hub import HfApi, list_repo_files

def check_space_contents():
    username = input("Enter your Hugging Face username: ")
    space_name = input("Enter your Space name (e.g., simisai-cv-model): ")
    space_id = f"{username}/{space_name}"
    
    try:
        # List files in the Space
        print(f"Checking Space: {space_id}")
        files = list_repo_files(space_id, repo_type="space")
        
        print("\n📁 Files in your Space:")
        for file in files:
            print(f"  - {file}")
        
        # Check for essential files
        essential_files = ["app.py", "requirements.txt", "best.pt", "README.md"]
        missing_files = []
        
        for file in essential_files:
            if file not in files:
                missing_files.append(file)
        
        if missing_files:
            print(f"\n❌ Missing files: {missing_files}")
        else:
            print(f"\n✅ All essential files are present!")
        
        # Show the Space URL
        space_url = f"https://{username}-{space_name}.hf.space"
        api_url = f"{space_url}/predict"
        
        print(f"\n🌐 Your Space URLs:")
        print(f"  - Web Interface: {space_url}")
        print(f"  - API Endpoint: {api_url}")
        print(f"  - Space Repository: https://huggingface.co/spaces/{space_id}")
        
    except Exception as e:
        print(f"❌ Error checking Space: {e}")

if __name__ == "__main__":
    check_space_contents()
