
// Система получения случайного тайла из доступных

@cc._decorator.ccclass
export class RandomTileSystem extends cc.Component
{
    @cc._decorator.property(cc.Prefab)
    private tilePrefabs: cc.Prefab[] = [];
    
    public getRandomTile(): {prefab: cc.Prefab, index: number}
    {
        const randomTileIndex = Math.floor(Math.random() * this.tilePrefabs.length);
        return { prefab: this.tilePrefabs[randomTileIndex], index: randomTileIndex };
    }
}
