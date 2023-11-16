import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';

const Color = Type.String({ $id: 'Color' });
const FamilyName = Type.String({ $id: 'FamilyName' });
const Length = Type.String({ $id: 'Length' });
const Percentage = Type.String({ $id: 'Percentage' });
const BoxShadow = Type.String({ $id: 'BoxShadow' });
const Number = Type.String({ $id: 'Number' });

const LineWidth = Type.Union([Type.String(), Type.Literal('thin'), Type.Literal('medium'), Type.Literal('thick')], {
	$id: 'LineWidth',
});

const Rules = Type.Object({
	//////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Base fonts
	fontFamilyDisplay: Type.Optional(Type.Ref(FamilyName)),
	fontFamilySansSerif: Type.Optional(Type.Ref(FamilyName)),
	fontFamilySerif: Type.Optional(Type.Ref(FamilyName)),
	fontFamilyMonospace: Type.Optional(Type.Ref(FamilyName)),

	//////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Base border styles
	borderRadius: Type.Optional(Type.Union([Type.Ref(Length), Type.Ref(Percentage)])),
	borderWidth: Type.Optional(Type.Ref(LineWidth)),

	//////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Base color palette
	foreground: Type.Optional(Type.Ref(Color)),
	foregroundSubdued: Type.Optional(Type.Ref(Color)),
	foregroundAccent: Type.Optional(Type.Ref(Color)),

	background: Type.Optional(Type.Ref(Color)),

	backgroundNormal: Type.Optional(Type.Ref(Color)),
	backgroundAccent: Type.Optional(Type.Ref(Color)),
	backgroundSubdued: Type.Optional(Type.Ref(Color)),

	borderColor: Type.Optional(Type.Ref(Color)),
	borderColorAccent: Type.Optional(Type.Ref(Color)),
	borderColorSubdued: Type.Optional(Type.Ref(Color)),

	primary: Type.Optional(Type.Ref(Color)),
	primaryBackground: Type.Optional(Type.Ref(Color)),
	primarySubdued: Type.Optional(Type.Ref(Color)),
	primaryAccent: Type.Optional(Type.Ref(Color)),

	secondary: Type.Optional(Type.Ref(Color)),
	secondaryBackground: Type.Optional(Type.Ref(Color)),
	secondarySubdued: Type.Optional(Type.Ref(Color)),
	secondaryAccent: Type.Optional(Type.Ref(Color)),

	success: Type.Optional(Type.Ref(Color)),
	successBackground: Type.Optional(Type.Ref(Color)),
	successSubdued: Type.Optional(Type.Ref(Color)),
	successAccent: Type.Optional(Type.Ref(Color)),

	warning: Type.Optional(Type.Ref(Color)),
	warningBackground: Type.Optional(Type.Ref(Color)),
	warningSubdued: Type.Optional(Type.Ref(Color)),
	warningAccent: Type.Optional(Type.Ref(Color)),

	danger: Type.Optional(Type.Ref(Color)),
	dangerBackground: Type.Optional(Type.Ref(Color)),
	dangerSubdued: Type.Optional(Type.Ref(Color)),
	dangerAccent: Type.Optional(Type.Ref(Color)),

	//////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Scopes
	navigation: Type.Optional(
		Type.Object({
			background: Type.Optional(Type.Ref(Color)),
			backgroundAccent: Type.Optional(Type.Ref(Color)),

			borderWidth: Type.Optional(Type.Ref(LineWidth)),
			borderColor: Type.Optional(Type.Ref(Color)),

			project: Type.Optional(
				Type.Object({
					background: Type.Optional(Type.Ref(Color)),
					foreground: Type.Optional(Type.Ref(Color)),
					fontFamily: Type.Optional(Type.Ref(FamilyName)),
					borderWidth: Type.Optional(Type.Ref(LineWidth)),
					borderColor: Type.Optional(Type.Ref(Color)),
				})
			),

			modules: Type.Optional(
				Type.Object({
					background: Type.Optional(Type.Ref(Color)),
					borderWidth: Type.Optional(Type.Ref(LineWidth)),
					borderColor: Type.Optional(Type.Ref(Color)),

					button: Type.Optional(
						Type.Object({
							foreground: Type.Optional(Type.Ref(Color)),
							foregroundHover: Type.Optional(Type.Ref(Color)),
							foregroundActive: Type.Optional(Type.Ref(Color)),

							background: Type.Optional(Type.Ref(Color)),
							backgroundHover: Type.Optional(Type.Ref(Color)),
							backgroundActive: Type.Optional(Type.Ref(Color)),
						})
					),
				})
			),

			list: Type.Optional(
				Type.Object({
					icon: Type.Optional(
						Type.Object({
							foreground: Type.Optional(Type.Ref(Color)),
							foregroundHover: Type.Optional(Type.Ref(Color)),
							foregroundActive: Type.Optional(Type.Ref(Color)),
						})
					),

					foreground: Type.Optional(Type.Ref(Color)),
					foregroundHover: Type.Optional(Type.Ref(Color)),
					foregroundActive: Type.Optional(Type.Ref(Color)),

					background: Type.Optional(Type.Ref(Color)),
					backgroundHover: Type.Optional(Type.Ref(Color)),
					backgroundActive: Type.Optional(Type.Ref(Color)),

					fontFamily: Type.Optional(Type.Ref(FamilyName)),

					divider: Type.Object({
						borderColor: Type.Optional(Type.Ref(Color)),
						borderWidth: Type.Optional(Type.Ref(LineWidth)),
					}),
				})
			),
		})
	),

	header: Type.Optional(
		Type.Object({
			background: Type.Optional(Type.Ref(Color)),
			borderWidth: Type.Optional(Type.Ref(LineWidth)),
			borderColor: Type.Optional(Type.Ref(Color)),
			boxShadow: Type.Optional(Type.Ref(BoxShadow)),
			headline: Type.Optional(
				Type.Object({
					foreground: Type.Optional(Type.Ref(Color)),
					fontFamily: Type.Optional(Type.Ref(FamilyName)),
				})
			),
			title: Type.Optional(
				Type.Object({
					foreground: Type.Optional(Type.Ref(Color)),
					fontFamily: Type.Optional(Type.Ref(FamilyName)),
				})
			),
		})
	),

	form: Type.Optional(
		Type.Object({
			field: Type.Optional(
				Type.Object({
					label: Type.Optional(
						Type.Object({
							foreground: Type.Optional(Type.Ref(Color)),
							fontFamily: Type.Optional(Type.Ref(FamilyName)),
						})
					),
					input: Type.Optional(
						Type.Object({
							background: Type.Optional(Type.Ref(Color)),
							backgroundSubdued: Type.Optional(Type.Ref(Color)),

							foreground: Type.Optional(Type.Ref(Color)),
							foregroundSubdued: Type.Optional(Type.Ref(Color)),

							borderColor: Type.Optional(Type.Ref(Color)),
							borderColorHover: Type.Optional(Type.Ref(Color)),
							borderColorFocus: Type.Optional(Type.Ref(Color)),

							boxShadow: Type.Optional(Type.Ref(BoxShadow)),
							boxShadowHover: Type.Optional(Type.Ref(BoxShadow)),
							boxShadowFocus: Type.Optional(Type.Ref(BoxShadow)),
						})
					),
				})
			),
		})
	),

	sidebar: Type.Optional(
		Type.Object({
			background: Type.Optional(Type.Ref(Color)),
			foreground: Type.Optional(Type.Ref(Color)),
			fontFamily: Type.Optional(Type.Ref(FamilyName)),
			borderWidth: Type.Optional(Type.Ref(LineWidth)),
			borderColor: Type.Optional(Type.Ref(Color)),

			section: Type.Optional(
				Type.Object({
					toggle: Type.Optional(
						Type.Object({
							icon: Type.Optional(
								Type.Object({
									foreground: Type.Optional(Type.Ref(Color)),
									foregroundHover: Type.Optional(Type.Ref(Color)),
									foregroundActive: Type.Optional(Type.Ref(Color)),
								})
							),

							foreground: Type.Optional(Type.Ref(Color)),
							foregroundHover: Type.Optional(Type.Ref(Color)),
							foregroundActive: Type.Optional(Type.Ref(Color)),

							background: Type.Optional(Type.Ref(Color)),
							backgroundHover: Type.Optional(Type.Ref(Color)),
							backgroundActive: Type.Optional(Type.Ref(Color)),

							fontFamily: Type.Optional(Type.Ref(FamilyName)),

							borderWidth: Type.Optional(Type.Ref(LineWidth)),
							borderColor: Type.Optional(Type.Ref(Color)),
						})
					),
				})
			),
		})
	),

	public: Type.Optional(
		Type.Object({
			background: Type.Optional(Type.Ref(Color)),
			foreground: Type.Optional(Type.Ref(Color)),
			foregroundAccent: Type.Optional(Type.Ref(Color)),

			art: Type.Optional(
				Type.Object({
					background: Type.Optional(Type.Ref(Color)),
					primary: Type.Optional(Type.Ref(Color)),
					secondary: Type.Optional(Type.Ref(Color)),
					speed: Type.Optional(Type.Ref(Number)),
				})
			),

			form: Type.Optional(
				Type.Object({
					field: Type.Optional(
						Type.Object({
							input: Type.Optional(
								Type.Object({
									background: Type.Optional(Type.Ref(Color)),
									foreground: Type.Optional(Type.Ref(Color)),
									foregroundSubdued: Type.Optional(Type.Ref(Color)),

									borderColor: Type.Optional(Type.Ref(Color)),
									borderColorHover: Type.Optional(Type.Ref(Color)),
									borderColorFocus: Type.Optional(Type.Ref(Color)),

									boxShadow: Type.Optional(Type.Ref(BoxShadow)),
									boxShadowHover: Type.Optional(Type.Ref(BoxShadow)),
									boxShadowFocus: Type.Optional(Type.Ref(BoxShadow)),
								})
							),
						})
					),
				})
			),
		})
	),
});

export const ThemeSchema = Type.Object({
	name: Type.String(),
	appearance: Type.Union([Type.Literal('light'), Type.Literal('dark')]),
	rules: Rules,
});

export const Definitions = {
	$defs: {
		Color,
		FamilyName,
		Length,
		Percentage,
		LineWidth,
		BoxShadow,
		Number,
	},
};

export type Theme = Static<typeof ThemeSchema>;
