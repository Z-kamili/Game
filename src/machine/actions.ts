import { freePositionY } from '../func/game'
import {GameAction} from '../types'

export const joinGameAction:GameAction<"join"> = (context,event) => ({

    players: [...context.players,{id:event.playerId,name:event.name}]

})

export const leaveGameAction: GameAction<"join"> = (context,event) => ({

    players: context.players.filter(p => p.id !== event.playerId)

})

export const dropTokenAction: GameAction<"dropToken"> = ({grid,players},{x:eventX,playerId}) => {

    const playerColor = players.find(p => playerId === p.id)!.color!
    const eventY = freePositionY(grid,eventX)
    const newGrid = grid.map((raw,y) => raw.map((v,x) => x === eventX && y === eventY ? playerColor :v ))
    return {
        grid:newGrid
    }
}
