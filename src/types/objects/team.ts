export interface Team {
	id: string
	name: string
	url: string
	domain: string
	email_domain: string
	avatar_base_url: string
	is_verified: boolean
	icon: {
		image_default: boolean
		image_34: string
		image_44: string
		image_68: string
		image_88: string
		image_102: string
		image_230: string
		image_132: string
	}
	discoverable?: string
	enterprise_id?: string
	enterprise_name?: string
	enterprise_domain?: string
	lob_sales_home_enabled?: boolean
	is_sfdc_auto_slack?: boolean
	slackbot_availability?: 'available' | 'restricted' | 'unavailable' | 'unknown'
}
