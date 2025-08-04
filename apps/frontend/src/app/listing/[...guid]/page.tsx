export default async function ListingPage({
	params,
}: {
	params: Promise<{ guid: string }>;
}) {
	const param = await params;

	return (
		<div>
			<h1>Listing Path</h1>
			<p>{param.guid}</p>
		</div>
	);
}
