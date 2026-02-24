
// Система управления состоянием игры (UI): ходы, очки, использование бустеров

@cc._decorator.ccclass
export class GameSateSystem
{
    public score: number = 0;
    public moves: number = 0;
    public bombCount: number = 0;
    public teleportCount: number = 0;
    public refreshesCount: number = 0;
    public isAnimating: boolean = false;
    public goalScore: number = 0;
    public startMovesCount: number = 0;
    
    constructor(goalScore: number, startMoves: number, bombCount: number, teleportCount: number) {
        this.goalScore = goalScore;
        this.moves = startMoves;
        this.startMovesCount = startMoves;
        this.bombCount = bombCount;
        this.teleportCount = teleportCount;
    }
    
    public decreaseMoves(): void {
        this.moves--;
    }
    
    public addScore(points: number): void {
        this.score += points;
    }
    
    public useBomb(): boolean {
        if (this.bombCount > 0) {
            this.bombCount--;
            return true;
        }
        return false;
    }
    
    public useTeleport(): boolean {
        if (this.teleportCount > 0) {
            this.teleportCount--;
            return true;
        }
        return false;
    }
}
