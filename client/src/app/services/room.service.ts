import { Socket } from 'socket.io-client';
import { IoService } from './io.service';
import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  @Output() onPeerStream = new EventEmitter<any>();
  @Output() onPeerDisconnected = new EventEmitter<any>();

  constructor(io: IoService) {
    this.addHandlers();
  }

  iceConfig: RTCConfiguration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }]};
  peerConnections = {} as any;
  currentId: any;
  roomId: any;
  stream: MediaStream | undefined;

  socket = IoService.io.connect("http://localhost:5555");
  connected = false;

  getPeerConnection(id: any) {
    if (this.peerConnections[id]) {
      return this.peerConnections[id];
    }
    let pc = new RTCPeerConnection(this.iceConfig);
    this.peerConnections[id] = pc;
    if(this.stream) {

      pc.onicecandidate = (evnt) => {
        this.socket.emit('msg', { by: this.currentId, to: id, ice: evnt.candidate, type: 'ice' });
      };
      (pc as any).onaddstream = (evnt: any) => {
        console.log('Received new stream');
        this.onPeerStream.emit({
          id: id,
          stream: evnt.stream
        });
      };

      (pc as any).addStream(this.stream);
    }
    return pc;
  }

  makeOffer(id: any) {
    let pc = this.getPeerConnection(id);
    pc.createOffer((sdp: any) => {
      pc.setLocalDescription(sdp);
      console.log('Creating an offer for', id);
      this.socket.emit('msg', { by: this.currentId, to: id, sdp: sdp, type: 'sdp-offer' });
    }, (e: Error) => {
      console.log(e);
    },
    { mandatory: { offerToReceiveVideo: true, offerToReceiveAudio: true }});
  }

  handleMessage(data: any) {
    let pc = this.getPeerConnection(data.by);
    switch (data.type) {
      case 'sdp-offer':
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp), () => {
          console.log('Setting remote description by offer');
          pc.createAnswer((sdp: any) => {
            pc.setLocalDescription(sdp);
            this.socket.emit('msg', { by: this.currentId, to: data.by, sdp: sdp, type: 'sdp-answer' });
          }, (e: Error) => {
            console.log(e);
          });
        }, (e: Error) => {
          console.log(e);
        });
        break;
      case 'sdp-answer':
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp), () => {
          console.log('Setting remote description by answer');
        }, (e: Error) => {
          console.error(e);
        });
        break;
      case 'ice':
        if (data.ice) {
          console.log('Adding ice candidates');
          pc.addIceCandidate(new RTCIceCandidate(data.ice));
        }
        break;
    }
  }

  addHandlers() {
    this.socket.on('peer.connected', (params: any) => {
      this.makeOffer(params.id);
    });
    this.socket.on('peer.disconnected', (data: any) => {
      this.onPeerDisconnected.emit(data);
    });

    this.socket.on('msg', (data: any) => {
      this.handleMessage(data);
    });
  }

  joinRoom(r: any) {
    if (!this.connected) {
      this.socket.emit('init', {room: r}, (response: any) => {
        this.roomId = response.room;
        this.currentId = response.id;
        this.connected = true;
      });
    }
  }

  createRoom() {
    let d = new Promise((resolve) => {
      this.socket.emit('init', {}, (response: any) => {
        this.roomId = response.room;
        this.currentId = response.id;
        this.connected = true;
        resolve(response.room);
      });
    });
    return d;
  }

  init(s: MediaStream) {
    this.stream = s;
  }
}
