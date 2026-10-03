import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import {
  pageCount,
  preferredLocale,
  setLocale,
  translate,
} from '../src/client/i18n';
import { ru } from '../src/client/locales/ru';
import { TaskActions } from '../src/client/TaskActions';
import { SpaceLibrary } from '../src/client/SpaceLibrary';
import type { Task, Space } from '../src/shared/types';

afterEach(() => setLocale('en'));
describe('interface languages', () => {
  it('keeps an explicit language and validates stored values', () => {
    expect(preferredLocale('en', 'ru-RU')).toBe('en');
    expect(preferredLocale('ru', 'en-US')).toBe('ru');
    expect(preferredLocale('invalid', 'ru-RU')).toBe('ru');
    expect(preferredLocale(null, 'fr')).toBe('en');
  });
  it('falls back to English and interpolates values without treating them as keys', () => {
    expect(translate('ru', 'New chat')).toBe('Новый чат');
    expect(translate('en', 'New chat')).toBe('New chat');
    expect(translate('ru', 'A new upstream message')).toBe(
      'A new upstream message',
    );
    expect(translate('ru', 'Message {name}…', { name: 'New chat' })).toBe(
      'Сообщение для New chat…',
    );
  });
  it('preserves every interpolation placeholder in the Russian catalogue', () => {
    const placeholders = (text: string) =>
      [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
    for (const [key, translation] of Object.entries(ru)) {
      expect(translation.trim(), key).not.toBe('');
      expect(placeholders(translation), key).toEqual(placeholders(key));
    }
  });
  it.each([
    [0, 'страниц'],
    [1, 'страница'],
    [2, 'страницы'],
    [5, 'страниц'],
    [11, 'страниц'],
    [21, 'страница'],
    [22, 'страницы'],
    [25, 'страниц'],
  ])('uses Russian page plurals for %s', (count, noun) => {
    expect(pageCount(Number(count), 'ru')).toBe(`${count} ${noun}`);
  });
  it('localizes task controls without changing their status logic', () => {
    setLocale('ru');
    const render = (status: Task['status']) =>
      renderToStaticMarkup(
        <TaskActions
          task={{ status, intervalSeconds: 60 } as Task}
          busy={false}
          settings={{
            name: 'Test workspace',
            paused: false,
            researchAllowed: true,
            memoryAllowed: true,
          }}
          onAction={() => {}}
          onSchedule={() => {}}
        />,
      );
    expect(render('running')).toContain('Приостановить задачу');
    expect(render('failed')).toContain('Повторить задачу');
    expect(render('completed')).toContain('Приостановить расписание');
    expect(render('cancelled')).not.toContain('>Отменить<');
  });
  it('preserves user-owned Space names when switching languages', () => {
    const space = {
      id: 'one',
      name: 'New chat',
      description: 'My words',
    } as Space;
    const render = () =>
      renderToStaticMarkup(
        <SpaceLibrary
          space={space}
          pages={[]}
          onPage={() => {}}
          onNew={() => {}}
        />,
      );
    setLocale('ru');
    expect(render()).toContain('<h1>New chat</h1>');
    expect(render()).toContain('Страниц пока нет');
    setLocale('en');
    expect(render()).toContain('No pages yet');
  });
});
