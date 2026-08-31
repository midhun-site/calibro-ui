import { Injectable, signal, computed } from '@angular/core';

/**
 * Service managing global HTTP request loading state across the application.
 * Tracks active HTTP connections and provides reactive signals for UI loaders.
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = signal<number>(0);

  /** Reactive signal indicating whether any HTTP background call is in-flight */
  public isLoading = computed(() => this.activeRequests() > 0);

  /**
   * Increments active HTTP request counter to show the loader.
   */
  show(): void {
    this.activeRequests.update(count => count + 1);
  }

  /**
   * Decrements active HTTP request counter and hides loader when all requests complete.
   */
  hide(): void {
    this.activeRequests.update(count => Math.max(0, count - 1));
  }

  /**
   * Resets active requests to 0 in case of uncaught errors or navigation cancellations.
   */
  reset(): void {
    this.activeRequests.set(0);
  }
}
