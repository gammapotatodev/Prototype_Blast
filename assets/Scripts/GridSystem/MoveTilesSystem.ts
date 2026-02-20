import { GridGenerator } from "./GenerateGridSystem";
//import {Tile} from "./TilesGroupSystem"
import { GridSize, CalculationProperties } from "./GridProperties";
import { TileSystem } from "../TileProperties/TileSystem";

@cc._decorator.ccclass
export class MoveTilesSystem 
{
    private grid: GridGenerator;
    private gridSize: GridSize;
    private calcProps: CalculationProperties;

    constructor(grid: GridGenerator, gridSize: GridSize)
    {
        this.grid = grid;
        this.gridSize = gridSize;
        this.calcProps = new CalculationProperties();
    }

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

                        // (tile as Tile).row = targetRow;
                        // (tile as Tile).col = c;
                        const tileComp = tile.getComponent(TileSystem);
                        tileComp.row = targetRow;
                        tileComp.col = c;

                        const newX = startX + c * gridData.cellSize;
                        const newY = startY + targetRow * gridData.cellSize;

                        tile.setPosition(newX, newY);

                        cc.log(`Tile moved DOWN from [${r}] to [${targetRow}]`);
                        anyTileMoved = true;
                    }

                    targetRow++;
                }
            }
        }

        return anyTileMoved;
    }
}
