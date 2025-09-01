import Heading from "@/components/ui/typography/Heading";

const page = async ({ params }: { params: Promise<{ guid: string }> }) => {
	const param = await params;
	return (
		<div>
			<Heading level="h1">Message Details</Heading>
			<p>GUID: {param.guid}</p>
		</div>
	);
};

export default page;
