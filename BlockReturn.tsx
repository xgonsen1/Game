interface BlockReturn
{
	placed?:any;
	chopped?:any;
	plane: 'x' | 'y' | 'z';
	direction: number;
	bonus?: boolean;
}