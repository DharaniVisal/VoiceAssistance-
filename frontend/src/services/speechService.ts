import { ISpeechService } from '../types';

class SpeechService implements ISpeechService {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;

  isSupported(): boolean {
    return !!navigator.mediaDevices?.getUserMedia;
  }

  async startListening(
    onTranscript: (text: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onBackendResult?: (data: any) => void
  ): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const audioContext = new AudioContext();

      const source =
        audioContext.createMediaStreamSource(this.stream);

      const processor =
        audioContext.createScriptProcessor(4096, 1, 1);

      // Prevent microphone audio from being echoed through speakers
      const silentGain = audioContext.createGain();
      silentGain.gain.value = 0;

      const audioData: Float32Array[] = [];

      processor.onaudioprocess = (event) => {
        audioData.push(
          new Float32Array(
            event.inputBuffer.getChannelData(0)
          )
        );
      };

      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(audioContext.destination);

      this.recorder = new MediaRecorder(this.stream);
      this.recorder.start();

      setTimeout(async () => {
        try {
          if (this.recorder?.state === 'recording') {
            this.recorder.stop();
          }

          processor.disconnect();
          source.disconnect();
          silentGain.disconnect();

          const wavBlob = this.createWav(
            audioData,
            audioContext.sampleRate
          );

          const formData = new FormData();

          formData.append(
            'file',
            wavBlob,
            'voice.wav'
          );

          const response = await fetch(
            'http://127.0.0.1:8000/voice',
            {
              method: 'POST',
              body: formData
            }
          );

          if (!response.ok) {
            throw new Error(
              'Backend connection failed'
            );
          }

          const data = await response.json();

          onTranscript(
            data.text || '',
            true
          );

          if (onBackendResult) {
            onBackendResult(data);
          }

          // IMPORTANT:
          // Do NOT play audio here.
          // VoiceAssistantPage will play Piper audio
          // and keep the TTS stage synchronized.

          this.stopListening();

        } catch (error: any) {
          onError(
            error?.message ||
            'Backend processing failed'
          );

          this.stopListening();
        }
      }, 5000);

    } catch (error: any) {
      onError(
        error?.message ||
        'Could not access microphone'
      );
    }
  }

  private createWav(
    buffers: Float32Array[],
    sampleRate: number
  ): Blob {

    const length = buffers.reduce(
      (total, buffer) =>
        total + buffer.length,
      0
    );

    const samples =
      new Float32Array(length);

    let offset = 0;

    for (const buffer of buffers) {
      samples.set(
        buffer,
        offset
      );

      offset += buffer.length;
    }

    const buffer =
      new ArrayBuffer(
        44 + samples.length * 2
      );

    const view =
      new DataView(buffer);

    const writeString = (
      offset: number,
      text: string
    ) => {
      for (
        let i = 0;
        i < text.length;
        i++
      ) {
        view.setUint8(
          offset + i,
          text.charCodeAt(i)
        );
      }
    };

    writeString(0, 'RIFF');

    view.setUint32(
      4,
      36 + samples.length * 2,
      true
    );

    writeString(8, 'WAVE');

    writeString(12, 'fmt ');

    view.setUint32(
      16,
      16,
      true
    );

    view.setUint16(
      20,
      1,
      true
    );

    view.setUint16(
      22,
      1,
      true
    );

    view.setUint32(
      24,
      sampleRate,
      true
    );

    view.setUint32(
      28,
      sampleRate * 2,
      true
    );

    view.setUint16(
      32,
      2,
      true
    );

    view.setUint16(
      34,
      16,
      true
    );

    writeString(36, 'data');

    view.setUint32(
      40,
      samples.length * 2,
      true
    );

    let pos = 44;

    for (
      let i = 0;
      i < samples.length;
      i++
    ) {
      const sample = Math.max(
        -1,
        Math.min(1, samples[i])
      );

      view.setInt16(
        pos,
        sample < 0
          ? sample * 32768
          : sample * 32767,
        true
      );

      pos += 2;
    }

    return new Blob(
      [view],
      {
        type: 'audio/wav'
      }
    );
  }

  stopListening(): void {

    if (
      this.recorder?.state === 'recording'
    ) {
      this.recorder.stop();
    }

    this.stream
      ?.getTracks()
      .forEach((track) =>
        track.stop()
      );

    this.stream = null;
    this.recorder = null;
  }
}

export const speechService =
  new SpeechService();