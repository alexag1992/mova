#!/usr/bin/env python3
"""
Генератор аудио для приложения МОВА.
Использует gTTS (Google Text-to-Speech) для озвучки белорусских слов.
Белорусский язык в gTTS отсутствует, поэтому используем украинский (uk)
как ближайший по произношению.

Использование:
  pip install gtts
  python tools/generate_audio.py
"""

import json
import os
import re
import time
from pathlib import Path

try:
    from gtts import gTTS
except ImportError:
    print("Установите gTTS: pip install gtts")
    exit(1)

# Базовый путь проекта
BASE_DIR = Path(__file__).parent.parent
AUDIO_DIR = BASE_DIR / "audio"
DATA_DIR = BASE_DIR / "data"

# Язык для озвучки (украинский — ближайший к белорусскому)
LANG = "uk"

# Пауза между запросами к Google (чтобы не забанили)
DELAY = 0.5


def sanitize_filename(text):
    """Превращает текст в безопасное имя файла"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text[:50]


def generate_audio(text, filepath):
    """Генерирует MP3 файл из текста"""
    if filepath.exists():
        print(f"  ⏭ Уже есть: {filepath.name}")
        return True

    try:
        tts = gTTS(text=text, lang=LANG, slow=False)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        tts.save(str(filepath))
        print(f"  ✅ Создано: {filepath.name}")
        time.sleep(DELAY)
        return True
    except Exception as e:
        print(f"  ❌ Ошибка: {filepath.name} — {e}")
        return False


def process_alphabet():
    """Генерация аудио для алфавита"""
    print("\n🔤 АЛФАВІТ")
    print("=" * 40)

    alphabet_file = DATA_DIR / "alphabet.json"
    if not alphabet_file.exists():
        print("  ⚠ alphabet.json не найден, пропускаю")
        return

    with open(alphabet_file, "r", encoding="utf-8") as f:
        letters = json.load(f)

    audio_dir = AUDIO_DIR / "alphabet"

    for item in letters:
        letter = item["letter"].split()[0]  # Берём заглавную букву
        example = item.get("example", "").split("(")[0].strip()

        # Озвучка буквы
        filename = sanitize_filename(letter) + ".mp3"
        generate_audio(letter, audio_dir / filename)

        # Озвучка примера
        if example:
            example_filename = sanitize_filename(example) + ".mp3"
            generate_audio(example, audio_dir / example_filename)


def process_lesson(lesson_num):
    """Генерация аудио для одного урока"""
    lesson_file = DATA_DIR / f"lesson-{lesson_num:02d}.json"

    if not lesson_file.exists():
        print(f"  ⚠ lesson-{lesson_num:02d}.json не найден, пропускаю")
        return

    with open(lesson_file, "r", encoding="utf-8") as f:
        lesson = json.load(f)

    print(f"\n📚 УРОК {lesson_num}: {lesson.get('title', '')}")
    print("=" * 40)

    audio_dir = AUDIO_DIR / f"lesson-{lesson_num:02d}"
    count = 0

    for section in lesson.get("sections", []):
        # Озвучка слов
        if section["type"] == "words":
            for word in section.get("words", []):
                be_text = word["be"]
                # Используем путь из JSON если есть, иначе генерируем из текста
                audio_path = word.get("audio", "")
                if audio_path:
                    filepath = AUDIO_DIR / audio_path
                else:
                    filepath = audio_dir / (sanitize_filename(be_text) + ".mp3")
                if generate_audio(be_text, filepath):
                    count += 1

                # Озвучка примера
                example = word.get("example", {})
                if isinstance(example, dict) and example.get("be"):
                    ex_filename = "ex-" + sanitize_filename(example["be"]) + ".mp3"
                    if generate_audio(example["be"], audio_dir / ex_filename):
                        count += 1

        # Озвучка диалогов
        elif section["type"] == "dialogue":
            for i, line in enumerate(section.get("lines", [])):
                be_text = line["be"]
                filename = f"dialog-{i+1:02d}-" + sanitize_filename(be_text)[:30] + ".mp3"
                if generate_audio(be_text, audio_dir / filename):
                    count += 1

        # Озвучка интересных фактов
        elif section["type"] == "fun_fact":
            be_text = section.get("be", "")
            if be_text:
                filename = "fun-fact.mp3"
                if generate_audio(be_text, audio_dir / filename):
                    count += 1

    print(f"  📊 Создано файлов для урока {lesson_num}: {count}")
    return count


def main():
    print("🎵 МОВА — Генерация аудио")
    print("=" * 50)
    print(f"Папка аудио: {AUDIO_DIR}")
    print(f"Папка данных: {DATA_DIR}")
    print(f"Язык озвучки: {LANG}")
    print()

    total = 0

    # Алфавит
    process_alphabet()

    # Уроки 1-24
    for i in range(1, 25):
        result = process_lesson(i)
        if result:
            total += result

    print("\n" + "=" * 50)
    print(f"🎉 ГОТОВО! Всего создано аудиофайлов: {total}")
    print(f"📁 Папка: {AUDIO_DIR}")


if __name__ == "__main__":
    main()
