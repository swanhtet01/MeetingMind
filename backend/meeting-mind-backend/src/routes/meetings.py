from flask import Blueprint, request, jsonify
import os
import openai
from datetime import datetime

meetings_bp = Blueprint('meetings', __name__)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

@meetings_bp.route('/', methods=['GET'])
def get_meetings():
    """Get all meetings"""
    # For now, return mock data
    meetings = [
        {
            "id": 1,
            "title": "Weekly Team Standup",
            "date": "2025-01-02",
            "duration": "30 minutes",
            "participants": ["Alice", "Bob", "Charlie"],
            "status": "completed"
        },
        {
            "id": 2,
            "title": "Product Planning Session",
            "date": "2025-01-03",
            "duration": "60 minutes", 
            "participants": ["Alice", "David", "Eve"],
            "status": "completed"
        }
    ]
    return jsonify(meetings)

@meetings_bp.route('/', methods=['POST'])
def create_meeting():
    """Create a new meeting"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Basic validation
    required_fields = ['title', 'transcript']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Create meeting record
    meeting = {
        "id": len(get_meetings().get_json()) + 1,
        "title": data['title'],
        "date": datetime.now().strftime("%Y-%m-%d"),
        "transcript": data['transcript'],
        "participants": data.get('participants', []),
        "duration": data.get('duration', 'Unknown'),
        "status": "processing"
    }
    
    return jsonify(meeting), 201

@meetings_bp.route('/<int:meeting_id>', methods=['GET'])
def get_meeting(meeting_id):
    """Get a specific meeting"""
    # Mock data for demo
    meeting = {
        "id": meeting_id,
        "title": "Weekly Team Standup",
        "date": "2025-01-02",
        "duration": "30 minutes",
        "transcript": "Alice: Good morning everyone. Let's start with our weekly standup. Bob, can you share your updates? Bob: Sure, I completed the user authentication feature and started working on the dashboard. Charlie: I finished the API documentation and will begin testing today.",
        "participants": ["Alice", "Bob", "Charlie"],
        "status": "completed"
    }
    return jsonify(meeting)

@meetings_bp.route('/<int:meeting_id>', methods=['DELETE'])
def delete_meeting(meeting_id):
    """Delete a meeting"""
    return jsonify({"message": f"Meeting {meeting_id} deleted successfully"})

@meetings_bp.route('/upload', methods=['POST'])
def upload_meeting():
    """Upload meeting audio/video file"""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    # For now, return success without actual processing
    # In production, this would handle file upload and transcription
    return jsonify({
        "message": "File uploaded successfully",
        "filename": file.filename,
        "status": "processing"
    }), 201

