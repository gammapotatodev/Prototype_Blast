

@cc._decorator.ccclass
export abstract class BombSystem
{
    protected radius: number;
    protected grid: cc.Node[][];

    constructor(
        radius: number, 
        grid: cc.Node[][]
    )
    {
        this.radius = radius;
        this.grid = grid;
    }
    
    protected getCellsInRadius(row: number, col: number): cc.Node[]
    {
        const result: cc.Node[] = [];
        for(let dr = -this.radius; dr <= this.radius; dr++)
        {
            for(let dc = -this.radius; dc <= this.radius; dc++)
            {
                if(Math.sqrt(dr * dr + dc * dc) > this.radius)
                    continue;
                
                const r = row + dr;
                const c = col + dc;

                if(this.isInsideGrid(r, c))
                {
                    result.push(this.grid[r][c]);
                }
            }
        }
        
        return result;
    }

    protected isInsideGrid(r: number, c: number): boolean
    {
        return (
            r >= 0 && 
            c >= 0 &&
            r < this.grid.length &&
            c < this.grid[0].length
        );
    }

}
