import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
// import { hitService } from "@/services/hitService"; // COMMENTED: Using Supabase instead
import { supabaseStatsService } from "@/services/supabaseStatsService";
import { Trophy, Medal, User, Target, ArrowLeft, RefreshCw, Crown, Sparkles, TrendingUp, Award, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import spiderImage from "@/assets/spider.png";

interface LeaderboardScreenProps {
  onBack: () => void;
}

interface TopScore {
  player_address: string;
  total_score: number;
  total_hits: number;
  games_played: number;
}

interface PlayerStats {
  player_address: string;
  total_score: number;
  total_hits: number;
  games_played: number;
  rank: number;
}

const LeaderboardScreen = ({ onBack }: LeaderboardScreenProps) => {
  const { address } = useAccount();
  const { toast } = useToast();
  const [topScores, setTopScores] = useState<TopScore[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch top 50 scores from Supabase
      const scores = await supabaseStatsService.getLeaderboard(50);
      setTopScores(scores);

      // Fetch player stats if wallet is connected
      if (address) {
        const stats = await supabaseStatsService.getPlayerStats(address);
        setPlayerStats(stats);
      }

      // COMMENTED: Old contract-based code
      // const scores = await hitService.getTopScores();
      // const stats = await hitService.getPlayerScore(address);
    } catch (error) {
      console.error("Failed to fetch leaderboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Leaderboard data updated",
    });
  };

  useEffect(() => {
    fetchData();
  }, [address]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatScore = (score: number) => {
    return score.toLocaleString();
  };

  const calculateReward = (score: number) => {
    return (score * 0.01).toFixed(2);
  };

  const formatReward = (score: number) => {
    const reward = calculateReward(score);
    return parseFloat(reward).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return null;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-yellow-500/50";
      case 1:
        return "bg-gradient-to-r from-gray-300/20 to-gray-500/20 border-gray-400/50";
      case 2:
        return "bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-700/50";
      default:
        return "bg-white/10 border-white/20";
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(topScores.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentPageScores = topScores.slice(startIndex, endIndex);

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [topScores.length]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of leaderboard when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Calculate player rank for star rating
  const getPlayerRank = () => {
    if (!playerStats) return 0;
    return playerStats.rank;
  };

  // Calculate star rating based on rank (1-5 stars)
  const getStarRating = () => {
    const rank = getPlayerRank();
    if (rank === 0 || rank > topScores.length) return 1; // Default 1 star if not ranked
    if (rank <= 3) return 5; // Top 3 = 5 stars
    if (rank <= 10) return 4; // Top 10 = 4 stars
    if (rank <= 25) return 3; // Top 25 = 3 stars
    if (rank <= 50) return 2; // Top 50 = 2 stars
    return 1; // Others = 1 star
  };

  // Calculate overall rating (for large number display)
  const getOverallRating = () => {
    if (!playerStats) return 0;
    const score = playerStats.total_score;
    const hits = playerStats.total_hits;
    // Calculate rating based on score and hits
    const rating = Math.floor((score * 0.7) + (hits * 10 * 0.3));
    return Math.max(1, rating);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground font-press-start p-4">
        <div className="text-center">
          <div className="relative">
            <Trophy className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
            <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <p className="text-xl sm:text-2xl mt-4">Loading leaderboard...</p>
          <p className="text-sm text-muted-foreground mt-2">Fetching top players...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-press-start p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <Button
              onClick={onBack}
              variant="outline"
              className="font-press-start flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 animate-pulse" />
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center">
                Leaderboard
              </h1>
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 animate-pulse" />
            </div>
            
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="font-press-start flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 hover:bg-primary hover:text-primary-foreground transition-all"
            >
              {refreshing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Player Stats Card Section */}
          {playerStats && (
            <div className="lg:col-span-1 order-2 lg:order-1 space-y-6">
              {/* Collectible Card Style */}
              <div 
                className="relative bg-gradient-to-b from-blue-900/90 via-blue-800/90 to-blue-900/90 rounded-xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all"
                style={{
                  borderTop: '3px solid rgba(234, 179, 8, 0.8)',
                  borderLeft: '3px solid rgba(234, 179, 8, 0.8)',
                  borderBottom: '3px solid rgba(234, 179, 8, 0.3)',
                  borderRight: '3px solid rgba(234, 179, 8, 0.3)',
                  boxShadow: `
                    inset 3px 3px 6px rgba(234, 179, 8, 0.5),
                    inset -3px -3px 6px rgba(234, 179, 8, 0.15),
                    0 10px 30px rgba(0, 0, 0, 0.5)
                  `
                }}
              >
                {/* Upper Section - Image/Art Area */}
                <div className="h-48 sm:h-56 bg-gradient-to-br from-blue-700/50 to-blue-900/50 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,215,0,0.1)_0%,_transparent_70%)]"></div>
                  
                  {/* Animated Spider */}
                  <div className="absolute inset-0">
                    <img 
                      src={spiderImage} 
                      alt="Spider" 
                      className="absolute w-20 h-20 sm:w-24 sm:h-24 object-contain"
                      style={{
                        animation: 'spiderMove 8s ease-in-out infinite',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  </div>
                  
                  <div className="relative z-10 text-center mt-8">
                    <p className="text-xs sm:text-sm text-yellow-400 font-bold">CATCH IF YOU CAN</p>
                  </div>
                </div>

                {/* Lower Section - Stats Panel */}
                <div className="bg-gradient-to-b from-blue-800/90 to-blue-900/90 p-4 sm:p-5">
                  {/* Player Name and Stars */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            i < getStarRating()
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'fill-gray-600 text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="bg-blue-700/80 border border-yellow-500/50 rounded px-3 py-1.5 flex-1 ml-2">
                      <p className="text-white text-xs sm:text-sm font-bold text-center truncate">
                        {formatAddress(playerStats.player_address).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Stats Boxes */}
                  <div className="space-y-2 mb-3">
                    {/* Total Score Stat */}
                    <div className="bg-blue-700/80 border border-yellow-500/30 rounded px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs sm:text-sm font-bold">Total Score</span>
                        <span className="text-white text-lg sm:text-xl font-bold">
                          {formatScore(playerStats.total_score)}
                        </span>
                      </div>
                    </div>

                    {/* Total Hits Stat */}
                    <div className="bg-blue-700/80 border border-yellow-500/30 rounded px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs sm:text-sm font-bold">Total Hits</span>
                        <span className="text-white text-lg sm:text-xl font-bold">
                          {playerStats.total_hits}
                        </span>
                      </div>
                    </div>

                    {/* Total Reward Stat */}
                    <div className="bg-blue-700/80 border border-yellow-500/30 rounded px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs sm:text-sm font-bold">Total Reward</span>
                        <span className="text-white text-lg sm:text-xl font-bold">
                          {formatReward(playerStats.total_score)}
                        </span>
                        <p className="text-xs text-yellow-400/80 mt-1">CELO</p>
                      </div>
                   
                    </div>
                  </div>

                  {/* Rank Display */}
                  <div className="flex items-end justify-end mt-8">
                    <div className="text-right">
                      {getPlayerRank() > 0 && getPlayerRank() <= topScores.length ? (
                        <>
                          <p className="text-5xl sm:text-6xl font-bold text-white leading-none ">
                            #{getPlayerRank()}
                          </p>
                        </>
                      ) : (
                        <p className="text-2xl sm:text-3xl font-bold text-white leading-none">
                          Unranked
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Leaderboard Table */}
          <div className={`${playerStats ? 'lg:col-span-2' : 'lg:col-span-3'} order-1 lg:order-2`}>
            <div className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border-2 border-white/30 rounded-xl p-5 sm:p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-white/20">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg sm:text-xl font-bold">Top Players</h2>
                <span className="ml-auto text-xs sm:text-sm text-muted-foreground">
                  {topScores.length} players
                </span>
              </div>
              
              {topScores.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="relative inline-block mb-4">
                    <Target className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground mx-auto opacity-50" />
                    <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-muted-foreground mb-2">
                    No scores recorded yet
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Start playing to see your score here!
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <div className="min-w-full">
                      {/* Table Header */}
                      <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 mb-2 border-b border-white/20 text-xs sm:text-sm font-bold text-muted-foreground">
                        <div className="col-span-1 text-center">Rank</div>
                        <div className="col-span-5 sm:col-span-5">Player</div>
                        <div className="col-span-3 sm:col-span-2 text-right">Score</div>
                        <div className="col-span-3 sm:col-span-3 text-right">Reward</div>
                        <div className="col-span-0 sm:col-span-1"></div>
                      </div>

                      {/* Table Rows */}
                      <div className="space-y-2">
                        {currentPageScores.map((score, localIndex) => {
                          const globalIndex = startIndex + localIndex;
                          const isCurrentUser = address === score.player_address;
                          const rankBadge = getRankBadge(globalIndex);
                          const rankIcon = getRankIcon(globalIndex);
                          
                          return (
                            <div
                              key={score.player_address}
                              className={`grid grid-cols-12 gap-2 sm:gap-4 items-center px-3 sm:px-4 py-3 sm:py-4 rounded-lg border-2 transition-all hover:scale-[1.01] hover:shadow-md ${
                                isCurrentUser
                                  ? 'bg-gradient-to-r from-primary/30 to-primary/20 border-primary shadow-lg'
                                  : getRankColor(globalIndex)
                              }`}
                            >
                              {/* Rank */}
                              <div className="col-span-1 sm:col-span-1 flex items-center justify-center">
                                <div className="flex items-center gap-1 sm:gap-2">
                                  {rankBadge && (
                                    <span className="text-xl sm:text-2xl">{rankBadge}</span>
                                  )}
                                  {rankIcon && (
                                    <div className="hidden sm:block">{rankIcon}</div>
                                  )}
                                  {!rankBadge && !rankIcon && (
                                    <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${
                                      globalIndex === 0 ? 'from-yellow-400 to-yellow-600' :
                                      globalIndex === 1 ? 'from-gray-300 to-gray-500' :
                                      globalIndex === 2 ? 'from-amber-600 to-amber-800' :
                                      'from-blue-400 to-blue-600'
                                    } border-2 border-white/30`}>
                                      <span className="text-sm sm:text-base font-bold text-white">
                                        {globalIndex + 1}
                                      </span>
                                    </div>
                                  )}
                                  {!rankBadge && !rankIcon && (
                                    <span className="text-sm sm:text-base font-bold sm:hidden">{globalIndex + 1}</span>
                                  )}
                                </div>
                              </div>

                              {/* Player Address */}
                              <div className="col-span-4 sm:col-span-5 flex items-center gap-2 min-w-0">
                                <p className="font-bold text-xs sm:text-sm md:text-base truncate">
                                  {formatAddress(score.player_address)}
                                </p>
                                {isCurrentUser && (
                                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0">
                                    YOU
                                  </span>
                                )}
                              </div>

                              {/* Score */}
                              <div className="col-span-3 sm:col-span-2 text-right">
                                <p className="text-xs sm:text-sm md:text-base font-bold text-primary">
                                  {formatScore(score.total_score)}
                                </p>
                                <p className="text-xs text-muted-foreground hidden sm:block">points</p>
                              </div>

                              {/* Reward */}
                              <div className="col-span-4 sm:col-span-3 text-right">
                                <p className="text-xs sm:text-sm md:text-base font-bold text-yellow-500">
                                  {formatReward(score.total_score)}
                                </p>
                                <p className="text-xs text-muted-foreground">CELO</p>
                              </div>

                              {/* Spacer for grid alignment */}
                              <div className="col-span-0 sm:col-span-1"></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/20">
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Showing {startIndex + 1} - {Math.min(endIndex, topScores.length)} of {topScores.length} players
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Previous Button */}
                        <Button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          variant="outline"
                          size="sm"
                          className="font-press-start text-xs px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="hidden sm:inline">Prev</span>
                        </Button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                          {getPageNumbers().map((page, idx) => {
                            if (page === '...') {
                              return (
                                <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                                  ...
                                </span>
                              );
                            }
                            const pageNum = page as number;
                            return (
                              <Button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                className={`font-press-start text-xs px-3 py-2 min-w-[2.5rem] ${
                                  currentPage === pageNum
                                    ? 'bg-primary text-primary-foreground'
                                    : ''
                                }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        {/* Next Button */}
                        <Button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          variant="outline"
                          size="sm"
                          className="font-press-start text-xs px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;
