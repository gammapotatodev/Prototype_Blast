import { GridGenerator } from "./GenerateGridSystem";
import { TileSystem } from "../TileProperties/TileSystem";

// Система для поиска групп связанных тайлов и проверки наличия возможных ходов

//@cc._decorator.ccclass
export class TilesGroupSystem
{
    // Ссылка на GridGenerator для доступа к данным о сетке
    private grid: GridGenerator = null!;

    // Инициализация системы, передача ссылки на GridGenerator
    public Init(grid: GridGenerator): void
    {
        this.grid = grid;
    }

    // Метод для поиска группы связанных тайлов, начиная с заданной позиции и типа тайла
    public FindConnectedTilesGroup(row: number, col: number, tileGroup: number) : cc.Node[]
    {
        // Массив для отслеживания посещённых позиций
        const checked: boolean[][] = [];
        // Массив для хранения найденной группы связанных тайлов
        const group: cc.Node[] = [];
        
        // Идём по матрице тайлов (которые хранятся в GridGenerator) и инициализируем массив checked 
        // значениями false
        for(let i = 0; i < this.grid.gridTiles.length; i++)
        {
            checked[i] = [];
            for(let j = 0; j < this.grid.gridTiles[i].length; j++)
            {
                checked[i][j] = false;
            }
        }

        // Используем стек для итеративного обхода связанных тайлов
        const stack: [number, number][] = [[row, col]];

        // Пока в стеке есть позиции для проверки
        while(stack.length > 0)
        {
            // Получаем текущую позицию из стека
            const [r,c] = stack.pop()!;

            // Проверяем, что позиция находится в пределах сетки и не была посещена ранее
            if(r < 0 || r >= this.grid.gridTiles.length || c < 0 || c >= this.grid.gridTiles[r].length)
                continue;

            // Проверяем, что на данной позиции есть тайл и он соответствует искомой группе
            if(checked[r][c] || !this.grid.gridTiles[r][c])
                continue;

            // Получаем компонент TileSystem для текущего тайла и проверяем его группу
            const tileComp = this.grid.gridTiles[r][c].getComponent(TileSystem)!;

            // Если группа не совпадает - пропускаем
            if(tileComp.groupIndex !== tileGroup)
                continue;

            // Помечаем текущую позицию как посещённую
            checked[r][c] = true;
            // Добавляем текущий тайл в группу связанных тайлов
            group.push(this.grid.gridTiles[r][c]);

            // Добавляем соседние позиции в стек для проверки
            stack.push([r+1, c]);
            stack.push([r-1,c]);
            stack.push([r, c+1]);
            stack.push([r, c-1]);

        }
    
        // // Рекурсивная функция для поиска связанных тайлов
        // const dfs = (r: number, c: number) =>
        // {
        //     if(r < 0 || r >= this.grid.gridTiles.length || c < 0 || c >= this.grid.gridTiles[r].length)
        //         return;
        //     if(checked[r][c] || !this.grid.gridTiles[r][c])
        //         return;
        //     if(this.grid.gridTiles[r][c].groupIndex !== tileGroup)
        //         return;
    
        //     checked[r][c] = true;
        //     group.push(this.grid.gridTiles[r][c]);
                
        //     dfs(r + 1, c);
        //     dfs(r - 1, c);
        //     dfs(r, c + 1);
        //     dfs(r, c - 1);
        // }
    
        // dfs(row, col);
        
        // Возвращаем найденную группу связанных тайлов
        return group;
    }

    // Метод для проверки наличия возможных ходов (групп связанных тайлов размером 2 и более)
    public HasAnyMoves(): boolean
    {
        const checked: boolean[][] = [];
    
        // Инициализируем checked
        for(let i = 0; i < this.grid.gridTiles.length; i++)
        {
            checked[i] = [];
            for(let j = 0; j < this.grid.gridTiles[i].length; j++)
            {
                checked[i][j] = false;
            }
        }

        // Проходим по всем тайлам в сетке
        for(let r = 0; r < this.grid.gridTiles.length; r++)
        {
            for(let c = 0; c < this.grid.gridTiles[r].length; c++)
            {
                const tile = this.grid.gridTiles[r][c];
                // Если тайла нет или он уже был проверен - пропускаем
                if(!tile || checked[r][c])
                    continue;
                    
                // Получаем компонент TileSystem для текущего тайла и ищем группу связанных тайлов
                const tileComp = tile.getComponent(TileSystem)!;
                const group = this.FindConnectedTilesGroup(tileComp.row,tileComp.col,tileComp.groupIndex);
                
                // Помечаем группу как посещённую
                for(const node of group)
                {
                    const tileComp = node.getComponent(TileSystem)!;
                    checked[tileComp.row][tileComp.col] = true;
                }
                
                // Если нашли группу размером >= 2 - сразу возвращаем true
                if(group.length >= 2)
                {
                    return true;
                }
            }
        }
        return false;
    }
}
