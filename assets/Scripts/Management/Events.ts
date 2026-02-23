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
    public static readonly Type = "TileClickEvent";

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

    constructor(
        public readonly removedTiles: cc.Node[],
        public readonly groupSize: number
    )
    {
        super(TilesRemovedEvent.Type);
    }
}

// Событие обновления интерфейса
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

// Событие перемешивания сетки
export class RefreshGridEvent extends BaseEvent
{
    public static readonly Type = "RefreshGridEvent";
    
    constructor()
    {
        super(RefreshGridEvent.Type);
    }
}

// Событие окончания игры
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