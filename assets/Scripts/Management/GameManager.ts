import { SuperTileSystem } from "../GameFeatures/SuperTileSystem";
import { GridGenerator } from "../GridSystem/GenerateGridSystem";
import { GridSize } from "../GridSystem/GridProperties";
import { MoveTilesSystem } from "../GridSystem/MoveTilesSystem";
import { RandomTileSystem } from "../GridSystem/RandomTileSystem";
import { TilesGroupSystem } from "../GridSystem/TilesGroupSystem";
import { TileSystem } from "../TileProperties/TileSystem";
import { BoosterSystem } from "./BoosterSystem";
import { EventManager } from "./EventManager";
import { GameOverEvent, GameResultType, RefreshGridEvent, TileClickEvent, TilesRemovedEvent, UpdateUIEvent } from "./Events";
import { GameSateSystem } from "./GameStateSystem";
import { MoveHandle } from "./MoveHandle";
import { RefreshGridSystem } from "./RefreshGridSystem";
import { RemoveTilesSystem } from "./RemoveTilesSystem";
import { UpdateUISystem } from "./UpdateUISystem";


@cc._decorator.ccclass
export class GameManager extends cc.Component
{
    @cc._decorator.property(cc.Node)
    private gridNode: cc.Node = null!;

    @cc._decorator.property(cc.Node)
    private randomTileSystemNode: cc.Node = null!;

    @cc._decorator.property(cc.Node)
    private superTileSystem: cc.Node = null!;

    private gameState: GameSateSystem = null!;
    private boosterManager: BoosterSystem = null!;
    private moveHandler: MoveHandle = null!;
    
    private gridGenerator: GridGenerator = null!;
    private gridSize: GridSize = null!;
    private randomTileSystem: RandomTileSystem = null!;
    private tilesRemoveSystem: RemoveTilesSystem = null!;
    private refreshTilesSystem: RefreshGridSystem = null!;
    private moveTiles: MoveTilesSystem = null!;
    private updateUISystem: UpdateUISystem = null!;
    private superTile: SuperTileSystem = null!;
    private tilesGroupSystem: TilesGroupSystem = new TilesGroupSystem();

    private boundHandlers = {
        onTileClick: null as any,
        onTilesRemoved: null as any,
        onUpdateUI: null as any,
        onRefreshGrid: null as any
    };

    onLoad(): void 
    {
        this.initSystems();
        this.initGameState();
        this.initManagers();
        this.subscribeToEvents();
    }

    private initSystems(): void {
        this.updateUISystem = this.getComponent(UpdateUISystem)!;
        this.gridNode.active = true;
        
        this.gridGenerator = this.gridNode.getComponent(GridGenerator)!;
        this.gridSize = this.gridNode.getComponent(GridSize)!;
        
        this.randomTileSystem = this.randomTileSystemNode.getComponent(RandomTileSystem)!;
        this.superTile = this.superTileSystem.getComponent(SuperTileSystem)!;
        this.superTile.Init(this.gridGenerator);
        
        this.tilesGroupSystem.Init(this.gridGenerator);
        this.moveTiles = new MoveTilesSystem(this.gridGenerator, this.gridSize, this.randomTileSystem);
        this.refreshTilesSystem = new RefreshGridSystem(this.gridGenerator, this.gridSize);
    }

    private initGameState(): void {
        this.gameState = new GameSateSystem(
            this.updateUISystem.goalScore,
            this.updateUISystem.movesCount,
            this.updateUISystem.BoosterBombCount,
            this.updateUISystem.BoosterTeleportCount
        );
        
        this.tilesRemoveSystem = new RemoveTilesSystem(
            this.gridGenerator, 
            this.updateUISystem, 
            0, 
            this.gameState.startMovesCount
        );
    }

    private initManagers(): void {
        this.boosterManager = new BoosterSystem(this.gameState, this.gridGenerator);
        
        const moveHandlerNode = new cc.Node();
        moveHandlerNode.parent = this.node;
        this.moveHandler = moveHandlerNode.addComponent(MoveHandle);
        
        this.moveHandler.init(
            this.gameState,
            this.gridGenerator,
            this.tilesGroupSystem,
            this.tilesRemoveSystem,
            this.moveTiles,
            this.superTile,
            () => {
                this.gameState.isAnimating = false;
            },
            () => {
                this.emitUIUpdate();
            }
        );
    }

    private subscribeToEvents(): void {
        this.boundHandlers.onTileClick = this.onTileClick.bind(this);
        this.boundHandlers.onTilesRemoved = this.onTilesRemoved.bind(this);
        this.boundHandlers.onUpdateUI = this.onUpdateUI.bind(this);
        this.boundHandlers.onRefreshGrid = this.onRefreshTiles.bind(this);
        
        EventManager.instance.on(TileClickEvent, this.boundHandlers.onTileClick);
        EventManager.instance.on(TilesRemovedEvent, this.boundHandlers.onTilesRemoved);
        EventManager.instance.on(UpdateUIEvent, this.boundHandlers.onUpdateUI);
        EventManager.instance.on(RefreshGridEvent, this.boundHandlers.onRefreshGrid);
    }

    private onTileClick(event: TileClickEvent): void
    {
        if(this.gameState.isAnimating) return;

        const clickedTile = this.gridGenerator.gridTiles[event.row][event.col];
        const tileComp = clickedTile.getComponent(TileSystem);

        if (tileComp.isSuperTile) {
            this.handleSuperTileClick(event.row, event.col);
            return;
        }

        if (this.handleBoosterClicks(event, clickedTile)) {
            return;
        }

        this.handleRegularTileClick(event);
    }

    private handleSuperTileClick(row: number, col: number): void {
        this.gameState.isAnimating = true;
        this.moveHandler.handleSuperTile(row, col);
    }

    private handleBoosterClicks(event: TileClickEvent, clickedTile: cc.Node): boolean {
        if (this.boosterManager.handleBombClick(event.row, event.col, () => {
            this.emitUIUpdate();
        })) {
            return true;
        }

        if (this.boosterManager.handleTeleportClick(clickedTile, (used) => {
            if (used) {
                this.tilesGroupSystem.Init(this.gridGenerator);
                this.gameState.isAnimating = false;
                this.emitUIUpdate();
            }
        })) {
            return true;
        }

        return false;
    }

    private handleRegularTileClick(event: TileClickEvent): void {
        const group = this.tilesGroupSystem.FindConnectedTilesGroup(
            event.row, event.col, event.tileGroup
        );
        
        this.moveHandler.handleRegularTile(group, event.row, event.col);
        
        if(!this.tilesGroupSystem.HasAnyMoves()) {
            this.gameState.refreshesCount++;
            EventManager.instance.emit(new RefreshGridEvent());
        }
    }

    private onTilesRemoved(event: TilesRemovedEvent): void
    {
        this.gameState.isAnimating = true;
        this.tilesRemoveSystem.RemoveTiles(event.removedTiles);
        this.emitUIUpdate();
        this.checkGameOver();

        this.scheduleOnce(() => {
            this.moveTiles.ApplyMove();
            this.gameState.isAnimating = false;
        }, 0.3);
    }

    private onRefreshTiles(): void
    {
        if(this.gameState.refreshesCount > 3) {
            this.emitGameOver(GameResultType.Lose);
            return;
        }
        
        this.gameState.isAnimating = true;
        this.refreshTilesSystem.RefreshGrid();
        this.tilesGroupSystem.Init(this.gridGenerator);
        
        this.scheduleOnce(() => {
            this.gameState.isAnimating = false;
        }, 0.5);
    }

    private onUpdateUI(event: UpdateUIEvent): void
    {
        this.updateUISystem.UpdateUI(event.score, event.moves, event.bomb, event.teleport);
    }

    private emitUIUpdate(): void {
        EventManager.instance.emit(new UpdateUIEvent(
            this.tilesRemoveSystem.Score,
            this.tilesRemoveSystem.Moves,
            this.gameState.bombCount,
            this.gameState.teleportCount
        ));
    }

    private checkGameOver(): void {
        if(this.tilesRemoveSystem.Score >= this.gameState.goalScore) {
            this.emitGameOver(GameResultType.Win);
        } else if(this.tilesRemoveSystem.Moves <= 0) {
            this.emitGameOver(GameResultType.Lose);
        }
    }

    private emitGameOver(result: GameResultType): void {
        EventManager.instance.emit(new GameOverEvent(
            result, 
            this.tilesRemoveSystem.Score, 
            this.gameState.goalScore
        ));
        this.gridNode.active = false;
    }

    public ActivateBomb(): void {
        this.boosterManager.activateBomb();
    }

    public ActivateTeleport(): void {
        this.boosterManager.activateTeleport();
    }

    public DebugRefreshGrid(): void {
        if(this.gameState.refreshesCount < 3) {
            this.gameState.refreshesCount++;
            EventManager.instance.emit(new RefreshGridEvent());
        } else {
            this.emitGameOver(GameResultType.Lose);
        }
    }

    public RestartGame(): void {
        cc.director.loadScene(cc.director.getScene().name);
    }

    onDestroy(): void {
        EventManager.instance.off(TileClickEvent, this.boundHandlers.onTileClick);
        EventManager.instance.off(TilesRemovedEvent, this.boundHandlers.onTilesRemoved);
        EventManager.instance.off(UpdateUIEvent, this.boundHandlers.onUpdateUI);
        EventManager.instance.off(RefreshGridEvent, this.boundHandlers.onRefreshGrid);
    }
}