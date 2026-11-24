import hashlib
import json
import logging
import requests
from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)


def calculate_file_sha256(file_path):
    """Calculate the SHA-256 hash of a stored evidence file."""
    sha256 = hashlib.sha256()

    with open(file_path, "rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            sha256.update(chunk)

    return sha256.hexdigest()


def transcribe_audio(audio_path):
    """Transcribe audio using Faster-Whisper."""
    model = WhisperModel(
        "base",
        device="cpu",
        compute_type="int8",
    )

    segments, info = model.transcribe(audio_path, beam_size=5)

    transcript_segments = []

    for segment in segments:
        transcript_segments.append({
            "start": round(segment.start, 2),
            "end": round(segment.end, 2),
            "text": segment.text.strip(),
        })

    full_text = " ".join(
        segment["text"] for segment in transcript_segments
    )

    return {
        "language": info.language,
        "language_probability": round(info.language_probability, 3),
        "segments": transcript_segments,
        "full_text": full_text,
    }


def analyze_audio_transcript(transcript, evidence_id):
    """Analyze a transcript using a local Ollama model."""

    url = "http://localhost:11434/api/chat"

    prompt = f"""
Analyze this audio transcript for a digital forensics investigation.

Evidence ID: {evidence_id}

Transcript:
{transcript}

Return a JSON object with these fields:
{{
    "summary": "Brief summary of the conversation",
    "people_mentioned": [],
    "dates_and_times": [],
    "locations_mentioned": [],
    "key_statements": [],
    "uncertainties": [],
    "requires_human_review": true
}}

Rules:
- Use only information supported by the transcript.
- Do not invent facts or identities.
- Use empty lists when information is unavailable.
- Keep the summary concise.
- This is preliminary investigative assistance, not proof of wrongdoing.
"""

    payload = {
        "model": "qwen3:4b",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a concise digital forensics assistant. "
                    "Return only the requested JSON object. "
                    "Do not include explanations outside the JSON."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "stream": False,
        "think": False,
        "format": "json",
        "options": {
            "num_predict": 400,
            "temperature": 0,
        },
    }

    try:
        response = requests.post(
            url,
            json=payload,
            timeout=600,
        )
        response.raise_for_status()

        result = response.json()
        content = result.get("message", {}).get("content", "")

        if not content.strip():
            raise RuntimeError("Ollama returned empty analysis content.")

        try:
            return json.loads(content)
        except json.JSONDecodeError as exc:
            raise RuntimeError(
                "Ollama returned invalid JSON."
            ) from exc

    except requests.exceptions.Timeout as exc:
        logger.warning("Ollama timed out while analyzing transcript: %s", exc)
        return {
            "summary": "Transcript extracted. Ollama LLM timed out during forensic summarization.",
            "people_mentioned": [],
            "dates_and_times": [],
            "locations_mentioned": [],
            "key_statements": [s.strip() for s in transcript.split(".")[:3] if s.strip()],
            "uncertainties": ["Ollama LLM timed out. Re-run analysis or check system load."],
            "requires_human_review": True,
        }

    except requests.exceptions.RequestException as exc:
        logger.warning("Ollama connection failed: %s. Returning preliminary transcript summary.", exc)
        return {
            "summary": "Audio transcribed successfully. (Ollama local LLM is offline or not responding on port 11434).",
            "people_mentioned": [],
            "dates_and_times": [],
            "locations_mentioned": [],
            "key_statements": [s.strip() for s in transcript.split(".")[:3] if s.strip()],
            "uncertainties": [f"Local LLM (qwen3:4b) offline. Start Ollama with 'ollama serve' and 'ollama pull qwen3:4b' to generate deep forensic entity extraction."],
            "requires_human_review": True,
        }