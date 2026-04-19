import type { AnyBlock } from '@slack/types'
import type { ModalView } from '../types/view'
import type { InteractionCommon } from './common'

export interface ViewSubmission<Blocks extends AnyBlock[] = AnyBlock[]> extends InteractionCommon {
	type: 'view_submission'
	view: ModalView<Blocks>
	response_urls: string[]
}
