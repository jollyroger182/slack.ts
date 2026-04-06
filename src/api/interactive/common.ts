export interface InteractionCommon {
	team: { id: string; domain: string; enterprise_id?: string; enterprise_name?: string }
	user: { id: string; username: string; name: string; team_id: string }
	api_app_id: string
	token: string
	trigger_id: string
	is_enterprise_install?: boolean
	enterprise?: { id: string; name: string }
}
