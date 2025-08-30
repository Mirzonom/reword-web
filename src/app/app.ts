import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('reword-web');
  vocabulary = [
    { german: 'Hallo', russian: 'Привет' },
    { german: 'Welt', russian: 'Мир' },
    { german: 'Haus', russian: 'Дом' },
    { german: 'Buch', russian: 'Книга' },
    { german: 'Auto', russian: 'Машина' },
    { german: 'Freund', russian: 'Друг' },
    { german: 'Essen', russian: 'Еда' },
    { german: 'Wasser', russian: 'Вода' },
    { german: 'Schule', russian: 'Школа' },
    { german: 'Arbeit', russian: 'Работа' },
    { german: 'Liebe', russian: 'Любовь' },
    { german: 'Zeit', russian: 'Время' }
  ];
}
