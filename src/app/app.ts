import {Component} from '@angular/core';
import {Sidebar} from './layouts/sidebar/sidebar';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    Sidebar,
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
