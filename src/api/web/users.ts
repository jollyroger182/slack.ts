import type { User } from '../types/user'

export interface UsersInfoParams {
	/** User to get info on */
	user: string

	/** Set this to `true` to receive the locale for this user. Defaults to `false` */
	include_locale?: boolean
}

export interface UsersInfoResponse {
	user: User
}
