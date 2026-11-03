import type { SubteamCreatedEvent } from '@slack/types'

type Subteam = SubteamCreatedEvent['subteam']

export interface Usergroup extends Subteam {}
