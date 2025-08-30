import {Component} from '@angular/core';
import {DataService} from '../../core/data.service';

@Component({
  selector: 'app-dictionary',
  imports: [],
  templateUrl: './dictionary.html',
  styleUrl: './dictionary.scss'
})
export class Dictionary {
  constructor(public ds: DataService) {
  }
}
