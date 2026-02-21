import { EventManager } from "./EventManager";
import { TileClickEvent, TilesRemovedEvent, UpdateUIEvent } from "./Events";
import { TilesGroupSystem } from "../GridSystem/TilesGroupSystem";
//import { TilePositionSystem } from "../GridSystem/TilePositionSystem";
import { GridGenerator } from "../GridSystem/GenerateGridSystem";
import { MoveTilesSystem } from "../GridSystem/MoveTilesSystem";
import { GridSize } from "../GridSystem/GridProperties";
import { TileSystem } from "../TileProperties/TileSystem";
import { RandomTileSystem } from "../GridSystem/RandomTileSystem";
import { UpdateUISystem } from "./UpdateUISystem";

// Менеджер игры, управляющий логикой игры и событиями

@cc._decorator.ccclass
class GameManager extends cc.Component
{
    @cc._decorator.property(cc.Node)
    private loseScreen: cc.Node = null!;

    @cc._decorator.property(cc.Label)
    private loseScoreLabel: cc.Label = null!;

    @cc._decorator.property(cc.Node)
    private winScreen: cc.Node = null!;

    // Костыль "для заморозки" игры при взаимодействии с экраном выигрыша/проигрыша
    @cc._decorator.property(cc.Node)
    private gridHolderNode: cc.Node = null!;

    // Ссылка на ноду с GridGenerator
    @cc._decorator.property(cc.Node)
    private gridNode: cc.Node = null!;

    // Ссылка на GridSize
    @cc._decorator.property(cc.Node)
    private gridSizeNode: cc.Node = null!;

    @cc._decorator.property(cc.Node)
    private randomTileSystemNode: cc.Node = null!;

    // Связанные методы для событий
    private boundOnTileClick: (event: TileClickEvent) => void;
    private boundOnTilesRemoved: (event: TilesRemovedEvent) => void;
    private boundOnUpdateUI: (event: UpdateUIEvent) => void;

    // Объявлялем поле для хранения ссылки на GridGenerator и GridSize
    private gridGenerator: GridGenerator = null!;
    private gridSize: GridSize = null!;
    private randomTileSystem: RandomTileSystem = null!;
    
    // Объявляем экземпляр TilesGroupSystem, который будет использоваться для поиска групп связанных тайлов
    private tilesGroupSystem: TilesGroupSystem = new TilesGroupSystem()
    
    // Объявляем экземпляр TilePositionSystem, который будет использоваться для получения позиций тайлов
    //private tilePositionSystem: TilePositionSystem = new TilePositionSystem();
    
    // Объявляем поле для хранения экземпляра MoveTilesSystem, 
    // который будет использоваться для перемещения оставшихся тайлов после удаления
    private moveTiles : MoveTilesSystem = null!;

    private updateUISystem: UpdateUISystem = null!;

    private currentScore: number = 0;
    private startMovesCount: number = 0;
    private currentMovesCount: number = 0;
    private goalScore: number = 0;
    //private canClick: boolean = true;

    onLoad(): void 
    {
        // Получаем компонент GridGenerator
        this.gridGenerator = this.gridNode.getComponent(GridGenerator)!;
        
        // Получаем компонент GridSize
        this.gridSize = this.gridSizeNode.getComponent(GridSize);

        // Получаем компонент RandomTileSystem
        this.randomTileSystem = this.randomTileSystemNode.getComponent(RandomTileSystem)!;

        // Инициализируем систему группировки тайлов, передавая ей ссылку на GridGenerator для доступа к данным 
        // о сетке
        this.tilesGroupSystem.Init(this.gridGenerator);
        
        // Инициализируем систему получения позиций тайлов, передавая ей ссылку на GridGenerator для доступа к данным 
        // о сетке
        //this.tilePositionSystem.Init(this.gridGenerator);
        
        // Инициализируем систему перемещения тайлов, передавая ей ссылки на GridGenerator и GridSize для доступа к данным 
        // о сетке и ее размерах
        this.moveTiles = new MoveTilesSystem(this.gridGenerator, this.gridSize, this.randomTileSystem);

        this.updateUISystem = this.getComponent(UpdateUISystem)!;
        this.startMovesCount = this.updateUISystem.movesCount;
        this.currentMovesCount = this.startMovesCount;
        this.goalScore = this.updateUISystem.goalScore;
        this.updateUISystem.UpdateUI(this.currentScore, this.currentMovesCount);
        

        // Поддготовка связанных методов для событий
        this.boundOnTileClick = this.onTileClick.bind(this);
        this.boundOnTilesRemoved = this.onTilesRemoved.bind(this);
        this.boundOnUpdateUI = this.onUpdateUI.bind(this);
        
        // Подписываемся на события
        EventManager.instance.on(TileClickEvent, this.boundOnTileClick);
        EventManager.instance.on(TilesRemovedEvent, this.boundOnTilesRemoved);
        EventManager.instance.on(UpdateUIEvent, this.boundOnUpdateUI);
    }


    // Метод для обработки кликов по тайлам
    private onTileClick(event: TileClickEvent): void
    {
        // Используем TilesGroupSystem для поиска всех связанных тайлов, которые принадлежат к той же группе, 
        // что и кликнутый тайл
        const group = this.tilesGroupSystem.FindConnectedTilesGroup(event.row, event.col, event.tileGroup);
        
        // Если найдено 2 или более связанных тайлов, удаляем их
        if(group.length >= 2) //&& this.canClick)
        {
            //this.canClick = false;
            this.RemoveTiles(group);
        }
        
        // Проверяем, есть ли еще возможные ходы после удаления тайлов
        if(!this.tilesGroupSystem.HasAnyMoves())
            cc.log("No moves");
            // ЭМИТ ДЛЯ СОБЫТИЯ ПЕРЕМЕШИВАНИЯ ТАЙЛОВ
    }

    private onUpdateUI(event: UpdateUIEvent): void
    {
        // this.currentScore = event.score;
        // this.currentMovesCount = event.moves;
        this.updateUISystem.UpdateUI(event.score, event.moves);
    }

    // Метод для обработки события удаления тайлов
    private onTilesRemoved(event: TilesRemovedEvent): void
    {
        this.moveTiles.ApplyMove();
    }

    // Метод для удаления тайлов из сетки и уничтожения их нод
    private RemoveTiles(tiles: cc.Node[]): void
    {
        for(let tile of tiles)
        {
            const tileComp = tile.getComponent(TileSystem)!;
            //const pos = this.tilePositionSystem.GetTilePosition(tile);
            if(tileComp.row !== -1 && tileComp.col !== -1)
            {
                this.gridGenerator.gridTiles[tileComp.row][tileComp.col] = null;
                tile.destroy();
            }
        }
        
        this.currentMovesCount--;
        const gaindeScore = this.updateUISystem.ScoreMultiplier * tiles.length; 
        this.currentScore += gaindeScore;
        const updateScoreEvent = new UpdateUIEvent(this.currentScore, this.currentMovesCount);
        EventManager.instance.emit(updateScoreEvent);
        this.CheckGameOver();

        // ДОБАВИТЬ ЭМИТ СОБЫТИЯ ПОСЛЕ УДАЛЕНИЯ ДЛЯ СДВИГА ОСТАЛЬНЫХ
        const moveEvent = new TilesRemovedEvent(tiles, tiles.length);
        EventManager.instance.emit(moveEvent);
        //this.canClick = true;
    }

    private CheckGameOver(): void
    {
        if(this.currentScore >= this.goalScore)
        {
            this.winScreen.active = true;
            this.gridHolderNode.active = false;
            this.loseScreen.active = false;
        }
        else if(this.currentMovesCount <= 0)
        {
            this.loseScreen.active = true;
            this.gridHolderNode.active = false;
            this.winScreen.active = false;
            this.loseScoreLabel.string = this.currentScore.toString() + " / " + this.goalScore.toString();
        }
    }

    private RestartGame(): void
    {
        cc.director.loadScene(cc.director.getScene().name);
    }

    onDestroy(): void 
    {
        // Отписка от события
        EventManager.instance.off(TileClickEvent, this.boundOnTileClick);
        EventManager.instance.off(TilesRemovedEvent, this.boundOnTilesRemoved);
        EventManager.instance.off(UpdateUIEvent, this.boundOnUpdateUI);
        
    }
}
