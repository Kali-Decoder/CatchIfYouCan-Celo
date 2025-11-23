// COMMENTED: Direct Supabase access - now using backend API
// import { supabase } from "@/lib/supabaseClient";

// Use the same relayer URL for Supabase operations
const RELAYER_URL = import.meta.env.VITE_RELAYER_URL || "https://catchthemouchbackend.onrender.com";

export interface LeaderboardPlayer {
  player_address: string;
  total_score: number;
  total_hits: number;
  games_played: number;
}

export interface GlobalStats {
  totalPlayers: number;
  totalGames: number;
  totalHits: number;
  totalScore: number;
}

export interface PlayerStats {
  player_address: string;
  total_score: number;
  total_hits: number;
  games_played: number;
  rank: number;
}

export class SupabaseStatsService {
  private static instance: SupabaseStatsService;

  private constructor() {}

  static getInstance(): SupabaseStatsService {
    if (!SupabaseStatsService.instance) {
      SupabaseStatsService.instance = new SupabaseStatsService();
    }
    return SupabaseStatsService.instance;
  }

  /**
   * Get leaderboard - Top 50 players via backend API
   */
  async getLeaderboard(limit: number = 50): Promise<LeaderboardPlayer[]> {
    try {
      const response = await fetch(`${RELAYER_URL}/api/leaderboard?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      return data.leaderboard || [];
    } catch (error) {
      console.error("❌ Failed to get leaderboard:", error);
      return [];
    }
  }

  /**
   * Get individual player stats via backend API
   */
  async getPlayerStats(playerAddress: string): Promise<PlayerStats | null> {
    try {
      const response = await fetch(`${RELAYER_URL}/api/playerStats/${playerAddress}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch player stats');
      }

      const data = await response.json();
      return data.playerStats || null;
    } catch (error) {
      console.error("❌ Failed to get player stats:", error);
      return null;
    }
  }

  /**
   * Get global stats via backend API
   */
  async getGlobalStats(): Promise<GlobalStats> {
    try {
      const response = await fetch(`${RELAYER_URL}/api/globalStats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch global stats');
      }

      const data = await response.json();
      return data.globalStats || {
        totalPlayers: 0,
        totalGames: 0,
        totalHits: 0,
        totalScore: 0,
      };
    } catch (error) {
      console.error("❌ Failed to get global stats:", error);
      return {
        totalPlayers: 0,
        totalGames: 0,
        totalHits: 0,
        totalScore: 0,
      };
    }
  }
}

// Export singleton instance
export const supabaseStatsService = SupabaseStatsService.getInstance();

/* ============================================
   COMMENTED: Old direct Supabase code
   ============================================

import { supabase } from "@/lib/supabaseClient";

export class SupabaseStatsService {
  private static instance: SupabaseStatsService;

  private constructor() {}

  static getInstance(): SupabaseStatsService {
    if (!SupabaseStatsService.instance) {
      SupabaseStatsService.instance = new SupabaseStatsService();
    }
    return SupabaseStatsService.instance;
  }

  async getLeaderboard(limit: number = 50): Promise<LeaderboardPlayer[]> {
    try {
      const { data, error } = await supabase
        .from('player_scores')
        .select('player_address, final_score, total_hits');

      if (error) throw error;

      const playerMap = new Map<string, { total_score: number; total_hits: number; games_played: number }>();

      data?.forEach((row) => {
        const existing = playerMap.get(row.player_address) || { total_score: 0, total_hits: 0, games_played: 0 };
        playerMap.set(row.player_address, {
          total_score: existing.total_score + (row.final_score || 0),
          total_hits: existing.total_hits + (row.total_hits || 0),
          games_played: existing.games_played + 1,
        });
      });

      const leaderboard = Array.from(playerMap.entries())
        .map(([player_address, stats]) => ({
          player_address,
          ...stats,
        }))
        .sort((a, b) => b.total_score - a.total_score)
        .slice(0, limit);

      return leaderboard;
    } catch (error) {
      console.error("❌ Failed to get leaderboard:", error);
      return [];
    }
  }

  async getPlayerStats(playerAddress: string): Promise<PlayerStats | null> {
    try {
      const { data, error } = await supabase
        .from('player_scores')
        .select('final_score, total_hits')
        .eq('player_address', playerAddress);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const total_score = data.reduce((sum, row) => sum + (row.final_score || 0), 0);
      const total_hits = data.reduce((sum, row) => sum + (row.total_hits || 0), 0);
      const games_played = data.length;

      const leaderboard = await this.getLeaderboard(1000);
      const rank = leaderboard.findIndex(p => p.player_address === playerAddress) + 1;

      return {
        player_address: playerAddress,
        total_score,
        total_hits,
        games_played,
        rank: rank || leaderboard.length + 1,
      };
    } catch (error) {
      console.error("❌ Failed to get player stats:", error);
      return null;
    }
  }

  async getGlobalStats(): Promise<GlobalStats> {
    try {
      const { data: scoresData, error: scoresError } = await supabase
        .from('player_scores')
        .select('player_address, final_score, total_hits');

      if (scoresError) throw scoresError;

      const uniquePlayers = new Set(scoresData?.map(row => row.player_address) || []);
      const totalPlayers = uniquePlayers.size;

      const { count: totalGames, error: gamesError } = await supabase
        .from('game_results')
        .select('*', { count: 'exact', head: true });

      if (gamesError) throw gamesError;

      const totalHits = scoresData?.reduce((sum, row) => sum + (row.total_hits || 0), 0) || 0;
      const totalScore = scoresData?.reduce((sum, row) => sum + (row.final_score || 0), 0) || 0;

      return {
        totalPlayers,
        totalGames: totalGames || 0,
        totalHits,
        totalScore,
      };
    } catch (error) {
      console.error("❌ Failed to get global stats:", error);
      return {
        totalPlayers: 0,
        totalGames: 0,
        totalHits: 0,
        totalScore: 0,
      };
    }
  }
}

export const supabaseStatsService = SupabaseStatsService.getInstance();

============================================ */

