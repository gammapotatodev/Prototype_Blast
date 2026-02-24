import { BombSystem } from "../GameFeatures/BombSystem";
import { BoosterTeleport } from "../GameFeatures/BoosterTeleport";
import { GridGenerator } from "../GridSystem/GenerateGridSystem";
import { GameSateSystem } from "./GameStateSystem";

// Система управления бустерами

@cc._decorator.ccclass
export class BoosterSystem 
{
    private activeBoosterTeleport: BoosterTeleport | null = null;
    private activeBoosterBomb: boolean = false;
    private teleportFirstTile: cc.Node | null = null;
    private gameState: GameSateSystem;
    private gridGenerator: GridGenerator;
    
    constructor(gameState: GameSateSystem, gridGenerator: GridGenerator) {
        this.gameState = gameState;
        this.gridGenerator = gridGenerator;
    }
    
    public activateBomb(): boolean {
        if (this.activeBoosterBomb || this.gameState.bombCount <= 0) return false;
        this.activeBoosterBomb = true;
        return true;
    }
    
    public activateTeleport(): boolean {
        if (this.activeBoosterTeleport || this.gameState.teleportCount <= 0) return false;
        this.activeBoosterTeleport = new BoosterTeleport(this.gridGenerator);
        this.teleportFirstTile = null;
        return true;
    }
    
    public handleBombClick(row: number, col: number, onComplete: () => void): boolean {
        if (!this.activeBoosterBomb || !this.gameState.useBomb()) return false;
        
        const bombNode = new cc.Node();
        const bomb = bombNode.addComponent(BombSystem);
        bomb.radius = 1;
        bomb.init(this.gridGenerator.gridTiles);
        bomb.explode(row, col);
        bombNode.destroy();
        
        this.activeBoosterBomb = false;
        onComplete();
        return true;
    }
    
    public handleTeleportClick(clickedTile: cc.Node, onComplete: (used: boolean) => void): boolean {
        if (!this.activeBoosterTeleport) return false;
        
        if (!this.teleportFirstTile) {
            this.teleportFirstTile = clickedTile;
            onComplete(false);
            return true;
        } else {
            if (this.gameState.useTeleport()) {
                this.activeBoosterTeleport.TeleportTiles(this.teleportFirstTile, clickedTile);
                this.teleportFirstTile = null;
                this.activeBoosterTeleport = null;
                onComplete(true);
                return true;
            }
        }
        return false;
    }
    
    public resetTeleportSelection(): void {
        this.teleportFirstTile = null;
    }
}
