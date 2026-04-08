export interface TimeSeriesData {
  timestamp: string;
  value: number; // sentiment or frequency
}

export interface ChangePoint {
  date: string;
  magnitude: number;
  reason: string;
}

export class ChangePointDetector {
  /**
   * Detects sudden shifts in time-series data using a simplified slope-change heuristic
   */
  public detect(data: TimeSeriesData[]): ChangePoint[] {
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const changes: ChangePoint[] = [];

    for (let i = 1; i < sortedData.length; i++) {
      const diff = Math.abs(sortedData[i].value - sortedData[i - 1].value);
      
      // If the change is greater than 50% shift in index
      if (diff > 0.5) {
        changes.push({
          date: sortedData[i].timestamp,
          magnitude: diff,
          reason: diff > 0 ? 'Positive Sentiment Spurt' : 'Negative Shift Detected'
        });
      }
    }

    return changes;
  }
}
