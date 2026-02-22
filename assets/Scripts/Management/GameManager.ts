import { EventManager } from "./EventManager";
import { TileClickEvent, TilesRemovedEvent, UpdateUIEvent } from "./Events";
import { TilesGroupSystem } from "../GridSystem/TilesGroupSystem";
import { GridGenerator } from "../GridSystem/GenerateGridSystem";
import { MoveTilesSystem } from "../GridSystem/MoveTilesSystem";
import { GridSize } from "../GridSystem/GridProperties";
import { RandomTileSystem } from "../GridSystem/RandomTileSystem";
import { UpdateUISystem } from "./UpdateUISystem";
import { RemoveTilesSystem } from "./RemoveTilesSystem";

// Менеджер игры, управляющий логикой игры и событиями

@cc._decorator.ccclass
class GameManager extends cc.Component
{
    @cc._decorator.property(cc.Node)
    private resultScreen: cc.Node = null!;

    @cc._decorator.property(cc.Label)
    private mainTextLabel: cc.Label = null!;

    @cc._decorator.property(cc.Label)
    private WinScoreLabel: cc.Label = null!;

    @cc._decorator.property(cc.Label)
    private loseScoreLabel: cc.Label = null!;

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
    private tilesRemoveSystem: RemoveTilesSystem = null!;
    
    // Объявляем экземпляр TilesGroupSystem, который будет использоваться для поиска групп связанных тайлов
    private tilesGroupSystem: TilesGroupSystem = new TilesGroupSystem()
    
    // Объявляем поле для хранения экземпляра MoveTilesSystem, 
    // который будет использоваться для перемещения оставшихся тайлов после удаления
    private moveTiles : MoveTilesSystem = null!;

    private updateUISystem: UpdateUISystem = null!;

    private startMovesCount: number = 0;
    private goalScore: number = 0;

    onLoad(): void 
    {
        this.resultScreen.active = false;
        this.WinScoreLabel.node.active = false;
        this.loseScoreLabel.node.active = false;
        this.gridHolderNode.active = true;

        // Получаем компонент GridGenerator
        this.gridGenerator = this.gridNode.getComponent(GridGenerator)!;
        
        this.updateUISystem = this.getComponent(UpdateUISystem)!;
        this.startMovesCount = this.updateUISystem.movesCount;
        this.goalScore = this.updateUISystem.goalScore;
        
        this.tilesRemoveSystem = new RemoveTilesSystem(this.gridGenerator, this.updateUISystem, 0, this.startMovesCount);
        
        // Получаем компонент GridSize
        this.gridSize = this.gridSizeNode.getComponent(GridSize);

        // Получаем компонент RandomTileSystem
        this.randomTileSystem = this.randomTileSystemNode.getComponent(RandomTileSystem)!;

        // Инициализируем систему группировки тайлов, передавая ей ссылку на GridGenerator для доступа к данным 
        // о сетке
        this.tilesGroupSystem.Init(this.gridGenerator);
        
        // Инициализируем систему перемещения тайлов, передавая ей ссылки на GridGenerator и GridSize для доступа к данным 
        // о сетке и ее размерах
        this.moveTiles = new MoveTilesSystem(this.gridGenerator, this.gridSize, this.randomTileSystem);   

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
            this.tilesRemoveSystem.RemoveTiles(group);
            this.CheckGameOver(
                this.tilesRemoveSystem.Score,
                this.tilesRemoveSystem.Moves
            );
        }
        
        // Проверяем, есть ли еще возможные ходы после удаления тайлов
        if(!this.tilesGroupSystem.HasAnyMoves())
            cc.log("No moves");
            // ЭМИТ ДЛЯ СОБЫТИЯ ПЕРЕМЕШИВАНИЯ ТАЙЛОВ
    }

    private onUpdateUI(event: UpdateUIEvent): void
    {
        this.updateUISystem.UpdateUI(event.score, event.moves);
    }

    // Метод для обработки события удаления тайлов
    private onTilesRemoved(event: TilesRemovedEvent): void
    {
        this.moveTiles.ApplyMove();
    }

    // ВЫНЕСТИ В ОТДЕЛЬНЫЙ СКРИПТ ЧТОБЫ ОБЛЕГЧИТЬ МЕНЕДЖЕР ИГРЫ
    private CheckGameOver(score: number, moves: number): void
    {
        if(score >= this.goalScore)
        {
            this.mainTextLabel.string = "ПОБЕДИЛ!";
            this.WinScoreLabel.node.active = true;
            this.WinScoreLabel.string = "Ты набрал нужное количество\nочков, молодец!";
            this.resultScreen.active = true;
            this.gridHolderNode.active = false;
        }
        else if(moves <= 0)
        {
            this.mainTextLabel.string = "ПРОИГРАЛ!";
            this.loseScoreLabel.node.active = true;
            this.loseScoreLabel.string = "Твои очки: " + score.toString() + " / " + this.goalScore.toString();
            this.resultScreen.active = true;
            this.gridHolderNode.active = false;
        }
    }

    // ВЫНЕСТИ В ОТДЕЛЬНЫЙ СКРИПТ ЧТОБЫ ОБЛЕГЧИТЬ МЕНЕДЖЕР ИГРЫ
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
