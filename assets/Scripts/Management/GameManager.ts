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
//import { BoosterBomb } from "../GameFeatures/BoosterBomb";
import { BoosterTeleport } from "../GameFeatures/BoosterTeleport";
import { SuperTileSystem } from "../GameFeatures/SuperTileSystem";
//import { STbomb } from "../GameFeatures/STbomb ";
import { TileSystem } from "../TileProperties/TileSystem";
import Bomb from "../GameFeatures/Bomb";

// Менеджер игры, управляющий логикой игры и событиями

@cc._decorator.ccclass
class GameManager extends cc.Component
{
    // Ссылка на ноду с GridGenerator
    @cc._decorator.property(cc.Node)
    private gridNode: cc.Node = null!;

    @cc._decorator.property(cc.Node)
    private randomTileSystemNode: cc.Node = null!;

    @cc._decorator.property(cc.Node)
    private superTileSystem: cc.Node = null!;

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
    private moveTiles : MoveTilesSystem = null!;
    private updateUISystem: UpdateUISystem = null!;
    //private activeBoosterBomb: BoosterBomb = null!;
    private activeBoosterTeleport: BoosterTeleport = null!;
    private teleportFirstTile: cc.Node = null!;
    private superTile: SuperTileSystem = null!;
    
    private tilesGroupSystem: TilesGroupSystem = new TilesGroupSystem()

    private startMovesCount: number = 0;
    private goalScore: number = 0;
    private startBombCount: number = 0;
    private startTeleportCount: number = 0;
    private refreshesCount: number = 0;
    private isAnimating: boolean = false;
    private activeBoosterBomb: boolean = false;

    onLoad(): void 
    {
        this.gridNode.active = true;
        this.refreshesCount = 0;

        this.gridGenerator = this.gridNode.getComponent(GridGenerator)!;
        this.gridSize = this.gridNode.getComponent(GridSize)!;
        
        this.updateUISystem = this.getComponent(UpdateUISystem)!;
        this.startMovesCount = this.updateUISystem.movesCount;
        this.goalScore = this.updateUISystem.goalScore;
        this.startBombCount = this.updateUISystem.BoosterBombCount;
        this.startTeleportCount = this.updateUISystem.BoosterTeleportCount;
        
        this.tilesRemoveSystem = new RemoveTilesSystem(this.gridGenerator, this.updateUISystem, 0, this.startMovesCount);

        this.randomTileSystem = this.randomTileSystemNode.getComponent(RandomTileSystem)!;
        this.superTile = this.superTileSystem.getComponent(SuperTileSystem)!;
        this.superTile.Init(this.gridGenerator);   

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
        if(this.isAnimating)
            return;

        const clickedTile = this.gridGenerator.gridTiles[event.row][event.col];
        const tileComp = clickedTile.getComponent(TileSystem);

        if (tileComp.isSuperTile)
        {
            this.isAnimating = true;

            const bomb = clickedTile.getComponent(Bomb);

            if (bomb)
            {
                bomb.init(this.gridGenerator.gridTiles);
                bomb.explode(event.row, event.col);
            }

            this.scheduleOnce(() =>
            {
                this.moveTiles.ApplyMove();
                this.isAnimating = false;
            }, 0.3);

            return;
        }

        if (this.activeBoosterTeleport && this.startTeleportCount > 0)
        {
            if (!this.teleportFirstTile)
            {
                // Выбираем первый тайл
                this.teleportFirstTile = clickedTile;
                return;
            }
            else
            {
                // Выбираем второй тайл и телепортируем
                this.isAnimating = true;

                this.activeBoosterTeleport.TeleportTiles(
                    this.teleportFirstTile,
                    clickedTile
                );

                // Сброс состояния
                this.teleportFirstTile = null;
                this.activeBoosterTeleport = null;

                // Обновляем группы после телепорта
                this.tilesGroupSystem.Init(this.gridGenerator);

                this.scheduleOnce(() =>
                {
                    this.isAnimating = false;
                }, 0.2);

                this.startTeleportCount--;
                EventManager.instance.emit(new UpdateUIEvent(
                    this.tilesRemoveSystem.Score, 
                    this.tilesRemoveSystem.Moves, 
                    this.startBombCount, 
                    this.startTeleportCount)
                );
                return;
            }
        }

        if (this.activeBoosterBomb && this.startBombCount > 0) 
        {
            this.isAnimating = true;

            const bombNode = new cc.Node();
            const bomb = bombNode.addComponent(Bomb);

            bomb.radius = 1;
            bomb.init(this.gridGenerator.gridTiles);
            bomb.explode(event.row, event.col);

            bombNode.destroy();

            this.activeBoosterBomb = false;
            this.startBombCount--;

            EventManager.instance.emit(
                new UpdateUIEvent(
                    this.tilesRemoveSystem.Score,
                    this.tilesRemoveSystem.Moves,
                    this.startBombCount,
                    this.startTeleportCount
                )
            );

            return;
        }
        // Используем TilesGroupSystem для поиска всех связанных тайлов, которые принадлежат к той же группе, 
        // что и кликнутый тайл
        const group = this.tilesGroupSystem.FindConnectedTilesGroup(event.row, event.col, event.tileGroup);
        
        // Если найдено 2 или более связанных тайлов, удаляем их
        if(group.length >= 5)
        {
            this.isAnimating = true;

            const clickedTile = this.gridGenerator.gridTiles[event.row][event.col];

            this.tilesRemoveSystem.RemoveTilesWithoutScore(group);

            this.superTile.SpawnSuperTile(clickedTile);

            // удалить без очков
            //this.tilesRemoveSystem.RemoveTilesWithoutScore(group);

            // создать супер тайл
            //this.superTile.SpawnSuperTile(event.row, event.col);

            this.tilesGroupSystem.Init(this.gridGenerator);

            this.scheduleOnce(() =>
            {
                this.moveTiles.ApplyMove();
                this.isAnimating = false;
            }, 0.3);

            return;
        }
        else if(group.length >= 2)
        {
            EventManager.instance.emit(
                new TilesRemovedEvent(group, group.length)
            );
        }
        
        // Проверяем, есть ли еще возможные ходы после удаления тайлов
        if(!this.tilesGroupSystem.HasAnyMoves())
        {
            this.refreshesCount++;
            EventManager.instance.emit(new RefreshGridEvent());
        }
    }

    private onUpdateUI(event: UpdateUIEvent): void
    {
        this.updateUISystem.UpdateUI(event.score, event.moves, event.bomb, event.teleport);
    }

    // Метод для обработки события удаления тайлов
    private onTilesRemoved(event: TilesRemovedEvent): void
    {
        this.isAnimating = true;
        this.tilesRemoveSystem.RemoveTiles(event.removedTiles);
        EventManager.instance.emit(new UpdateUIEvent(
            this.tilesRemoveSystem.Score, 
            this.tilesRemoveSystem.Moves, 
            this.startBombCount, 
            this.startTeleportCount)
        );
        this.CheckGameOver(
            this.tilesRemoveSystem.Score,
            this.tilesRemoveSystem.Moves
        );

        this.scheduleOnce(() =>
        {
            this.moveTiles.ApplyMove();
            this.isAnimating = false;
        }, 0.3);
    }

    private onRefreshTiles(): void
    {
        if(this.refreshesCount > 3)
        {
            EventManager.instance.emit(new GameOverEvent(GameResultType.Lose, this.tilesRemoveSystem.Score, this.goalScore));
            return;
        }
        this.isAnimating = true;
        this.refreshTilesSystem.RefreshGrid();
        this.tilesGroupSystem.Init(this.gridGenerator);
        this.scheduleOnce(() =>
        {
            this.isAnimating = false;
        }, 0.5);
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
    }
    
    public ActivateBomb(): void 
    {
        if (this.activeBoosterBomb) return;
        this.activeBoosterBomb = true;
    }

    public ActivateTeleport(): void
    {
        if (this.activeBoosterTeleport) return;

        this.activeBoosterTeleport = new BoosterTeleport(
            this.gridGenerator,
            this.gridSize
        );

        this.teleportFirstTile = null;
    }

    onDestroy(): void 
    {
        // Отписки от событий
        EventManager.instance.off(TileClickEvent, this.boundOnTileClick);
        EventManager.instance.off(TilesRemovedEvent, this.boundOnTilesRemoved);
        EventManager.instance.off(UpdateUIEvent, this.boundOnUpdateUI);
        EventManager.instance.off(RefreshGridEvent, this.boundOnRefreshGrid);
        
    }
}
