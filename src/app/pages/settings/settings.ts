import {Component} from '@angular/core';
import {DataService} from "../../core/data.service";

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings {
  constructor(public ds: DataService) {
  }
}
