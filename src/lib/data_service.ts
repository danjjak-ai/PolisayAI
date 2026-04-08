import { supabase } from './supabase';

export class DataService {
  /**
   * Saves analyzed speech data to the database
   */
  async saveAnalyzedSpeech(data: {
    politician_id: string;
    content: string;
    source_type: string;
    analysis: any;
  }) {
    const { data: speech, error: speechError } = await supabase
      .from('speeches')
      .insert({
        politician_id: data.politician_id,
        content: data.content,
        source_type: data.source_type,
        relevance_score: data.analysis.score,
      })
      .select()
      .single();

    if (speechError) throw speechError;

    // Save topic classifications
    const topicInserts = data.analysis.tags.map((tag: string) => ({
      reference_id: speech.id,
      reference_type: 'speech',
      topic_label: tag,
      confidence_score: 0.9, // Simplified
      method: 'LLM'
    }));

    const { error: topicError } = await supabase
      .from('topic_classifications')
      .insert(topicInserts);

    if (topicError) throw topicError;

    return speech;
  }

  /**
   * Fetches a KOL's profile with their recent analyzed activity
   */
  async getKOLProfile(id: string) {
    const { data: politician, error: polError } = await supabase
      .from('politicians')
      .select('*')
      .eq('id', id)
      .single();

    if (polError) return null;

    const { data: recentSpeeches, error: speechError } = await supabase
      .from('speeches')
      .select('*, topic_classifications(*)')
      .eq('politician_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      ...politician,
      recentActivity: recentSpeeches || []
    };
  }
}
