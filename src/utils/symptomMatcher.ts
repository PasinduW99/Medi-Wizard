import { symptomDatabase } from '../data/symptoms';
import { SymptomEntry } from '../types';

export class SymptomMatcher {
  static matchSymptoms(userInput: string): string | null {
    const normalizedInput = userInput.toLowerCase().trim();
    const inputWords = normalizedInput.split(/\s+/);
    
    let bestMatch: { entry: SymptomEntry; matchCount: number } | null = null;
    
    for (const entry of symptomDatabase) {
      const matchCount = this.countMatches(inputWords, entry.keywords);
      if (matchCount >= 2) {
        if (!bestMatch || matchCount > bestMatch.matchCount) {
          bestMatch = { entry, matchCount };
        }
      }
    }
    
    return bestMatch ? bestMatch.entry.specialist : null;
  }

  private static countMatches(inputWords: string[], keywords: string[]): number {
    let matchCount = 0;
    
    for (const keyword of keywords) {
      const hasMatch = inputWords.some(word => 
        word === keyword || 
        word.includes(keyword) || 
        keyword.includes(word)
      );
      
      if (hasMatch) {
        matchCount++;
      }
    }
    
    return matchCount;
  }
  
  static getAllSpecialists(): string[] {
    return [...new Set(symptomDatabase.map(entry => entry.specialist))];
  }
  
  static getFallbackRecommendation(): string {
    return "General Physician";
  }
}