import hashlib
from pathlib import Path
from django.conf import settings
from rest_framework.exceptions import ValidationError

ALLOWED = {".jpg",".jpeg",".png",".gif",".webp",".bmp",".mp4",".avi",".mov",".mkv",".webm",".mp3",".wav",".m4a",".aac",".ogg",".pdf",".doc",".docx",".txt",".csv"}

def file_type(name):
    e = Path(name).suffix.lower()
    if e in {".jpg",".jpeg",".png",".gif",".webp",".bmp"}: return "IMAGE"
    if e in {".mp4",".avi",".mov",".mkv",".webm"}: return "VIDEO"
    if e in {".mp3",".wav",".m4a",".aac",".ogg"}: return "AUDIO"
    if e in {".pdf",".doc",".docx",".txt",".csv"}: return "DOCUMENT"
    return "OTHER"

def sha256_file(f):
    h = hashlib.sha256()
    for chunk in f.chunks():
        h.update(chunk)
    f.seek(0)
    return h.hexdigest()

def validate_file(f):
    if f.size > settings.MAX_UPLOAD_MB * 1024 * 1024:
        raise ValidationError({"file": f"Maximum upload size is {settings.MAX_UPLOAD_MB} MB."})
    if Path(f.name).suffix.lower() not in ALLOWED:
        raise ValidationError({"file": "File extension is not allowed."})
