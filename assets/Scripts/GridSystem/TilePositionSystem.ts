// import { GridGenerator } from "./GenerateGridSystem";

// // Система для получения позиции тайла в сетке

// @cc._decorator.ccclass
// export class TilePositionSystem
// {
//     // Ссылка на GridGenerator для доступа к данным о сетке
//     private grid: GridGenerator = null!;
//     // Инициализация системы, передача ссылки на GridGenerator
//     public Init(grid: GridGenerator): void
//     {
//         this.grid = grid;
//     }

//     // Метод для получения позиции тайла в сетке по его ноде
//     public GetTilePosition(tile: cc.Node): {row: number, col: number}
//     {
//         for(let i = 0; i < this.grid.gridTiles.length; i++)
//         {
//             for(let j = 0; j < this.grid.gridTiles[i].length; j++)
//             {
//                 if(this.grid.gridTiles[i][j] === tile)
//                     return {row: i, col: j};
//             }
//         }
//         return {row: -1, col: -1}; // Если тайл не найден
//     }
// }
