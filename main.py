import os
import subprocess
import shutil
import uuid
from pathlib import Path

# --- New Imports for Chord Recognition ---
import librosa
import numpy as np


# --- NEW: Import Form for model selection ---
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# --- Application Setup ---
app = FastAPI(
    title="All in one Audio Separator and Chord Analyser",
    description="A web server for music source separation and chord analysis.",
    version="1.3.2", # Updated for silence handling in chord analysis
)

# --- CORS Configuration ---
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Directory Setup ---
BASE_DIR = Path(__file__).resolve().parent
TEMP_DIR = BASE_DIR / "temp"
OUTPUT_DIR = BASE_DIR / "separated"

TEMP_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# --- Static File Serving ---
app.mount("/separated", StaticFiles(directory=OUTPUT_DIR), name="separated")


# --- Helper Function for Demucs ---
def run_demucs(input_path: Path, model: str):
    output_path = input_path.parent / model
    command = [
        "python", "-m", "demucs",
        "-n", model,  # Use the model passed from the UI
        "--out", str(input_path.parent),
        "--mp3",
        "--mp3-bitrate", "192",
        str(input_path)
    ]
    
    print(f"Running command: {' '.join(command)}")
    process = subprocess.run(command, capture_output=True, text=True)
    print("Demucs STDOUT:", process.stdout)
    print("Demucs STDERR:", process.stderr)
    return output_path, process.stdout, process.stderr

# --- Updated Helper Function for Chord Recognition ---
# Implemented silence handling by forcing 'N' in low-energy frames
def analyze_chords(audio_path: Path):
    print(f"\n--- RUNNING LATEST CHORD ANALYSIS CODE (v1.3.2) ---\n")
    try:
        # Load the audio file
        y, sr = librosa.load(audio_path)
        print(f"Audio loaded successfully: {audio_path}, duration: {len(y)/sr:.2f} seconds")

        # Check if the audio is too short or silent
        if len(y) < sr:  # Less than 1 second of audio
            print("Warning: Audio is too short for meaningful chord analysis. Returning empty list.")
            return []

        # Perform harmonic-percussive source separation
        y_harmonic, _ = librosa.effects.hpss(y, margin=4.0)
        print("Harmonic-percussive separation completed")

        # Compute chroma features (use chroma_cens for robustness in chord tasks)
        chroma = librosa.feature.chroma_cens(y=y_harmonic, sr=sr)
        if chroma is None or chroma.size == 0:
            print("Warning: Chroma feature extraction failed. Audio may lack harmonic content. Returning empty list.")
            return []

        # Check for invalid values in chroma
        if np.any(np.isnan(chroma)) or np.any(chroma < 0):
            print("Warning: Chroma contains invalid values (NaN or negative). Returning empty list.")
            return []

        print(f"Chroma shape: {chroma.shape}")

        # Create templates for major, minor, and no-chord qualities
        maj_template = np.array([1,0,0, 0,1,0, 0,1,0, 0,0,0])
        min_template = np.array([1,0,0, 1,0,0, 0,1,0, 0,0,0])
        N_template   = np.array([1,1,1, 1,1,1, 1,1,1, 1,1,1.]) / 4.

        # Generate the weighting matrix that maps chroma to labels (25 states: 12 maj, 12 min, 1 no-chord)
        weights = np.zeros((25, 12), dtype=float)
        labels = ['C', 'C#', 'D', 'D#', 'E', 'F',
                    'F#', 'G', 'G#', 'A', 'A#', 'B',
                    'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm',
                    'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm',
                    'N']  # Standard chord notation (maj without suffix, min with 'm', 'N' for no-chord/silence)
        for c in range(12):
            weights[c, :] = np.roll(maj_template, c)  # c:maj
            weights[c + 12, :] = np.roll(min_template, c)  # c:min
        weights[-1] = N_template  # the last row is the no-chord class

        # Make a self-loop transition matrix over 25 states
        transition = librosa.sequence.transition_loop(25, 0.9)

        # Map chroma (observations) to class (state) likelihoods
        probs = np.exp(weights.dot(chroma))  # P[class | chroma] ~= exp(template' chroma)
        probs /= probs.sum(axis=0, keepdims=True) + 1e-15  # Normalize to sum to 1, add epsilon to avoid division issues

        # NEW: Handle silence/low-energy frames by forcing 'N' (no-chord)
        # Compute energy per frame (squared sum for RMS-like measure)
        energy = np.sum(chroma**2, axis=0)
        threshold = 0.01  # Empirical threshold; adjust based on testing (lower for stricter silence detection)
        low_energy = energy < threshold
        probs[:-1, low_energy] = 0  # Set non-N probabilities to 0 for low-energy frames
        probs[-1, low_energy] = 1  # Force N (silence/no-chord)

        print("Chord probabilities computed, with silence handling")

        # Perform chord recognition with Viterbi
        chords_raw = librosa.sequence.viterbi_discriminative(probs, transition)
        if chords_raw is None:
            print("Warning: Chord analysis returned no valid data (viterbi). The audio might be non-musical or too noisy.")
            return []

        # Convert chord indices to chord labels
        chord_labels = [labels[i] for i in chords_raw]
        times = librosa.times_like(chroma, sr=sr, hop_length=512)
        
        # Build chord progression, skipping 'N' (silence) segments to avoid displaying them
        chord_progression = []
        if len(chord_labels) > 0:
            current_chord = chord_labels[0]
            start_time = times[0]
            
            for i in range(1, len(chord_labels)):
                if chord_labels[i] != current_chord:
                    if current_chord != 'N':  # Skip adding silence segments
                        chord_progression.append({
                            "chord": current_chord,
                            "start": round(start_time, 2),
                            "end": round(times[i], 2)
                        })
                    current_chord = chord_labels[i]
                    start_time = times[i]
            
            if current_chord != 'N':  # Skip last if silence
                chord_progression.append({
                    "chord": current_chord,
                    "start": round(start_time, 2),
                    "end": round(times[-1], 2)
                })
            
        print(f"Chord progression extracted: {len(chord_progression)} chords (silence segments skipped)")
        return chord_progression

    except Exception as e:
        print(f"Error during chord analysis: {str(e)}")
        if isinstance(e, ValueError) and "Invalid probability values" in str(e):
            print("Warning: Handled invalid probability values error. Returning empty list.")
            return []
        if isinstance(e, TypeError) and "'NoneType' object has no attribute 'shape'" in str(e):
            print("Warning: Handled a TypeError during chord analysis. Returning empty list.")
            return []
        print(f"Unexpected error during chord analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

# --- API Endpoints ---
# --- UPDATED: Endpoint now accepts form data for the model ---
@app.post("/separate")
async def separate_audio(file: UploadFile = File(...), model: str = Form(...)):
    # Validate the incoming model name
    allowed_models = ['htdemucs', 'htdemucs_6s']
    if model not in allowed_models:
        raise HTTPException(status_code=400, detail="Invalid model selected.")

    request_id = str(uuid.uuid4())
    session_dir = TEMP_DIR / request_id
    session_dir.mkdir()
    input_path = session_dir / file.filename
    
    try:
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()

    # Pass the validated model to the processing function
    separated_dir, stdout, stderr = run_demucs(input_path, model)
    stems = {}
    if separated_dir.exists() and separated_dir.is_dir():
        for extension in ["*.mp3", "*.wav"]:
            for stem_file in separated_dir.rglob(extension):
                stem_name = stem_file.stem
                final_filename = f"{request_id}_{stem_file.name}"
                final_path = OUTPUT_DIR / final_filename
                shutil.move(str(stem_file), str(final_path))
                stems[stem_name] = f"separated/{final_filename}"

    shutil.rmtree(session_dir)
    
    if not stems:
        error_details = stderr or stdout or "Demucs completed but produced no output."
        raise HTTPException(status_code=500, detail=f"Demucs failed: {error_details}")
    return {"stems": stems}

@app.post("/chords")
async def get_chords(file: UploadFile = File(...)):
    temp_path = TEMP_DIR / f"{uuid.uuid4()}_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()

    chords = analyze_chords(temp_path)
    
    os.remove(temp_path)
    
    return {"chords": chords}


@app.get("/")
def read_root():
    return {"message": "Demucs API is running."}