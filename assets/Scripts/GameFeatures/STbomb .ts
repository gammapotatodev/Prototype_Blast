import { STbombSystem } from "./STbombSystem";


@cc._decorator.ccclass
export class STbomb extends cc.Component 
{
    private bomb: STbombSystem;

    init(grid: cc.Node[][])
    {
        this.bomb = new STbombSystem(grid);
    }

    onClick(row: number, col: number)
    {
        this.bomb.explode(row, col);    
    }
}
