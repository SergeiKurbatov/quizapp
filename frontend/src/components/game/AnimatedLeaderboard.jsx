import { motion, AnimatePresence } from "framer-motion";

const MEDAL = ["🥇", "🥈", "🥉"];

const AnimatedLeaderboard = ({ leaderboard, isUpdating, title = "Standings" }) => {
  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 mb-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white/40 uppercase tracking-widest text-sm font-bold">
          {title}
        </h3>
        
        {/* Drumroll Animation */}
        <AnimatePresence>
          {isUpdating && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2 bg-violet-500/20 px-3 py-1 rounded-full border border-violet-500/30"
            >
              <motion.div
                animate={{ 
                  x: [-1, 1, -1, 1, 0],
                  rotate: [-5, 5, -5, 5, 0] 
                }}
                transition={{ repeat: Infinity, duration: 0.1 }}
                className="text-lg"
              >
                🥁
              </motion.div>
              <span className="text-[10px] text-violet-400 uppercase font-black tracking-tighter">
                Drumroll...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative">
        <AnimatePresence mode="popLayout">
          {leaderboard.length === 0 ? (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/30 text-center py-4 italic"
            >
              Waiting for results...
            </motion.p>
          ) : (
            leaderboard.map((entry) => (
              <motion.div
                key={entry.nickname}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 30,
                  layout: { duration: 0.5 } 
                }}
                className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0 bg-gray-900"
              >
                <span className={`text-2xl font-black w-8 text-center ${
                  entry.position === 1 ? "text-yellow-400" : 
                  entry.position === 2 ? "text-gray-300" : 
                  entry.position === 3 ? "text-amber-600" : "text-white/40"
                }`}>
                  {entry.position <= 3 ? MEDAL[entry.position - 1] : entry.position}
                </span>
                
                <span className="flex-1 font-semibold text-lg">{entry.nickname}</span>
                
                <motion.div 
                  key={entry.score}
                  initial={{ scale: 1.3, color: "#fff" }}
                  animate={{ scale: 1, color: "#a78bfa" }}
                  className="font-mono font-bold text-xl"
                >
                  {entry.score}
                  <span className="text-[10px] ml-1 uppercase opacity-60">pts</span>
                </motion.div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimatedLeaderboard;