import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

WHISPER = (
    BASE_DIR
    / "whisper.cpp"
    / "build"
    / "bin"
    / "Release"
    / "whisper-cli.exe"
)

MODEL = (
    BASE_DIR
    / "whisper.cpp"
    / "models"
    / "ggml-small.bin"
)


def transcribe(audio_file, language="en"):

    command = [
        str(WHISPER),
        "-m",
        str(MODEL),
        "-f",
        str(audio_file),
        "-l",
        language
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )

    lines = []

    for line in result.stdout.splitlines():

        if "]" in line:
            text = line.split("]", 1)[1].strip()

            if text:
                lines.append(text)

    return " ".join(lines)