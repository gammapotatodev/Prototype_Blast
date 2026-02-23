

@cc._decorator.ccclass
export class UpdateUISystem extends cc.Component
{

    @cc._decorator.property(cc.Label)
    scoreLabel: cc.Label = null!;

    @cc._decorator.property(cc.Label)
    movesLabel: cc.Label = null!;

    @cc._decorator.property(cc.Label)
    bombLabel: cc.Label = null!;

    @cc._decorator.property(cc.Label)
    teleportLabel: cc.Label = null!;

    @cc._decorator.property()
    public goalScore: number = 100;

    @cc._decorator.property()
    public movesCount: number = 20;

    @cc._decorator.property()
    public ScoreMultiplier: number = 10;

    @cc._decorator.property()
    public BoosterBombCount: number = 5;

    @cc._decorator.property()
    public BoosterTeleportCount: number = 5;

    onLoad () 
    {
        this.scoreLabel.string = " / " + this.goalScore.toString();
        this.movesLabel.string = this.movesCount.toString();
        this.bombLabel.string = this.BoosterBombCount.toString();
        this.teleportLabel.string = this.BoosterTeleportCount.toString();
    }

    public UpdateUI(score: number, moves: number, bomb: number, teleport: number): void
    {
        this.scoreLabel.string = score.toString() + " / " + this.goalScore.toString();
        this.movesLabel.string = moves.toString();
        this.bombLabel.string = bomb.toString();
        this.teleportLabel.string = teleport.toString();
    }
}
