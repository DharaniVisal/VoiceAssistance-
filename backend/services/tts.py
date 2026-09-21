import subprocess
import sys
import winsound

def speak(text):

    command = [
        sys.executable,
        "-m",
        "piper",
        "--model",
        "en_US-lessac-medium.onnx",
        "--output_file",
        "response.wav"
    ]

    subprocess.run(
        command,
        input=text,
        text=True,
        encoding="utf-8",
        check=True
    )

    print("Voice response created: response.wav")

    # Play the generated voice
    winsound.PlaySound("response.wav", winsound.SND_FILENAME)

    print("Voice response played.")