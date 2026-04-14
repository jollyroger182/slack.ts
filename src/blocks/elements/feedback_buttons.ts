import type { FeedbackButtons, PlainTextElement } from '@slack/types'
import { BlockElementBuilder } from './base'
import { ensureIsTextObjectBuilder, type TextObjectBuilder } from '../objects/text'

type TypedFeedbackButtons<
	ActionID extends string,
	PositiveValue extends string | undefined,
	NegativeValue extends string | undefined,
> = FeedbackButtons & {
	action_id: ActionID
	positive_button: { value: PositiveValue }
	negative_button: { value: NegativeValue }
}

type FeedbackButtonData = {
	text: PlainTextElement
	value: string
	accessibility_label?: string
}

export class FeedbackButtonsBuilder<
	ActionID extends string = string,
	PositiveValue extends string | undefined = undefined,
	NegativeValue extends string | undefined = undefined,
> extends BlockElementBuilder<
	TypedFeedbackButtons<ActionID, PositiveValue, NegativeValue>,
	ActionID,
	PositiveValue extends string ? (NegativeValue extends string ? true : false) : false
> {
	private _positive?: FeedbackButtonData
	private _negative?: FeedbackButtonData

	constructor() {
		super()
	}

	override id<ActionID extends string>(
		actionId: ActionID,
	): FeedbackButtonsBuilder<ActionID, PositiveValue, NegativeValue> {
		return this._id(actionId)
	}

	positive<PositiveValue extends string>(
		text: TextObjectBuilder<false> | string,
		value: PositiveValue,
		accessibilityLabel?: string,
	): FeedbackButtonsBuilder<ActionID, PositiveValue, NegativeValue> {
		this._positive = {
			text: ensureIsTextObjectBuilder(text).plain().build(),
			value: value,
			accessibility_label: accessibilityLabel,
		}
		return this as any
	}

	negative<NegativeValue extends string>(
		text: TextObjectBuilder<false> | string,
		value: NegativeValue,
		accessibilityLabel?: string,
	): FeedbackButtonsBuilder<ActionID, PositiveValue, NegativeValue> {
		this._negative = {
			text: ensureIsTextObjectBuilder(text).plain().build(),
			value: value,
			accessibility_label: accessibilityLabel,
		}
		return this as any
	}

	override build(): TypedFeedbackButtons<ActionID, PositiveValue, NegativeValue> {
		if (!this._negative || !this._positive) {
			throw new Error('Both positive and negative feedback buttons have to be set')
		}
		return {
			...this._build(),
			type: 'feedback_buttons',
			positive_button: this._positive as any,
			negative_button: this._negative as any,
		}
	}
}

export function feedbackButtons() {
	return new FeedbackButtonsBuilder()
}
