import { EventManager } from "./EventManager";
import { TileClickEvent, TilesRemovedEvent, UpdateUIEvent, RefreshGridEvent, GameOverEvent, GameResultType } from "./Events";
import { TilesGroupSystem } from "../GridSystem/TilesGroupSystem";
import { GridGenerator } from "../GridSystem/GenerateGridSystem";
import { MoveTilesSystem } from "../GridSystem/MoveTilesSystem";
import { GridSize } from "../GridSystem/GridProperties";
import { RandomTileSystem } from "../GridSystem/RandomTileSystem";
import { UpdateUISystem } from "./UpdateUISystem";
import { RemoveTilesSystem } from "./RemoveTilesSystem";
import { RefreshGridSystem } from "./RefreshGridSystem";
import { BoosterBomb } from "../GameFeatures/BoosterBomb";

// Менеджер игры, управляющий логикой игры и событиями

@cc._decorator.ccclass
class GameManager extends cc.Component
{
    // Ссылка на ноду с GridGenerator
    @cc._decorator.property(cc.Node)
    private gridNode: cc.Node = null!;

    @cc._decorator.property(cc.Node)
    private randomTileSystemNode: cc.Node = null!;

    // Связанные методы для событий
    private boundOnTileClick: (event: TileClickEvent) => void;
    private boundOnTilesRemoved: (event: TilesRemovedEvent) => void;
    private boundOnUpdateUI: (event: UpdateUIEvent) => void;
    private boundOnRefreshGrid: () => void;

    private gridGenerator: GridGenerator = null!;
    private gridSize: GridSize = null!;
    private randomTileSystem: RandomTileSystem = null!;
    private tilesRemoveSystem: RemoveTilesSystem = null!;
    private refreshTilesSystem: RefreshGridSystem = null!;

    private activeBoosterBomb: BoosterBomb = null!;
    
    private tilesGroupSystem: TilesGroupSystem = new TilesGroupSystem()
    
    private moveTiles : MoveTilesSystem = null!;

    private updateUISystem: UpdateUISystem = null!;

    private startMovesCount: number = 0;
    private goalScore: number = 0;
    //private canClick: boolean = true;
    private refreshesCount: number = 0;

    onLoad(): void 
    {
        this.gridNode.active = true;
        this.refreshesCount = 0;

        this.gridGenerator = this.gridNode.getComponent(GridGenerator)!;
        this.gridSize = this.gridNode.getComponent(GridSize)!;
        
        this.updateUISystem = this.getComponent(UpdateUISystem)!;
        this.startMovesCount = this.updateUISystem.movesCount;
        this.goalScore = this.updateUISystem.goalScore;
        
        this.tilesRemoveSystem = new RemoveTilesSystem(this.gridGenerator, this.updateUISystem, 0, this.startMovesCount);

        this.randomTileSystem = this.randomTileSystemNode.getComponent(RandomTileSystem)!;

        this.tilesGroupSystem.Init(this.gridGenerator);
        
        this.moveTiles = new MoveTilesSystem(this.gridGenerator, this.gridSize, this.randomTileSystem);
        
        this.refreshTilesSystem = new RefreshGridSystem(this.gridGenerator, this.gridSize);

        // Поддготовка связанных методов для событий
        this.boundOnTileClick = this.onTileClick.bind(this);
        this.boundOnTilesRemoved = this.onTilesRemoved.bind(this);
        this.boundOnUpdateUI = this.onUpdateUI.bind(this);
        this.boundOnRefreshGrid = this.onRefreshTiles.bind(this);
        
        // Подписываемся на события
        EventManager.instance.on(TileClickEvent, this.boundOnTileClick);
        EventManager.instance.on(TilesRemovedEvent, this.boundOnTilesRemoved);
        EventManager.instance.on(UpdateUIEvent, this.boundOnUpdateUI);
        EventManager.instance.on(RefreshGridEvent, this.boundOnRefreshGrid);
    }

    // Метод для обработки кликов по тайлам
    private onTileClick(event: TileClickEvent): void
    {
        if (this.activeBoosterBomb) {
            this.activeBoosterBomb.explode(event.row, event.col);
            this.activeBoosterBomb = null;
            return;
        }
        // if(!this.canClick) 
        //     return;
        // Используем TilesGroupSystem для поиска всех связанных тайлов, которые принадлежат к той же группе, 
        // что и кликнутый тайл
        const group = this.tilesGroupSystem.FindConnectedTilesGroup(event.row, event.col, event.tileGroup);
        
        // Если найдено 2 или более связанных тайлов, удаляем их
        if(group.length >= 2) //&& this.canClick)
        {
            //this.canClick = false;
            this.tilesRemoveSystem.RemoveTiles(group);
            this.CheckGameOver(this.tilesRemoveSystem.Score, this.tilesRemoveSystem.Moves);
        }
        
        // Проверяем, есть ли еще возможные ходы после удаления тайлов
        if(!this.tilesGroupSystem.HasAnyMoves())
        {
            //cc.log("No moves");
            //this.canClick = false;
            this.refreshesCount++;
            EventManager.instance.emit(new RefreshGridEvent());
            //this.canClick = true;
        }
    }

    private onUpdateUI(event: UpdateUIEvent): void
    {
        this.updateUISystem.UpdateUI(event.score, event.moves);
    }

    // Метод для обработки события удаления тайлов
    private onTilesRemoved(event: TilesRemovedEvent): void
    {
        this.moveTiles.ApplyMove();
        //this.canClick = true;
    }

    private onRefreshTiles(): void
    {
        if(this.refreshesCount > 3)
        {
            EventManager.instance.emit(new GameOverEvent(GameResultType.Lose, this.tilesRemoveSystem.Score, this.goalScore));
            return;
        }
        this.refreshTilesSystem.RefreshGrid();
        this.tilesGroupSystem.Init(this.gridGenerator);
    }

    private CheckGameOver(score: number, moves: number): void
    {
        if(score >= this.goalScore)
        {
            EventManager.instance.emit(new GameOverEvent(GameResultType.Win, score, this.goalScore));
            this.gridNode.active = false;
        }
        else if(moves <= 0)
        {
            EventManager.instance.emit(new GameOverEvent(GameResultType.Lose, score, this.goalScore));
            this.gridNode.active = false;
        }
    }

    // ВЫНЕСТИ В ОТДЕЛЬНЫЙ СКРИПТ ЧТОБЫ ОБЛЕГЧИТЬ МЕНЕДЖЕР ИГРЫ
    private RestartGame(): void
    {
        cc.director.loadScene(cc.director.getScene().name);
    }

    public DebugRefreshGrid(): void
    {
        if(this.refreshesCount < 3)
        {
            this.refreshesCount++;
            EventManager.instance.emit(new RefreshGridEvent());
        }
        else if(this.refreshesCount >= 3)
            EventManager.instance.emit(new GameOverEvent(GameResultType.Lose, this.tilesRemoveSystem.Score, this.goalScore));
        //this.canClick = false;
        //this.canClick = true;
        //this.onRefreshTiles();
    }
    
    public ActivateBomb(): void 
    {
        if (this.activeBoosterBomb) return;
        this.activeBoosterBomb = new BoosterBomb(this.gridGenerator.gridTiles);
    }

    onDestroy(): void 
    {
        // Отписка от события
        EventManager.instance.off(TileClickEvent, this.boundOnTileClick);
        EventManager.instance.off(TilesRemovedEvent, this.boundOnTilesRemoved);
        EventManager.instance.off(UpdateUIEvent, this.boundOnUpdateUI);
        EventManager.instance.off(RefreshGridEvent, this.boundOnRefreshGrid);
        
    }
}
