import { GridGenerator } from "../GridSystem/GenerateGridSystem";
import { TileSystem } from "../TileProperties/TileSystem";

// Класс, описывающий поведение бустера: телепорт

export class BoosterTeleport
{
    private gridGenerator: GridGenerator;

    constructor(
        gridGenerator: GridGenerator,
    )
    {
        this.gridGenerator = gridGenerator;
    }

    // Телепортация двух тайлов
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

        // Меняем row и col в компонентах
        firstComp.row = secondRow;
        firstComp.col = secondCol;

        secondComp.row = firstRow;
        secondComp.col = firstCol;
    }



}
