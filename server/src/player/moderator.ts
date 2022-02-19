import { Socket } from "socket.io"
import { Room } from "../room/room"
import { PlayerToken } from "@livechoice/common"
import { Logger } from "@nestjs/common"

export class Moderator {
   private logger = new Logger("Moderator")

   constructor(private client: Socket, private room: Room) {}

   public createdRoom() {
      this.client.emit("room:created", this.room.getInfo())
      this.logger.log(`Created room ${this.room.getInfo().id}`)
   }

   public joinedRoom() {
      this.client.on("room:tokens:create", (token: PlayerToken) => {
         this.room.addToken(token)
      })

      this.client.emit("room:moderating")
      this.logger.log(`Joined room ${this.room.getInfo().id}`)
   }

   public updateTokens() {
      this.client.emit("room:tokens", this.room.playerTokens)
   }

   public is(client: Socket) {
      return this.client === client
   }
}