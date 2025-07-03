import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.routes.meetings import meetings_bp
from src.routes.analysis import analysis_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'meetingmind-super-mega-inc-2025'

# Enable CORS for all routes
CORS(app, origins="*")

# Register blueprints
app.register_blueprint(meetings_bp, url_prefix='/api/meetings')
app.register_blueprint(analysis_bp, url_prefix='/api/analysis')

@app.route('/api/health')
def health_check():
    return {"status": "healthy", "service": "MeetingMind API"}

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return {"message": "MeetingMind API is running", "frontend": "Not deployed yet"}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

