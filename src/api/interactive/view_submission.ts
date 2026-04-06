import type { ModalView } from '../types/view'
import type { InteractionCommon } from './common'

export interface ViewSubmission extends InteractionCommon {
	type: 'view_submission'
	view: ModalView
	response_urls: string[]
}
