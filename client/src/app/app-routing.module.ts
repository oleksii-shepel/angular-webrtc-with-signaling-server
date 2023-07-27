import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoomComponent } from './components/room/room.component';

const routes: Routes = [
  { path: 'room/:roomId', component: RoomComponent },
  { path: 'room', component: RoomComponent },
  { path: '', redirectTo: 'room', pathMatch: 'full' },
  { path: '*', redirectTo: 'room', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
