import { Injectable } from "@angular/core"
import { Socket } from "ngx-socket-io"
import { untilDestroyed } from "@ngneat/until-destroy"
import { PlayerProperties, PlayerToken, Question, RoomInfo } from "livechoice-common"
import { LeaderboardData } from "../question/leaderboard/leaderboard.component"

type HandlerBlock = {
   roomNotFound: HandlerFunction<void>
   roomAuthenticationRequest: HandlerFunction<void>
   roomAuthenticationError: HandlerFunction<string>
   roomJoined: HandlerFunction<RoomInfo>
   roomModerating: HandlerFunction<RoomInfo>
   roomTokens: HandlerFunction<PlayerToken[]>
   playerProperties: HandlerFunction<PlayerProperties>
   questionDisplay: HandlerFunction<Question>
   questionRevealAnswer: HandlerFunction<void>
   questionPrompt: HandlerFunction<Question>
   questionResult: HandlerFunction<boolean>
   showLeaderboard: HandlerFunction<LeaderboardData>
}

type HandlerFunction<T> = (callback: (data: T) => void) => void

@Injectable({
   providedIn: "root"
})
export class RoomService {
   constructor(private socket: Socket) {}

   public joinRoom(roomId: string) {
      this.socket.emit("room:join", roomId)
   }

   public authenticate(key: string) {
      this.socket.emit("room:authentication:response", key)
   }

   public createToken(key: string, name: string) {
      this.socket.emit("room:tokens:create", new PlayerToken(key, { name }))
   }

   public loadQuestions(input: string) {
      this.socket.emit("room:questions:load", input)
   }

   public registerHandlers(instance: any, block: (on: HandlerBlock) => void) {
      const socket = this.socket

      function createHandlerFunction<T>(event: string): HandlerFunction<T> {
         return (callback: (data: T) => void) => {
            socket.fromEvent<T>(event).pipe(untilDestroyed(instance)).subscribe(callback)
         }
      }

      block({
         roomNotFound: createHandlerFunction<void>("room:not-found"),
         roomAuthenticationRequest: createHandlerFunction<void>("room:authentication:request"),
         roomAuthenticationError: createHandlerFunction<string>("room:authentication:error"),
         roomJoined: createHandlerFunction<RoomInfo>("room:joined"),
         roomModerating: createHandlerFunction<RoomInfo>("room:moderating"),
         roomTokens: createHandlerFunction<PlayerToken[]>("room:tokens"),
         playerProperties: createHandlerFunction<PlayerProperties>("player:properties"),
         questionDisplay: createHandlerFunction<Question>("question:display"),
         questionRevealAnswer: createHandlerFunction<void>("question:reveal-answer"),
         questionPrompt: createHandlerFunction<Question>("question:prompt"),
         questionResult: createHandlerFunction<boolean>("question:answer-result"),
         showLeaderboard: createHandlerFunction<LeaderboardData>("leaderboard")
      })
   }

   public startRoom() {
      this.socket.emit("room:start")
   }

   public sendAnswer(answer: any) {
      this.socket.emit("question:answer", answer)
   }
}
