import { Book, AutoCompleteResult, SearchAnalytics } from '../types/book';

export class FuzzySearch {
  // Calculate Levenshtein distance for fuzzy matching
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Calculate similarity score (0-1, higher is better)
  private static calculateSimilarity(query: string, target: string): number {
    const normalizedQuery = query.toLowerCase().trim();
    const normalizedTarget = target.toLowerCase().trim();

    // Exact match
    if (normalizedQuery === normalizedTarget) return 1.0;

    // Starts with query
    if (normalizedTarget.startsWith(normalizedQuery)) return 0.9;

    // Contains query
    if (normalizedTarget.includes(normalizedQuery)) return 0.8;

    // Fuzzy match using Levenshtein distance
    const distance = this.levenshteinDistance(normalizedQuery, normalizedTarget);
    const maxLength = Math.max(normalizedQuery.length, normalizedTarget.length);
    const similarity = 1 - (distance / maxLength);

    // Only consider matches with reasonable similarity
    return similarity > 0.6 ? similarity * 0.7 : 0;
  }

  static searchBooks(books: Book[], query: string, threshold: number = 0.3): Book[] {
    if (!query.trim()) return books;

    const results = books.map(book => {
      const titleScore = this.calculateSimilarity(query, book.title);
      const authorScore = this.calculateSimilarity(query, book.author) * 0.8;
      const categoryScore = this.calculateSimilarity(query, book.category) * 0.6;
      const descriptionScore = this.calculateSimilarity(query, book.description) * 0.4;

      const maxScore = Math.max(titleScore, authorScore, categoryScore, descriptionScore);

      return { book, score: maxScore };
    })
    .filter(result => result.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(result => result.book);

    return results;
  }

  static generateAutoComplete(books: Book[], query: string, limit: number = 8): AutoCompleteResult[] {
    if (!query.trim()) return [];

    const results: AutoCompleteResult[] = [];
    const seen = new Set<string>();

    // Search in book titles
    books.forEach(book => {
      const titleScore = this.calculateSimilarity(query, book.title);
      if (titleScore > 0.4 && !seen.has(book.title.toLowerCase())) {
        results.push({
          type: 'book',
          text: book.title,
          book,
          score: titleScore
        });
        seen.add(book.title.toLowerCase());
      }
    });

    // Search in authors
    books.forEach(book => {
      const authorScore = this.calculateSimilarity(query, book.author);
      if (authorScore > 0.4 && !seen.has(book.author.toLowerCase())) {
        results.push({
          type: 'author',
          text: book.author,
          book,
          score: authorScore * 0.9
        });
        seen.add(book.author.toLowerCase());
      }
    });

    // Search in categories
    const categories = [...new Set(books.map(book => book.category))];
    categories.forEach(category => {
      const categoryScore = this.calculateSimilarity(query, category);
      if (categoryScore > 0.4 && !seen.has(category.toLowerCase())) {
        results.push({
          type: 'category',
          text: category,
          score: categoryScore * 0.8
        });
        seen.add(category.toLowerCase());
      }
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export class SearchAnalytics {
  private static readonly STORAGE_KEY = 'searchAnalytics';
  private static readonly MAX_SEARCHES = 1000;

  static saveSearch(analytics: SearchAnalytics): void {
    try {
      const searches = this.getSearchHistory();
      searches.push(analytics);

      if (searches.length > this.MAX_SEARCHES) {
        searches.splice(0, searches.length - this.MAX_SEARCHES);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error('Failed to save search analytics:', error);
    }
  }

  static getSearchHistory(): SearchAnalytics[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load search analytics:', error);
      return [];
    }
  }

  static getPopularSearches(limit: number = 10): string[] {
    const searches = this.getSearchHistory();
    const queryCount = new Map<string, number>();

    searches.forEach(search => {
      if (search.query.trim().length > 2) {
        const count = queryCount.get(search.query) || 0;
        queryCount.set(search.query, count + 1);
      }
    });

    return Array.from(queryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query]) => query);
  }

  static getSearchSuggestions(query: string, limit: number = 5): string[] {
    if (!query.trim()) return [];

    const searches = this.getSearchHistory();
    const suggestions = searches
      .filter(search => 
        search.query.toLowerCase().includes(query.toLowerCase()) &&
        search.query !== query &&
        search.resultsCount > 0
      )
      .map(search => search.query)
      .filter((query, index, arr) => arr.indexOf(query) === index) // Remove duplicates
      .slice(0, limit);

    return suggestions;
  }
}