import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Header from "./Header";

describe("Header Component", () => {
	it("should render without crashing", () => {
		render(<Header />);
		const header = screen.getByTestId("header");
		expect(header).toBeInTheDocument();
	});

	it("should display the site title", () => {
		render(<Header />);
		const title = screen.getByText("HardverGo");
		expect(title).toBeInTheDocument();
	});
});
