import { Component, OnInit } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy"
import { RoomService } from "../services/room.service"
import { PlayerToken } from "@livechoice/common"

@UntilDestroy()
@Component({
   selector: "app-room",
   templateUrl: "./room.component.html",
   styleUrls: ["./room.component.scss"]
})
export class RoomComponent implements OnInit {
   roomId: string = ""
   state = "joining"

   authenticationError: string = ""

   playerName: string = ""
   tokens: PlayerToken[] = []

   constructor(private route: ActivatedRoute, public roomService: RoomService) {}

   ngOnInit() {
      this.route.params.pipe(untilDestroyed(this)).subscribe(params => {
         const id = params["id"]
         this.roomId = id
         this.roomService.joinRoom(id)
      })

      this.roomService.registerHandlers(this, on => {
         on.roomNotFound(() => (this.state = "room-not-found"))
         on.roomAuthenticationRequest(() => (this.state = "authentication-request"))
         on.roomAuthenticationError(error => {
            this.state = "authentication-error"
            this.authenticationError = error
         })
         on.roomJoined(() => (this.state = "joined"))
         on.roomModerating(() => (this.state = "moderating"))
         on.roomTokens(tokens => (this.tokens = tokens))
         on.playerProperties(properties => (this.playerName = properties.name))
      })
   }

   authenticate(key: string) {
      this.roomService.authenticate(key)
   }
}