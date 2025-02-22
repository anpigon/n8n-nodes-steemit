import type {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class SteemitApi implements ICredentialType {
	name = 'steemitApi';
	displayName = 'Steemit API';
	documentationUrl = 'https://developers.steem.io/';
	properties: INodeProperties[] = [
		{
			displayName: 'Account Name',
			name: 'accountName',
			type: 'string',
			default: '',
			description: 'Steemit account name',
			required: true,
		},
		{
			displayName: 'Posting Key',
			name: 'postingKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Steemit posting private key',
			required: true,
		},
	];
}
