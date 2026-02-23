import { GridGenerator } from "../GridSystem/GenerateGridSystem";
import { TileSystem } from "../TileProperties/TileSystem";
import { UpdateUISystem } from "./UpdateUISystem";

// Система удаления тайлов

export class RemoveTilesSystem
{
    private gridGenerator: GridGenerator;
    private updateUISystem: UpdateUISystem;

    private currentScore: number;
    private currentMoves: number;

    constructor(
        gridGenerator: GridGenerator,
        updateUISystem: UpdateUISystem,
        startScore: number,
        startMoves: number
    )
    {
        this.gridGenerator = gridGenerator;
        this.updateUISystem = updateUISystem;
        this.currentScore = startScore;
        this.currentMoves = startMoves;
    }

    public RemoveTiles(tiles: cc.Node[]): void
    {
        for (let tile of tiles)
        {
            const tileComp = tile.getComponent(TileSystem)!
            if(tileComp.row !== -1 && tileComp.col !== -1)
            {
                this.gridGenerator.gridTiles[tileComp.row][tileComp.col] = null;
                tile.destroy();
            }
        }
        this.currentMoves--;
        const gainedScore = this.updateUISystem.ScoreMultiplier * tiles.length;

        this.currentScore += gainedScore;
        
    }

    public RemoveTilesWithoutScore(tiles: cc.Node[]): void
    {
        for (let tile of tiles)
        {
            const tileComp = tile.getComponent(TileSystem)!
            if(tileComp.row !== -1 && tileComp.col !== -1)
            {
                this.gridGenerator.gridTiles[tileComp.row][tileComp.col] = null;
                tile.destroy();
            }
        }
        this.currentMoves--;
    }

    public get Score(): number
    {
        return this.currentScore;
    }

    public get Moves(): number
    {
        return this.currentMoves;
    }
}
