import { cn } from "@/lib/utils";

const classNames = {
	h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 mt-8",
	h2: "scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl mb-4 mt-8",
	h3: "scroll-m-20 text-2xl font-bold tracking-tight lg:text-3xl mb-4 mt-8",
	h4: "scroll-m-20 text-xl font-bold tracking-tight lg:text-2xl mb-4 mt-8",
	h5: "scroll-m-20 text-lg font-bold tracking-tight lg:text-xl mb-4 mt-8",
	h6: "scroll-m-20 text-base font-bold tracking-tight lg:text-lg mb-4 mt-8",
};

type HeadingProps = {
	level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	children: React.ReactNode;
	className?: string;
	rest?: HTMLHeadingElement;
};

const Heading = ({ level, children, className, ...rest }: HeadingProps) => {
	const Tag = level;
	return (
		<Tag className={cn(classNames[level], className)} {...rest}>
			{children}
		</Tag>
	);
};

export default Heading;
