import type { DistributivePick, NotNull } from '../../utils/typing'
import type { HomeViewData, ModalViewData } from '../types/view'

export type ViewsOpenParams = {
	view: Partial<
		DistributivePick<
			{ [K in keyof ModalViewData]: NotNull<ModalViewData[K]> },
			| 'close'
			| 'submit'
			| 'private_metadata'
			| 'callback_id'
			| 'clear_on_close'
			| 'notify_on_close'
			| 'external_id'
		>
	> &
		DistributivePick<ModalViewData, 'type' | 'title' | 'blocks'>
} & (
	| { trigger_id: string; interactivity_pointer?: never }
	| { trigger_id?: never; interactivity_pointer: string }
)

export interface ViewsOpenResponse {
	view: ModalViewData
}

export interface ViewsPublishParams {
	/** `id` of the user you want publish a view to. */
	user_id: string

	/** A [view payload](https://docs.slack.dev/reference/views). */
	view: Partial<
		DistributivePick<HomeViewData, 'private_metadata' | 'callback_id' | 'external_id'>
	> &
		DistributivePick<HomeViewData, 'type' | 'blocks'>

	/** A string that represents view state to protect against possible race conditions. */
	hash?: string
}

export interface ViewsPublishResponse {
	view: HomeViewData
}
