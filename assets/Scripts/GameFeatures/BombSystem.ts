import { EventManager } from "../Management/EventManager";
import { TilesRemovedEvent } from "../Management/Events";

// Класс, описывающий поведение бустера: телепорт

@cc._decorator.ccclass
export class BombSystem extends cc.Component 
{
    // Для любой бомбы можно указать свой радиус поражения
    @cc._decorator.property
    radius: number = 1;
    
    // Для мега бомбы (уничтожает все клетки)
    @cc._decorator.property
    destroyAll: boolean = false;

    private grid: cc.Node[][] = [];

    public init(grid: cc.Node[][])
    {
        this.grid = grid;
    }

    // Активация бомбы
    public explode(row: number, col: number): void
    {
        if (this.destroyAll)
        {
            const all: cc.Node[] = [];

            for (let r = 0; r < this.grid.length; r++)
                for (let c = 0; c < this.grid[0].length; c++)
                    all.push(this.grid[r][c]);

            EventManager.instance.emit(
                new TilesRemovedEvent(all, all.length)
            );

            return;
        }

        const cells = this.getCellsInRadius(row, col);

        EventManager.instance.emit(
            new TilesRemovedEvent(cells, cells.length)
        );
    }

    // Метод получения тайлов в радиусе
    private getCellsInRadius(row: number, col: number): cc.Node[]
    {
        const result: cc.Node[] = [];

        for (let dr = -this.radius; dr <= this.radius; dr++)
        {
            for (let dc = -this.radius; dc <= this.radius; dc++)
            {
                if (Math.sqrt(dr * dr + dc * dc) > this.radius)
                    continue;

                const r = row + dr;
                const c = col + dc;

                if (this.isInsideGrid(r, c))
                {
                    const tile = this.grid[r][c];
                    if (tile && tile.isValid)
                        result.push(tile);
                }
            }
        }

        return result;
    }

    // Проверка границ
    private isInsideGrid(r: number, c: number): boolean
    {
        return (
            r >= 0 &&
            c >= 0 &&
            r < this.grid.length &&
            c < this.grid[0].length
        );
    }
}
