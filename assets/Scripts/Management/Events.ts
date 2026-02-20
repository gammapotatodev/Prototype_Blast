
// Базовый класс для всех событий. Содержит только тип события, который используется для 
// идентификации события при его запуске и обработке
export class BaseEvent
{
    constructor(public readonly type: string){}
}

// Событие клика по тайлу. Содержит координаты тайла (row, col), ссылку на ноду тайла и индекс группы тайла
export class TileClickEvent extends BaseEvent
{
    // Статическое поле для хранения типа события
    public static readonly Type = "TileClickEvent";

    // Конструктор принимает координаты тайла, ссылку на ноду и индекс группы, и вызывает конструктор 
    // базового класса с типом события
    constructor(
        public readonly row: number,
        public readonly col: number,
        public readonly tileNode: cc.Node,
        public readonly tileGroup: number
    )
    {
        super(TileClickEvent.Type);
    }
}

// Событие удаления тайлов. Содержит массив удалённых нод тайлов и размер группы, которая была удалена
export class TilesRemovedEvent extends BaseEvent
{
    public static readonly Type = "TilesRemovedEvent";

    // Конструктор принимает массив удалённых нод тайлов и размер группы, и вызывает конструктор
    constructor(
        public readonly removedTiles: cc.Node[],
        public readonly groupSize: number
    )
    {
        super(TilesRemovedEvent.Type);
    }
}

// export class DeleteTilesGroupEvent extends BaseEvent
// {
//     public static readonly Type = "DeleteTilesGroupEvent";

//     constructor(
//         public readonly group: cc.Node[],
//         public readonly groupSize: number,
//         public readonly groupType: number
//     )
//     {
//         super(DeleteTilesGroupEvent.Type);
//     }
// }