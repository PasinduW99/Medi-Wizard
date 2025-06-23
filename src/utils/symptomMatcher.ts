import { symptomDatabase } from '../data/symptoms';
import { SymptomEntry } from '../types';

export class SymptomMatcher {
  /**
   * Matches user input against symptom database
   * Returns specialist recommendation if 2 or more keywords match
   */
  static matchSymptoms(userInput: string): string | null {
    const normalizedInput = userInput.toLowerCase().trim();
    const inputWords = normalizedInput.split(/\s+/);
    
    let bestMatch: { entry: SymptomEntry; matchCount: number } | null = null;
    
    for (const entry of symptomDatabase) {
      const matchCount = this.countMatches(inputWords, entry.keywords);
      
      // Require at least 2 keyword matches as specified
      if (matchCount >= 2) {
        if (!bestMatch || matchCount > bestMatch.matchCount) {
          bestMatch = { entry, matchCount };
        }
      }
    }
    
    return bestMatch ? bestMatch.entry.specialist : null;
  }
  
  /**
   * Counts how many keywords from the symptom entry match the user input
   */
  private static countMatches(inputWords: string[], keywords: string[]): number {
    let matchCount = 0;
    
    for (const keyword of keywords) {
      // Check for exact word matches or partial matches within words
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
  
  /**
   * Gets all possible specialists from the database
   */
  static getAllSpecialists(): string[] {
    return [...new Set(symptomDatabase.map(entry => entry.specialist))];
  }
  
  /**
   * Gets a fallback recommendation for general symptoms
   */
  static getFallbackRecommendation(): string {
    return "General Physician";
  }
}