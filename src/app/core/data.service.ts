import {Injectable, signal} from '@angular/core';
import {Word} from '../models/word.model';
import {User} from '../models/user.model';
import {Category} from '../models/category.model';

@Injectable({providedIn: 'root'})
export class DataService {
  words = signal<Word[]>(this.loadFromStorage('words', []));
  categories = signal<Category[]>(this.loadFromStorage('categories', []));
  user = signal<User>(this.loadUser());

  private loadFromStorage<T>(key: string, defaultValue: T): T {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : defaultValue;
  }

  private saveToStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private loadUser(): User {
    const saved = localStorage.getItem('user');
    const now = Date.now();

    if (saved) {
      const user = JSON.parse(saved) as User;
      // Проверяем стрик: был ли вчера?
      const yesterday = now - 86400000;
      const wasActiveYesterday = user.lastActive >= yesterday - 10000 && user.lastActive <= yesterday + 10000;

      if (!wasActiveYesterday && user.currentStreak > 0) {
        user.currentStreak = 1; // сбрасываем, если пропустил
      } else if (wasActiveYesterday) {
        // уже учтено
      } else {
        // новый день, но активен сегодня — увеличиваем стрик
        user.currentStreak = Math.max(1, user.currentStreak);
      }

      user.lastActive = now;
      this.saveToStorage('user', user);
      return user;
    }

    // Новый пользователь
    const newUser: User = {
      id: 'guest',
      name: 'Guest',
      dailyGoal: 20,
      currentStreak: 1,
      bestStreak: 1,
      lastActive: now,
    };
    this.saveToStorage('user', newUser);
    return newUser;
  }

  updateUser(updates: Partial<User>) {
    const current = this.user();
    const updated = { ...current, ...updates };

    // Обновляем bestStreak
    if (updated.currentStreak > updated.bestStreak) {
      updated.bestStreak = updated.currentStreak;
    }

    this.user.set(updated);
    this.saveToStorage('user', updated);
  }

  addWord(wordData: { original: string; translation: string; categoryId: string }) {
    const newWord: Word = {
      ...wordData,
      id: Date.now().toString(),
      createdAt: Date.now(),
      lastReviewed: 0,
      level: 0
    };
    const updated = [...this.words(), newWord];
    this.words.set(updated);
    this.saveToStorage('words', updated);
  }

  updateWordLevel(wordId: string, level: number) {
    const now = Date.now();
    const updated = this.words().map(word =>
      word.id === wordId ? { ...word, level, lastReviewed: now } : word
    );
    this.words.set(updated);
    this.saveToStorage('words', updated);
  }

  addCategory(category: Omit<Category, 'id' | 'wordIds'>) {
    const newCat: Category = { ...category, id: Date.now().toString(), wordIds: [] };
    const updated = [...this.categories(), newCat];
    this.categories.set(updated);
    this.saveToStorage('categories', updated);
  }

  updateCategory(catId: string, updates: Partial<Category>) {
    const updated = this.categories().map(cat =>
      cat.id === catId ? { ...cat, ...updates } : cat
    );
    this.categories.set(updated);
    this.saveToStorage('categories', updated);
  }

  deleteCategory(catId: string) {
    const filtered = this.categories().filter(cat => cat.id !== catId);
    this.categories.set(filtered);
    this.saveToStorage('categories', filtered);

    // Удаляем слова из этой категории?
    // Пока не трогаем — можно реализовать позже
  }

  getNextReviewInterval(level: number): number {
    const INTERVALS_IN_DAYS = [0, 1, 3, 7, 16, 30] as const;
    const MS_PER_DAY = 86_400_000;

    const index = Math.max(0, Math.min(level, INTERVALS_IN_DAYS.length - 1));
    return INTERVALS_IN_DAYS[index] * MS_PER_DAY;
  }
}
