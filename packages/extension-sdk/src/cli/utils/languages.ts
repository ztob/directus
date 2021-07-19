type Language = 'javascript' | 'typescript';
type LanguageShort = 'js' | 'ts';

export const LANGUAGES: Language[] = ['javascript', 'typescript'];

export function isLanguage(language: string): language is Language {
	return (LANGUAGES as string[]).includes(language);
}

export function languageToShort(language: Language): LanguageShort {
	if (language === 'javascript') {
		return 'js';
	} else {
		return 'ts';
	}
}
