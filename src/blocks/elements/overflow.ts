import type { Overflow, PlainTextOption } from '@slack/types'
import { InteractiveElementBuilder } from './base'
import type { OptionObjectBuilder } from '../objects/option'

type TypedOverflow<Options extends OptionObjectBuilder[], ActionID extends string> = Overflow & {
	action_id: ActionID
	options: {
		[K in keyof Options]: Options[K] extends OptionObjectBuilder<infer Value>
			? PlainTextOption & { value: Value }
			: never
	}
}

export class OverflowBuilder<
	Options extends OptionObjectBuilder[],
	ActionID extends string = string,
> extends InteractiveElementBuilder<TypedOverflow<Options, ActionID>, ActionID> {
	constructor(private _options: Options) {
		super()
	}

	override id<ActionID extends string>(actionId: ActionID): OverflowBuilder<Options, ActionID> {
		return this._id(actionId)
	}

	override build(): TypedOverflow<Options, ActionID> {
		return {
			...this._build(),
			type: 'overflow',
			options: this._options.map((o) => o.build()) as any,
		}
	}
}

export function overflow<Options extends OptionObjectBuilder[]>(...options: Options) {
	return new OverflowBuilder(options)
}
