import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import type { Operation } from '@upvu/dsteem';
import { Client as DsteemClient, PrivateKey } from '@upvu/dsteem';

export class Steemit implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Steemit',
		name: 'steemit',
		icon: 'file:steemit.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Publish and manage content on Steemit',
		defaults: {
			name: 'Steemit',
		},
		// @ts-ignore
		inputs: ['main'],
		// @ts-ignore
		outputs: ['main'],
		credentials: [
			{
				name: 'steemitApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new post',
						action: 'Create a post',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing post',
						action: 'Update a post',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a post',
						action: 'Get a post',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search posts',
						action: 'Search posts',
					},
				],
				default: 'create',
			},
			// Create operation
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Title of the post',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				required: true,
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Content of the post in Markdown format',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				required: true,
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Tags for the post (comma-separated)',
				placeholder: 'tag1,tag2,tag3',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
			},
			// Get operation
			{
				displayName: 'Author',
				name: 'author',
				type: 'string',
				default: '',
				description: 'Author of the post',
				displayOptions: {
					show: {
						operation: ['get', 'update'],
					},
				},
				required: true,
			},
			{
				displayName: 'Permlink',
				name: 'permlink',
				type: 'string',
				default: '',
				description: 'Permlink of the post',
				displayOptions: {
					show: {
						operation: ['get', 'update'],
					},
				},
				required: true,
			},
			// Search operation
			{
				displayName: 'Search By',
				name: 'searchBy',
				type: 'options',
				options: [
					{
						name: 'Tag',
						value: 'tag',
					},
					{
						name: 'Author',
						value: 'author',
					},
				],
				default: 'tag',
				displayOptions: {
					show: {
						operation: ['search'],
					},
				},
				required: true,
			},
			{
				displayName: 'Search Term',
				name: 'searchTerm',
				type: 'string',
				default: '',
				description: 'Term to search for',
				displayOptions: {
					show: {
						operation: ['search'],
					},
				},
				required: true,
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
				displayOptions: {
					show: {
						operation: ['search'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		// Initialize the Steem client
		const client = new DsteemClient('https://api.steemit.com');
		const credentials = await this.getCredentials('steemitApi');

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'create') {
					const title = this.getNodeParameter('title', i) as string;
					const content = this.getNodeParameter('content', i) as string;
					const tags = (this.getNodeParameter('tags', i) as string)
						.split(',')
						.map((tag) => tag.trim());

					// Create post using dsteem
					const accountName = credentials.accountName as string;
					const postingKey = credentials.postingKey as string;
					const permlink = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
					const jsonMetadata = { tags, app: 'n8n-nodes-steemit' };

					const operations: Operation[] = [
						[
							'comment',
							{
								parent_author: '',
								parent_permlink: tags[0] || 'steemit',
								author: accountName,
								permlink,
								title,
								body: content,
								json_metadata: JSON.stringify(jsonMetadata),
							},
						],
					];

					await client.broadcast.sendOperations(operations, PrivateKey.from(postingKey));

					returnData.push({
						json: {
							author: accountName,
							permlink,
							title,
							tags,
							content,
						},
					});
				} else if (operation === 'update') {
					const title = this.getNodeParameter('title', i) as string;
					const content = this.getNodeParameter('content', i) as string;
					const tags = (this.getNodeParameter('tags', i) as string)
						.split(',')
						.map((tag) => tag.trim());
					const author = this.getNodeParameter('author', i) as string;
					const permlink = this.getNodeParameter('permlink', i) as string;

					// Update post using dsteem
					const postingKey = credentials.postingKey as string;
					const jsonMetadata = { tags, app: 'n8n-nodes-steemit' };

					const operations: Operation[] = [
						[
							'comment',
							{
								parent_author: '',
								parent_permlink: tags[0] || 'steemit',
								author,
								permlink,
								title,
								body: content,
								json_metadata: JSON.stringify(jsonMetadata),
							},
						],
					];

					await client.broadcast.sendOperations(operations, PrivateKey.from(postingKey));

					returnData.push({
						json: {
							author,
							permlink,
							title,
							tags,
							content,
						},
					});
				} else if (operation === 'get') {
					const author = this.getNodeParameter('author', i) as string;
					const permlink = this.getNodeParameter('permlink', i) as string;

					// Get post using dsteem
					const post = await client.database.call('get_content', [author, permlink]);

					returnData.push({
						json: {
							author: post.author,
							permlink: post.permlink,
							title: post.title,
							content: post.body,
							created: post.created,
							lastUpdate: post.last_update,
							tags: JSON.parse(post.json_metadata).tags || [],
						},
					});
				} else if (operation === 'search') {
					const searchBy = this.getNodeParameter('searchBy', i) as string;
					const searchTerm = this.getNodeParameter('searchTerm', i) as string;
					const limit = this.getNodeParameter('limit', i) as number;

					// Search posts using dsteem
					const query = {
						tag: searchBy === 'tag' ? searchTerm : '',
						limit,
					};

					if (searchBy === 'author') {
						const posts = await client.database.getDiscussions('blog', { tag: searchTerm, limit });
						returnData.push({
							json: {
								posts: posts.map((post) => ({
									author: post.author,
									permlink: post.permlink,
									title: post.title,
									created: post.created,
									tags: JSON.parse(post.json_metadata).tags || [],
								})),
							},
						});
					} else {
						const posts = await client.database.getDiscussions('trending', query);
						returnData.push({
							json: {
								posts: posts.map((post) => ({
									author: post.author,
									permlink: post.permlink,
									title: post.title,
									created: post.created,
									tags: JSON.parse(post.json_metadata).tags || [],
								})),
							},
						});
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
