import {Component, signal} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {BookOpen, Library, LucideAngularModule, Settings} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideAngularModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  protected readonly BookOpen = BookOpen;
  currentRoute = signal<string>('');

  menuItems = [
    { label: 'Учить', link: '/learn', icon: BookOpen },
    { label: 'Словарь', link: '/dictionary', icon: Library },
    { label: 'Настройки', link: '/settings', icon: Settings },
  ];

  constructor() {
    // Можно обновлять currentRoute через router.events
    // Пока упрощённо — пусть работает через routerLinkActive
  }

  getItemClass(index: number) {
    const base = 'flex items-center gap-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer text-sm font-medium';
    const active = 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-r-2 border-indigo-500';
    return base;
  }
}
