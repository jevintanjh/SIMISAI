import cv2
import os
import glob
import time

# === Config ===
save_folder = 'data/blood_pressure_poc3'  # Changed from absolute to relative path
camera_index = 0   # 0 = default webcam. Try 1/2 if you have multiple cameras.
width, height = 1280, 720  # set to None,None to skip forcing resolution

# Create the folder if it doesn't exist
os.makedirs(save_folder, exist_ok=True)

# Continue numbering from the highest existing filename
existing = glob.glob(os.path.join(save_folder, '*.jpg'))
if existing:
    try:
        # Sort numerically by extracting the number from each filename
        existing_numbers = []
        for filepath in existing:
            filename = os.path.basename(filepath)
            number = int(os.path.splitext(filename)[0])
            existing_numbers.append(number)
        last_num = max(existing_numbers)
    except ValueError:
        last_num = 0
else:
    last_num = 0
image_count = last_num + 1

# Initialize the webcam
# On Windows, you can try cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)
cap = cv2.VideoCapture(camera_index)

if width and height:
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

# Check if the camera opened correctly
if not cap.isOpened():
    print(f"Cannot open webcam (index {camera_index})")
    exit(1)

print("Press SPACE to capture, ESC to exit.")
while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break

    # Show live feed
    cv2.imshow("Webcam Feed", frame)

    # Key handling
    key = cv2.waitKey(1) & 0xFF

    if key == ord(' '):  # SPACE to capture
        img_name = os.path.join(save_folder, f"{image_count}.jpg")
        cv2.imwrite(img_name, frame)
        print(f"Image saved: {img_name}")
        image_count += 1

        # tiny debounce so multiple frames aren’t saved on one press
        time.sleep(0.1)

    elif key == 27:  # ESC to quit
        print("Exiting...")
        break

# Cleanup
cap.release()
cv2.destroyAllWindows()
