import { EventManager } from "../Management/EventManager";
import { TilesRemovedEvent } from "../Management/Events";
import { TileSystem } from "../TileProperties/TileSystem";
import { BombSystem } from "./BombSystem";

@cc._decorator.ccclass
export class BoosterBomb extends BombSystem
{
    constructor(grid: cc.Node[][])
    {
        // Радиус бомбы 1
        super(1, grid);
    }
    public explode(row: number, col: number): void {
        const cells = this.getCellsInRadius(row, col);

        this.burnCells(cells);

        
        EventManager.instance.emit(
            new TilesRemovedEvent(cells, cells.length)
        );
    }
    protected burnCells(cells: cc.Node[]): void
    {
        for(const cell of cells)
        {
            if(!cell)
                continue;

            const tileComp = cell.getComponent(TileSystem);
            if (tileComp) 
            {
                this.grid[tileComp.row][tileComp.col] = null;
            }
            cc.tween(cell)
                .to(0.2, { scale: 0 })
                .call(() => cell.destroy())
                .start();
        }
    }
}
