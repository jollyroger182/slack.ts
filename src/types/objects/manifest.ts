export interface Manifest {
	_metadata?: { major_version: number; minor_version: number }
	display_information: {
		name: string
		long_description?: string
		description?: string
		background_color?: string
	}
	settings?: {
		allowed_ip_address_ranges?: string[]
		org_deploy_enabled?: boolean
		socket_mode_enabled?: boolean
		token_rotation_enabled?: boolean
		event_subscriptions?: {
			request_url?: string
			bot_events?: string[]
			user_events?: string[]
			metadata_subscriptions?: { app_id: string; event_type: string }[]
		}
		incoming_webhooks?: {
			incoming_webhooks_enabled: boolean
		}
		interactivity?: {
			is_enabled: boolean
			request_url?: string
			message_menu_options_url?: string
		}
		is_hosted: boolean
		siws_links?: { initiate_uri?: `https://${string}` }
		function_runtime?: 'remote' | 'slack'
	}
	features?: {
		app_home?: {
			home_tab_enabled?: boolean
			messages_tab_enabled?: boolean
			messages_tab_read_only_enabled?: boolean
		}
		assistant_view?: {
			assistant_description: string
			suggested_prompts?: { title: string; message: string }[]
		}
		bot_user?: { display_name: string; always_online?: boolean }
		rich_previews?: { is_active?: boolean; entity_types?: string[] }
		shortcuts?: {
			name: string
			callback_id: string
			description: string
			type: 'message' | 'global'
		}[]
		slash_commands?: {
			command: `/${string}`
			description: string
			should_escape?: boolean
			url?: string
			usage_hint?: string
		}[]
		unfurl_domains?: string[]
		/** @deprecated */
		workflow_steps?: { name: string; callback_id: string }[]
	}
	oauth_config?: {
		redirect_urls?: string[]
		scopes: {
			bot?: string[]
			bot_optional?: string[]
			user?: string[]
			user_optional?: string[]
		}
		token_management_enabled?: boolean
	}
	functions?: Record<
		string,
		{
			title: string
			description: string
			input_parameters: {
				properties: Record<
					string,
					{ type: string; title: string; description: string; hint: string; name: string }
				>
				required: string[]
			}
			output_parameters: {
				properties: Record<
					string,
					{ type: string; title: string; description: string; name: string }
				>
				required: string[]
			}
		}
	>
	workflows?: Record<
		string,
		{
			title: string
			description: string
			input_parameters?: { properties: Record<string, { type: string }>; required: string[] }
			steps: {
				id: string
				function_id: string
				inputs: Record<string, unknown>
				type?: 'function' | 'switch' | 'conditional'
			}
			suggested_triggers?: Record<
				string,
				{ name: string; description: string; type: string; inputs: Record<string, unknown> }
			>
		}
	>
	outgoing_domains?: string[]
	types?: Record<
		string,
		{
			title?: string
			type: string
			description?: string
			is_required?: boolean
			is_hidden?: boolean
			hint?: string
		}
	>
}
