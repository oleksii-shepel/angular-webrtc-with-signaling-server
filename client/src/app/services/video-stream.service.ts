import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VideoStreamService {
  private mediaStream: MediaStream | undefined = undefined;

  public getMediaStream(): Promise<MediaStream> {
    if (!this.mediaStream) {
      return navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: true
        })
        .then((stream: MediaStream) => {
          return Promise.resolve(stream);
        })
        .catch((err: Error) => {
          console.error('Error accessing the hardware:', err);
          return Promise.reject(err);
        });
    } else {
      return Promise.resolve(this.mediaStream);
    }
  }
}
