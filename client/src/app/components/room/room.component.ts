import { Component } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { RoomService } from 'src/app/services/room.service';
import { VideoStreamService } from 'src/app/services/video-stream.service';

@Component({
  selector: 'room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent {
  error: string | undefined;
  stream: MediaStream | undefined;
  peers: any[] = [];

  constructor(vss: VideoStreamService, rs: RoomService, ar: ActivatedRoute, router: Router) {
    if(!window.RTCPeerConnection || !(navigator as any).getUserMedia) {
      this.error = 'WebRTC is not supported by your browser. You can try the app with Chrome and Firefox.';
      return;
    }

    vss.getMediaStream().then((s) => {
      this.stream = s;
      rs.init(this.stream);
      let snapshot = ar.snapshot.params;
      if (!snapshot || !snapshot['roomId']) {
        rs.createRoom().then((roomId) => {
          router.navigateByUrl('/room/' + roomId);
        });
      } else {
        rs.joinRoom(snapshot['roomId']);
      }
    }, () => {
      this.error = 'No audio/video permissions. Please refresh your browser and allow the audio/video capturing.';
    });

    rs.onPeerStream.subscribe((peer: any) => {
      console.log('Client connected, adding new stream');
      this.peers.push({
        id: peer.id,
        stream: peer.stream
      });
    });

    rs.onPeerDisconnected.subscribe((peer: any) => {
      console.log('Client disconnected, removing stream');
      this.peers = this.peers.filter((p: any) => {
        return p.id !== peer.id;
      });
    });
  }

  getLocalVideo() {
    return this.stream;
  }
}
