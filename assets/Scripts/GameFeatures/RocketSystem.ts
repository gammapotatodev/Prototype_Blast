import { EventManager } from "../Management/EventManager";
import { TilesRemovedEvent } from "../Management/Events";


@cc._decorator.ccclass
export class RocketSystem extends cc.Component 
{
    @cc._decorator.property
    rocketRow : boolean = false;

    @cc._decorator.property
    rocketCol : boolean = false;

    private grid: cc.Node[][] = [];

    public init(grid: cc.Node[][])
    {
        this.grid = grid;
    }

    public explode(row: number, col: number) 
    {
        if (!this.grid || this.grid.length === 0) return;

        const affected: cc.Node[] = [];

        if (this.rocketRow) {
            for (let c = 0; c < this.grid[0].length; c++) {
                affected.push(this.grid[row][c]);
            }
        }

        if (this.rocketCol) {
            for (let r = 0; r < this.grid.length; r++) {
                affected.push(this.grid[r][col]);
            }
        }

        // Удаляем дубликаты, если ракета выбрана и по строке, и по столбцу
        const uniqueNodes = Array.from(new Set(affected));

        EventManager.instance.emit(
            new TilesRemovedEvent(uniqueNodes, uniqueNodes.length)
        );
    }
}
