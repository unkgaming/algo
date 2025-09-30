import { Book, BookInteraction, TrendingScore } from '../types/book';

export class TrendingAlgorithm {
  private static readonly TRENDING_WINDOW_HOURS = 72; // Last 3 days
  private static readonly VIEW_WEIGHT = 1;
  private static readonly LIKE_WEIGHT = 3;
  private static readonly PURCHASE_WEIGHT = 5;
  private static readonly RECENCY_DECAY = 0.5; // How much recent activity matters vs older

  static calculateTrendingScores(
    books: Book[],
    interactions: BookInteraction[]
  ): TrendingScore[] {
    const now = Date.now();
    const windowStart = now - (this.TRENDING_WINDOW_HOURS * 60 * 60 * 1000);
    
    // Filter recent interactions
    const recentInteractions = interactions.filter(
      interaction => interaction.timestamp >= windowStart
    );

    const bookScores: Map<string, TrendingScore> = new Map();

    // Initialize scores for all books
    books.forEach(book => {
      bookScores.set(book.id, {
        bookId: book.id,
        score: 0,
        category: book.category,
        recentViews: 0,
        recentLikes: 0,
        recentPurchases: 0
      });
    });

    // Calculate scores based on recent interactions
    recentInteractions.forEach(interaction => {
      const score = bookScores.get(interaction.bookId);
      if (!score) return;

      // Calculate recency factor (more recent = higher weight)
      const hoursAgo = (now - interaction.timestamp) / (1000 * 60 * 60);
      const recencyFactor = Math.exp(-hoursAgo * this.RECENCY_DECAY / this.TRENDING_WINDOW_HOURS);

      let weight = 0;
      switch (interaction.type) {
        case 'view':
          weight = this.VIEW_WEIGHT;
          score.recentViews++;
          break;
        case 'like':
          weight = this.LIKE_WEIGHT;
          score.recentLikes++;
          break;
        case 'purchase':
          weight = this.PURCHASE_WEIGHT * (interaction.value || 1);
          score.recentPurchases += (interaction.value || 1);
          break;
      }

      score.score += weight * recencyFactor;
    });

    return Array.from(bookScores.values())
      .sort((a, b) => b.score - a.score);
  }

  static getTrendingCategories(trendingScores: TrendingScore[]): string[] {
    const categoryScores = new Map<string, number>();

    trendingScores.forEach(score => {
      const current = categoryScores.get(score.category) || 0;
      categoryScores.set(score.category, current + score.score);
    });

    return Array.from(categoryScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category);
  }

  static detectTrendingBooks(trendingScores: TrendingScore[]): string[] {
    // A book is trending if it has significant recent activity
    const threshold = Math.max(1, trendingScores[0]?.score * 0.1 || 0);
    
    return trendingScores
      .filter(score => 
        score.score >= threshold && 
        (score.recentViews > 0 || score.recentLikes > 0 || score.recentPurchases > 0)
      )
      .slice(0, 10)
      .map(score => score.bookId);
  }
}

export class InteractionTracker {
  private static readonly STORAGE_KEY = 'bookInteractions';
  private static readonly MAX_INTERACTIONS = 10000; // Limit storage size

  static saveInteraction(interaction: BookInteraction): void {
    try {
      const interactions = this.getInteractions();
      interactions.push(interaction);

      // Keep only recent interactions to prevent storage bloat
      if (interactions.length > this.MAX_INTERACTIONS) {
        interactions.splice(0, interactions.length - this.MAX_INTERACTIONS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(interactions));
    } catch (error) {
      console.error('Failed to save interaction:', error);
    }
  }

  static getInteractions(): BookInteraction[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load interactions:', error);
      return [];
    }
  }

  static trackView(bookId: string): void {
    this.saveInteraction({
      bookId,
      type: 'view',
      timestamp: Date.now()
    });
  }

  static trackLike(bookId: string): void {
    this.saveInteraction({
      bookId,
      type: 'like',
      timestamp: Date.now()
    });
  }

  static trackPurchase(bookId: string, quantity: number = 1): void {
    this.saveInteraction({
      bookId,
      type: 'purchase',
      timestamp: Date.now(),
      value: quantity
    });
  }

  static trackSearch(query: string): void {
    this.saveInteraction({
      bookId: `search_${query}`,
      type: 'search',
      timestamp: Date.now()
    });
  }
}