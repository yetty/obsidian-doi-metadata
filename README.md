
# Obsidian DOI Metadata Plugin

This Obsidian plugin allows you to automatically fetch and update metadata for academic papers in your markdown files based on their DOI (Digital Object Identifier). The plugin uses the CrossRef API to retrieve detailed information about the paper and updates the front matter metadata in your markdown file.

## Features

- **Load Metadata using DOI**: Fetches metadata for a given DOI and updates the front matter of the markdown file.
- **CrossRef Integration**: Uses the CrossRef API to obtain accurate and up-to-date information about academic papers.

## Installation

1. **Download**: Clone or download this repository.
2. **Install**: Copy the plugin files to your Obsidian plugins directory.
3. **Enable**: Go to Obsidian settings, navigate to the "Community plugins" section, and enable the "DOI Metadata Plugin".

## Usage

1. Open a markdown file in Obsidian.
2. Ensure the front matter of the file contains a `doi` field with the DOI of the paper.
3. Run the command "Load metadata using DOI" from the command palette.
4. The plugin will fetch metadata from CrossRef and update the front matter of the markdown file.

### Example

Given a markdown file with the following front matter:

```markdown
---
doi: 10.1038/s41586-020-2649-2
---
```

After running the "Load metadata using DOI" command, the front matter will be updated to:

```markdown
---
doi: 10.1038/s41586-020-2649-2
title: "Paper Title"
author: "Author1, Author2"
journal: "Journal Name"
year: 2020
volume: 5
issue: 12
pages: 123-456
url: "https://doi.org/10.1038/s41586-020-2649-2"
---
```

## Command

- **Load metadata using DOI**: Fetches and updates metadata based on the DOI in the front matter.

## License

This plugin is licensed under the MIT License.

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes.
4. Push to your branch.
5. Create a pull request.

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

## Acknowledgments

- [Obsidian](https://obsidian.md/)
- [CrossRef API](https://www.crossref.org/services/metadata-delivery/rest-api/)

---

This plugin streamlines the process of managing academic paper references in your markdown notes by leveraging the power of DOIs and the CrossRef API. Enjoy seamless metadata updates and keep your notes organized with accurate bibliographic information.
