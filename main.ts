import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';

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
	async onload() {
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
}
