import { GridGenerator } from "../GridSystem/GenerateGridSystem";
import { GridSize } from "../GridSystem/GridProperties";
import { TileSystem } from "../TileProperties/TileSystem";


@cc._decorator.ccclass
export class BoosterTeleport
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

    public TeleportTiles(firstTile: cc.Node, secondTile: cc.Node): void
    {
        if (!firstTile || !secondTile) return;
        if (firstTile === secondTile) return;

        const gridTiles = this.gridGenerator.gridTiles;

        const firstComp = firstTile.getComponent(TileSystem);
        const secondComp = secondTile.getComponent(TileSystem);

        // Сохраняем старые координаты
        const firstRow = firstComp.row;
        const firstCol = firstComp.col;

        const secondRow = secondComp.row;
        const secondCol = secondComp.col;

        // Меняем позиции визуально
        const firstPos = firstTile.position.clone();
        const secondPos = secondTile.position.clone();

        cc.tween(firstTile)
            .to(0.2, { position: secondPos })
            .start();

        cc.tween(secondTile)
            .to(0.2, { position: firstPos })
            .start();

        // Меняем данные в gridTiles
        gridTiles[firstRow][firstCol] = secondTile;
        gridTiles[secondRow][secondCol] = firstTile;

        // Меняем row/col в компонентах
        firstComp.row = secondRow;
        firstComp.col = secondCol;

        secondComp.row = firstRow;
        secondComp.col = firstCol;
    }



}
