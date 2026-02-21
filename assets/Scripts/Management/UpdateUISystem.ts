

@cc._decorator.ccclass
export class UpdateUISystem extends cc.Component
{

    @cc._decorator.property(cc.Label)
    scoreLabel: cc.Label = null!;

    @cc._decorator.property(cc.Label)
    movesLabel: cc.Label = null!;

    @cc._decorator.property()
    public goalScore: number = 100;

    @cc._decorator.property()
    public movesCount: number = 20;

    @cc._decorator.property()
    public ScoreMultiplier: number = 10;

    onLoad () 
    {
        this.scoreLabel.string = " / " + this.goalScore.toString();
        this.movesLabel.string = this.movesCount.toString();
    }

    public UpdateUI(score: number, moves: number): void
    {
        this.scoreLabel.string = score.toString() + " / " + this.goalScore.toString();
        this.movesLabel.string = moves.toString();
    }
}
