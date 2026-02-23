import { BombSystem } from "../GameFeatures/BombSystem";
import { RocketSystem } from "../GameFeatures/RocketSystem";
import { SuperTileSystem } from "../GameFeatures/SuperTileSystem";
import { GridGenerator } from "../GridSystem/GenerateGridSystem";
import { MoveTilesSystem } from "../GridSystem/MoveTilesSystem";
import { TilesGroupSystem } from "../GridSystem/TilesGroupSystem";
import { EventManager } from "./EventManager";
import { TilesRemovedEvent } from "./Events";
import { GameSateSystem } from "./GameStateSystem";
import { RemoveTilesSystem } from "./RemoveTilesSystem";


@cc._decorator.ccclass
export class MoveHandle extends cc.Component 
{
    private gameState: GameSateSystem = null!;
    private gridGenerator: GridGenerator = null!;
    private tilesGroupSystem: TilesGroupSystem = null!;
    private tilesRemoveSystem: RemoveTilesSystem = null!;
    private moveTiles: MoveTilesSystem = null!;
    private superTile: SuperTileSystem = null!;
    private onMoveComplete: (() => void) | null = null;
    private onGameStateChanged: (() => void) | null = null;
    
    public init(
        gameState: GameSateSystem,
        gridGenerator: GridGenerator,
        tilesGroupSystem: TilesGroupSystem,
        tilesRemoveSystem: RemoveTilesSystem,
        moveTiles: MoveTilesSystem,
        superTile: SuperTileSystem,
        onMoveComplete: () => void,
        onGameStateChanged: () => void
    ): void {
        this.gameState = gameState;
        this.gridGenerator = gridGenerator;
        this.tilesGroupSystem = tilesGroupSystem;
        this.tilesRemoveSystem = tilesRemoveSystem;
        this.moveTiles = moveTiles;
        this.superTile = superTile;
        this.onMoveComplete = onMoveComplete;
        this.onGameStateChanged = onGameStateChanged;
    }
    
    public handleSuperTile(row: number, col: number): void {
        const clickedTile = this.gridGenerator.gridTiles[row][col];
        const bomb = clickedTile.getComponent(BombSystem);
        const rocket = clickedTile.getComponent(RocketSystem);
        
        if (bomb) {
            bomb.init(this.gridGenerator.gridTiles);
            bomb.explode(row, col);
        } else if (rocket) {
            rocket.init(this.gridGenerator.gridTiles);
            rocket.explode(row, col);
        }
        
        this.scheduleOnce(() => 
        {
            if (this.moveTiles && this.onMoveComplete) {
                this.moveTiles.ApplyMove();
                this.onMoveComplete();
            }
        }, 0.3);
    }
    
    public handleRegularTile(group: cc.Node[], row: number, col: number): void {
        if (group.length >= 5) {
            this.handleSuperTileCreation(group, row, col);
        } else if (group.length >= 2) {
            this.handleNormalRemoval(group);
        }
    }
    
    private handleSuperTileCreation(group: cc.Node[], row: number, col: number): void {
        const clickedTile = this.gridGenerator.gridTiles[row][col];
        this.tilesRemoveSystem.RemoveTilesWithoutScore(group);
        this.superTile.SpawnSuperTile(clickedTile);
        this.tilesGroupSystem.Init(this.gridGenerator);
        
        this.scheduleOnce(() => 
        {
            if (this.moveTiles && this.onMoveComplete) {
                this.moveTiles.ApplyMove();
                this.onMoveComplete();
            }
        }, 0.3);
    }
    
    private handleNormalRemoval(group: cc.Node[]): void {
        EventManager.instance.emit(new TilesRemovedEvent(group, group.length));
    }
}