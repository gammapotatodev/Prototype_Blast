// Интерфейс, описывающий структуру данных для параметров сетки
// Позволяет безопасно передавать данные о сетке
interface GridData
{
    width: number;
    height: number;
    cellSize: number;
}

// Компонент, содержащий данные о сетке (ширина, высота, размер ячейки)
// Метод getGridSize возвращает объект с параметрами сетки, соответствующий интерфейсу GridData
@cc._decorator.ccclass
export class GridSize extends cc.Component 
{
    @cc._decorator.property(cc.Integer)
    gridWidth: number = 9;

    @cc._decorator.property(cc.Integer)
    gridHeight: number = 9;

    @cc._decorator.property(cc.Integer)
    gridCellSize: number = 70;

    public getGridSize() : GridData
    {
        return {
            width: this.gridWidth, 
            height: this.gridHeight, 
            cellSize: this.gridCellSize
        };
    }
}

// Класс, отвечающий за расчет параметров для дальнейшего построения сетки
// В метод CalculateGridProperties передаётся ссылка на объект GridData, и 
// происходит расчёт возвращаемых параметров
//@cc._decorator.ccclass
export class CalculationProperties
{
    public CalculateGridProperties(grid: GridData)
    {
        const totalWidth = (grid.width - 1) * grid.cellSize;
        const totalHeight = (grid.height - 1) * grid.cellSize;

        const startX = -totalWidth / 2;
        const startY = -totalHeight / 2;

        return {startX, startY};
    }
}
