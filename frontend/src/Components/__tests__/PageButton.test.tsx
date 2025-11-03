import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PageButton, { PageButtonColour } from "../PageButton";

// Snapshot tests to check styling has not unintentionally changed since last time
it("snapshot test", () => {
  const onClick = jest.fn();
  const sampleText = 'Sample Text'
  const { asFragment } = render(<PageButton
    colour={PageButtonColour.Red}
    onClick={onClick}
  >{sampleText}</PageButton>);

  expect(asFragment()).toMatchSnapshot();
});

// DOM tests to check functionality and presence of elements
it("should call onClick when clicked on", () => {
  const onClick = jest.fn();
  const sampleText = 'Sample Text'
  render(<PageButton
    colour={PageButtonColour.Red}
    onClick={onClick}
  >{sampleText}</PageButton>);

  const button = screen.getByRole("button", { name: sampleText });

  expect(
    button,
  ).toBeInTheDocument();
  
  fireEvent.click(button);

  expect(onClick).toHaveBeenCalled();
});