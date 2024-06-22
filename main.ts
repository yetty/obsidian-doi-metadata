import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

interface CrossRefResponse {
	message: {
		title: string[];
		author: { given: string; family: string }[];
		'container-title': string[];
		'published-print': { 'date-parts': number[][] };
		volume: string;
		issue: string;
		page: string;
		DOI: string;
		URL: string;
	};
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'load-metadata-using-doi',
			name: 'Load metadata using DOI',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const file = view.file;
				const fileCache = this.app.metadataCache.getFileCache(file);

				// Get DOI from front matter
				const frontMatter = fileCache.frontmatter;
				if (!frontMatter || !frontMatter.doi) {
					new Notice('DOI not found in front matter');
					return;
				}

				const doi = frontMatter.doi;
				const metadata = await this.fetchMetadataFromDOI(doi);
				if (metadata.error) {
					new Notice(`Error fetching metadata: ${metadata.error}`);
					return;
				}

				// Update front matter with metadata
				const newFrontMatter = {
					...frontMatter,
					title: `"${metadata['title'][0]}"`,
					author: metadata.author.map((a: { given: string; family: string }) => `${a.family}, ${a.given}`).join(' and '),
					journal: metadata['container-title'] ? metadata['container-title'][0] : undefined,
					year: metadata['published-print'] ? metadata['published-print']['date-parts'][0][0] : undefined,
					volume: metadata.volume,
					issue: metadata.issue,
					pages: metadata.page,
					url: metadata.URL,
				};

				// Remove undefined values from newFrontMatter
				Object.keys(newFrontMatter).forEach(key => {
					if (newFrontMatter[key] === undefined) {
						delete newFrontMatter[key];
					}
				});

				// Sort the keys in alphabetical order
				const sortedFrontMatter = Object.keys(newFrontMatter)
					.sort()
					.reduce((obj, key) => {
						obj[key] = newFrontMatter[key];
						return obj;
					}, {});

				// Convert front matter back to string
				const newFrontMatterString = this.convertObjectToFrontMatterString(sortedFrontMatter);
				const content = view.data;
				const newContent = content.replace(/^---\n[\s\S]*?\n---\n/, `${newFrontMatterString}\n`);

				// Update the file with new content
				await this.app.vault.modify(file, newContent);
				new Notice('Metadata updated successfully');
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	async fetchMetadataFromDOI(doi: string) {
		const url = `https://api.crossref.org/works/${doi}`;
		const response = await fetch(url);
		if (response.status === 200) {
			const data: CrossRefResponse = await response.json();
			return data.message;
		} else {
			return { error: `HTTP error ${response.status}` };
		}
	}

	convertObjectToFrontMatterString(frontMatter: Record<string, any>): string {
		const frontMatterLines = ['---'];
		for (const [key, value] of Object.entries(frontMatter)) {
			if (Array.isArray(value)) {
				frontMatterLines.push(`${key}:`);
				value.forEach(item => {
					frontMatterLines.push(`  - ${item}`);
				});
			} else {
				frontMatterLines.push(`${key}: ${value}`);
			}
		}
		frontMatterLines.push('---');
		return frontMatterLines.join('\n');
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
