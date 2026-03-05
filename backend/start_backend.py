import uvicorn
import logging
from app.main import app
from app.api import camera_manager

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

if __name__ == "__main__":
    logging.info("Starting up CCTV Face Recognition backend...")
    
    # Start the camera workers in background threads
    camera_manager.start_all()
    
    # Run the Uvicorn web server
    uvicorn.run(app, host="0.0.0.0", port=8000)
