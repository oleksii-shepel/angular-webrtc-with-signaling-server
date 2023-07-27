import { Injectable } from '@angular/core';
import * as client from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class IoService {
  static io = client;
  constructor() { }
}
