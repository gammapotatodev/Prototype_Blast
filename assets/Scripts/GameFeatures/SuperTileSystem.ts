import { GridGenerator } from "../GridSystem/GenerateGridSystem";
import { ClickHandle } from "../Management/ClickHandle";
import { TileSystem } from "../TileProperties/TileSystem";
// import Bomb from "./Bomb";
// import { STbomb } from "./STbomb ";


@cc._decorator.ccclass
export class SuperTileSystem extends cc.Component 
{
    // Префабы супер-тайлов
    @cc._decorator.property(cc.Prefab)
    private superTilesPrefab: cc.Prefab[] = [];

    private gridGenerator: GridGenerator = null!;

    public Init(gridGenerator: GridGenerator): void
    {
        this.gridGenerator = gridGenerator;
    }

    public SpawnSuperTile(oldTile: cc.Node): cc.Node
    {
        const randomIndex = Math.floor(Math.random() * this.superTilesPrefab.length);
        const prefab = this.superTilesPrefab[randomIndex];

        const newTile = cc.instantiate(prefab);

        const tileCompOld = oldTile.getComponent(TileSystem)!;

        newTile.setPosition(oldTile.getPosition());
        oldTile.parent.addChild(newTile);

        this.gridGenerator.gridTiles[tileCompOld.row][tileCompOld.col] = newTile;

        const tileComp = newTile.getComponent(TileSystem)!;
        tileComp.row = tileCompOld.row;
        tileComp.col = tileCompOld.col;
        tileComp.groupIndex = -1;
        tileComp.isSuperTile = true;

        // const bombComp = newTile.getComponent(Bomb);
        // if (bombComp)
        //     bombComp.init(this.gridGenerator.gridTiles);

        const clickable = newTile.addComponent(ClickHandle);
        clickable.Init(this.gridGenerator);

        return newTile;
    }
}
