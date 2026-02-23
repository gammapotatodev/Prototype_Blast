import { EventManager } from "./EventManager";
import { GameOverEvent, GameResultType } from "./Events";

// Система отображения экрана завершения игры

@cc._decorator.ccclass
export class GameOverSystem extends cc.Component
{
    @cc._decorator.property(cc.Node)
    private resultScreen: cc.Node = null!;

    @cc._decorator.property(cc.Label)
    private mainTextLabel: cc.Label = null!;

    @cc._decorator.property(cc.Label)
    private WinScoreLabel: cc.Label = null!;

    @cc._decorator.property(cc.Label)
    private loseScoreLabel: cc.Label = null!;

    private boundOnGameOver: (event: GameOverEvent) => void;

    onLoad(): void
    {
        this.resultScreen.active = false;
        this.WinScoreLabel.node.active = false;
        this.loseScoreLabel.node.active = false;

        this.boundOnGameOver = this.onGameOver.bind(this);
        
        EventManager.instance.on(GameOverEvent.Type, this.boundOnGameOver);
    }

    private onGameOver(event: GameOverEvent): void
    {
        switch(event.resultType)
        {
            case GameResultType.Win:
                this.mainTextLabel.string = "ПОБЕДИЛ!";
                this.WinScoreLabel.node.active = true;
                this.WinScoreLabel.string = "Ты набрал нужное количество\nочков, молодец!";
                break;
            case GameResultType.Lose:
                this.mainTextLabel.string = "ПРОИГРАЛ!";
                this.loseScoreLabel.node.active = true;
                this.loseScoreLabel.string = "Твои очки: " + event.score.toString() + " / " + event.goalScore.toString();
                break;
        }
        this.resultScreen.active = true;
    }

    protected onDestroy(): void {
        EventManager.instance.off(GameOverEvent.Type, this.boundOnGameOver);
    }
}
