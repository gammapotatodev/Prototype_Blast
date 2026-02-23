import { GridGenerator } from "../GridSystem/GenerateGridSystem";
import { EventManager } from "./EventManager";
import { TileClickEvent } from "./Events";
import { TileSystem } from "../TileProperties/TileSystem";

// Система обработки кликов на тайлах. При клике на тайл, получает его координаты и индекс группы,
// и отправляет событие TileClickEvent с этими данными

@cc._decorator.ccclass
export class ClickHandle extends cc.Component 
{
    // Ссылка на GridGenerator для доступа к матрице тайлов и получения координат при клике
    private grid: GridGenerator  = null!;

    // Инициализация ClickHandle, передаём ссылку на GridGenerator для доступа к матрице тайлов
    public Init(grid: GridGenerator)
    {
        // Сохраняем ссылку на GridGenerator
        this.grid = grid;

        // Подписываемся на событие клика мыши на ноде, вызывая метод OnClick при клике
        if(cc.sys.isMobile)
            this.node.on(cc.Node.EventType.TOUCH_START, this.OnTouch, this);
        else
            this.node.on(cc.Node.EventType.MOUSE_DOWN, this.OnClickMouse, this);

    }

    // Метод обработки клика. Проверяем, что клик был левой кнопкой мыши, 
    // получаем компонент TileSystem
    private OnTouch(event: cc.Event.EventTouch): void
    {
        // // Проверяем, что клик был левой кнопкой мыши
        // if(event.getButton() !== cc.Event.EventMouse.BUTTON_LEFT)
        //     return;

        // // Получаем компонент TileSystem для доступа к координатам и индексу группы тайла
        // const tileComp = this.node.getComponent(TileSystem)!;

        // // Создаём событие TileClickEvent, передавая координаты тайла и индекс группы из компонента TileSystem,
        // // а также передаём ссылку на ноду
        // const clickEvent = new TileClickEvent(tileComp.row, tileComp.col, this.node, tileComp.groupIndex);

        // // Запускаем событие через EventManager
        // EventManager.instance.emit(clickEvent);
        this.HandleClick();

    }

    private OnClickMouse(event: cc.Event.EventMouse): void
    {
        if(event.getButton() !== cc.Event.EventMouse.BUTTON_LEFT)
            return;

        this.HandleClick();
    }

    private HandleClick(): void
    {
        const tileComp = this.node.getComponent(TileSystem)!;

        const clickEvent = new TileClickEvent(
            tileComp.row,
            tileComp.col,
            this.node,
            tileComp.groupIndex
        );

        EventManager.instance.emit(clickEvent);
    }

    onDestroy() 
    {
        this.node.off(cc.Node.EventType.MOUSE_DOWN, this.OnClickMouse, this);
        this.node.off(cc.Node.EventType.TOUCH_START, this.OnTouch, this);
    }
}
