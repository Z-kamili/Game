import {createMachine, interpret, InterpreterFrom} from 'xstate';
import {createModel} from 'xstate/lib/model';
import { GameContext, GameStates, GridState, Player, PlayerColor } from '../types';
import { joinGameAction } from './actions';
import { canJoinGuard, canLeaveGuard } from './guards';


export const GameModel = createModel(
{

    players: [] as Player[],
    currentPlayer: null as null | Player['id'],
    rowLength:4,

    grid : [
        ["E","E","E","E","E","E","E"],
        ["E","E","E","E","E","E","E"],
        ["E","E","E","E","E","E","E"],
        ["E","E","E","E","E","E","E"],
        ["E","E","E","E","E","E","E"]
    ] as GridState

} , {
    events : {

        join:(playerId:Player["id"],name:Player["name"]) => ({playerId,name}),
        leave:(playerId:Player['id']) => ({playerId}),
        chooseColor:(playerId:Player['id'],color:PlayerColor) => ({playerId,color}),
        start:(playerId:Player["id"],x:number) => ({playerId,x}),
        dropToken:(playerId:Player["id"],x:number) => ({playerId,x}),
        restart: (playerId:Player["id"]) => ({playerId}),
        
    }
}
) 

export const GameMachine = createMachine({

   // etats management 
     id: 'game',
     context:GameModel.initialContext,
     initial: GameStates.LOBBY,
     states : {
        [GameStates.LOBBY] : {
            on : {
                join : {
                    cond:canJoinGuard,
                    actions:[GameModel.assign(joinGameAction)],
                    target: GameStates.LOBBY,
                },
                leave : {
                    cond:canLeaveGuard,
                    // actions:[GameModel.assign()],
                    target : GameStates.LOBBY
                },
                chooseColor: {
                    target:GameStates.LOBBY
                },
                start : {
                    target: GameStates.PLAY
                },
            }
     },
     [GameStates.PLAY] : {
        on : {
            dropToken:{
                target:GameStates.VICTORY
            }
        }
     },
     [GameStates.VICTORY]: {
        on: {

            restart: {
                target: GameStates.LOBBY
            }

        }
     },
     [GameStates.DRAW]: {
        on:{

            restart:{
                target:GameStates.LOBBY
            }

        }
     }

}
})



export function makeGame (state : GameStates = GameStates.LOBBY, context: Partial<GameContext> = {}) : InterpreterFrom<typeof GameMachine> {

    return interpret(
        GameMachine.withContext({
            ...GameModel.initialContext,
            ...context
        }).withConfig({
            ...GameMachine.config,
            initial: state
        }as any)
        ).start()

}