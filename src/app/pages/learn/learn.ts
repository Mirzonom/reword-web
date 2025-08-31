import {Component, effect, signal} from '@angular/core';
import {DataService} from '../../core/data.service';
import {Mode, Word} from '../../models/word.model';
import {FormsModule} from '@angular/forms';
import {ChevronLeft, ChevronRight, Eye, Keyboard, List, LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-learn',
  imports: [
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './learn.html',
  styleUrl: './learn.scss'
})
export class Learn {
  selectedCategoryIds = signal<string[]>([]);

  mode = signal<Mode>({id: 'mixed', label: 'Смешанный режим'});
  modes: Mode[] = [
    {id: 'new', label: 'Учить новые'},
    {id: 'review', label: 'Повторить'},
    {id: 'mixed', label: 'Смешанный'}
  ];

  currentWord: Word | null = null;
  showOriginal = false;
  showInput = false;
  showOptions = false;
  userAnswer = '';
  correctAnswer = false;

  todayLearned = 0;
  dailyGoal = 20;

  protected readonly Keyboard = Keyboard;
  protected readonly Eye = Eye;
  protected readonly List = List;
  protected readonly ChevronRight = ChevronRight;
  protected readonly ChevronLeft = ChevronLeft;

  constructor(public ds: DataService) {
    // Устанавливаем категории
    this.selectedCategoryIds.set(this.ds.categories().map(c => c.id));

    effect(() => {
      console.log('Категории:', this.ds.categories());
      console.log('Выбранные ID:', this.selectedCategoryIds());
      console.log('Слова:', this.ds.words());
    });
  }

  loadNextWord() {
    const words = this.ds.words();
    const categories = this.selectedCategoryIds();

    let pool: Word[] = [];

    if (this.mode().id === 'new') {
      pool = words.filter(w => w.level === 0 && categories.includes(w.categoryId));
    } else if (this.mode().id === 'review') {
      const now = Date.now();
      pool = words.filter(w =>
        w.level > 0 &&
        categories.includes(w.categoryId) &&
        w.lastReviewed + this.ds.getNextReviewInterval(w.level) <= now
      );
    } else {
      const newWords = words.filter(w => w.level === 0 && categories.includes(w.categoryId));
      const reviewWords = words.filter(w =>
        w.level > 0 &&
        categories.includes(w.categoryId) &&
        w.lastReviewed + this.ds.getNextReviewInterval(w.level) <= Date.now()
      );
      pool = [...newWords, ...reviewWords];
    }

    this.currentWord = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
    this.resetCard();
  }

  resetCard() {
    this.showOriginal = false;
    this.showInput = false;
    this.showOptions = false;
    this.userAnswer = '';
    this.correctAnswer = false;
  }

  toggleOriginal() {
    this.showOriginal = !this.showOriginal;
  }

  toggleInput() {
    this.showInput = !this.showInput;
    this.showOptions = false;
  }

  toggleOptions() {
    this.showOptions = !this.showOptions;
    this.showInput = false;
  }

  checkAnswer() {
    if (!this.currentWord) return;
    this.correctAnswer = this.userAnswer.trim().toLowerCase() === this.currentWord.original.toLowerCase();
  }

  onRemember() {
    if (!this.currentWord) return;
    const newLevel = Math.min(this.currentWord.level + 1, 5);
    this.ds.updateWordLevel(this.currentWord.id, newLevel);
    this.todayLearned++;
    this.loadNextWord();
  }

  onRepeat() {
    if (!this.currentWord) return;
    this.ds.updateWordLevel(this.currentWord.id, Math.max(0, this.currentWord.level - 1));
    this.loadNextWord();
  }

  updateCategorySelection(catId: string, event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;

    const isChecked = target.checked;
    this.selectedCategoryIds.update(ids =>
      isChecked ? [...ids, catId] : ids.filter(id => id !== catId)
    );
  }

  getAnswerOptions(correctWord: string): string[] {
    const allWords = this.ds.words();
    const pool = Array.from(new Set(allWords.map(w => w.original))); // все оригиналы

    // Убираем правильный ответ из пула
    const filtered = pool.filter(word => word !== correctWord);

    // Выбираем 3 случайных
    const samples = this.shuffle(filtered).slice(0, 3);

    // Добавляем правильный и перемешиваем
    const options = [correctWord, ...samples];
    return this.shuffle(options);
  }

// Вспомогательный метод для перемешивания
  private shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }
}
