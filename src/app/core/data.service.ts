import {Injectable, signal} from '@angular/core';
import {Word} from '../models/word.model';
import {User} from '../models/user.model';
import {Category} from '../models/category.model';

@Injectable({providedIn: 'root'})
export class DataService {
  private isInitialized = false;

  words = signal<Word[]>(this.loadFromStorage('words', []));
  categories = signal<Category[]>(this.loadFromStorage('categories', []));
  user = signal<User>(this.loadUser());

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    if (this.isInitialized) return;

    const words = this.loadFromStorage<Word[]>('words', []); // ← всегда массив
    const categories = this.loadFromStorage<Category[]>('categories', []); // ← всегда массив

    // Если данных в localStorage нет — используем начальные
    if (words.length === 0) {
      const initialWords = this.getInitialWords();
      this.words.set(initialWords);
      this.saveToStorage('words', initialWords);
    }

    if (categories.length === 0) {
      const initialCategories = this.getInitialCategories();
      this.categories.set(initialCategories);
      this.saveToStorage('categories', initialCategories);
    }

    this.isInitialized = true;
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved) as T;
      } catch (e) {
        console.warn(`Failed to parse localStorage item "${key}"`, e);
        return fallback;
      }
    }
    return fallback;
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
    const updated = {...current, ...updates};

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
      word.id === wordId ? {...word, level, lastReviewed: now} : word
    );
    this.words.set(updated);
    this.saveToStorage('words', updated);
  }

  addCategory(category: Omit<Category, 'id' | 'wordIds'>) {
    const newCat: Category = {...category, id: Date.now().toString(), wordIds: []};
    const updated = [...this.categories(), newCat];
    this.categories.set(updated);
    this.saveToStorage('categories', updated);
  }

  updateCategory(catId: string, updates: Partial<Category>) {
    const updated = this.categories().map(cat =>
      cat.id === catId ? {...cat, ...updates} : cat
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

  private getInitialCategories(): Category[] {
    return [
      {
        id: '1',
        name: 'Повседневные слова',
        icon: '🍎',
        wordIds: ['w1', 'w2', 'w3', 'w4', 'w5']
      },
      {
        id: '2',
        name: 'Путешествия',
        icon: '✈️',
        wordIds: ['w6', 'w7', 'w8', 'w9', 'w10']
      },
      {
        id: '3',
        name: 'Еда',
        icon: '🍕',
        wordIds: ['w11', 'w12', 'w13', 'w14', 'w15']
      }
    ];
  }

  private getInitialWords(): Word[] {
    return [
      {
        id: 'w1',
        original: 'apple',
        translation: 'яблоко',
        categoryId: '1',
        level: 0,
        lastReviewed: 0,
        createdAt: Date.now() - 86400000 * 2
      },
      {
        id: 'w2',
        original: 'book',
        translation: 'книга',
        categoryId: '1',
        level: 1,
        lastReviewed: Date.now() - 86400000,
        createdAt: Date.now() - 86400000 * 5
      },
      {
        id: 'w3',
        original: 'water',
        translation: 'вода',
        categoryId: '1',
        level: 0,
        lastReviewed: 0,
        createdAt: Date.now()
      },
      {
        id: 'w4',
        original: 'house',
        translation: 'дом',
        categoryId: '1',
        level: 2,
        lastReviewed: Date.now() - 86400000 * 3,
        createdAt: Date.now() - 86400000 * 10
      },
      {
        id: 'w5',
        original: 'friend',
        translation: 'друг',
        categoryId: '1',
        level: 0,
        lastReviewed: 0,
        createdAt: Date.now()
      },

      {
        id: 'w6',
        original: 'airport',
        translation: 'аэропорт',
        categoryId: '2',
        level: 0,
        lastReviewed: 0,
        createdAt: Date.now()
      },
      {
        id: 'w7',
        original: 'ticket',
        translation: 'билет',
        categoryId: '2',
        level: 3,
        lastReviewed: Date.now() - 86400000 * 7,
        createdAt: Date.now() - 86400000 * 15
      },
      {
        id: 'w8',
        original: 'passport',
        translation: 'паспорт',
        categoryId: '2',
        level: 0,
        lastReviewed: 0,
        createdAt: Date.now()
      },
      {
        id: 'w9',
        original: 'hotel',
        translation: 'отель',
        categoryId: '2',
        level: 1,
        lastReviewed: Date.now() - 86400000,
        createdAt: Date.now() - 86400000 * 3
      },
      {
        id: 'w10',
        original: 'luggage',
        translation: 'багаж',
        categoryId: '2',
        level: 0,
        lastReviewed: 0,
        createdAt: Date.now()
      },

      {
        id: 'w11',
        original: 'pizza',
        translation: 'пицца',
        categoryId: '3',
        level: 0,
        lastReviewed: 0,
        createdAt: Date.now()
      },
      {
        id: 'w12',
        original: 'coffee',
        translation: 'кофе',
        categoryId: '3',
        level: 2,
        lastReviewed: Date.now() - 86400000 * 2,
        createdAt: Date.now() - 86400000 * 8
      },
      {
        id: 'w13',
        original: 'bread',
        translation: 'хлеб',
        categoryId: '3',
        level: 0,
        lastReviewed: 0,
        createdAt: Date.now()
      },
      {
        id: 'w14',
        original: 'milk',
        translation: 'молоко',
        categoryId: '3',
        level: 1,
        lastReviewed: Date.now() - 86400000,
        createdAt: Date.now() - 86400000 * 4
      },
      {
        id: 'w15',
        original: 'cheese',
        translation: 'сыр',
        categoryId: '3',
        level: 0,
        lastReviewed: 0,
        createdAt: Date.now()
      },
    ];
  }
}
