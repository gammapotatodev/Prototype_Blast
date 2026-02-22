import { GridGenerator } from "../GridSystem/GenerateGridSystem";
import { GridSize } from "../GridSystem/GridProperties";
import { TileSystem } from "../TileProperties/TileSystem";



@cc._decorator.ccclass
export class RefreshGridSystem
{
    private gridGenerator: GridGenerator;
    private gridSize: GridSize;

    constructor(
        gridGenerator: GridGenerator,
        gridSize: GridSize,
    )
    {
        this.gridGenerator = gridGenerator;
        this.gridSize = gridSize;
    }

    public RefreshGrid(): void
    {
        const gridTiles = this.gridGenerator.gridTiles;
        const gridData = this.gridSize.getGridSize();

        const cellSize = gridData.cellSize;

        const startX =-(gridData.width - 1) * cellSize / 2;

        const startY =-(gridData.height - 1) * cellSize / 2;

        const allTiles: cc.Node[]= [];

        for(let row = 0; row < gridData.height; row++)
        {
            for(let col = 0; col < gridData.width; col++)
            {
                allTiles.push(gridTiles[row][col]);
            }
        }
        for(let i = allTiles.length - 1; i > 0; i--)
        {
            const j = Math.floor(Math.random() * (i + 1));

            const temp = allTiles[i];
            allTiles[i] = allTiles[j];
            allTiles[j] = temp;
        }
        
        let index = 0;

        for(let row = 0; row < gridData.height; row++)
        {
            for(let col = 0; col < gridData.width; col++)
            {
                const tileNode = allTiles[index];

                gridTiles[row][col] = tileNode;
                
                
                const tileComp = tileNode.getComponent(TileSystem);
                
                tileComp.row = row;
                tileComp.col = col;
                
                tileNode.setPosition(startX + col * cellSize, startY + row * cellSize);
                
                index++;
            }
        }

    }
}
