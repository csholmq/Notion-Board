import { Client } from '@notionhq/client';
import { Issue } from './models';

const notionApi = async (apiKey: string, database_id: string) => {
	let notion = await new Client({ auth: apiKey });
	return {
		createPage: async (name: string, url: string, id: number, state: string, body: string) => {
			try {
				let response = await notion.pages.create({
					parent: {
						database_id: database_id
					},
					properties: {
						//@ts-ignore
						Name: {
							title: [
								{ text: { content: name }, type: 'text' }
							]
						},
						//@ts-ignore
						'URL': {
							url: url
						},
						// @ts-ignore
						id: {
							number: id
						},
						state: {
							//@ts-ignore
							select: {
								name: state
							}
						},
						body: {
							rich_text: [
								{ text: { content: (body != undefined) ? body : '' }, type: 'text' }
							],
							type: 'rich_text'
						}
					}
				})

				if (response) return "✔ page created";
			} catch (error) {
				throw error;
			}
		},
		updateLabel: async (labels: any, id: number) => {
			console.log(labels, id);
			try {
				let LabelList = labels.map((el: any) => ({ name: el.name }));
				const response = await notion.databases.query({
					database_id: database_id,
					filter: {
						property: 'id',
						number: {
							equals: id
						}
					}
				});
				let pageID = response.results[0].id;
				let res = await notion.pages.update({
					page_id: pageID,
					properties: {
						//@ts-ignore
						labels: {
							multi_select: LabelList
						}
					}
				});
				if (res) return "✔ labels updated"
			} catch (error) {
				throw error;
			}

		},
		updatePage: async (name: string, id: number, body: string) => {
			const response = await notion.databases.query({
				database_id: database_id,
				filter: {
					property: 'id',
					number: {
						equals: id
					}
				}
			});
			let pageID = response.results[0].id;

			let res = await notion.pages.update({
				page_id: pageID,
				properties: {
					//@ts-ignore
					Name: {
						title: [
							{ text: { content: name }, type: 'text' }
						]
					},
					body: {
						rich_text: [
							{ text: { content: (body != undefined) ? body : '' }, type: 'text' }
						],
						type: 'rich_text'
					}
				}
			});
			if (res) return "✔ page updated"
		},
		updateState: async (state: string, id: number) => {
			try {
				const response = await notion.databases.query({
					database_id: database_id,
					filter: {
						property: 'id',
						number: {
							equals: id
						}
					}
				});
				let pageID = response.results[0].id;

				let res = await notion.pages.update({
					page_id: pageID,
					properties: {
						//@ts-ignore
						state: {
							//@ts-ignore
							select: {
								name: state
							}
						}
					}
				});
				if (res) return "✔ state updated"
			} catch (error) {
				throw error
			}
		}
	}
}

export const Notion = async (api_key: string, database_id: string, issue: Issue) => {
	const notion = await notionApi(api_key, database_id);
	return {
		issueCreated: async () => {
			//TODO: Create a page in notion 
			try {
				let res = await notion.createPage(issue.title, issue.html_url, issue.id, issue.state, issue.body);
				console.log(res);
				res = await notion.updateLabel(issue.labels, issue.id);
				console.log(res);
			} catch (error) {
				throw error
			}
		},
		issueEdited: async () => {
			try {
				let res = notion.updatePage(issue.title, issue.id, issue.body);
				console.log(res);
			} catch (error) {
				throw error;
			}
		},
		issueClosed: async () => {
			try {
				let res = await notion.updateState(issue.state, issue.id);
				console.log(res);
			} catch (error) {
				throw error
			}
		},
		issueDeleted: async () => {

		},
		issueReopened: async () => {
			let res = await notion.updateState(issue.state, issue.id);
			console.log(res);
		},
		issueLabeled: async () => {
			try {
				let res = await notion.updateLabel(issue.labels, issue.id);
				console.log(res);
			} catch (error) {
				throw error;
			}
		},
		issueUnlabeled: async () => {
			try {
				let res = await notion.updateLabel(issue.labels, issue.id);
				console.log(res);
			} catch (error) {
				throw error;
			}
		}
	}
}
