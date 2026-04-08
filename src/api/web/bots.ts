export interface BotsInfoParams {
	/** Bot user to get info on */
	bot: string

	/** Encoded team id or enterprise id where the bot exists, required if org token is used */
	team_id?: string
}

export interface BotsInfoResponse {
	bot: {
		id: string
		deleted: boolean
		name: string
		updated: number
		app_id: string
		user_id?: string
		icons: { image_36: string; image_48: string; image_72: string }
	}
}
