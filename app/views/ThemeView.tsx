import React from 'react';
import { StackNavigationOptions } from '@react-navigation/stack';

import I18n from '../i18n';
import { TSupportedThemes, withTheme } from '../theme';
import StatusBar from '../containers/StatusBar';
import * as List from '../containers/List';
import { supportSystemTheme } from '../lib/methods/helpers/deviceInfo';
import SafeAreaView from '../containers/SafeAreaView';
import UserPreferences from '../lib/methods/userPreferences';
import { events, logEvent } from '../lib/methods/helpers/log';
import { IThemePreference, TThemeMode, TDarkLevel } from '../definitions/ITheme';
import { THEME_PREFERENCES_KEY, themes } from '../lib/constants';

const THEME_GROUP = 'THEME_GROUP';
const DARK_GROUP = 'DARK_GROUP';

const SYSTEM_THEME: ITheme = {
	label: 'Automatic',
	value: 'automatic',
	group: THEME_GROUP
};

const THEMES: ITheme[] = [
	{
		label: 'Light',
		value: 'light',
		group: THEME_GROUP
	},
	{
		label: 'Dark',
		value: 'dark',
		group: THEME_GROUP
	},
	{
		label: 'Black',
		value: 'black',
		group: DARK_GROUP
	},
	{
		label: 'Dark',
		value: 'dark',
		group: DARK_GROUP
	}
];

if (supportSystemTheme()) {
	THEMES.unshift(SYSTEM_THEME);
}

const themeGroup = THEMES.filter(item => item.group === THEME_GROUP);
const darkGroup = THEMES.filter(item => item.group === DARK_GROUP);

interface ITheme {
	label: string;
	value: TThemeMode | TDarkLevel;
	group: string;
}

interface IThemeViewProps {
	theme: TSupportedThemes;
	themePreferences: IThemePreference;
	setTheme(newTheme?: IThemePreference): void;
}

class ThemeView extends React.Component<IThemeViewProps> {
	static navigationOptions = (): StackNavigationOptions => ({
		title: I18n.t('Theme')
	});

	isSelected = (item: ITheme) => {
		const { themePreferences } = this.props;
		const { group } = item;
		const { darkLevel, currentTheme } = themePreferences;
		if (group === THEME_GROUP) {
			return item.value === currentTheme;
		}
		if (group === DARK_GROUP) {
			return item.value === darkLevel;
		}
	};

	onClick = (item: ITheme) => {
		const { themePreferences } = this.props;
		const { darkLevel, currentTheme } = themePreferences;
		const { value, group } = item;
		let changes: Partial<IThemePreference> = {};
		if (group === THEME_GROUP && currentTheme !== value) {
			logEvent(events.THEME_SET_THEME_GROUP, { theme_group: value });
			changes = { currentTheme: value as TThemeMode };
		}
		if (group === DARK_GROUP && darkLevel !== value) {
			logEvent(events.THEME_SET_DARK_LEVEL, { dark_level: value });
			changes = { darkLevel: value as TDarkLevel };
		}
		this.setTheme(changes);
	};

	setTheme = (theme: Partial<IThemePreference>) => {
		const { setTheme, themePreferences } = this.props;
		const newTheme = { ...themePreferences, ...theme };
		setTheme(newTheme);
		UserPreferences.setMap(THEME_PREFERENCES_KEY, newTheme);
	};

	renderIcon = () => {
		const { theme } = this.props;
		return <List.Icon name='check' color={themes[theme].tintColor} />;
	};

	renderItem = ({ item }: { item: ITheme }) => {
		const { label, value } = item;
		return (
			<>
				<List.Item
					title={label}
					onPress={() => this.onClick(item)}
					testID={`theme-view-${value}`}
					right={() => (this.isSelected(item) ? this.renderIcon() : null)}
				/>
				<List.Separator />
			</>
		);
	};

	render() {
		return (
			<SafeAreaView testID='theme-view'>
				<StatusBar />
				<List.Container>
					<List.Section title='Theme'>
						<List.Separator />
						<>{themeGroup.map(item => this.renderItem({ item }))}</>
					</List.Section>
					<List.Section title='Dark_level'>
						<List.Separator />
						<>{darkGroup.map(item => this.renderItem({ item }))}</>
					</List.Section>
				</List.Container>
			</SafeAreaView>
		);
	}
}

export default withTheme(ThemeView);
