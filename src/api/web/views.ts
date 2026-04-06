import type { DistributivePick, NotNull } from '../../utils/typing'
import type { ModalView } from '../types/view'

export type ViewsOpenParams = {
	view: Partial<{ [K in keyof ModalView]: NotNull<ModalView[K]> }> &
		DistributivePick<ModalView, 'type' | 'title' | 'blocks'>
} & (
	| { trigger_id: string; interactivity_pointer?: never }
	| { trigger_id?: never; interactivity_pointer: string }
)

export interface ViewsOpenResponse {
	view: ModalView
}
