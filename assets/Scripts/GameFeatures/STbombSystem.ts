// import { EventManager } from "../Management/EventManager";
// import { TilesRemovedEvent } from "../Management/Events";
// import { BombSystem } from "./BombSystem";


// @cc._decorator.ccclass
// export class STbombSystem extends BombSystem
// {
//     constructor(grid: cc.Node [][])
//     {
//         super(2, grid);
//     }

//     public explode(row: number, col: number): void
//     {
//         const cells = this.getCellsInRadius(row, col);
    
//         EventManager.instance.emit(
//             new TilesRemovedEvent(cells, cells.length)
//         );
//     }
// }
