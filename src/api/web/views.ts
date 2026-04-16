import type { DistributivePick, NotNull } from '../../utils/typing'
import type { HomeView, ModalView } from '../types/view'

export type ViewsOpenParams = {
	view: Partial<
		DistributivePick<
			{ [K in keyof ModalView]: NotNull<ModalView[K]> },
			| 'close'
			| 'submit'
			| 'private_metadata'
			| 'callback_id'
			| 'clear_on_close'
			| 'notify_on_close'
			| 'external_id'
		>
	> &
		DistributivePick<ModalView, 'type' | 'title' | 'blocks'>
} & (
	| { trigger_id: string; interactivity_pointer?: never }
	| { trigger_id?: never; interactivity_pointer: string }
)

export interface ViewsOpenResponse {
	view: ModalView
}

export interface ViewsPublishParams {
	/** `id` of the user you want publish a view to. */
	user_id: string

	/** A [view payload](https://docs.slack.dev/reference/views). */
	view: Partial<DistributivePick<HomeView, 'private_metadata' | 'callback_id' | 'external_id'>> &
		DistributivePick<HomeView, 'type' | 'blocks'>

	/** A string that represents view state to protect against possible race conditions. */
	hash?: string
}

export interface ViewsPublishResponse {
	view: HomeView
}
