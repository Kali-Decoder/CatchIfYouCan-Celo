import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { hitService } from "@/services/hitService";
import { Trophy, Medal, User, Target, ArrowLeft, RefreshCw, Crown, Sparkles, TrendingUp, Award, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LeaderboardScreenProps {
  onBack: () => void;
}

interface TopScore {
  player: string;
  score: string;
  timestamp: string;
}

interface PlayerStats {
  player: string;
  totalScore: string;
  hitCount: number;
}

const LeaderboardScreen = ({ onBack }: LeaderboardScreenProps) => {
  const { address } = useAccount();
  const { toast } = useToast();
  const [topScores, setTopScores] = useState<TopScore[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch top scores
      const scores = await hitService.getTopScores();
      setTopScores(scores);

      // Fetch player stats if wallet is connected
      if (address) {
        const stats = await hitService.getPlayerScore(address);
        setPlayerStats(stats);
      }
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

  const formatScore = (score: string) => {
    return parseInt(score).toLocaleString();
  };

  const calculateReward = (score: string) => {
    return (parseInt(score) * 0.01).toFixed(2);
  };

  const formatReward = (score: string) => {
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
          {/* Player Stats Section */}
          {playerStats && (
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border-2 border-white/30 rounded-xl p-5 sm:p-6 shadow-lg sticky top-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/20">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold">Your Stats</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Total Score
                      </p>
                      <Award className="w-4 h-4 text-yellow-500" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">
                      {formatScore(playerStats.totalScore)}
                    </p>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Total Hits
                      </p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-secondary">
                      {playerStats.hitCount}
                    </p>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Total Reward
                      </p>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-500">
                      {formatReward(playerStats.totalScore)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">CELO</p>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                    <p className="text-xl font-mono break-all">{formatAddress(playerStats.player)}</p>
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
                          const isCurrentUser = address === score.player;
                          const rankBadge = getRankBadge(globalIndex);
                          const rankIcon = getRankIcon(globalIndex);
                          
                          return (
                            <div
                              key={score.player}
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
                                  {formatAddress(score.player)}
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
                                  {formatScore(score.score)}
                                </p>
                                <p className="text-xs text-muted-foreground hidden sm:block">points</p>
                              </div>

                              {/* Reward */}
                              <div className="col-span-4 sm:col-span-3 text-right">
                                <p className="text-xs sm:text-sm md:text-base font-bold text-yellow-500">
                                  {formatReward(score.score)}
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
