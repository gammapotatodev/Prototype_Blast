import { GridGenerator } from "./GenerateGridSystem";
import { GridSize, CalculationProperties } from "./GridProperties";
import { TileSystem } from "../TileProperties/TileSystem";
import { RandomTileSystem } from "./RandomTileSystem";
import { ClickHandle } from "../Management/ClickHandle";

// Класс, описывающий смещение тайлов вниз и добавления новых

export class MoveTilesSystem 
{

    private grid: GridGenerator;
    private gridSize: GridSize;
    private randomTileSystem: RandomTileSystem;
    private calcProps: CalculationProperties;

    constructor(grid: GridGenerator, gridSize: GridSize, randomTileSystem: RandomTileSystem)
    {
        this.grid = grid;
        this.gridSize = gridSize;
        this.randomTileSystem = randomTileSystem;
        this.calcProps = new CalculationProperties();
    }

    // Метод для смещения тайлов ниже
    public ApplyMove(): boolean
    {
        let anyTileMoved = false;

        const rows = this.grid.gridTiles.length;
        const cols = this.grid.gridTiles[0].length;

        const gridData = this.gridSize.getGridSize();
        const { startX, startY } = this.calcProps.CalculateGridProperties(gridData);

        for (let c = 0; c < cols; c++)
        {
            let targetRow = 0;

            for (let r = 0; r < rows; r++)
            {
                const tile = this.grid.gridTiles[r][c];
                if (tile !== null)
                {
                    if (r !== targetRow)
                    {
                        this.grid.gridTiles[targetRow][c] = tile;
                        this.grid.gridTiles[r][c] = null;

                        const tileComp = tile.getComponent(TileSystem);
                        tileComp.row = targetRow;
                        tileComp.col = c;

                        const newX = startX + c * gridData.cellSize;
                        const newY = startY + targetRow * gridData.cellSize;

                        tile.setPosition(newX, newY);

                        //cc.log(`Tile moved DOWN from [${r}] to [${targetRow}]`);
                        anyTileMoved = true;
                    }

                    targetRow++;
                }
            }
        }

        this.AddNewTiles();

        return anyTileMoved;
    }

    // Метод добавления новых тайлов
    private AddNewTiles(): void
    {
        const rows = this.grid.gridTiles.length;
        const cols = this.grid.gridTiles[0].length;

        const gridData = this.gridSize.getGridSize();
        const { startX, startY } = this.calcProps.CalculateGridProperties(gridData);

        for (let c = 0; c < cols; c++)
        {
            for (let r = 0; r < rows; r++)
            {
                if (this.grid.gridTiles[r][c] === null)
                {
                    // Выбираем случайный префаб из массива и создаём тайл
                    const { prefab, index  } = this.randomTileSystem.getRandomTile();
                    const tile = cc.instantiate(prefab);

                    tile.setParent(this.grid.node);

                    const posX = startX + c * gridData.cellSize;
                    const posY = startY + r * gridData.cellSize;

                    // Для появления тайла выше, для анимации
                    const spawnOffset = gridData.cellSize * 2;

                    tile.setPosition(posX, posY + spawnOffset);

                    this.grid.gridTiles[r][c] = tile;

                    const tileComp = tile.getComponent(TileSystem);
                    tileComp.row = r;
                    tileComp.col = c;
                    tileComp.groupIndex = index;

                    // добавляем скрипт для обработки кликов на тайлах
                    const clickable = tile.addComponent(ClickHandle);
                    
                    // Инициализируем ClickHandle, передавая ссылку на GridGenerator для доступа к матрице тайлов 
                    // при клике 
                    clickable.Init(this.grid);
                    
                    // Анимация падения тайла на место
                    cc.tween(tile)
                        .to(0.3, { position: cc.v3(posX, posY, 0) }, { easing: 'quadIn' }).start();
                }
            }
        }
    }
}
