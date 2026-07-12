export interface AppsConnectionsOpenParams {}

export interface AppsConnectionsOpenResponse {
	url: string
}

interface Manifest {
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

export interface AppsManifestCreateParams {
	/**
	 * A JSON app manifest encoded as a string. This manifest **must** use a valid [app manifest
	 * schema - Read our guide to creating
	 * one](https://docs.slack.dev/app-manifests/configuring-apps-with-app-manifests#fields).
	 */
	manifest: Manifest
}

export interface AppsManifestCreateResponse {
	app_id: string
	credentials: {
		client_id: string
		client_secret: string
		verification_token: string
		signing_secret: string
	}
	oauth_authorize_url: string
}

export interface AppsManifestDeleteParams {
	/** The ID of the app you want to delete. */
	app_id: string
}

export interface AppsManifestDeleteResponse {}

export interface AppsManifestExportParams {
	/** The ID of the app whose configuration you want to export as a manifest. */
	app_id: string
}

export interface AppsManifestExportResponse {
	manifest: Manifest
}

export interface AppsManifestUpdateParams {
	/**
	 * A JSON app manifest encoded as a string. This manifest **must** use a valid [app manifest
	 * schema - Read our guide to creating
	 * one](https://docs.slack.dev/app-manifests/configuring-apps-with-app-manifests#fields). As this
	 * method entirely _replaces_ any previous configuration, manifest must contain both unmodified
	 * and modified fields.
	 */
	manifest: Manifest

	/** The ID of the app whose configuration you want to update. */
	app_id: string
}

export interface AppsManifestUpdateResponse {
	app_id: string
	permissions_updated: boolean
}

export interface AppsManifestValidateParams {
	/**
	 * The manifest to be validated. Will be validated against the [app manifest schema - read our
	 * guide](https://docs.slack.dev/app-manifests/configuring-apps-with-app-manifests#fields).
	 */
	manifest: Manifest

	/** The ID of the app whose configuration you want to validate. */
	app_id?: string
}

export interface AppsManifestValidateResponse {
	errors: []
}

export interface AppsUninstallParams {
	/** Issued when you created your application. */
	client_id: string

	/** Issued when you created your application. */
	client_secret: string
}

export interface AppsUninstallResponse {}
