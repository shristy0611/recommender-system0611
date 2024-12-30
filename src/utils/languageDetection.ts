export function isJapaneseText(text: string): boolean {
  // Check for Japanese characters (Hiragana, Katakana, and Kanji)
  const japaneseRegex = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/;
  return japaneseRegex.test(text);
}
