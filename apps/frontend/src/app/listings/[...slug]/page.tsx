export default async function ListingPage({
	params,
}: {
	params: Promise<{ slug: string[] }>;
}) {
	const param = await params;
	return (
		<div>
			<h1>Listing Path</h1>
			<p>{param.slug.join(" / ")}</p>
		</div>
	);
}
