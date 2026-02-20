import { GridSize } from "./GridProperties";
import { CalculationProperties } from "./GridProperties";
import { ClickHandle } from "../Management/ClickHandle";
import { TileSystem } from "../TileProperties/TileSystem";
import { RandomTileSystem } from "./RandomTileSystem";

// Класс отвечающий за генерацию сетки на основе данных из GridSize и расчетов из CalculationProperties

@cc._decorator.ccclass
export class GridGenerator extends cc.Component {

    // Ссылка на ноду, содержащую GridProperties.ts (GridHolder)
    @cc._decorator.property(cc.Node)
    private gridNode: cc.Node = null!;

    //Массив префабов тайлов для дальнейшего случайного выбора при генерации сетки
    @cc._decorator.property(RandomTileSystem)
    private randomTileSystemComponent: RandomTileSystem = null!;

    // Экземпляр класса CalculationProperties для доступа к методу расчёта параметров сетки
    private calculation: CalculationProperties = new CalculationProperties();

    // Экземпляр класса RandomTileSystem для доступа к методу получения случайного тайла
    private randomTileSystem!: RandomTileSystem;

    // Матрица для хранения ссылок на созданные тайлы для дальнейшего использования в ClickHandle
    public gridTiles: cc.Node[][] = [];

    // В start() получаем компонент GridSize, получаем данные о сетке, рассчитываем параметры 
    // для генерации и вызываем метод генерации сетки
    start () 
    {
        const gridSizeComponent = this.gridNode.getComponent(GridSize);
        const gridData = gridSizeComponent.getGridSize();
        const gridInfo = this.calculation.CalculateGridProperties(gridData);
        this.GenerateGrid(gridData.width, gridData.height, gridData.cellSize, gridInfo.startX, gridInfo.startY);
    }

    // Метод генерации сетки. Передаём ширину, высоту, размер ячейки и стартовые координаты
    // для центрирования сетки. Сетка строится с нижнего левого угла
    GenerateGrid(Width: number, Height: number, CellSize: number, StartX: number, StartY: number): void
    {
        // Очищаем старую сетку
        this.gridTiles = [];
        for(let i = 0; i < Height; i++)
        {
            // Создание новой строки в матрице
            this.gridTiles[i] = [];
            for(let j = 0; j < Width; j++)
            {
                // Выбираем случайный префаб из массива и создаём тайл
                const { prefab, index  } = this.randomTileSystemComponent.getRandomTile();
                const tile = cc.instantiate(prefab);
                
                // Устанавливаем позицию тайла на основе стартовых координат и размера ячейки
                tile.setPosition(StartX + j * CellSize, StartY + i * CellSize);
                this.gridNode.addChild(tile);

                // Сохраняем ссылку на созданный тайл в матрице
                this.gridTiles[i][j] = tile;

                // Получаем компонент TileSystem, устанавливаем координаты и индекс группы 
                // для дальнейшего использования в ClickHandle
                const tileComp = tile.getComponent(TileSystem)!;
                tileComp.row = i;
                tileComp.col = j;
                tileComp.groupIndex = index;

                // добавляем скрипт для обработки кликов на тайлах (мб потом удалю и просто на префаб накину)
                const clickable = tile.addComponent(ClickHandle);

                // Инициализируем ClickHandle, передавая ссылку на GridGenerator для доступа к матрице тайлов 
                // при клике 
                clickable.Init(this);
            }
        }   
    }
}
