import { VideoStreamService } from './services/video-stream.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { RoomComponent } from './components/room/room.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { IoService } from './services/io.service';
import { RoomService } from './services/room.service';

window.RTCPeerConnection = window.RTCPeerConnection || (window as any).webkitRTCPeerConnection || (window as any).mozRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || (window as any).mozRTCIceCandidate || (window as any).webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || (window as any).mozRTCSessionDescription || (window as any).webkitRTCSessionDescription;
window.URL = window.URL || (window as any).mozURL || window.webkitURL;
(window.navigator as any).getUserMedia = (window.navigator as any).getUserMedia || (window.navigator as any).webkitGetUserMedia || (window.navigator as any).mozGetUserMedia;


@NgModule({
  declarations: [
    AppComponent,
    RoomComponent,
    VideoPlayerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [IoService, RoomService, VideoStreamService],
  bootstrap: [AppComponent]
})
export class AppModule { }
