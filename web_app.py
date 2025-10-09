from flask import Flask, request, jsonify
import torch
import librosa
from infer import separate_sources

app = Flask(__name__)

@app.route('/separate', methods=['POST'])
def separate():
    file = request.files['file']
    file_path = "temp.wav"
    file.save(file_path)
    separated_audio = separate_sources(file_path)
    return jsonify({"message": "Separation complete!"})

if __name__ == '__main__':
    app.run(debug=True)