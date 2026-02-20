import { BaseEvent } from "./Events";

// Тип для функции обратного вызова события, которая принимает событие типа T, где T расширяет BaseEvent
type EventCallback<T extends BaseEvent = BaseEvent> = (event: T) => void;


// Класс для управления событиями в игре. Обеспечивает единственный экземпляр 
// EventManager во всем проекте. Позволяет подписываться на события, отписываться от них и 
// запускать события с передачей данных.
export class EventManager 
{
    // Статическое поле для хранения единственного экземпляра EventManager
    private static _instance: EventManager;
    
    // Карта для хранения подписчиков на события, где ключ - тип события, а 
    // значение - массив функций обратного вызова
    private listeners: Map<string, EventCallback[]> = new Map();

    // Получение единственного экземпляра EventManager. 
    // Если экземпляр не создан, он будет создан при первом обращении
    public static get instance(): EventManager
    {
        if(!this._instance)
        {
            this._instance = new EventManager();
        }
        return this._instance;
    }

    // Подписка на событие. Принимает тип события (строка или объект с полем Type) 
    // и функцию обратного вызова
    public on<T extends BaseEvent>(eventType: {Type: string} | string, callback: EventCallback<T>): void
    {
        // Получаем строковое представление типа события
        const type = typeof eventType === "string" ? eventType : eventType.Type;
        // Если для данного типа события ещё нет подписчиков, создаём новый массив
        if(!this.listeners.has(type))
        {
            // Инициализируем массив подписчиков для данного типа события
            this.listeners.set(type, []);
        }
        // Добавляем функцию обратного вызова в массив подписчиков для данного типа события
        this.listeners.get(type)!.push(callback as EventCallback);
    }

    // Отписка от события. Принимает тип события и функцию обратного вызова, которую нужно удалить из списка подписчиков
    public off<T extends BaseEvent>(eventType: {Type: string} | string, callback: EventCallback<T>): void
    {
        const type = typeof eventType === "string" ? eventType : eventType.Type;
        // Получаем массив подписчиков для данного типа события
        const callbacks = this.listeners.get(type);
        if(callbacks)
        {
            // Находим индекс функции обратного вызова в массиве подписчиков 
            // и удаляем её, если она найдена
            const index = callbacks.indexOf(callback as EventCallback);
            if(index !== -1)
            {
                callbacks.splice(index, 1);
            }
        }
    }

    // Запуск события. Принимает объект события, извлекает его тип и вызывает все функции обратного вызова
    public emit<T extends BaseEvent>(event: T): void
    {
        // Получаем массив подписчиков для типа события, который соответствует полю Type объекта события
        const callbacks = this.listeners.get(event.type);
        // Если есть подписчики, вызываем каждую функцию обратного вызова, передавая ей объект события
        if(callbacks && callbacks.length > 0)
        {
            callbacks.forEach(callback => {
                try
                {
                    callback(event);
                } catch (error)
                {
                    console.error(`Error in event callback for event type "${event.type}":`, error);
                }
            });
        }
    }
}
