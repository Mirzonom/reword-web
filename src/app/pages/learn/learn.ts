import {Component} from '@angular/core';
import {DataService} from '../../core/data.service';

@Component({
  selector: 'app-learn',
  imports: [],
  templateUrl: './learn.html',
  styleUrl: './learn.scss'
})
export class Learn {
  constructor(public ds: DataService) {
  }
}
