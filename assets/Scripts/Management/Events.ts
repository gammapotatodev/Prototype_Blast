export enum GameResultType
{
    Win,
    Lose
}


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
 
export class UpdateUIEvent extends BaseEvent
{
    public static readonly Type = "UpdateUIEvent";

    constructor(
        public readonly score: number,
        public readonly moves: number,
        public readonly bomb: number,
        public readonly teleport: number
    )
    {
        super(UpdateUIEvent.Type);
    }
}

export class RefreshGridEvent extends BaseEvent
{
    public static readonly Type = "RefreshGridEvent";
    
    constructor()
    {
        super(RefreshGridEvent.Type);
    }
}

export class GameOverEvent extends BaseEvent
{
    public static readonly Type = "GameOverEvent";
    
    constructor(
        public readonly resultType: GameResultType,
        public readonly score: number,
        public readonly goalScore: number
    )
    {
        super(GameOverEvent.Type);
    }

}

// export class SuperTileEvent extends BaseEvent
// {
//     public static readonly Type = "SuperTileEvent"

//     constructor(
//         public readonly row: number,
//         public readonly col: number
//     )
//     {
//         super(SuperTileEvent.Type)
//     }
// }