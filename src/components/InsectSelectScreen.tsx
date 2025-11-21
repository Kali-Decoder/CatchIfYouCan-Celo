import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCreateRandomSession, useIsTogether, useLeaveSession } from "react-together";
import { Trophy, BarChart3, Play, Users, Home } from "lucide-react";
import GlobalStatsModal from "./GlobalStatsModal";
import beeGif from "/animals/bee.gif";
import butterflyGif from "/animals/butterfly.gif";
import bluemouchGif from "/animals/bluemouch.gif";
import mouchGif from "/animals/mouch.gif";

export interface BirdType {
  name: string;
  image: string;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  spawnRate: number; // How many times in 60 seconds (random range)
}

interface BirdSelectScreenProps {
  onStartGame: (mode: 'singleplayer' | 'multiplayer', options?: { isHost?: boolean; roomId?: string }) => void;
  onShowLeaderboard: () => void;
}

const PASSWORD = import.meta.env.VITE_MULTISYNQ_SESSION_PASSWORD || 'catchbirds';

const BirdSelectScreen = ({ onStartGame, onShowLeaderboard }: BirdSelectScreenProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinError, setJoinError] = useState("");
  const createRandomSession = useCreateRandomSession();
  const isTogether = useIsTogether();
  const leaveSession = useLeaveSession();

  const birds: BirdType[] = [
    { 
      name: "Bee", 
      image: beeGif, 
      points: 1, 
      rarity: 'common',
      spawnRate: 15 // 15-20 times in 60 seconds
    },
    { 
      name: "Butterfly", 
      image: butterflyGif, 
      points: 2, 
      rarity: 'uncommon',
      spawnRate: 10 // 10-15 times in 60 seconds
    },
    { 
      name: "Blue Mouch", 
      image: bluemouchGif, 
      points: 5, 
      rarity: 'rare',
      spawnRate: 5 // 5-8 times in 60 seconds
    },
    { 
      name: "Mouch", 
      image: mouchGif, 
      points: 10, 
      rarity: 'legendary',
      spawnRate: 2 // 2-4 times in 60 seconds
    },
  ];

  const handleCreateRoom = () => {
    leaveSession();
    onStartGame('multiplayer', { isHost: true });
    setModalOpen(false);
  };

  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) {
      setJoinError("Please enter a room ID.");
      return;
    }
    leaveSession();
    onStartGame('multiplayer', { isHost: false, roomId: joinRoomId });
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground font-press-start p-4">
      {/* Title Section */}
      <div className="text-center mb-6 w-full max-w-3xl">
        <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl mb-3 text-center leading-tight font-bold">
          Choose Your Mouch Challenge!
        </h1>
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl text-center text-muted-foreground font-medium">
          
        </h2>
      </div>
      
      {/* Fluid Grid Layout */}
      <div className="w-full max-w-5xl mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {birds.map((bird) => (
            <div
              key={bird.name}
              className="bg-transparent border-2 border-white/30 text-foreground font-press-start 
                         flex flex-col items-center justify-center gap-2 p-3 
                         min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px]
                         hover:border-white/50 hover:scale-105 transition-all duration-300
                         rounded-lg backdrop-blur-sm"
            >
              <p className="text-xs sm:text-sm md:text-base font-bold text-white text-center">
                {bird.name}
              </p>
              <img
                src={bird.image}
                alt={bird.name}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain"
              />
              <p className="text-xs sm:text-sm font-bold text-white">
                +{bird.points} pts
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {bird.rarity}
              </p>
            </div>
          ))}
        </div>
      </div>

 
      <div className="w-full max-w-2xl flex justify-center">
        <TooltipProvider>
          <div className="flex gap-3 justify-items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onStartGame('singleplayer')}
                  className="bg-primary text-primary-foreground hover:opacity-90 font-press-start 
                             rounded-full w-12 h-12 sm:w-12 sm:h-12 flex items-center justify-center p-0"
                >
                  <Play className="w-16 h-16 sm:w-16 sm:h-16" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Singleplayer</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setModalOpen(true)}
                  className="bg-secondary text-secondary-foreground hover:opacity-90 font-press-start 
                             rounded-full w-12 h-12 sm:w-12 sm:h-12 flex items-center justify-center p-0"
                >
                  <Users className="w-16 h-16 sm:w-16 sm:h-16" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Multiplayer</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onShowLeaderboard}
                  className="bg-primary text-primary-foreground hover:opacity-90 font-press-start 
                             rounded-full w-12 h-12 sm:w-12 sm:h-12 flex items-center justify-center p-0"
                >
                  <Trophy className="w-16 h-16 sm:w-16 sm:h-16" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Leaderboard</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => window.location.href = '/'}
                  className="bg-secondary text-secondary-foreground hover:opacity-90 font-press-start 
                             rounded-full w-12 h-12 sm:w-12 sm:h-12 flex items-center justify-center p-0"
                >
                  <Home className="w-16 h-16 sm:w-16 sm:h-16" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Main Menu</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setStatsModalOpen(true)}
                  className="bg-primary text-primary-foreground hover:opacity-90 font-press-start 
                             rounded-full w-12 h-12 sm:w-12 sm:h-12 sm:col-span-2 lg:col-span-1 flex items-center justify-center p-0"
                >
                  <BarChart3 className="w-16 h-16 sm:w-16 sm:h-16" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Stats</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-press-start">Multiplayer</DialogTitle>
          </DialogHeader>
          <TooltipProvider>
            <div className="flex flex-col gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleCreateRoom} 
                    className="w-full bg-primary text-primary-foreground font-press-start py-3"
                  >
                    Create Room
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create a new multiplayer room</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Enter Room ID"
                  value={joinRoomId}
                  onChange={e => { setJoinRoomId(e.target.value); setJoinError(""); }}
                  className="border rounded px-3 py-2 text-black font-press-start"
                />
                {joinError && <span className="text-red-500 text-xs">{joinError}</span>}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleJoinRoom} 
                      className="w-full bg-secondary text-secondary-foreground font-press-start py-3"
                    >
                      Join Room
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Join an existing multiplayer room</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </TooltipProvider>
          <DialogFooter>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogClose asChild>
                    <Button variant="outline" className="font-press-start">Cancel</Button>
                  </DialogClose>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Close this dialog</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global Stats Modal */}
      <GlobalStatsModal open={statsModalOpen} onOpenChange={setStatsModalOpen} />
    </div>
  );
};

export default BirdSelectScreen;
