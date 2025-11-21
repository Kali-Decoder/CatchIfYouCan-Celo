import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabaseStatsService, GlobalStats } from "@/services/supabaseStatsService";
import { Users, Gamepad2, Target, Trophy } from "lucide-react";

// Simple animated number component without external dependency
const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 1000; // 1 second animation
    const steps = 30;
    const increment = value / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newValue = Math.min(Math.floor(increment * currentStep), value);
      setDisplayValue(newValue);

      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

interface GlobalStatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GlobalStatsModal = ({ open, onOpenChange }: GlobalStatsModalProps) => {
  const [stats, setStats] = useState<GlobalStats>({
    totalPlayers: 0,
    totalGames: 0,
    totalHits: 0,
    totalScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadStats();
    }
  }, [open]);

  const loadStats = async () => {
    setLoading(true);
    const data = await supabaseStatsService.getGlobalStats();
    setStats(data);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-gradient-to-br from-blue-600/95 via-blue-700/95 to-blue-800/95 backdrop-blur-sm border-2 border-white/30 text-white font-press-start">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl text-center text-white mb-6">
            GLOBAL GAME STATS
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-lg">Loading stats...</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 py-6">
            {/* Total Players */}
            <div className="flex flex-col items-center gap-3 bg-white/10 border-2 border-white/20 rounded-lg p-4 hover:scale-105 transition-all">
              <Users className="w-8 h-8 text-white" />
              <div className="text-xs sm:text-sm text-white/80 text-center">PLAYERS</div>
              <div className="text-2xl sm:text-3xl font-bold text-white">
                <AnimatedNumber value={stats.totalPlayers} />
              </div>
            </div>

            {/* Total Games */}
            <div className="flex flex-col items-center gap-3 bg-white/10 border-2 border-white/20 rounded-lg p-4 hover:scale-105 transition-all">
              <Gamepad2 className="w-8 h-8 text-white" />
              <div className="text-xs sm:text-sm text-white/80 text-center">GAMES</div>
              <div className="text-2xl sm:text-3xl font-bold text-white">
                <AnimatedNumber value={stats.totalGames} />
              </div>
            </div>

            {/* Total Hits */}
            <div className="flex flex-col items-center gap-3 bg-white/10 border-2 border-white/20 rounded-lg p-4 hover:scale-105 transition-all">
              <Target className="w-8 h-8 text-white" />
              <div className="text-xs sm:text-sm text-white/80 text-center">HITS</div>
              <div className="text-2xl sm:text-3xl font-bold text-white">
                <AnimatedNumber value={stats.totalHits} />
              </div>
            </div>

            {/* Total Score */}
            <div className="flex flex-col items-center gap-3 bg-white/10 border-2 border-white/20 rounded-lg p-4 hover:scale-105 transition-all">
              <Trophy className="w-8 h-8 text-white" />
              <div className="text-xs sm:text-sm text-white/80 text-center">SCORE</div>
              <div className="text-2xl sm:text-3xl font-bold text-white">
                <AnimatedNumber value={stats.totalScore} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GlobalStatsModal;

